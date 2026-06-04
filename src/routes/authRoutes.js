const express = require("express");
const db = require("../config/db");
const { verifyPassword } = require("../helpers/password");
const { normalizeUsername } = require("../helpers/username");

const router = express.Router();

router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("auth/login", { title: "Login" });
});

router.post("/login", async (req, res, next) => {
  try {
    const { role, password } = req.body;
    const username = normalizeUsername(req.body.username);
    let rows = [];
    let user = null;

    if (role === "admin") {
      [rows] = await db.query("SELECT * FROM tb_admin WHERE username = ?", [username]);
      if (rows[0]) {
        user = {
          id: rows[0].id_admin,
          username: rows[0].username,
          nama: rows[0].nama_lengkap,
          password: rows[0].password,
          role: "admin"
        };
      }
    }

    if (role === "guru") {
      [rows] = await db.query("SELECT * FROM tb_guru WHERE username = ?", [username]);
      if (rows[0]) {
        user = {
          id: rows[0].id_guru,
          username: rows[0].username,
          nama: rows[0].nama_guru,
          mata_pelajaran: rows[0].mata_pelajaran,
          password: rows[0].password,
          role: "guru"
        };
      }
    }

    if (role === "siswa") {
      [rows] = await db.query("SELECT * FROM tb_siswa WHERE username = ?", [username]);
      if (rows[0]) {
        user = {
          id: rows[0].nis,
          username: rows[0].username,
          nama: rows[0].nama_siswa,
          kelas: rows[0].kelas,
          password: rows[0].password,
          role: "siswa"
        };
      }
    }

    if (!user || !verifyPassword(password, user.password)) {
      req.session.flash = { type: "danger", message: "Username, password, atau role tidak valid." };
      return res.redirect("/login");
    }

    delete user.password;
    req.session.user = user;
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

module.exports = router;
