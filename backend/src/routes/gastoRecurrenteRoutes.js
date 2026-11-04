const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    crearGastoRecurrente,
    obtenerGastosRecurrentes,
    desactivarGastoRecurrente
} = require('../controllers/gastoRecurrenteController');

const router = express.Router();

router.post('/', authenticateToken, crearGastoRecurrente);
router.get('/', authenticateToken, obtenerGastosRecurrentes);
router.delete('/:id', authenticateToken, desactivarGastoRecurrente);

module.exports = router;
