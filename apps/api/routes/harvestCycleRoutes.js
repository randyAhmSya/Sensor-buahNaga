const express = require('express');
const router = express.Router();
const harvestController = require('../controllers/harvestCycleControllers');
const validate = require('../middlewares/validation');
const { createHarvestCycleSchema } = require('../schemas/harvestCycleSchema');

router.get('/', harvestController.getAllHarvestCycles);
router.get('/active', harvestController.getActiveCycles);
router.get('/completed', harvestController.getCompletedCycles);
router.get('/block/:blockId', harvestController.getHarvestCyclesByBlock);
router.post('/', validate(createHarvestCycleSchema), harvestController.createHarvestCycle);
router.post('/harvest/:id', harvestController.harvestNow);
router.delete('/:id', harvestController.deleteHarvestCycle);

module.exports = router;