require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const guruRoutes = require("./src/routes/guruRoutes");
const siswaRoutes = require("./src/routes/siswaRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const { requireAuth } = require("./src/middleware/auth");

const app = express();
const port = process.env.APP_PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.APP_SESSION_SECRET || "goodlearn-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 60 * 1000,
      httpOnly: true
    }
  })
);

app.use((req, res, next) => {
  res.locals.appName = process.env.APP_NAME || "GoodLearn";
  res.locals.user = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  res.locals.printMode = false;
  delete req.session.flash;
  next();
});

app.get("/", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.role === "admin") return res.redirect("/admin");
  if (req.session.user.role === "guru") return res.redirect("/guru");
  return res.redirect("/siswa");
});

app.use("/", authRoutes);
app.use("/admin", requireAuth("admin"), adminRoutes);
app.use("/guru", requireAuth("guru"), guruRoutes);
app.use("/siswa", requireAuth("siswa"), siswaRoutes);
app.use("/laporan", requireAuth(["admin", "guru"]), reportRoutes);

app.use((req, res) => {
  res.status(404).render("errors/404", { title: "Halaman Tidak Ditemukan" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("errors/500", {
    title: "Terjadi Kesalahan",
    message: err.message
  });
});

app.listen(port, () => {
  console.log(`GoodLearn berjalan di http://localhost:${port}`);
});
