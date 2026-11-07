# vAPI Network: Router Request Documentation

Dokumentasi dan log eksekusi panggilan pertama ke **vAPI Router** (`https://api.vapinetwork.ai/router`).

---

## 1. Status Eksekusi

- **Status:** **SUKSES / COMPLETED**
- **Endpoint:** `https://router.vapinetwork.ai` (OpenAI-compatible)
- **Account:** `main` (`0xDBFFAb162d3edd079Bd552915F940d50cC31b92C`)
- **Owner:** `0x22c90e068ab8a1cb07eb57c7efb439e768996654`
- **Funding Source:** `balance` (Prepaid Router Balance)
- **Model Digunakan:** `venice/llama-3.2-3b`
- **Tokens:** Prompt: 20 · Completion: 8 · Total: 28
- **Biaya Panggilan:** ~$0.0000078 USD
- **Sisa Balance:** ~$0.9999922 USD

---

## 2. Output Resmi Panggilan (`vapi router chat`)

```json
{
  "model": "venice/llama-3.2-3b",
  "content": "Hello from vAPI router! 👋",
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 8,
    "total_tokens": 28
  }
}
```

---

## 3. Status Router Usage Terkini

Output dari `vapi router usage --account main --json`:
```json
{
  "compute": {
    "allowanceUsd": 1,
    "spentTodayUsd": 0,
    "remainingTodayUsd": 0,
    "resetsAt": "2026-11-08T00:00:00.000Z",
    "ownerLimitUsd": 0,
    "ownerSpentUsd": 0
  },
  "balance": {
    "purchasedUsd": 1,
    "spentUsd": 0.0000078,
    "remainingUsd": 0.9999922
  }
}
```

---

## 4. Cara Melakukan Request Router Berikutnya

Untuk mengirim prompt apa pun ke model mana pun melalui vAPI Router, jalankan perintah PowerShell:

```powershell
$env:VAPI_HOME = "$env:USERPROFILE\.vapi"
$env:PATH = "$env:APPDATA\npm;$env:PATH"

vapi router chat --model "<model_id>" --max-tokens <max_tokens> "<prompt>" --account main --json
```

Contoh:
```powershell
vapi router chat --model "venice/llama-3.2-3b" --max-tokens 100 "Explain quantum computing in one sentence" --account main --json
```
