# A Core Raa

**A Core Raa** adalah engine intelligence mandiri untuk analisis evidence resource game web. Repository ini terpisah dari Game Collector dan tidak menggunakan Groq, OpenAI, model eksternal, atau API pihak ketiga.

> A Core Raa tidak menebak isi game. Ia hanya membuat kesimpulan dari evidence yang diberikan, mencocokkan pola lokal, memberi tingkat risiko, dan menjelaskan tindakan yang aman.

## Kemampuan inti

Engine melakukan redaction terhadap credential, membaca manifest dan metadata capture, menghitung missing asset, memeriksa error, resource protected, integrity/hash, dependency graph, API map, ukuran paket, serta mencocokkan evidence dengan dataset lokal. Matcher sekarang menggunakan compact inverted-token index, sehingga tidak perlu memindai setiap pola untuk setiap evidence.

Dataset saat ini berisi 50 pola game-web lintas network, asset, runtime, offline, API, security, capture, packaging, compatibility, dan performance, termasuk G1006, CORS, asset 404, WebAssembly, rate limit, timeout API, mixed content, CSP, HAR tidak lengkap, manifest invalid, mobile capability, memory pressure, dan CPU pressure.

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

Laporan berisi `score`, `level`, `findings`, `priorities`, `dataset.version`, `dataset.caseCount`, `dataset.capacity`, `dataset.stats`, `dataset.matched`, dan `explainability`. `dataset.caseCount` adalah jumlah pola yang benar-benar dimuat; `dataset.capacity` menyatakan kapasitas desain indeks sebesar 3.000.000 pola, bukan klaim bahwa tiga juta pengetahuan domain sudah tersedia di repository. File output ditulis dengan permission `0600` oleh CLI.

## Skala pola

Indeks baru memetakan token indikator ke kandidat pola menggunakan `Uint32Array`, lalu tetap melakukan verifikasi substring terhadap kandidat agar hasilnya deterministik dan kompatibel dengan matcher sebelumnya. Dengan demikian, biaya pencarian ditentukan terutama oleh token yang muncul pada evidence, bukan oleh seluruh jumlah corpus. Benchmark `npm run benchmark:patterns` membangun dan menguji 3.000.000 pola sintetis; corpus domain nyata tetap perlu dipasok sebagai data yang telah ditinjau, diberi versi, dan diuji sebelum dianggap sebagai pengetahuan A Core Raa.

## Prinsip keamanan

A Core Raa berjalan offline dan tidak melakukan fetch otomatis. Credential-like fields di-redact sebelum diproses. CAPTCHA, DRM, protected resource, dan kontrol akses tidak dilewati. Evidence tidak dianggap sebagai instruksi eksekusi. Input dibatasi kedalaman, panjang string, jumlah array, dan jumlah object key untuk mengurangi risiko resource exhaustion.

## Roadmap

Tahap berikutnya dapat menambahkan parser evidence adapters, root-cause graph, confidence calibration, counter-evidence self-review, benchmark cases, dan report schema versioning. Semua penambahan harus tetap deterministik, evidence-bound, dapat diuji, dan tidak mengirim data keluar repository.

## Status

Repository ini merupakan fondasi AI domain-spesifik mandiri. Ia bukan klaim bahwa sistem lebih pintar dari seluruh model AI umum; targetnya adalah analisis game-resource yang konsisten, dapat diaudit, aman, dan teliti.

## Cloudflare deployment

Repository canonical deployment adalah `frostbyte-lab/a-core-raa`. Worker terisolasi sudah live di https://a-core-raa-cloud.technologiesfrostbyte.workers.dev dan menyediakan `GET /api/health` serta `POST /api/analyze`. Worker tidak mengambil atau mengeksekusi URL yang dikirim pengguna.

Workflow GitHub Actions tersedia untuk deployment otomatis setiap push ke `main`. Agar workflow otomatis dapat berjalan, tambahkan repository Actions secrets `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID` melalui GitHub Repository Settings atau Git integration Cloudflare. Deployment langsung sudah diverifikasi; token integrasi GitHub pada sesi ini tidak memiliki izin menulis Actions secrets dan mengembalikan HTTP 403.
