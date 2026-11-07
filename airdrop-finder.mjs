#!/usr/bin/env node
/**
 * airdrop-finder.mjs
 * 
 * Tool pencari airdrop & task crypto aktif hari ini.
 * Sumber data:
 *  1. Live Airdrop Feed (Campaigns, Tasks, Rewards)
 *  2. DefiLlama Tokenless Protocols (High-TVL potential airdrops)
 *  3. Integrasi vAPI Router AI untuk analisis task instan
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ARGS = process.argv.slice(2);
const HAS_HELP = ARGS.includes('--help') || ARGS.includes('-h');
const USE_PROTOCOLS = ARGS.includes('--protocols') || ARGS.includes('--tokenless');
const USE_AI = ARGS.includes('--ai');
const LIMIT_ARG_IDX = ARGS.findIndex(a => a === '--limit' || a === '-l');
const LIMIT = LIMIT_ARG_IDX !== -1 && ARGS[LIMIT_ARG_IDX + 1] ? parseInt(ARGS[LIMIT_ARG_IDX + 1], 10) : 5;

// ANSI Colors
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  bgBlue: '\x1b[44m\x1b[37m\x1b[1m'
};

if (HAS_HELP) {
  console.log(`
${C.bold}🔍 vAPI Airdrop & Task Finder${C.reset}
Cari airdrop aktif, campaign reward, dan tugas harian secara instan.

${C.yellow}Penggunaan:${C.reset}
  node airdrop-finder.mjs [opsi]

${C.yellow}Opsi:${C.reset}
  --latest            Daftar airdrop & campaign aktif terbaru (Default)
  --protocols         Daftar protokol tokenless TVL tinggi (DefiLlama)
  --ai                Analisis task & rekomendasi langkah via vAPI Router AI
  --limit <n>         Jumlah hasil yang ditampilkan (default: 5)
  --help, -h          Tampilkan bantuan ini

${C.yellow}Contoh:${C.reset}
  node airdrop-finder.mjs
  node airdrop-finder.mjs --limit 3 --ai
  node airdrop-finder.mjs --protocols --limit 5
`);
  process.exit(0);
}

// Helper: AI analysis via vapi CLI
function askVapiRouter(prompt) {
  try {
    const cliJs = path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'vapi-network', 'dist', 'cli.js');
    const stdout = execFileSync(process.execPath, [
      cliJs,
      'router', 'chat',
      '--model', 'venice/llama-3.2-3b',
      '--max-tokens', '120',
      prompt,
      '--account', 'main',
      '--json'
    ], {
      encoding: 'utf8',
      env: {
        ...process.env,
        VAPI_HOME: path.join(process.env.USERPROFILE || '', '.vapi'),
        PATH: `${path.join(process.env.APPDATA || '', 'npm')};${process.env.PATH}`
      },
      timeout: 25000
    });
    const parsed = JSON.parse(stdout);
    return parsed.content?.trim();
  } catch (err) {
    return null;
  }
}

// 1. Fetch Airdrop Alert Live Feed
async function fetchLatestAirdrops(limit) {
  console.log(`${C.cyan}⏳ Mengambil update airdrop terbaru dari live feed...${C.reset}\n`);
  const res = await fetch('https://airdropalert.com/feed/rssfeed', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Gagal memuat feed airdrop`);
  
  const text = await res.text();
  const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, limit).map(m => {
    const block = m[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || 'Unknown';
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] || '';
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
    const descRaw = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
    const cleanDesc = descRaw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return { title, link, pubDate, description: cleanDesc };
  });

  return items;
}

// 2. Fetch DefiLlama Tokenless Protocols
async function fetchTokenlessProtocols(limit) {
  console.log(`${C.cyan}⏳ Mengambil protokol tokenless potensial dari DefiLlama...${C.reset}\n`);
  const res = await fetch('https://api.llama.fi/protocols');
  if (!res.ok) throw new Error(`HTTP ${res.status}: Gagal memuat DefiLlama`);
  
  const data = await res.json();
  const excludedCategories = ['CEX', 'Bridge', 'Canonical Bridge', 'Deposit Pools', 'Risk Curators'];
  const excludedNames = ['Binance', 'Robinhood', 'Coinbase', 'Bitfinex', 'Bybit', 'Kraken', 'WBTC'];

  const filtered = data.filter(p => {
    const isTokenless = !p.symbol || p.symbol === '-';
    const isValidCategory = !excludedCategories.includes(p.category);
    const notExcludedName = !excludedNames.some(ex => p.name.includes(ex));
    return isTokenless && isValidCategory && notExcludedName && p.tvl > 5000000;
  })
  .sort((a, b) => b.tvl - a.tvl)
  .slice(0, limit)
  .map(p => ({
    name: p.name,
    category: p.category,
    tvl: `$${(p.tvl / 1e6).toFixed(1)}M`,
    chains: (p.chains || []).slice(0, 4).join(', '),
    url: p.url,
    description: `Protokol kategori ${p.category} di jaringan ${p.chains?.join(', ')} dengan TVL ${'$' + (p.tvl / 1e6).toFixed(1)}M belum meluncurkan token.`
  }));

  return filtered;
}

async function main() {
  console.log(`${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
  console.log(`${C.bold}🚀 vAPI AIRDROP & TASK TRACKER — TODAY'S ONGOING OPPORTUNITIES${C.reset}`);
  console.log(`${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}\n`);

  try {
    let items;
    if (USE_PROTOCOLS) {
      items = await fetchTokenlessProtocols(LIMIT);
      console.log(`${C.green}✓ Berhasil menemukan ${items.length} protokol potensial airdrop (Tokenless DeFi):${C.reset}\n`);
    } else {
      items = await fetchLatestAirdrops(LIMIT);
      console.log(`${C.green}✓ Berhasil memuat ${items.length} campaign / airdrop aktif terkini:${C.reset}\n`);
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      console.log(`${C.bold}${C.yellow}[${i + 1}] ${it.title || it.name}${C.reset}`);
      if (it.pubDate) console.log(`    📅 ${C.dim}Tanggal/Update:${C.reset} ${it.pubDate}`);
      if (it.tvl) console.log(`    💰 ${C.green}TVL:${C.reset} ${it.tvl} | ${C.dim}Kategori:${C.reset} ${it.category} | ${C.dim}Chain:${C.reset} ${it.chains}`);
      console.log(`    🔗 ${C.cyan}Link Resmi:${C.reset} ${it.link || it.url}`);
      
      const snippet = it.description.length > 220 ? it.description.slice(0, 220) + '...' : it.description;
      console.log(`    📝 ${C.dim}Keterangan:${C.reset} ${snippet}`);

      // Jika opsi --ai diaktifkan, tanyakan panduan task ke vAPI Router
      if (USE_AI) {
        console.log(`    🤖 ${C.magenta}vAPI AI Task Quick-Guide:${C.reset} ${C.dim}Menganalisis...${C.reset}`);
        const aiSummary = askVapiRouter(
          `Beri ringkasan 2 langkah tugas praktis untuk ikut airdrop/campaign "${it.title || it.name}": ${snippet}. Buat singkat & padat maksimal 2 kalimat bahasa Indonesia.`
        );
        if (aiSummary) {
          console.log(`    💡 ${C.magenta}${aiSummary}${C.reset}`);
        }
      }
      console.log('');
    }

    console.log(`${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
    console.log(`${C.dim}Tip: Gunakan opsi ${C.cyan}--ai${C.dim} untuk menghasilkan panduan task via vAPI Router LLM.${C.reset}`);
    console.log(`${C.dim}Jalankan ${C.cyan}node airdrop-finder.mjs --help${C.dim} untuk opsi lainnya.${C.reset}\n`);

  } catch (error) {
    console.error(`\n❌ Terjadi kesalahan: ${error.message}`);
  }
}

main();
