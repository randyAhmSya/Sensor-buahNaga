const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function requireAuth(req, res, next) {
  if (!JWT_SECRET) {
    console.error("[auth] JWT_SECRET belum diset");
    return res.status(500).json({ error: "Layanan login sedang bermasalah" });
  }

  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token tidak valid atau kedaluwarsa" });
  }
}

module.exports = { requireAuth };