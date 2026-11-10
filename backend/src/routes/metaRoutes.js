const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    listarMetas,
    crearMeta,
    asignarFondos,
    retirarFondos,
    transferirFondos
} = require('../controllers/metaController');

const router = express.Router();

router.get('/', authenticateToken, listarMetas);
router.post('/', authenticateToken, crearMeta);
router.post('/transferir', authenticateToken, transferirFondos);
router.post('/:id/asignar', authenticateToken, asignarFondos);
router.post('/:id/retirar', authenticateToken, retirarFondos);

module.exports = router;
