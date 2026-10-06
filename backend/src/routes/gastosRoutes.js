const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { registrarGasto, obtenerGastos, eliminarGasto, editarGasto } = require('../controllers/gastoController');
const router = express.Router();

router.post('/registrar', authenticateToken, registrarGasto);
router.get('/obtener', authenticateToken, obtenerGastos);
router.put('/editar/:id', authenticateToken, editarGasto);
router.delete('/eliminar/:id', authenticateToken, eliminarGasto);

module.exports = router;