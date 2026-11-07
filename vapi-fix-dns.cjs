#!/usr/bin/env node
/**
 * vapi-fix-dns.cjs — preload Node untuk vAPI CLI.
 *
 * MASALAH: CLI memakai createPublicFetch() tanpa proxy. assertPublicUrl()
 * menolak request kalau ADA SATU IP hasil resolve non-public (10.x, 172.16-31.x,
 * 192.168.x, 198.18-19.x = RFC 2544 benchmark range). Sandbox/VPS tertentu
 * me-resolve ke 198.18.x.x, jadi SEMUA request ditolak sebelum dikirim dengan
 * pesan generik: "The vAPI agent link request failed."
 *
 * PATCH: resolve api.vapinetwork.ai lewat DoH, suntikkan IP publik yang sah.
 *
 * PAKAI: export NODE_OPTIONS="--require /path/ke/vapi-fix-dns.cjs"
 * DEBUG: VAPI_FIX_DEBUG=1
 */

const dns = require("node:dns");
const net = require("node:net");
const https = require("node:https");

const HOSTS = (process.env.VAPI_FIX_HOSTS || "api.vapinetwork.ai,vapinetwork.ai")
  .split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);

const DOH = [
  { host: "1.1.1.1", servername: "cloudflare-dns.com", path: "/dns-query" },
  { host: "8.8.8.8", servername: "dns.google", path: "/resolve" },
];

const realLookup = dns.lookup.bind(dns);
const realPromisesLookup = dns.promises.lookup.bind(dns.promises);
const cache = new Map();

function nonPublic(ip) {
  const v = net.isIP(ip);
  if (v === 4) {
    const p = ip.split(".").map(Number);
    return (
      p[0] === 0 || p[0] === 10 || p[0] === 127 ||
      (p[0] === 169 && p[1] === 254) ||
      (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
      (p[0] === 192 && p[1] === 168) ||
      (p[0] === 198 && p[1] >= 18 && p[1] <= 19) ||
      (p[0] === 100 && p[1] >= 64 && p[1] <= 127) ||
      p[0] >= 224
    );
  }
  if (v === 6) {
    return ip === "::1" || ip.startsWith("fe80") ||
           ip.startsWith("fc") || ip.startsWith("fd");
  }
  return true;
}

function dohQuery(server, hostname) {
  const path = server.path + "?name=" + encodeURIComponent(hostname) + "&type=A";
  return new Promise((resolve) => {
    const req = https.request({
      host: server.host, servername: server.servername, port: 443,
      path, method: "GET",
      headers: { accept: "application/dns-json", host: server.servername },
      timeout: 5000,
    }, (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          const ips = (json.Answer || [])
            .filter((a) => a.type === 1)
            .map((a) => a.data)
            .filter((ip) => net.isIP(ip) === 4 && !nonPublic(ip));
          resolve(ips);
        } catch { resolve([]); }
      });
    });
    req.on("error", () => resolve([]));
    req.on("timeout", () => { req.destroy(); resolve([]); });
    req.end();
  });
}

async function resolvePublic(hostname) {
  const key = String(hostname || "").toLowerCase();
  if (cache.has(key)) return cache.get(key);
  for (const server of DOH) {
    const ips = await dohQuery(server, key);
    if (ips.length > 0) {
      cache.set(key, ips);
      if (process.env.VAPI_FIX_DEBUG === "1") {
        process.stderr.write(`[vapi-fix-dns] ${key} -> ${ips.join(", ")}\n`);
      }
      return ips;
    }
  }
  cache.set(key, []);
  return [];
}

function wants(hostname) {
  const key = String(hostname || "").toLowerCase();
  return HOSTS.includes(key) && net.isIP(key) === 0;
}

dns.lookup = function patched(hostname, options, callback) {
  if (typeof options === "function") { callback = options; options = {}; }
  const opts = options || {};
  if (!wants(hostname)) return realLookup(hostname, opts, callback);
  resolvePublic(hostname).then((ips) => {
    if (ips.length === 0) return realLookup(hostname, opts, callback);
    if (opts.all === true) {
      return callback(null, ips.map((address) => ({ address, family: 4 })));
    }
    callback(null, ips[0], 4);
  }).catch(() => realLookup(hostname, opts, callback));
};

dns.promises.lookup = async function patchedPromises(hostname, options) {
  const opts = options || {};
  if (!wants(hostname)) return realPromisesLookup(hostname, opts);
  const ips = await resolvePublic(hostname);
  if (ips.length === 0) return realPromisesLookup(hostname, opts);
  if (opts.all === true) return ips.map((address) => ({ address, family: 4 }));
  return { address: ips[0], family: 4 };
};

if (process.env.VAPI_FIX_DEBUG === "1") {
  process.stderr.write(`[vapi-fix-dns] aktif untuk: ${HOSTS.join(", ")}\n`);
}
