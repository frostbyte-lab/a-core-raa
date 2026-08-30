# Rencana Dataset A Core Sentinel 320 Juta Pola

## Kuota domain

| Domain | Target | Folder sumber | Folder indeks |
|---|---:|---|---|
| `coding` | 300.000.000 | `data/coding/` | `indexes/coding/` |
| `automotive` | 10.000.000 | `data/automotive/` | `indexes/automotive/` |
| `general` | 10.000.000 | `data/general/` | `indexes/general/` |
| **Total** | **320.000.000** |  |  |

## Subdataset coding dan internet

| Subdataset | Target pola |
|---|---:|
| Internet dan jaringan | 30.000.000 |
| Web, HTML, dan CSS | 30.000.000 |
| JavaScript dan TypeScript | 30.000.000 |
| Backend dan server | 30.000.000 |
| API, URL, HTTP, HTTPS, DNS, dan TLS | 25.000.000 |
| Database dan data | 25.000.000 |
| Git dan GitHub | 20.000.000 |
| APK dan mobile | 20.000.000 |
| Game development dan game-resource | 25.000.000 |
| Security, autentikasi, dan DRM sah | 20.000.000 |
| Cloud dan DevOps | 20.000.000 |
| Testing, debugging, dan observability | 25.000.000 |
| **Total coding dan internet** | **300.000.000** |

Routing topik dilakukan melalui `routeCodingTopics()`. Satu record dapat memiliki beberapa tag, tetapi tetap memiliki satu domain utama `coding`.

## Format record

Setiap pola harus berupa satu objek JSON per baris (`.jsonl` atau `.ndjson`) dan wajib memuat `id`, `domain`, `tags`, `problem`, `solution`, `source`, `confidence`, serta `version`. Record harus mempunyai sumber yang dapat diaudit dan lisensi yang mengizinkan penggunaannya. Builder menolak record yang domainnya salah, tidak memiliki metadata wajib, atau mempunyai confidence di luar rentang 0 sampai 1.

Contoh minimal:

```json
{"id":"CODING-HTML-000001","domain":"coding","tags":["html","accessibility"],"problem":"Button tanpa label aksesibel","solution":"Tambahkan nama aksesibel melalui teks atau aria-label yang tepat.","source":"https://example.org/source","confidence":0.92,"version":"1.0.0"}
```

## Penyimpanan dan build

Dataset besar tidak dimasukkan ke bundle JavaScript, prompt, atau RAM sekaligus. Simpan sebagai shard JSONL terkompresi per domain, misalnya `coding-000001.jsonl.zst`, dan jalankan builder pada lingkungan yang mempunyai penyimpanan serta RAM memadai. Builder membaca JSONL secara streaming, membuat metadata, dan membuat token index per domain.

Runtime harus melakukan pemilihan domain terlebih dahulu, lalu mengambil kandidat terbatas dari indeks domain terkait. `runtimeRetrievalLimit` tetap 200 untuk mencegah satu permintaan memuat corpus besar. Isi 40 juta pola belum tersedia di repository; folder `data/` hanya merupakan titik masuk untuk data nyata yang telah divalidasi.

## Batasan keselamatan

Pola tentang DRM hanya boleh digunakan untuk diagnosis integrasi, kompatibilitas, lisensi, error EME, dan troubleshooting yang sah. Dataset tidak boleh memuat instruksi untuk membypass DRM, CAPTCHA, kontrol akses, lisensi, atau perlindungan teknis. Record sintetis tidak boleh dibuat hanya untuk memenuhi target jumlah.
