require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Import routes
const devicesRouter = require("./routes/devices");
const authRouter = require("./routes/auth");
const googleAuthRouter = require("./routes/googleAuth");
const gardenRouter = require("./routes/gardenRoutes");
const blockRouter = require("./routes/blockRoutes");
const harvestRouter = require("./routes/harvestCycleRoutes");


const PORT = process.env.PORT || 3001;

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes
app.use("/api/auth", authRouter);           // Local auth
app.use("/api/auth/google", googleAuthRouter); // Google OAuth
app.use("/api/devices", devicesRouter);
app.use("/api/gardens", gardenRouter);
app.use("/api/blocks", blockRouter);
app.use("/api/harvest-cycles", harvestRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route tidak ditemukan"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("[api] unhandled error:", err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === "development"
            ? err.message
            : "Terjadi kesalahan pada server"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`[api] REST API listening on port ${PORT}`);
    console.log(`[api] Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;