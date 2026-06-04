class Guru {
  constructor({ id_guru, nama_guru, mata_pelajaran }) {
    this.idGuru = id_guru;
    this.namaGuru = nama_guru;
    this.mataPelajaran = mata_pelajaran;
    this.daftarNilaiSiswa = [];
  }

  inputNilai(siswa, tugas, uts, uas) {
    if (!siswa.setNilai(tugas, uts, uas)) return false;
    this.daftarNilaiSiswa.push(siswa.tampilkanProfil());
    return true;
  }

  lihatRekapNilai() {
    return this.daftarNilaiSiswa;
  }

  validasiNilaiSiswa(siswa) {
    return siswa.nilaiTugas !== null && siswa.nilaiUTS !== null && siswa.nilaiUAS !== null;
  }

  getRataRataKelas() {
    if (!this.daftarNilaiSiswa.length) return 0;
    const total = this.daftarNilaiSiswa.reduce((sum, item) => sum + Number(item.nilaiAkhir), 0);
    return Math.round((total / this.daftarNilaiSiswa.length) * 100) / 100;
  }
}

module.exports = Guru;
