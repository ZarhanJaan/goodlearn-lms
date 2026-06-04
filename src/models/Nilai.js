const { hitungNilaiAkhir, tentukanKelulusan } = require("../helpers/gradeUtils");

class Nilai {
  constructor(data) {
    this.idNilai = data.id_nilai;
    this.nis = data.nis;
    this.idGuru = data.id_guru;
    this.mataPelajaran = data.mata_pelajaran;
    this.nilaiTugas = Number(data.nilai_tugas);
    this.nilaiUTS = Number(data.nilai_uts);
    this.nilaiUAS = Number(data.nilai_uas);
    this.nilaiAkhir = Number(data.nilai_akhir || 0);
    this.status = data.status || "Tidak Lulus";
  }

  hitung() {
    this.nilaiAkhir = hitungNilaiAkhir(this.nilaiTugas, this.nilaiUTS, this.nilaiUAS);
    this.status = tentukanKelulusan(this.nilaiAkhir);
  }

  async simpan(db) {
    this.hitung();
    const sql = `
      INSERT INTO tb_nilai
        (nis, id_guru, mata_pelajaran, nilai_tugas, nilai_uts, nilai_uas, nilai_akhir, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nilai_tugas = VALUES(nilai_tugas),
        nilai_uts = VALUES(nilai_uts),
        nilai_uas = VALUES(nilai_uas),
        nilai_akhir = VALUES(nilai_akhir),
        status = VALUES(status),
        updated_at = NOW()
    `;
    await db.query(sql, [
      this.nis,
      this.idGuru,
      this.mataPelajaran,
      this.nilaiTugas,
      this.nilaiUTS,
      this.nilaiUAS,
      this.nilaiAkhir,
      this.status
    ]);
    return true;
  }

  tampilkan() {
    return `${this.nis} - ${this.mataPelajaran}: ${this.nilaiAkhir} (${this.status})`;
  }
}

module.exports = Nilai;
