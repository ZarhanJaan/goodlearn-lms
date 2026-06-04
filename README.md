# GoodLearn Learning Management System

GoodLearn adalah web app berbasis Express.js untuk pengolahan nilai siswa. Aplikasi ini mendukung role Admin, Guru, dan Siswa dengan fitur CRUD data, input nilai, perhitungan nilai akhir otomatis, status kelulusan, dan laporan.

## Fitur

- Login berdasarkan role: Admin, Guru, Siswa
- Kelola akun admin
- CRUD data siswa
- CRUD data guru
- Input nilai tugas, UTS, dan UAS oleh guru
- Validasi nilai dalam rentang 0 sampai 100
- Perhitungan nilai akhir otomatis:

```text
(30% x Tugas) + (30% x UTS) + (40% x UAS)
```

- Status kelulusan otomatis:
  - `Lulus` jika nilai akhir >= 70
  - `Tidak Lulus` jika nilai akhir < 70
- Laporan nilai dengan filter kelas, mata pelajaran, dan NIS
- Ekspor laporan ke CSV/Excel
- Halaman cetak laporan untuk PDF melalui browser

## Teknologi

- Node.js
- Express.js
- EJS
- MySQL/MariaDB
- Laragon
- express-session
- mysql2
- dotenv

## Struktur Folder

```text
program/
├── app.js
├── .env
├── package.json
├── database/
│   └── schema.sql
├── public/
│   └── css/
│       └── style.css
├── scripts/
│   └── setup-db.js
├── src/
│   ├── config/
│   ├── helpers/
│   ├── middleware/
│   ├── models/
│   └── routes/
└── views/
    ├── admin/
    ├── auth/
    ├── errors/
    ├── guru/
    ├── partials/
    ├── reports/
    └── siswa/
```

## Konfigurasi Environment

File `.env`:

```env
APP_NAME=GoodLearn
APP_PORT=3000
APP_SESSION_SECRET=goodlearn-local-session-secret

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=goodlearn-db
DB_USER=root
DB_PASSWORD=
```

Untuk Laragon default, username database biasanya `root` dan password kosong.

## Instalasi

Masuk ke folder project:

```powershell
cd e:\sourcecode\e-learning-management-system\program
```

Install dependency:

```powershell
npm install
```

## Setup Database

Pastikan MySQL Laragon sudah berjalan, lalu jalankan:

```powershell
npm run setup-db
```

Command ini akan:

- Membaca nama database dari `.env`
- Membuat database jika belum ada
- Menghapus semua tabel lama pada database tersebut
- Membuat ulang tabel:
  - `tb_admin`
  - `tb_siswa`
  - `tb_guru`
  - `tb_nilai`
- Meminta input username dan password admin baru

Peringatan: command ini menghapus semua data lama pada database target.

## Menjalankan Server

```powershell
npm start
```

Buka aplikasi di browser:

```text
http://localhost:3000
```

Untuk mematikan server, tekan:

```text
Ctrl + C
```

## Login

Login memakai field `username` untuk semua role.

Username yang diinput di halaman admin akan otomatis mengganti spasi menjadi tanda `-`.

Contoh:

```text
Budi Santoso -> Budi-Santoso
```

## Role dan Hak Akses

### Admin

- Mengelola data siswa
- Mengelola data guru
- Mengelola akun admin
- Melihat laporan nilai
- Ekspor laporan

### Guru

- Input nilai siswa berdasarkan kelas
- Melihat rekap nilai
- Melihat laporan untuk mata pelajaran yang diampu

### Siswa

- Melihat nilai pribadi
- Melihat status kelulusan

## Struktur Database

### tb_admin

- `id_admin`
- `username`
- `password`
- `nama_lengkap`

### tb_siswa

- `nis`
- `username`
- `nama_siswa`
- `kelas`
- `password`
- `created_at`

### tb_guru

- `id_guru`
- `username`
- `nama_guru`
- `mata_pelajaran`
- `password`
- `created_at`

### tb_nilai

- `id_nilai`
- `nis`
- `id_guru`
- `mata_pelajaran`
- `nilai_tugas`
- `nilai_uts`
- `nilai_uas`
- `nilai_akhir`
- `status`
- `updated_at`

## Script NPM

```json
{
  "start": "node app.js",
  "dev": "node app.js",
  "setup-db": "node scripts/setup-db.js"
}
```

## Catatan Pengembangan

- Password disimpan dalam bentuk hash SHA-256.
- Session login otomatis kadaluarsa setelah 30 menit.
- Nilai kosong atau nilai di luar 0 sampai 100 akan ditolak.
- `nis` dan `id_guru` tetap dipakai sebagai key relasi database.
- `username` dipakai khusus untuk login.
