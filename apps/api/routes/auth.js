const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


router.post("/register", async (req, res) => {
    try {
        const { name, email, password, nomor } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: "Name, email, and password are required"
            });
        }

        const existing = await prisma.admin.findUnique({
            where: { email }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                error: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.admin.create({
            data: {
                name,
                email,
                password: hashedPassword,
                nomor: nomor ? parseInt(nomor) : null,
                role: "user"
            }
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user.id_admin,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("[auth] Register error:", error);
        res.status(500).json({
            success: false,
            error: "Registration failed",
            message: error.message
        });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required"
            });
        }

        const user = await prisma.admin.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                userId: user.id_admin,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user.id_admin,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    nomor: user.nomor
                }
            }
        });
    } catch (error) {
        console.error("[auth] Login error:", error);
        res.status(500).json({
            success: false,
            error: "Login failed",
            message: error.message
        });
    }
});

// Get current user
router.get("/me", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Authentication required"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        const user = await prisma.admin.findUnique({
            where: { id_admin: decoded.userId },
            select: {
                id_admin: true,
                name: true,
                email: true,
                role: true,
                nomor: true,
                created_at: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: "Invalid token"
        });
    }
});

module.exports = router;