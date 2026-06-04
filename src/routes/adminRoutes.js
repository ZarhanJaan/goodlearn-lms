const express = require("express");
const db = require("../config/db");
const { hashPassword } = require("../helpers/password");
const { normalizeUsername } = require("../helpers/username");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [[siswa]] = await db.query("SELECT COUNT(*) AS total FROM tb_siswa");
    const [[guru]] = await db.query("SELECT COUNT(*) AS total FROM tb_guru");
    const [[nilai]] = await db.query("SELECT COUNT(*) AS total FROM tb_nilai");
    const [[lulus]] = await db.query("SELECT COUNT(*) AS total FROM tb_nilai WHERE status = 'Lulus'");
    res.render("admin/dashboard", { title: "Dashboard Admin", stats: { siswa, guru, nilai, lulus } });
  } catch (err) {
    next(err);
  }
});

router.get("/siswa", async (req, res, next) => {
  try {
    const [siswa] = await db.query("SELECT nis, username, nama_siswa, kelas, created_at FROM tb_siswa ORDER BY kelas, nama_siswa");
    res.render("admin/siswa", { title: "Data Siswa", siswa, edit: null });
  } catch (err) {
    next(err);
  }
});

router.get("/siswa/:nis/edit", async (req, res, next) => {
  try {
    const [siswa] = await db.query("SELECT nis, username, nama_siswa, kelas FROM tb_siswa ORDER BY kelas, nama_siswa");
    const [[edit]] = await db.query("SELECT nis, username, nama_siswa, kelas FROM tb_siswa WHERE nis = ?", [req.params.nis]);
    res.render("admin/siswa", { title: "Edit Siswa", siswa, edit });
  } catch (err) {
    next(err);
  }
});

router.post("/siswa", async (req, res, next) => {
  try {
    const { nis, nama_siswa, kelas, password } = req.body;
    const username = normalizeUsername(req.body.username || nis);
    await db.query("INSERT INTO tb_siswa (nis, username, nama_siswa, kelas, password) VALUES (?, ?, ?, ?, ?)", [
      nis,
      username,
      nama_siswa,
      kelas,
      hashPassword(password || username)
    ]);
    req.session.flash = { type: "success", message: "Data siswa berhasil ditambahkan." };
    res.redirect("/admin/siswa");
  } catch (err) {
    next(err);
  }
});

router.post("/siswa/:nis", async (req, res, next) => {
  try {
    const { nama_siswa, kelas, password } = req.body;
    const username = normalizeUsername(req.body.username);
    if (password) {
      await db.query("UPDATE tb_siswa SET username = ?, nama_siswa = ?, kelas = ?, password = ? WHERE nis = ?", [
        username,
        nama_siswa,
        kelas,
        hashPassword(password),
        req.params.nis
      ]);
    } else {
      await db.query("UPDATE tb_siswa SET username = ?, nama_siswa = ?, kelas = ? WHERE nis = ?", [
        username,
        nama_siswa,
        kelas,
        req.params.nis
      ]);
    }
    req.session.flash = { type: "success", message: "Data siswa berhasil diperbarui." };
    res.redirect("/admin/siswa");
  } catch (err) {
    next(err);
  }
});

router.post("/siswa/:nis/delete", async (req, res, next) => {
  try {
    await db.query("DELETE FROM tb_siswa WHERE nis = ?", [req.params.nis]);
    req.session.flash = { type: "success", message: "Data siswa berhasil dihapus." };
    res.redirect("/admin/siswa");
  } catch (err) {
    next(err);
  }
});

router.get("/guru", async (req, res, next) => {
  try {
    const [guru] = await db.query("SELECT id_guru, username, nama_guru, mata_pelajaran, created_at FROM tb_guru ORDER BY nama_guru");
    res.render("admin/guru", { title: "Data Guru", guru, edit: null });
  } catch (err) {
    next(err);
  }
});

router.get("/akun", async (req, res, next) => {
  try {
    const [admins] = await db.query("SELECT id_admin, username, nama_lengkap FROM tb_admin ORDER BY nama_lengkap");
    res.render("admin/akun", { title: "Kelola Admin", admins, edit: null });
  } catch (err) {
    next(err);
  }
});

router.get("/akun/:id/edit", async (req, res, next) => {
  try {
    const [admins] = await db.query("SELECT id_admin, username, nama_lengkap FROM tb_admin ORDER BY nama_lengkap");
    const [[edit]] = await db.query("SELECT id_admin, username, nama_lengkap FROM tb_admin WHERE id_admin = ?", [req.params.id]);
    res.render("admin/akun", { title: "Edit Admin", admins, edit });
  } catch (err) {
    next(err);
  }
});

router.post("/akun", async (req, res, next) => {
  try {
    const username = normalizeUsername(req.body.username);
    const { nama_lengkap, password } = req.body;

    await db.query("INSERT INTO tb_admin (username, password, nama_lengkap) VALUES (?, ?, ?)", [
      username,
      hashPassword(password || username),
      nama_lengkap
    ]);

    req.session.flash = { type: "success", message: "Akun admin berhasil ditambahkan." };
    res.redirect("/admin/akun");
  } catch (err) {
    next(err);
  }
});

router.post("/akun/:id", async (req, res, next) => {
  try {
    const username = normalizeUsername(req.body.username);
    const { nama_lengkap, password } = req.body;

    if (password) {
      await db.query("UPDATE tb_admin SET username = ?, nama_lengkap = ?, password = ? WHERE id_admin = ?", [
        username,
        nama_lengkap,
        hashPassword(password),
        req.params.id
      ]);
    } else {
      await db.query("UPDATE tb_admin SET username = ?, nama_lengkap = ? WHERE id_admin = ?", [
        username,
        nama_lengkap,
        req.params.id
      ]);
    }

    if (Number(req.params.id) === Number(req.session.user.id)) {
      req.session.user.username = username;
      req.session.user.nama = nama_lengkap;
    }

    req.session.flash = { type: "success", message: "Akun admin berhasil diperbarui." };
    res.redirect("/admin/akun");
  } catch (err) {
    next(err);
  }
});

router.post("/akun/:id/delete", async (req, res, next) => {
  try {
    if (Number(req.params.id) === Number(req.session.user.id)) {
      req.session.flash = { type: "danger", message: "Akun admin yang sedang login tidak bisa dihapus." };
      return res.redirect("/admin/akun");
    }

    await db.query("DELETE FROM tb_admin WHERE id_admin = ?", [req.params.id]);
    req.session.flash = { type: "success", message: "Akun admin berhasil dihapus." };
    res.redirect("/admin/akun");
  } catch (err) {
    next(err);
  }
});

router.get("/guru/:id/edit", async (req, res, next) => {
  try {
    const [guru] = await db.query("SELECT id_guru, username, nama_guru, mata_pelajaran FROM tb_guru ORDER BY nama_guru");
    const [[edit]] = await db.query("SELECT id_guru, username, nama_guru, mata_pelajaran FROM tb_guru WHERE id_guru = ?", [req.params.id]);
    res.render("admin/guru", { title: "Edit Guru", guru, edit });
  } catch (err) {
    next(err);
  }
});

router.post("/guru", async (req, res, next) => {
  try {
    const { id_guru, nama_guru, mata_pelajaran, password } = req.body;
    const username = normalizeUsername(req.body.username || id_guru);
    await db.query("INSERT INTO tb_guru (id_guru, username, nama_guru, mata_pelajaran, password) VALUES (?, ?, ?, ?, ?)", [
      id_guru,
      username,
      nama_guru,
      mata_pelajaran,
      hashPassword(password || username)
    ]);
    req.session.flash = { type: "success", message: "Data guru berhasil ditambahkan." };
    res.redirect("/admin/guru");
  } catch (err) {
    next(err);
  }
});

router.post("/guru/:id", async (req, res, next) => {
  try {
    const { nama_guru, mata_pelajaran, password } = req.body;
    const username = normalizeUsername(req.body.username);
    if (password) {
      await db.query("UPDATE tb_guru SET username = ?, nama_guru = ?, mata_pelajaran = ?, password = ? WHERE id_guru = ?", [
        username,
        nama_guru,
        mata_pelajaran,
        hashPassword(password),
        req.params.id
      ]);
    } else {
      await db.query("UPDATE tb_guru SET username = ?, nama_guru = ?, mata_pelajaran = ? WHERE id_guru = ?", [
        username,
        nama_guru,
        mata_pelajaran,
        req.params.id
      ]);
    }
    req.session.flash = { type: "success", message: "Data guru berhasil diperbarui." };
    res.redirect("/admin/guru");
  } catch (err) {
    next(err);
  }
});

router.post("/guru/:id/delete", async (req, res, next) => {
  try {
    await db.query("DELETE FROM tb_guru WHERE id_guru = ?", [req.params.id]);
    req.session.flash = { type: "success", message: "Data guru berhasil dihapus." };
    res.redirect("/admin/guru");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
