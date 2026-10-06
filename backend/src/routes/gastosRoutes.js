const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { registrarGasto, obtenerGastos } = require('../controllers/gastoController');
const router = express.Router();

router.post('/registrar', authenticateToken, registrarGasto);
router.get('/obtener', authenticateToken, obtenerGastos);

module.exports = router;