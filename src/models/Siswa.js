const { validasiNilai, hitungNilaiAkhir, tentukanKelulusan } = require("../helpers/gradeUtils");

class Siswa {
  constructor({ nis, nama_siswa, nama, kelas }) {
    this.nis = nis;
    this.nama = nama_siswa || nama;
    this.kelas = kelas;
    this.nilaiTugas = 0;
    this.nilaiUTS = 0;
    this.nilaiUAS = 0;
    this.nilaiAkhir = 0;
    this.status = "Tidak Lulus";
  }

  setNilai(tugas, uts, uas) {
    if (![tugas, uts, uas].every(validasiNilai)) return false;
    this.nilaiTugas = Number(tugas);
    this.nilaiUTS = Number(uts);
    this.nilaiUAS = Number(uas);
    this.getNilaiAkhir();
    this.getStatus();
    return true;
  }

  getNilaiAkhir() {
    this.nilaiAkhir = hitungNilaiAkhir(this.nilaiTugas, this.nilaiUTS, this.nilaiUAS);
    return this.nilaiAkhir;
  }

  getStatus() {
    this.status = tentukanKelulusan(this.nilaiAkhir);
    return this.status;
  }

  tampilkanProfil() {
    return {
      nis: this.nis,
      nama: this.nama,
      kelas: this.kelas,
      nilaiTugas: this.nilaiTugas,
      nilaiUTS: this.nilaiUTS,
      nilaiUAS: this.nilaiUAS,
      nilaiAkhir: this.nilaiAkhir,
      status: this.status
    };
  }
}

module.exports = Siswa;
