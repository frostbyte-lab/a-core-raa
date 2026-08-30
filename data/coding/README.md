# Dataset Coding 20 Juta Pola

Domain ini disiapkan untuk **20.000.000 pola coding**. Cakupan yang direncanakan meliputi HTML, CSS, JavaScript, TypeScript, Git, GitHub, API, database, testing, debugging, security review, analisis kode, perbaikan kode, performance, deployment, dan diagnosis DRM yang sah.

Simpan data nyata sebagai shard `.jsonl` atau `.ndjson` di folder ini. Untuk dataset besar, gunakan banyak shard berukuran terkelola, misalnya:

```text
coding-000001.jsonl
coding-000002.jsonl
coding-000003.jsonl
```

Setiap baris harus memenuhi `schemas/pattern.schema.json` dan memiliki sumber yang dapat diaudit. Builder dapat dijalankan hanya untuk domain coding:

```bash
npm run patterns:build -- coding
```

Perintah tersebut membaca file secara streaming dan menghasilkan metadata serta token index di `indexes/coding/`. Folder ini belum berisi 20 juta record; kuota adalah kapasitas target, bukan klaim bahwa data sudah tersedia. Record terkait DRM hanya boleh membahas diagnosis integrasi, kompatibilitas, lisensi, dan error EME; jangan memasukkan instruksi bypass atau penghindaran kontrol akses.
