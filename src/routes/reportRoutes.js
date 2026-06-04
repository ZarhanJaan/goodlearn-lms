const express = require("express");
const db = require("../config/db");
const { buatLaporan } = require("../helpers/gradeUtils");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const filter = {
      kelas: req.query.kelas || "",
      mata_pelajaran: req.query.mata_pelajaran || "",
      nis: req.query.nis || ""
    };

    if (req.session.user.role === "guru") {
      filter.id_guru = req.session.user.id;
      filter.mata_pelajaran = req.session.user.mata_pelajaran;
    }

    const [kelasRows] = await db.query("SELECT DISTINCT kelas FROM tb_siswa ORDER BY kelas");
    const [mapelRows] = await db.query("SELECT DISTINCT mata_pelajaran FROM tb_guru ORDER BY mata_pelajaran");
    const rows = await buatLaporan(db, filter);
    const stats = rows.reduce(
      (acc, row) => {
        acc.total += 1;
        acc.lulus += row.status === "Lulus" ? 1 : 0;
        acc.sum += Number(row.nilai_akhir);
        return acc;
      },
      { total: 0, lulus: 0, sum: 0 }
    );
    stats.rata = stats.total ? Math.round((stats.sum / stats.total) * 100) / 100 : 0;

    if (req.query.format === "excel") {
      const csv = [
        ["NIS", "Nama", "Kelas", "Mata Pelajaran", "Guru", "Tugas", "UTS", "UAS", "Nilai Akhir", "Status"],
        ...rows.map((row) => [
          row.nis,
          row.nama_siswa,
          row.kelas,
          row.mata_pelajaran,
          row.nama_guru,
          row.nilai_tugas,
          row.nilai_uts,
          row.nilai_uas,
          row.nilai_akhir,
          row.status
        ])
      ]
        .map((cols) => cols.map((col) => `"${String(col ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=laporan-goodlearn.csv");
      return res.send(csv);
    }

    res.render("reports/index", {
      title: "Laporan Nilai",
      rows,
      kelasRows,
      mapelRows,
      filter,
      stats,
      printMode: req.query.format === "pdf"
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
