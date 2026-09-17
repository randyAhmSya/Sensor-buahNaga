const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {

  if (!GOOGLE_CLIENT_ID) {
    console.error("[auth] GOOGLE_CLIENT_ID belum diset");
    return res.status(500).json({ 
      success: false,
      error: "Login Google sedang tidak tersedia" 
    });
  }

  const { idToken } = req.body || {};

  if (!idToken || typeof idToken !== "string") {
    return res.status(400).json({ 
      success: false,
      error: "idToken wajib diisi" 
    });
  }

  try {

    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(401).json({ 
        success: false,
        error: "Token Google tidak valid" 
      });
    }

    const { sub: googleId, email, name, email_verified } = payload;

    if (!email_verified) {
      return res.status(401).json({ 
        success: false,
        error: "Email Google belum terverifikasi" 
      });
    }

    let user = await prisma.admin.findUnique({
      where: { email }
    });

    if (!user) {

      user = await prisma.admin.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password: 'google_oauth_' + googleId, 
          role: 'user',
          nomor: null
        }
      });
    } else {

      user = await prisma.admin.update({
        where: { email },
        data: {
          name: name || user.name,
        }
      });
    }

    const token = jwt.sign(
      { 
        userId: user.id_admin, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Google login successful",
      data: {
        token,
        user: {
          id: user.id_admin,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error("[auth] Gagal verifikasi token Google:", err.message);
    return res.status(401).json({ 
      success: false,
      error: "Gagal login dengan Google",
      message: err.message 
    });
  }
});

router.get("/url", (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({
      success: false,
      error: "Google Client ID not configured"
    });
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/google/callback";
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;

  res.json({
    success: true,
    data: { url }
  });
});

module.exports = router;