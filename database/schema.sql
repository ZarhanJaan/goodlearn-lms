CREATE DATABASE IF NOT EXISTS `goodlearn-db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `goodlearn-db`;

CREATE TABLE IF NOT EXISTS tb_admin (
  id_admin INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password CHAR(64) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS tb_siswa (
  nis VARCHAR(15) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  nama_siswa VARCHAR(100) NOT NULL,
  kelas VARCHAR(10) NOT NULL,
  password CHAR(64) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tb_guru (
  id_guru VARCHAR(10) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  nama_guru VARCHAR(100) NOT NULL,
  mata_pelajaran VARCHAR(50) NOT NULL,
  password CHAR(64) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tb_nilai (
  id_nilai INT AUTO_INCREMENT PRIMARY KEY,
  nis VARCHAR(15) NOT NULL,
  id_guru VARCHAR(10) NOT NULL,
  mata_pelajaran VARCHAR(50) NOT NULL,
  nilai_tugas DECIMAL(5,2) NOT NULL,
  nilai_uts DECIMAL(5,2) NOT NULL,
  nilai_uas DECIMAL(5,2) NOT NULL,
  nilai_akhir DECIMAL(5,2) NOT NULL,
  status ENUM('Lulus','Tidak Lulus') NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_nilai_siswa FOREIGN KEY (nis) REFERENCES tb_siswa(nis) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_nilai_guru FOREIGN KEY (id_guru) REFERENCES tb_guru(id_guru) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT ck_nilai_tugas CHECK (nilai_tugas BETWEEN 0 AND 100),
  CONSTRAINT ck_nilai_uts CHECK (nilai_uts BETWEEN 0 AND 100),
  CONSTRAINT ck_nilai_uas CHECK (nilai_uas BETWEEN 0 AND 100),
  UNIQUE KEY uq_nilai_mapel (nis, id_guru, mata_pelajaran)
);

INSERT INTO tb_admin (username, password, nama_lengkap)
VALUES ('admin', SHA2('admin123', 256), 'Administrator GoodLearn')
ON DUPLICATE KEY UPDATE nama_lengkap = VALUES(nama_lengkap);

INSERT INTO tb_siswa (nis, username, nama_siswa, kelas, password)
VALUES
  ('2025001', 'alya-putri', 'Alya Putri', 'X-A', SHA2('siswa123', 256)),
  ('2025002', 'bima-pratama', 'Bima Pratama', 'X-A', SHA2('siswa123', 256)),
  ('2025003', 'citra-lestari', 'Citra Lestari', 'X-B', SHA2('siswa123', 256))
ON DUPLICATE KEY UPDATE username = VALUES(username), nama_siswa = VALUES(nama_siswa), kelas = VALUES(kelas);

INSERT INTO tb_guru (id_guru, username, nama_guru, mata_pelajaran, password)
VALUES
  ('G001', 'rina-wulandari', 'Rina Wulandari', 'Matematika', SHA2('guru123', 256)),
  ('G002', 'dedi-santoso', 'Dedi Santoso', 'Bahasa Indonesia', SHA2('guru123', 256))
ON DUPLICATE KEY UPDATE username = VALUES(username), nama_guru = VALUES(nama_guru), mata_pelajaran = VALUES(mata_pelajaran);
