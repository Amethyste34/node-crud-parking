const reservations = require('../../reservations.json');

exports.fetchAll = () => {
    return reservations;
};

exports.fetchByParkingId = (parkingId) => {
    return reservations.filter(reservation => reservation.parkingId === parkingId);
};

exports.fetchOne = (parkingId, reservationId) => {
    return reservations.find(reservation => 
        reservation.parkingId === parkingId && reservation.id === reservationId
    );
};

exports.create = (reservation) => {
    reservations.push(reservation);
    return reservations;
};

exports.update = (parkingId, reservationId, data) => {
    const reservation = reservations.find(reservation => 
        reservation.parkingId === parkingId && reservation.id === reservationId
    );
    if (!reservation) return null;
    
    reservation.id = data.id;
    reservation.clientName = data.clientName;
    reservation.vehicle = data.vehicle;
    reservation.licensePlate = data.licensePlate;
    reservation.checkin = data.checkin;
    reservation.checkout = data.checkout;
    reservation.ok = data.ok;
    
    return reservations;
};

exports.remove = (parkingId, reservationId) => {
    const reservation = reservations.find(reservation => 
        reservation.parkingId === parkingId && reservation.id === reservationId
    );
    if (!reservation) return null;
    reservations.splice(reservations.indexOf(reservation), 1);
    return reservations;
};