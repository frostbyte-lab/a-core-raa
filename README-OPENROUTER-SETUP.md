# A Core Raa - OpenRouter Setup

## Konfigurasi Cepat

Project ini menggunakan **OpenRouter** sebagai LLM provider.

### 1. Dapatkan API Key

1. Kunjungi: https://openrouter.ai
2. Sign up / Login
3. Pergi ke: https://openrouter.ai/keys
4. Buat API key baru
5. Copy key-nya

### 2. Set di Cloudflare Workers

```bash
# Set secret
wrangler secret put OPENROUTER_API_KEY
# Paste your key, then Enter
```

### 3. Deploy

```bash
npm run deploy
```

### 4. Test

```bash
curl -X POST https://a-core-raa-cloud.technologiesfrostbyte.workers.dev/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Halo!","mode":"daily"}'
```

---

## Model Options

Ganti `OPENROUTER_MODEL` di `wrangler.toml`:

```toml
[vars]
# Free models
OPENROUTER_MODEL = "openrouter/free"        # Auto-rotate free models

# Atau pilih model spesifik:
OPENROUTER_MODEL = "mistralai/mistral-7b"   # Fast & good quality
OPENROUTER_MODEL = "meta-llama/llama-2-7b"  # Popular
OPENROUTER_MODEL = "gpt-3.5-turbo"          # OpenAI
```

See: https://openrouter.ai/docs/models

---

## Biaya

- **Free models:** $0 (tapi ada rate limit)
- **Paid models:** $0.001 - $0.01 per 1K tokens
- **Example:** Chat 1000x per hari ≈ $1-5/bulan

---

## Monitoring

Check usage:

```bash
curl https://openrouter.ai/api/auth/key \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Or via dashboard: https://openrouter.ai/activity

---

## Troubleshooting

**Error: OPENROUTER_API_KEY belum dikonfigurasi**

```bash
wrangler secret put OPENROUTER_API_KEY
```

**Error: Rate limited**

Upgrade ke API key berbayar atau gunakan paid model.

---

Selesai! 🎉
