const crypto = require("crypto");

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

module.exports = { hashPassword, verifyPassword };
