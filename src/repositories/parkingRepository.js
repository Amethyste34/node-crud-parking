const parkings = require('../../parkings.json');

exports.fetchAll = () => {
    return parkings;
};

exports.fetchById = (id) => {
    return parkings.find(parking => parking.id === id);
};

exports.create = (parking) => {
    parkings.push(parking);
    return parkings;
};

exports.update = (id, data) => {
    const parking = parkings.find(parking => parking.id === id);
    if (!parking) return null;
    parking.name = data.name;
    parking.city = data.city;
    parking.type = data.type;
    return parking;
};

exports.remove = (id) => {
    const parking = parkings.find(parking => parking.id === id);
    if (!parking) return null;
    parkings.splice(parkings.indexOf(parking), 1);
    return parkings;
};