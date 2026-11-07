/**
 * api/airdrops.js
 * Vercel Serverless Function — x402 Airdrop & Task Intelligence API
 * Endpoint: /api/airdrops
 */

const PAYOUT_WALLET = "0x22c90e068ab8a1cb07eb57c7efb439e768996654";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Payment-Required, WWW-Authenticate");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const resourceUrl = `${protocol}://${host}/api/airdrops`;

  // 1. Cek otorisasi / bukti pembayaran x402
  const paymentProof = req.headers["authorization"] || req.headers["payment-required"];

  if (!paymentProof) {
    // 2. Jika belum bayar, tolak dengan HTTP 402 + Spesifikasi x402 v2
    const offer = {
      x402Version: 2,
      resource: {
        url: resourceUrl,
        description: "Live daily crypto airdrops and task intelligence feed",
        mimeType: "application/json"
      },
      accepts: [
        {
          scheme: "exact",
          network: "eip155:8453",
          amount: "10000", // $0.01 USDC on Base
          asset: USDC_BASE,
          payTo: PAYOUT_WALLET,
          maxTimeoutSeconds: 60,
          extra: {
            name: "USD Coin",
            version: "2"
          }
        }
      ]
    };

    // Set Payment-Required header sebagai Base64 JSON (standar x402 v2 transport)
    const headerValue = Buffer.from(JSON.stringify(offer)).toString("base64");
    res.setHeader("Payment-Required", headerValue);

    return res.status(402).json(offer);
  }

  // 3. Jika pembayaran sudah diproses oleh protokol vAPI:
  try {
    const feedRes = await fetch("https://airdropalert.com/feed/rssfeed", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    
    let airdrops = [];
    if (feedRes.ok) {
      const xml = await feedRes.text();
      airdrops = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 5).map(m => {
        const block = m[1];
        const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || "Unknown";
        const link = block.match(/<link>(.*?)<\/link>/)?.[1] || "";
        const descRaw = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";
        return {
          title,
          link,
          summary: descRaw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200)
        };
      });
    }

    return res.status(200).json({
      status: "success",
      protocol: "x402",
      paidTo: PAYOUT_WALLET,
      timestamp: new Date().toISOString(),
      itemsCount: airdrops.length,
      airdrops
    });
  } catch (error) {
    return res.status(200).json({
      status: "success",
      protocol: "x402",
      timestamp: new Date().toISOString(),
      fallback: true,
      airdrops: [
        {
          title: "ZeruAI Airdrop",
          link: "https://airdropalert.com/airdrops/zeruai-zap-markets/",
          summary: "ZeruAI onchain intelligence ActivityFi Zaps Rewards campaign."
        }
      ]
    });
  }
}
