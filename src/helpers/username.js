function normalizeUsername(username) {
  return String(username || "")
    .trim()
    .replace(/\s+/g, "-");
}

module.exports = { normalizeUsername };
