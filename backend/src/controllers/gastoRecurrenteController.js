const Gasto = require('../models/Gasto');
const GastoRecurrente = require('../models/GastoRecurrente');
const {
    fechaLocalHoy,
    fechaValida,
    procesarRecurrenciasVencidas
} = require('../services/gastoRecurrenteService');

const CATEGORIAS_VALIDAS = ['otros', 'comida', 'transporte', 'estudio'];
const FRECUENCIAS_VALIDAS = ['semanal', 'mensual'];

async function crearGastoRecurrente(req, res) {
    try {
        const { monto, motivo, categoria, frecuencia, fechaInicio } = req.body;
        const montoNumero = Number(monto);
        const motivoLimpio = String(motivo || '').trim();
        const categoriaLimpia = String(categoria || 'otros').toLowerCase().trim();

        if (
            monto === undefined || monto === null || monto === '' ||
            !Number.isFinite(montoNumero) || montoNumero <= 0 ||
            !motivoLimpio || motivoLimpio.length > 255 ||
            !CATEGORIAS_VALIDAS.includes(categoriaLimpia) ||
            !FRECUENCIAS_VALIDAS.includes(frecuencia) ||
            !fechaValida(fechaInicio) || fechaInicio < fechaLocalHoy()
        ) {
            return res.status(400).json({
                error: 'Ingresa un monto positivo, motivo, categoría, frecuencia y fecha válidos'
            });
        }

        const recurrencia = await GastoRecurrente.create({
            userId: req.user.id,
            monto: montoNumero,
            motivo: motivoLimpio,
            categoria: categoriaLimpia,
            frecuencia,
            proximaFecha: fechaInicio,
            activa: true
        });

        let gastoGenerado = null;
        if (fechaInicio === fechaLocalHoy()) {
            await procesarRecurrenciasVencidas(req.user.id);
            await recurrencia.reload();
            if (recurrencia.ultimoError) {
                const error = recurrencia.ultimoError;
                await recurrencia.destroy();
                return res.status(400).json({ error });
            }
            gastoGenerado = await Gasto.findOne({
                where: {
                    recurrenciaId: recurrencia.id,
                    fechaProgramada: fechaInicio
                }
            });
        }

        return res.status(201).json({
            message: 'Gasto recurrente guardado correctamente',
            recurrencia,
            gastoGenerado
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'No se pudo guardar el gasto recurrente' });
    }
}

async function obtenerGastosRecurrentes(req, res) {
    try {
        await procesarRecurrenciasVencidas(req.user.id);
        const recurrentes = await GastoRecurrente.findAll({
            where: { userId: req.user.id },
            order: [['proximaFecha', 'ASC']]
        });
        return res.json({ recurrentes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'No se pudieron consultar los gastos recurrentes' });
    }
}

async function desactivarGastoRecurrente(req, res) {
    try {
        const recurrencia = await GastoRecurrente.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!recurrencia) {
            return res.status(404).json({ error: 'Gasto recurrente no encontrado' });
        }
        recurrencia.activa = false;
        await recurrencia.save();
        return res.json({ message: 'Gasto recurrente desactivado correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'No se pudo desactivar el gasto recurrente' });
    }
}

module.exports = {
    crearGastoRecurrente,
    obtenerGastosRecurrentes,
    desactivarGastoRecurrente
};
