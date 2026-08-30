# Xentinel

> Xentinel adalah branding publik untuk engine A Core Raa.

**A Core Raa** adalah engine intelligence untuk analisis evidence resource game web dan chat tugas sehari-hari. Mode evidence tetap offline-deterministik; mode chat menggunakan Ollama melalui endpoint HTTP yang dikonfigurasi.

> A Core Raa tidak menebak isi game. Ia hanya membuat kesimpulan dari evidence yang diberikan, mencocokkan pola lokal, memberi tingkat risiko, dan menjelaskan tindakan yang aman.

## Kemampuan inti

Engine melakukan redaction terhadap credential, membaca manifest dan metadata capture, menghitung missing asset, memeriksa error, resource protected, integrity/hash, dependency graph, API map, ukuran paket, serta mencocokkan evidence dengan dataset lokal. Matcher sekarang menggunakan compact inverted-token index, sehingga tidak perlu memindai setiap pola untuk setiap evidence.

Dataset inti saat ini berisi 50 pola game-web lintas network, asset, runtime, offline, API, security, capture, packaging, compatibility, dan performance. Fondasi Sentinel ditetapkan untuk domain internet 30.000.000.000 pola, coding 300.000.000 pola, otomotif 10.000.000 pola, dan umum 10.000.000 pola.

## Struktur

| Path | Fungsi |
|---|---|
| `src/araa-core.js` | Rules engine, scoring, redaction, findings, priorities, explainability |
| `src/araa-dataset.js` | Dataset lokal, metadata kapasitas, dan matcher pola |
| `src/araa-pattern-index.js` | Inverted-token index untuk corpus besar |
| `tests/pattern-index.bench.mjs` | Benchmark 3.000.000 pola sintetis |
| `src/araa-cli.mjs` | CLI JSON offline |
| `tests/` | Unit dan regression tests |

## Menjalankan

Gunakan Node.js 20 atau lebih baru.

```bash
npm test
npm run analyze -- ./evidence.example.json ./report.json
npm run benchmark:patterns
```

Input CLI harus berupa JSON evidence. Contoh minimal:

```json
{
  "manifest": { "files": ["index.html", "assets/game.js"] },
  "integrity": true,
  "errors": ["G1006"],
  "api": ["wss://example.test"],
  "missingAssets": ["assets/font.woff2"]
}
```

Laporan berisi `score`, `level`, `findings`, `priorities`, `dataset.version`, `dataset.caseCount`, `dataset.capacity`, `dataset.stats`, `dataset.matched`, dan `explainability`. `dataset.caseCount` adalah jumlah pola inti yang benar-benar dimuat; kapasitas Sentinel 30.320.000.000 pola dikelola melalui shard domain dan indeks selektif, bukan dimuat seluruhnya ke bundle atau RAM. File output ditulis dengan permission `0600` oleh CLI.

## Skala pola

Indeks baru memetakan token indikator ke kandidat pola menggunakan `Uint32Array`, lalu tetap melakukan verifikasi substring terhadap kandidat agar hasilnya deterministik dan kompatibel dengan matcher sebelumnya. Dengan demikian, biaya pencarian ditentukan terutama oleh token yang muncul pada evidence, bukan oleh seluruh jumlah corpus. Benchmark `npm run benchmark:patterns` membangun dan menguji 3.000.000 pola sintetis; corpus domain nyata tetap perlu dipasok sebagai data yang telah ditinjau, diberi versi, dan diuji sebelum dianggap sebagai pengetahuan A Core Raa.

## Prinsip keamanan

Mode evidence A Core Raa berjalan offline dan tidak melakukan fetch otomatis. Mode chat hanya mengirim riwayat percakapan yang dibatasi ke Ollama melalui endpoint yang dikonfigurasi; credential-like fields tetap dilarang dan tidak disimpan. Credential-like fields di-redact sebelum diproses. CAPTCHA, DRM, protected resource, dan kontrol akses tidak dilewati. Evidence tidak dianggap sebagai instruksi eksekusi. Input dibatasi kedalaman, panjang string, jumlah array, dan jumlah object key untuk mengurangi risiko resource exhaustion.

## Roadmap

Tahap berikutnya dapat menambahkan parser evidence adapters, root-cause graph, confidence calibration, counter-evidence self-review, benchmark cases, dan report schema versioning. Semua penambahan harus tetap deterministik, evidence-bound, dapat diuji, dan tidak mengirim data keluar repository.

## Status

Repository ini merupakan fondasi AI domain-spesifik dengan dua mode: analisis evidence yang dapat diaudit dan asisten chat harian. Ia bukan klaim bahwa sistem lebih pintar dari seluruh model AI umum; targetnya adalah analisis game-resource yang konsisten, dapat diaudit, aman, dan teliti.

## Cloudflare deployment

Repository canonical deployment adalah `frostbyte-lab/a-core-raa`. Worker terisolasi sudah live di https://a-core-raa-cloud.technologiesfrostbyte.workers.dev dan menyediakan `GET /api/health`, `POST /api/analyze`, dan `POST /api/chat`. Worker tidak mengambil atau mengeksekusi URL yang dikirim pengguna.

Workflow GitHub Actions tersedia untuk deployment otomatis setiap push ke `main`. Agar workflow otomatis dapat berjalan, tambahkan repository Actions secrets `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID` melalui GitHub Repository Settings atau Git integration Cloudflare. Deployment langsung sudah diverifikasi; token integrasi GitHub pada sesi ini tidak memiliki izin menulis Actions secrets dan mengembalikan HTTP 403.

## API untuk sistem lain

Untuk integrasi eksternal, gunakan jalur versioned `/api/v1/`. Jalur ini memerlukan repository secret/Worker secret bernama `ARAA_API_KEY`; dashboard dan endpoint lokal lama tetap tidak berubah. Kirim key melalui header `Authorization: Bearer <API_KEY>` atau `X-API-Key: <API_KEY>`. Jangan menaruh key di frontend, repository, URL query string, atau log.

Contoh pemanggilan chat:

```bash
curl -X POST https://a-core-raa-cloud.technologiesfrostbyte.workers.dev/api/v1/chat \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"message":"Bantu buat jadwal hari ini","mode":"daily"}'
```

Endpoint versioned yang tersedia adalah `/api/v1/chat`, `/api/v1/analyze`, `/api/v1/code/analyze`, `/api/v1/document/analyze`, `/api/v1/translate`, dan `/api/v1/video/prompt`. API Key saat ini merupakan satu key bersama untuk integrasi repository; rotasi dilakukan dengan mengganti secret `ARAA_API_KEY` dan melakukan deployment ulang.

## A Core Sentinel sebagai repository induk

Repository ini adalah induk A Core Sentinel dengan tiga domain: `coding`, `automotive`, dan `general`. Registry pusat berada di `sentinel-registry.json`, schema pola berada di `schemas/pattern.schema.json`, dan dataset domain disiapkan di `data/` dengan index terpisah di `indexes/`. Rincian kuota serta format impor tersedia di `DATASET-40M-PLAN.md`.

Target arsitektur saat ini adalah 30.320.000.000 pola: 30.000.000.000 internet, 300.000.000 coding, 10.000.000 otomotif, dan 10.000.000 umum. Domain internet dibagi ke repository shard RAA-1 sampai RAA-30; rincian integrasinya tersedia di `REPOSITORY-SHARDS.md`. Angka tersebut adalah target kapasitas, bukan klaim jumlah data yang sudah tersedia. Policy registry mewajibkan setiap pola memiliki sumber dan validasi; sistem tidak mengisi pola sintetis hanya untuk memenuhi angka.

Sentinel memilih domain dari isi pertanyaan melalui `src/sentinel-registry.js`, kemudian mengambil pola relevan. Dataset besar harus dipasang sebagai shard terkompresi dan diindeks, bukan dimuat seluruhnya ke prompt atau RAM.

### Build index pola

Pola nyata harus disimpan sebagai file `.jsonl` di folder domain yang sesuai. Jalankan `npm run patterns:build` untuk memvalidasi record, membuat token index per domain, dan menghasilkan statistik di `indexes/registry.json`. Builder menolak record tanpa sumber, confidence, domain, problem, atau solution; builder tidak membuat data sintetis.

## Xentinel Docker Compose dengan Ollama

Arsitektur container tersedia di `docker-compose.yml`. Service `ollama` menjalankan model `llama3.2:3b` pada port `11434`, service `api` menjalankan FastAPI orchestrator pada port `8000`, dan service `web` menyajikan UI Xentinel pada port `3000`. FastAPI membaca `internet-shard-manifest.json`, menampilkan 30 shard RAA, memilih shard yang relevan secara deterministik, lalu mengirim konteks percakapan ke Ollama.

Jalankan stack dengan perintah berikut:

```bash
docker compose up -d --build
docker compose exec ollama ollama pull llama3.2:3b
```

Buka `http://localhost:3000`. Pemeriksaan status tersedia di `http://localhost:8000/api/health`, sedangkan daftar shard tersedia di `http://localhost:8000/api/shards`. Variabel `OLLAMA_MODEL` dapat diganti, contohnya `OLLAMA_MODEL=qwen2.5:7b docker compose up -d --build`. Untuk domain publik seperti `api.frostbyte.com`, arahkan reverse proxy HTTPS ke service `web:3000`; jangan mengekspos port Ollama ke internet secara langsung.

## Xentinel dengan Ollama sebagai otak chat

Endpoint teks (`/api/chat`, `/api/translate`, dan `/api/video/prompt`) sekarang menggunakan **Ollama** melalui HTTP API `POST /api/chat`. Endpoint analisis evidence tetap deterministik dan endpoint gambar tetap menggunakan Workers AI karena Ollama tidak menyediakan pengganti langsung untuk pipeline gambar yang sudah ada.

Atur variabel berikut saat menjalankan Worker:

```bash
npx wrangler dev --var OLLAMA_BASE_URL:http://127.0.0.1:11434 --var OLLAMA_MODEL:qwen2.5:7b
```

Pastikan model sudah tersedia di komputer yang menjalankan Ollama:

```bash
ollama pull qwen2.5:7b
ollama serve
```

Untuk deployment Cloudflare, `OLLAMA_BASE_URL` harus berupa URL **HTTPS yang dapat dijangkau dari internet**, bukan `localhost` atau `127.0.0.1`. Jika server Ollama dilindungi proxy, token opsional dapat disimpan sebagai secret:

```bash
npx wrangler secret put OLLAMA_API_KEY
```

Model default adalah `llama3.2:3b`; ganti dengan model yang sesuai RAM/GPU server, misalnya `qwen2.5:7b`. Jangan mengekspos port Ollama secara langsung tanpa autentikasi dan pembatasan akses.

### Pilihan arsitektur

| Pendekatan | Tradeoff | Biaya | Kompleksitas setup |
| --- | --- | --- | --- |
| Worker Cloudflare → Ollama melalui HTTPS | Dapat diakses publik, tetapi server Ollama harus online dan diamankan | Biaya server/GPU Ollama | Sedang |
| Jalankan Worker dan Ollama di mesin yang sama | Latensi rendah dan cocok untuk pengembangan lokal, tetapi tidak cocok untuk Worker Cloudflare publik | Infrastruktur lokal | Rendah |
| Tetap memakai Workers AI | Tidak perlu mengelola server model, tetapi bukan model lokal Ollama | Mengikuti penggunaan Workers AI | Paling rendah |

Respons chat tetap kompatibel dengan frontend lama dan kini menambahkan `provider: "ollama"` serta nama model yang digunakan. Jika `OLLAMA_BASE_URL` tidak diatur, endpoint teks mengembalikan status `503` dengan pesan konfigurasi yang jelas.
