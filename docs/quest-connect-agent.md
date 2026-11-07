# Quest vAPI: "Connect an agent" (250 poin) — SELESAI

Dokumentasi lengkap, Standard Operating Procedure (SOP), dan log penyelesaian quest **"Connect an agent" (250 poin)** di vAPI Network.

---

## 1. Status Penyelesaian

- **Status:** **SUKSES / CONNECTED** (250 poin)
- **Agent Wallet Name:** `main`
- **Agent Address:** `0xDBFFAb162d3edd079Bd552915F940d50cC31b92C`
- **Owner Address:** `0x22c90e068ab8a1cb07eb57c7efb439e768996654`
- **Linked:** `true`
- **Status Akun:** `active`
- **Granted Scopes:** `mcp:call`, `router.use`, `tasks:read`, `tasks:write`
- **Spending Caps:** \$0.10 / call · \$1.00 / day
- **Router Key:** Tersimpan aman di Windows Data Protection (DPAPI)

---

## 2. Hasil Verifikasi Protokol

Output resmi `vapi whoami --account main --json`:
```json
{
  "wallet": "main",
  "address": "0xDBFFAb162d3edd079Bd552915F940d50cC31b92C",
  "linked": true,
  "owner": "0x22c90e068ab8a1cb07eb57c7efb439e768996654",
  "label": "main",
  "scopes": [
    "mcp:call",
    "router.use",
    "tasks:read",
    "tasks:write"
  ],
  "linkedAt": "2026-11-06T02:46:07.963Z",
  "routerKey": "stored",
  "status": "active",
  "identity": null
}
```

---

## 3. Standard Operating Procedure (SOP)

### Data Acuan
| Item | Nilai |
| :--- | :--- |
| **Owner Wallet** | `0x22c90e068ab8a1cb07eb57c7efb439e768996654` |
| **Jaringan** | Base mainnet |
| **API Endpoint** | `https://api.vapinetwork.ai` |
| **Package** | `vapi-network` (npm) |
| **Versi Acuan** | 0.12.0 atau lebih baru |
| **Node Minimum** | 22 |
| **Batas Wallet** | \$0,10 / call · \$1,00 / hari |
| **Reward** | 250 poin |

### Alur Eksekusi
1. **Pengecekan Node.js:**
   ```bash
   node -v
   ```
2. **Instalasi CLI:**
   ```bash
   npm install -g vapi-network@latest
   vapi version --json
   ```
3. **Persiapan Folder `$env:VAPI_HOME`:**
   ```powershell
   $env:VAPI_HOME = "$env:USERPROFILE\.vapi"
   New-Item -ItemType Directory -Force -Path $env:VAPI_HOME | Out-Null
   ```
4. **Diagnosa DNS (Tes A, B, C):**
   - Tes A: `curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" https://api.vapinetwork.ai/api/call/services`
   - Tes B: `node -e 'require("node:dns").lookup("api.vapinetwork.ai",{all:true},(e,a)=>console.log(JSON.stringify(a)))'`
   - Tes C: `curl -s --resolve api.vapinetwork.ai:443:104.21.28.39 -o /dev/null -w "%{http_code}\n" https://api.vapinetwork.ai/api/call/services`
5. **Inisialisasi Wallet & Caps:**
   ```bash
   vapi init --networks base --no-link --json
   vapi accounts caps main --per-call 0.1 --per-day 1 --json
   ```
6. **Background Login & Approval:**
   ```bash
   vapi login --account main --no-browser
   ```
   Kirimkan kode link dan URL kepada owner untuk di-approve melalui MetaMask.
7. **Verifikasi Akhir:**
   ```bash
   vapi whoami --account main --json
   ```
