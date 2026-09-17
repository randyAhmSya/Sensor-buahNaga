const express = require("express");
const prisma = require("../../../packages/shared/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();