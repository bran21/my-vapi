# Tool: Airdrop & Task Finder (`airdrop-finder.mjs`)

Tool CLI mandiri untuk melacak dan mencari airdrop, task reward, dan protokol tokenless aktif hari ini dengan integrasi kecerdasan **vAPI Router AI**.

---

## 1. Fitur Utama

- **Live Airdrop Feeds:** Mengambil airdrop dan campaign aktif terbaru secara langsung dari jaringan data terkurasi.
- **DefiLlama Tokenless Discovery:** Menyaring protokol DeFi bernilai tinggi (TVL > $5M) yang belum memiliki token di berbagai chain (Base, Monad, Ethereum, Arbitrum, dll.).
- **vAPI Router AI Task Guide:** Fitur opsional (`--ai`) yang membedah instruksi panjang menjadi 2 langkah praktis via model `venice/llama-3.2-3b`.
- **Zero Extra Dependencies:** Berjalan murni menggunakan runtime Node.js v22+ bawaan tanpa perlu `npm install` package tambahan.

---

## 2. Cara Penggunaan (CLI)

Jalankan perintah ini di terminal:

### A. Cari Airdrop Aktif Terbaru (Default)
```bash
node airdrop-finder.mjs
```

### B. Cari Airdrop Lengkap dengan Panduan Task AI dari vAPI Router
```bash
node airdrop-finder.mjs --limit 3 --ai
```

### C. Cari Protokol Tokenless TVL Tinggi (DefiLlama)
```bash
node airdrop-finder.mjs --protocols --limit 5
```

---

## 3. Parameter / Opsi

| Opsi | Keterangan |
| :--- | :--- |
| `--latest` | Menampilkan airdrop dan reward campaign aktif (Default) |
| `--protocols` | Menampilkan protokol DeFi potensial airdrop dari DefiLlama |
| `--ai` | Mengaktifkan analisis ringkasan task via vAPI Router AI |
| `--limit <n>` | Mengatur jumlah item yang ditampilkan (default: `5`) |
| `--help` | Menampilkan menu bantuan |
