# Deployment A Core Raa: GitHub + Cloudflare

## Arsitektur

Repository canonical untuk deployment adalah `frostbyte-lab/a-core-raa`. Repository ini mendeploy satu resource Cloudflare Worker bernama `a-core-raa-cloud`. Resource tersebut berbeda dari Worker Game Collector dan tidak menggunakan repository, nama Worker, atau endpoint Game Collector.

```text
GitHub: frostbyte-lab/a-core-raa
        └── main push
            └── GitHub Actions: test → Wrangler deploy
                └── Cloudflare Worker: a-core-raa-cloud
                    ├── GET  /api/health
                    ├── POST /api/analyze
                    └── static dashboard
```

## Deployment saat ini

Worker live: https://a-core-raa-cloud.technologiesfrostbyte.workers.dev

Commit yang dipakai pada deployment awal: `0398f1ca1af27e89254b524df315c7e0a257125b`. Commit dokumentasi terbaru di GitHub: `58a77ac0759f7ee250f5b70cf0182abd00cc858b`.

## Secrets GitHub Actions

Workflow `.github/workflows/deploy-cloudflare.yml` membutuhkan dua repository Actions secrets. `CLOUDFLARE_API_TOKEN` harus memiliki izin deployment Worker pada akun Cloudflare. `CLOUDFLARE_ACCOUNT_ID` harus berisi Account ID Cloudflare yang sama dengan akun target. Jangan menaruh nilai tersebut di source code, `wrangler.toml`, issue, log, atau frontend.

Pada sesi setup ini, deployment langsung ke Cloudflare berhasil. Penulisan repository secrets melalui token integrasi GitHub ditolak dengan HTTP 403, sehingga auto-deploy dari GitHub belum dapat diverifikasi. Pemilik repository dapat memasukkan secret dari GitHub: **Settings → Secrets and variables → Actions → New repository secret**. Setelah kedua secret tersedia, jalankan workflow `Test and Deploy A Core Raa Cloudflare` melalui **Actions → Run workflow**.

## Verifikasi

```bash
npm install
npm test
npx wrangler deploy --dry-run
curl https://a-core-raa-cloud.technologiesfrostbyte.workers.dev/api/health
curl -X POST https://a-core-raa-cloud.technologiesfrostbyte.workers.dev/api/analyze \
  -H 'content-type: application/json' \
  --data '{"evidence":{"manifest":{"files":["index.html"]}}}'
```

Dashboard harus dibuka dari URL Worker, bukan dari URL preview Manus, dan tombol **Analisis sekarang** harus menghasilkan score serta findings. Worker tidak mengeksekusi URL evidence, tidak mengambil resource game, tidak memanggil model AI eksternal, dan tidak menyimpan evidence mentah.

## Batas dan rollback

Cloudflare Worker adalah runtime edge untuk analisis ringan dan request terkontrol. Evidence dibatasi 256 KB. Bila sebuah perubahan gagal, gunakan version history Cloudflare atau deploy kembali commit GitHub terakhir yang tervalidasi. Jangan mengubah `name` pada `wrangler.toml` menjadi nama Game Collector.
