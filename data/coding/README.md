# Dataset Coding dan Internet 300 Juta Pola

Domain ini disiapkan untuk **300.000.000 pola coding dan teknologi internet**. Cakupan meliputi HTML, CSS, JavaScript, TypeScript, Git, GitHub, API, database, testing, debugging, security review, analisis kode, perbaikan kode, performance, deployment, URL, URI, HTTP/HTTPS, DNS, TLS, browser, jaringan, web service, data, scraping yang sah, observability, dan diagnosis DRM yang sah.

Simpan data nyata sebagai shard `.jsonl` atau `.ndjson` di folder ini. Untuk 300 juta record, gunakan banyak shard kecil dan terurut berdasarkan domain, topik, bahasa, versi, atau sumber. Jangan menyimpan satu file raksasa dan jangan memasukkan corpus ke bundle JavaScript, prompt, atau RAM sekaligus. Contoh:

```text
coding-000001.jsonl
coding-000002.jsonl
coding-000003.jsonl
```

Setiap baris harus memenuhi `schemas/pattern.schema.json` dan memiliki sumber yang dapat diaudit. Builder dapat dijalankan hanya untuk domain coding:

```bash
npm run patterns:build -- coding
```

Perintah tersebut membaca file secara streaming dan menghasilkan metadata serta token index di `indexes/coding/`. Folder ini belum berisi 300 juta record; kuota adalah kapasitas target, bukan klaim bahwa data sudah tersedia. Record terkait DRM hanya boleh membahas diagnosis integrasi, kompatibilitas, lisensi, dan error EME; jangan memasukkan instruksi bypass atau penghindaran kontrol akses.
