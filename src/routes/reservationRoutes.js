const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.get('/', reservationController.getAll);
router.get('/parking/:id', reservationController.getByParkingId);
router.get('/parking/:id/:idreservation', reservationController.getOne);
router.post('/parking/:id', reservationController.create);
router.put('/parking/:id/:idreservation', reservationController.update);
router.delete('/parking/:id/:idreservation', reservationController.remove);

module.exports = router;