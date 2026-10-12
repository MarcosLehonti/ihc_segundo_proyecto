const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    establecerPresupuesto,
    obtenerPresupuesto
} = require('../controllers/presupuestoController');

const router = express.Router();

router.post('/establecer', authenticateToken, establecerPresupuesto);
router.get('/obtener', authenticateToken, obtenerPresupuesto);

module.exports = router;