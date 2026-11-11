const express = require('express');
const {
    registrarEvento,
    obtenerResumen,
    obtenerUltimos
} = require('../controllers/analiticaController');

const router = express.Router();

// Rutas sin authenticateToken: la analitica es anonima.
// No se guarda el userId justamente para no mezclar eventos con datos personales.
router.post('/evento', registrarEvento);
router.get('/resumen', obtenerResumen);
router.get('/ultimos', obtenerUltimos);

module.exports = router;
