const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { registrarGasto, obtenerGastos, eliminarGasto, editarGasto, pagarGasto, filtrarGastos, obtenerHistorialMesActual } = require('../controllers/gastoController');
const router = express.Router();

router.post('/registrar', authenticateToken, registrarGasto);
router.get('/obtener', authenticateToken, obtenerGastos);
router.get('/filtrar', authenticateToken, filtrarGastos);
router.get('/historial-mes', authenticateToken, obtenerHistorialMesActual);
router.put('/editar/:id', authenticateToken, editarGasto);
router.delete('/eliminar/:id', authenticateToken, eliminarGasto);
router.put('/pagar/:id', authenticateToken, pagarGasto);

module.exports = router;