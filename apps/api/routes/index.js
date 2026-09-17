const express = require('express');
const router = express.Router();
const gardenRoutes = require('./gardenRoutes');
const blockRoutes = require('./blockRoutes');
const harvestCycleRoutes = require('./harvestCycleRoutes');

// API routes
router.use('/gardens', gardenRoutes);
router.use('/blocks', blockRoutes);
router.use('/harvest-cycles', harvestCycleRoutes);

router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;