require("dotenv").config();

const crypto = require("crypto");
const mysql = require("mysql2/promise");
const { createInterface } = require("readline/promises");
const { stdin: input, stdout: output } = require("process");

const dbName = process.env.DB_NAME || "goodlearn-db";

function normalizeUsername(username) {
  return String(username || "")
    .trim()
    .replace(/\s+/g, "-");
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

async function askAdminAccount() {
  const rl = createInterface({ input, output });

  try {
    console.log(`Database target: ${dbName}`);
    console.log("PERINGATAN: Semua tabel di database ini akan dihapus dan dibuat ulang.");

    const confirmation = (await rl.question(`Ketik nama database (${dbName}) untuk lanjut: `)).trim();
    if (confirmation !== dbName) {
      throw new Error("Setup dibatalkan karena konfirmasi database tidak sesuai.");
    }

    const username = normalizeUsername(await rl.question("Username admin baru: "));
    if (!username) throw new Error("Username admin tidak boleh kosong.");

    const password = await rl.question("Password admin baru: ");
    if (!password.trim()) throw new Error("Password admin tidak boleh kosong.");

    const confirmPassword = await rl.question("Ulangi password admin: ");
    if (password !== confirmPassword) throw new Error("Konfirmasi password tidak sama.");

    const namaLengkap = (await rl.question("Nama lengkap admin (opsional): ")).trim() || username;
    return { username, password, namaLengkap };
  } finally {
    rl.close();
  }
}

async function dropAllTables(connection) {
  const [tables] = await connection.query(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'",
    [dbName]
  );

  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const table of tables) {
    await connection.query(`DROP TABLE IF EXISTS ${connection.escapeId(table.TABLE_NAME)}`);
  }
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");
}

async function createTables(connection) {
  await connection.query(`
    CREATE TABLE tb_admin (
      id_admin INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password CHAR(64) NOT NULL,
      nama_lengkap VARCHAR(100) NOT NULL
    )
  `);

  await connection.query(`
    CREATE TABLE tb_siswa (
      nis VARCHAR(15) PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      nama_siswa VARCHAR(100) NOT NULL,
      kelas VARCHAR(10) NOT NULL,
      password CHAR(64) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE tb_guru (
      id_guru VARCHAR(10) PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      nama_guru VARCHAR(100) NOT NULL,
      mata_pelajaran VARCHAR(50) NOT NULL,
      password CHAR(64) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE tb_nilai (
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
    )
  `);
}

async function main() {
  const admin = await askAdminAccount();

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: false
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${connection.escapeId(dbName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.query(`USE ${connection.escapeId(dbName)}`);

    await dropAllTables(connection);
    await createTables(connection);

    await connection.query("INSERT INTO tb_admin (username, password, nama_lengkap) VALUES (?, ?, ?)", [
      admin.username,
      hashPassword(admin.password),
      admin.namaLengkap
    ]);

    console.log("Setup database selesai.");
    console.log(`Admin dibuat: ${admin.username}`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error(`Setup database gagal: ${err.message}`);
  process.exit(1);
});
