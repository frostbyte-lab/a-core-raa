# A Core Raa

**A Core Raa** adalah engine intelligence mandiri untuk analisis evidence resource game web. Repository ini terpisah dari Game Collector dan tidak menggunakan Groq, OpenAI, model eksternal, atau API pihak ketiga.

> A Core Raa tidak menebak isi game. Ia hanya membuat kesimpulan dari evidence yang diberikan, mencocokkan pola lokal, memberi tingkat risiko, dan menjelaskan tindakan yang aman.

## Kemampuan inti

Engine melakukan redaction terhadap credential, membaca manifest dan metadata capture, menghitung missing asset, memeriksa error, resource protected, integrity/hash, dependency graph, API map, ukuran paket, serta mencocokkan evidence dengan dataset lokal berisi 20 pola game-web.

Dataset saat ini mencakup network dan G1006, redirect loop, CORS, asset 404, MIME mismatch, integrity mismatch, SPA fallback, Canvas/WebGL, Web Worker, Service Worker, IndexedDB, credential-bound API, DRM/protected media, WebSocket, bundle besar, unsafe inline execution, open redirect, interaction gate, CAPTCHA/bot gate, dan archive invalid.

## Struktur

| Path | Fungsi |
|---|---|
| `src/araa-core.js` | Rules engine, scoring, redaction, findings, priorities, explainability |
| `src/araa-dataset.js` | Dataset lokal dan matcher pola |
| `src/araa-cli.mjs` | CLI JSON offline |
| `tests/` | Unit dan regression tests |

## Menjalankan

Gunakan Node.js 20 atau lebih baru.

```bash
npm test
npm run analyze -- ./evidence.example.json ./report.json
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

Laporan berisi `score`, `level`, `findings`, `priorities`, `dataset.version`, `dataset.caseCount`, `dataset.matched`, dan `explainability`. File output ditulis dengan permission `0600` oleh CLI.

## Prinsip keamanan

A Core Raa berjalan offline dan tidak melakukan fetch otomatis. Credential-like fields di-redact sebelum diproses. CAPTCHA, DRM, protected resource, dan kontrol akses tidak dilewati. Evidence tidak dianggap sebagai instruksi eksekusi. Input dibatasi kedalaman, panjang string, jumlah array, dan jumlah object key untuk mengurangi risiko resource exhaustion.

## Roadmap

Tahap berikutnya dapat menambahkan parser evidence adapters, root-cause graph, confidence calibration, counter-evidence self-review, benchmark cases, dan report schema versioning. Semua penambahan harus tetap deterministik, evidence-bound, dapat diuji, dan tidak mengirim data keluar repository.

## Status

Repository ini merupakan fondasi AI domain-spesifik mandiri. Ia bukan klaim bahwa sistem lebih pintar dari seluruh model AI umum; targetnya adalah analisis game-resource yang konsisten, dapat diaudit, aman, dan teliti.
