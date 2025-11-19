const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

router.get('/', parkingController.getAll);
router.get('/:id', parkingController.getById);
router.post('/', parkingController.create);
router.put('/:id', parkingController.update);
router.delete('/:id', parkingController.remove);

module.exports = router;