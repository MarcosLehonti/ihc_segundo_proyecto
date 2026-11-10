const Gasto = require('../models/Gasto');
const Meta = require('../models/Meta');

const redondear = (n) => Number(Number(n).toFixed(2));

// Disponible = ingresos - gastos - fondos reservados en metas.
// Las asignaciones a metas NO se registran como gastos ni como ingresos.
function calcularDisponible(movimientos, metas) {
    let ingresos = 0;
    let gastos = 0;
    for (const m of movimientos) {
        if ((m.tipo || 'gasto').toLowerCase() === 'ingreso') ingresos += Number(m.monto);
        else gastos += Number(m.monto);
    }
    const reservado = metas.reduce((t, meta) => t + Number(meta.ahorrado), 0);
    return {
        ingresos: redondear(ingresos),
        gastos: redondear(gastos),
        reservado: redondear(reservado),
        disponible: redondear(ingresos - gastos - reservado),
        saldoTotal: redondear(ingresos - gastos)
    };
}

async function obtenerSaldo(userId, transaction) {
    const [movimientos, metas] = await Promise.all([
        Gasto.findAll({ where: { userId }, attributes: ['monto', 'tipo'], transaction }),
        Meta.findAll({ where: { userId }, transaction })
    ]);
    return { ...calcularDisponible(movimientos, metas), metas };
}

module.exports = { calcularDisponible, obtenerSaldo, redondear };
