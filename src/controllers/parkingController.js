const parkingService = require('../services/parkingService');

exports.getAll = (req, res) => {
    const parkings = parkingService.getAll();
    res.status(200).json(parkings);
};

exports.getById = (req, res) => {
    const id = parseInt(req.params.id);
    const parking = parkingService.getById(id);
    if (!parking) {
        return res.status(404).json({ message: 'Parking not found' });
    }
    res.status(200).json(parking);
};

exports.create = (req, res) => {
    const parkings = parkingService.create(req.body);
    res.status(201).json(parkings);
};

exports.update = (req, res) => {
    const id = parseInt(req.params.id);
    const parking = parkingService.update(id, req.body);
    if (!parking) {
        return res.status(404).json({ message: 'Parking not found' });
    }
    res.status(200).json(parking);
};

exports.remove = (req, res) => {
    const id = parseInt(req.params.id);
    const parkings = parkingService.remove(id);
    if (!parkings) {
        return res.status(404).json({ message: 'Parking not found' });
    }
    res.status(200).json(parkings);
};