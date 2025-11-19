const express = require('express');
const app = express();

// Middleware
app.use(express.json());

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Routes
const parkingRoutes = require('./routes/parkingRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

app.use('/api/parkings', parkingRoutes);
app.use('/api/reservations', reservationRoutes);

// Gestion des routes inexistantes (404)
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        path: req.originalUrl 
    });
});

app.listen(8080, () => {
    console.log("Serveur à l'écoute sur http://localhost:8080");
});