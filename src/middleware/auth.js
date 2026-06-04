function requireAuth(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.session.user) {
      req.session.flash = { type: "danger", message: "Silakan login terlebih dahulu." };
      return res.redirect("/login");
    }

    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).render("errors/403", { title: "Akses Ditolak" });
    }

    next();
  };
}

module.exports = { requireAuth };
