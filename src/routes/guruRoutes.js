const express = require("express");
const db = require("../config/db");
const Nilai = require("../models/Nilai");
const { validasiNilai } = require("../helpers/gradeUtils");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const idGuru = req.session.user.id;
    const [[rekap]] = await db.query("SELECT COUNT(*) AS total, AVG(nilai_akhir) AS rata FROM tb_nilai WHERE id_guru = ?", [idGuru]);
    const [[lulus]] = await db.query("SELECT COUNT(*) AS total FROM tb_nilai WHERE id_guru = ? AND status = 'Lulus'", [idGuru]);
    res.render("guru/dashboard", { title: "Dashboard Guru", rekap, lulus });
  } catch (err) {
    next(err);
  }
});

router.get("/nilai", async (req, res, next) => {
  try {
    const [kelasRows] = await db.query("SELECT DISTINCT kelas FROM tb_siswa ORDER BY kelas");
    const kelas = req.query.kelas || (kelasRows[0] && kelasRows[0].kelas);
    const [siswa] = kelas
      ? await db.query(
          `SELECT s.nis, s.nama_siswa, s.kelas, n.nilai_tugas, n.nilai_uts, n.nilai_uas, n.nilai_akhir, n.status
           FROM tb_siswa s
           LEFT JOIN tb_nilai n ON n.nis = s.nis AND n.id_guru = ? AND n.mata_pelajaran = ?
           WHERE s.kelas = ?
           ORDER BY s.nama_siswa`,
          [req.session.user.id, req.session.user.mata_pelajaran, kelas]
        )
      : [[]];
    res.render("guru/input-nilai", { title: "Input Nilai", kelasRows, kelas, siswa });
  } catch (err) {
    next(err);
  }
});

router.post("/nilai", async (req, res, next) => {
  try {
    const { nis, nilai_tugas, nilai_uts, nilai_uas, kelas } = req.body;
    const items = Array.isArray(nis) ? nis : [nis];
    const tugasItems = Array.isArray(nilai_tugas) ? nilai_tugas : [nilai_tugas];
    const utsItems = Array.isArray(nilai_uts) ? nilai_uts : [nilai_uts];
    const uasItems = Array.isArray(nilai_uas) ? nilai_uas : [nilai_uas];

    for (const [index, itemNis] of items.entries()) {
      const tugas = tugasItems[index];
      const uts = utsItems[index];
      const uas = uasItems[index];

      if (![tugas, uts, uas].every(validasiNilai)) {
        req.session.flash = { type: "danger", message: "Nilai harus berada dalam rentang 0 sampai 100." };
        return res.redirect(`/guru/nilai?kelas=${encodeURIComponent(kelas)}`);
      }

      const nilai = new Nilai({
        nis: itemNis,
        id_guru: req.session.user.id,
        mata_pelajaran: req.session.user.mata_pelajaran,
        nilai_tugas: tugas,
        nilai_uts: uts,
        nilai_uas: uas
      });
      await nilai.simpan(db);
    }

    req.session.flash = { type: "success", message: "Nilai berhasil disimpan." };
    res.redirect(`/guru/nilai?kelas=${encodeURIComponent(kelas)}`);
  } catch (err) {
    next(err);
  }
});

router.get("/rekap", async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT n.*, s.nama_siswa, s.kelas
       FROM tb_nilai n
       JOIN tb_siswa s ON s.nis = n.nis
       WHERE n.id_guru = ?
       ORDER BY s.kelas, s.nama_siswa`,
      [req.session.user.id]
    );
    res.render("guru/rekap", { title: "Rekap Nilai", rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
