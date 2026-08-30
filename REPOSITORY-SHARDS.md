# Arsitektur Repository Shard RAA

## Hub utama

`frostbyte-lab/a-core-raa` adalah jantung utama. Hub ini menyimpan registry, schema, routing, manifest, kebijakan validasi, dan kontrak retrieval. Hub tidak menyimpan seluruh data mentah.

## Internet 30 miliar pola

Domain `internet` mempunyai target **30.000.000.000 pola** dan dibagi menjadi 30 repository private. Setiap repository memiliki kapasitas target 1.000.000.000 pola.

| Nomor | Repository | Target | Status |
|---:|---|---:|---|
| 1–30 | `frostbyte-lab/raa-1` hingga `frostbyte-lab/raa-30` | 1 miliar per shard | Planned; belum berisi record nyata |

Manifest resmi berada di [`internet-shard-manifest.json`](./internet-shard-manifest.json). Setiap shard menggunakan format JSONL/NDJSON, metadata versi, sumber, lisensi, confidence, checksum, dan indeks yang dibangun di luar bundle web.

## Alur integrasi

Web utama mengirim permintaan ke API hub. Hub memilih domain dan topik, membaca manifest, menentukan shard yang relevan, lalu mengambil kandidat terbatas. Web tidak memuat seluruh 30 miliar pola. Data mentah skala besar harus berada di object storage atau data lake; repository GitHub menyimpan kode, dokumentasi, manifest, dan metadata yang dapat diaudit.

## Scaling

Kapasitas dapat dinaikkan dengan menambah shard baru dan memperbarui manifest, tanpa mengubah kontrak API hub. Penambahan kapasitas bukan berarti mengklaim jumlah data aktual. Record baru hanya dapat ditandai `validated` setelah sumber, lisensi, schema, deduplikasi, dan checksum diperiksa.
