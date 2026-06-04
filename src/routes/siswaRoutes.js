const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT n.*, g.nama_guru
       FROM tb_nilai n
       JOIN tb_guru g ON g.id_guru = n.id_guru
       WHERE n.nis = ?
       ORDER BY n.mata_pelajaran`,
      [req.session.user.id]
    );
    res.render("siswa/dashboard", { title: "Dashboard Siswa", rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
