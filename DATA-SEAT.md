# Data Seat berbasis GitHub

## Alur

Dataset custom disimpan sebagai JSONL di `data-seat/incoming/`. Setiap baris harus berupa satu record dengan field `id`, `tags`, `problem`, `solution`, `source`, `confidence`, `version`, dan `domain` yang valid. Push ke `main` memicu GitHub Actions.

Workflow `Build Data Seat shards` membaca file secara streaming, menolak JSON atau record yang tidak valid, memecah data per domain menjadi file `part-00001.jsonl`, `part-00002.jsonl`, dan seterusnya dengan target maksimum 20 MB per shard, membuat `data-seat/shards/manifest.json`, lalu membangun token index per domain. Dataset tidak dimuat seluruhnya ke RAM.

## Menambahkan dataset

```bash
mkdir -p data-seat/incoming
cp dataset.jsonl data-seat/incoming/my-dataset.jsonl
git add data-seat/incoming/my-dataset.jsonl
git commit -m "data: add reviewed Data Seat records"
git push origin main
```

Untuk dataset sangat besar, upload bertahap dalam beberapa file JSONL. GitHub bukan object storage tak terbatas; gunakan Git LFS atau storage artifact terpisah bila ukuran repository mulai besar. Jangan commit credential, token, cookie, data pribadi, atau data berhak cipta tanpa izin.

## Konsumsi AI

Retriever menggunakan `indexes/*/token-index.json` untuk memilih kandidat relevan. Manifest digunakan untuk mengetahui shard yang tersedia dan statistik record. Worker/AI harus mengambil shard terpilih saja, bukan membaca seluruh dataset pada setiap request.

## Data Seat access

Panel web hanya memeriksa access code terhadap Worker secret `DATA_SEAT_KEY`. Secret tidak boleh ditulis di HTML, JavaScript, URL, commit, atau dataset. Set capacity secara opsional melalui `DATA_SEAT_CAPACITY`, misalnya `10M-record target`; angka kapasitas adalah metadata target, bukan bukti record sudah tersedia.

## Verifikasi

```bash
npm run data-seat:shard
npm run patterns:build
npm test
```
