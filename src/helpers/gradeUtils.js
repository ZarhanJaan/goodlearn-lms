function validasiNilai(nilai) {
  if (nilai === null || nilai === undefined || String(nilai).trim() === "") return false;
  const angka = Number(nilai);
  return Number.isFinite(angka) && angka >= 0 && angka <= 100;
}

function hitungNilaiAkhir(tugas, uts, uas) {
  const nilaiAkhir = Number(tugas) * 0.3 + Number(uts) * 0.3 + Number(uas) * 0.4;
  return Math.round(nilaiAkhir * 100) / 100;
}

function tentukanKelulusan(nilaiAkhir) {
  return Number(nilaiAkhir) >= 70 ? "Lulus" : "Tidak Lulus";
}

async function buatLaporan(db, filter = {}) {
  const params = [];
  const where = [];

  if (filter.kelas) {
    where.push("s.kelas = ?");
    params.push(filter.kelas);
  }

  if (filter.mata_pelajaran) {
    where.push("n.mata_pelajaran = ?");
    params.push(filter.mata_pelajaran);
  }

  if (filter.nis) {
    where.push("s.nis = ?");
    params.push(filter.nis);
  }

  if (filter.id_guru) {
    where.push("n.id_guru = ?");
    params.push(filter.id_guru);
  }

  const sql = `
    SELECT n.*, s.nama_siswa, s.kelas, g.nama_guru
    FROM tb_nilai n
    JOIN tb_siswa s ON s.nis = n.nis
    JOIN tb_guru g ON g.id_guru = n.id_guru
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY s.kelas, s.nama_siswa, n.mata_pelajaran
  `;

  const [rows] = await db.query(sql, params);
  return rows;
}

module.exports = {
  validasiNilai,
  hitungNilaiAkhir,
  tentukanKelulusan,
  buatLaporan
};
