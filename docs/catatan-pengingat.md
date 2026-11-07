# Panduan & Catatan Pengingat vAPI Router

Dokumentasi ringkas dan panduan praktis (cheatsheet) untuk menjalankan request ke **vAPI Router** (`https://api.vapinetwork.ai/router`).

---

## 1. Identitas Akun & Wallet

| Parameter | Keterangan / Nilai |
| :--- | :--- |
| **Owner Wallet** | `0x22c90e068ab8a1cb07eb57c7efb439e768996654` (MetaMask / EOA) |
| **Agent Wallet** | `0xDBFFAb162d3edd079Bd552915F940d50cC31b92C` (Nama: `main`) |
| **Jaringan** | Base Mainnet (`eip155:8453`) |
| **Penyimpanan Kunci** | Windows DPAPI (Aman, self-custody di mesin lokal) |
| **Folder Vault & Config** | `$env:USERPROFILE\.vapi` |
| **Endpoint Router** | `https://router.vapinetwork.ai` |

---

## 2. Persiapan Environment (Wajib di PowerShell)

Sebelum menjalankan perintah `vapi`, pastikan path dan home directory sudah diset di sesi terminal:

```powershell
$env:VAPI_HOME = "$env:USERPROFILE\.vapi"
$env:PATH = "$env:APPDATA\npm;$env:PATH"
```

> [!NOTE]
> Jika koneksi internet mengalami kendala DNS non-publik (RFC 2544 / sandbox), sertakan preload DNS fix:
> ```powershell
> $env:NODE_OPTIONS = "--require C:\Users\SLIMBO~1\vapi\vapi-fix-dns.cjs"
> ```

---

## 3. Catatan Penting & Troubleshooting (Pelajaran dari Error Lalu)

### A. Perbedaan Kuota Compute vs Saldo Prabayar (Router Balance)
- **Staking Compute Allowance (`stake`):** Kuota harian gratis yang diperoleh jika owner melakukan *staking token vAPI*. Jika stake = 0, kuota compute akan `remainingTodayUsd: 0` dan reset setiap pukul 00:00 UTC.
- **Prepaid Router Balance (`balance`):** Saldo credit yang dibeli menggunakan USDC. Saldo ini **tidak hangus** harian dan langsung terpotong sesuai token yang digunakan pada setiap chat request.

### B. Sinkronisasi Kunci Router Balance (`router-balance-key`)
- Router key untuk staking dan router key untuk prepaid balance disimpan terpisah di DPAPI.
- Jika balance diisi lewat web dashboard, CLI perlu memastikan `router-balance-key` tersimpan di DPAPI agar fallback dari kuota compute ke prepaid balance berjalan otomatis.

---

## 4. Perintah CLI Praktis (Cheatsheet)

### 1. Cek Status Link & Identitas Agent
```powershell
vapi whoami --account main --json
```

### 2. Cek Saldo USDC Onchain
```powershell
vapi balance --account main --json
```

### 3. Cek Sisa Saldo Router & Kuota Harian
```powershell
vapi router usage --account main --json
```

### 4. Melihat Daftar Model AI yang Tersedia
```powershell
vapi router models --account main --json
```

### 5. Melakukan Request Chat ke Router (Inference)
Gunakan format ini untuk berinteraksi dengan model:
```powershell
vapi router chat --model "<model_id>" --max-tokens <jumlah_token> "<prompt_anda>" --account main --json
```

**Contoh Panggilan Cepat & Hemat:**
```powershell
vapi router chat --model "venice/llama-3.2-3b" --max-tokens 50 "Halo dari vAPI!" --account main --json
```

---

## 5. Rekomendasi Model Hemat Biaya

| Model ID | Deskripsi / Keunggulan |
| :--- | :--- |
| `venice/llama-3.2-3b` | Sangat murah (~$0.000008 / call singkat), cocok untuk tes dan tugas ringan |
| `venice/deepseek-v4-flash` | Cepat, kapabel, dan ekonomis |
| `venice/gemini-3-5-flash` | Sangat cepat dan konteks panjang |
| `venice/claude-haiku-5-5` | Responsif untuk instruksi terstruktur |

---

## 6. Manajemen Saldo & Penarikan Dana

- **Top-up Saldo Router (Prepaid):**
  ```powershell
  vapi router buy 1 --account main
  ```
- **Tarik Saldo USDC di Wallet Agent kembali ke Owner:**
  ```powershell
  vapi send 1 --from main --to owner
  ```
- **Sapu Bersih Semua Saldo USDC ke Owner:**
  ```powershell
  vapi sweep --account main
  ```
*(Catatan: Saldo yang sudah dibelikan Router Balance tidak bisa di-refund ke USDC, tapi USDC di wallet agent bisa ditarik kapan saja).*
