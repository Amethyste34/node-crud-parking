const parkingRepository = require('../repositories/parkingRepository');

exports.getAll = () => {
    return parkingRepository.fetchAll();
};

exports.getById = (id) => {
    return parkingRepository.fetchById(id);
};

exports.create = (parking) => {
    return parkingRepository.create(parking);
};

exports.update = (id, data) => {
    return parkingRepository.update(id, data);
};

exports.remove = (id) => {
    return parkingRepository.remove(id);
};