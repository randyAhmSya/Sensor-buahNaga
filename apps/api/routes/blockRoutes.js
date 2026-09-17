const express = require('express');
const router = express.Router();
const blockController = require('../controllers/blockController');
const validate = require('../middlewares/validation');
const { createBlockSchema } = require('../schemas/blockSchema');


router.get('/', blockController.getAllBlocks);
router.get('/garden/:gardenId', blockController.getBlocksByGarden);
router.post('/', validate(createBlockSchema), blockController.createBlock);
router.delete('/:id', blockController.deleteBlock);

module.exports = router;