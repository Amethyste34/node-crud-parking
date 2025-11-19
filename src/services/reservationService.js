const reservationRepository = require('../repositories/reservationRepository');
const parkingRepository = require('../repositories/parkingRepository');

exports.getAll = () => {
    return reservationRepository.fetchAll();
};

exports.getByParkingId = (parkingId) => {
    return reservationRepository.fetchByParkingId(parkingId);
};

exports.getOne = (parkingId, reservationId) => {
    return reservationRepository.fetchOne(parkingId, reservationId);
};

exports.create = (parkingId, data) => {
    const parking = parkingRepository.fetchById(parkingId);
    if (!parking) return null;
    
    const reservation = {
        parkingId: parking.id,
        parking: parking.name,
        city: parking.city,
        id: data.id,
        clientName: data.clientName,
        vehicle: data.vehicle,
        licensePlate: data.licensePlate,
        checkin: data.checkin,
        checkout: data.checkout,
        ok: data.ok
    };
    
    return reservationRepository.create(reservation);
};

exports.update = (parkingId, reservationId, data) => {
    return reservationRepository.update(parkingId, reservationId, data);
};

exports.remove = (parkingId, reservationId) => {
    return reservationRepository.remove(parkingId, reservationId);
};