const express = require('express');
const router = express.Router();
const gardenController = require('../controllers/gardenController');
const validate = require('../middlewares/validation');
const { createGardenSchema, updateGardenSchema } = require('../schemas/gardenSchema');

router.get('/', gardenController.getAllGardens);
router.get('/:id', gardenController.getGardenById);
router.post('/', validate(createGardenSchema), gardenController.createGarden);
router.put('/:id', validate(updateGardenSchema), gardenController.updateGarden);
router.delete('/:id', gardenController.deleteGarden);

module.exports = router;