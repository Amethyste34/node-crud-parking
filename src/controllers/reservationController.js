const reservationService = require('../services/reservationService');

exports.getAll = (req, res) => {
    const reservations = reservationService.getAll();
    res.status(200).json(reservations);
};

exports.getByParkingId = (req, res) => {
    const parkingId = parseInt(req.params.id);
    const reservations = reservationService.getByParkingId(parkingId);
    res.status(200).json(reservations);
};

exports.getOne = (req, res) => {
    const parkingId = parseInt(req.params.id);
    const reservationId = parseInt(req.params.idreservation);
    const reservation = reservationService.getOne(parkingId, reservationId);
    if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
    }
    res.status(200).json(reservation);
};

exports.create = (req, res) => {
    const parkingId = parseInt(req.params.id);
    const reservations = reservationService.create(parkingId, req.body);
    if (!reservations) {
        return res.status(404).json({ message: 'Parking not found' });
    }
    res.status(201).json(reservations);
};

exports.update = (req, res) => {
    const parkingId = parseInt(req.params.id);
    const reservationId = parseInt(req.params.idreservation);
    const reservations = reservationService.update(parkingId, reservationId, req.body);
    if (!reservations) {
        return res.status(404).json({ message: 'Reservation not found' });
    }
    res.status(200).json(reservations);
};

exports.remove = (req, res) => {
    const parkingId = parseInt(req.params.id);
    const reservationId = parseInt(req.params.idreservation);
    const reservations = reservationService.remove(parkingId, reservationId);
    if (!reservations) {
        return res.status(404).json({ message: 'Reservation not found' });
    }
    res.status(200).json(reservations);
};