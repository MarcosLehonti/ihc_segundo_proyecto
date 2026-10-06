const Gasto = require('../models/Gasto');
async function registrarGasto(req, res) {
    try {
        const { monto, motivo } = req.body;

        if (!monto || !motivo) {
            return res.status(400).json({
                error: 'Todos los campos son obligatorios'
            });
        }

        const gasto = await Gasto.create({
            monto,
            motivo,
            fecha: new Date(),
            userId: req.user.id
        });

        res.status(201).json(gasto);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Error al registrar el gasto'
        });
    }
}

async function obtenerGastos(req, res) {
    try {
        const gastos = await Gasto.findAll({
            where: { userId: req.user.id }
        });
        res.json(gastos);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Error al obtener los gastos'
        });
    }
}


async function eliminarGasto(req, res) {
    try {
        const { id } = req.params;
        const gasto = await Gasto.findByPk(id);
        if (!gasto) {
            return res.status(404).json({
                error: 'Gasto no encontrado'
            });
        }
        await gasto.destroy();
        res.json({ message: 'Gasto eliminado correctamente' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Error al eliminar el gasto'
        });
    }

}

async function editarGasto(req, res) {
    try {
        const { id } = req.params;
        const { monto, motivo } = req.body;

        if (!monto || !motivo) {
            return res.status(400).json({
                error: 'Todos los campos son obligatorios'
            });
        }

        const gasto = await Gasto.findByPk(id);
        if (!gasto) {
            return res.status(404).json({
                error: 'Gasto no encontrado'
            });
        }

        gasto.monto = monto;
        gasto.motivo = motivo;

        await gasto.save();
        return res.json({
            message: 'Gasto editado correctamente',
            gasto
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Error al editar el gasto'
        });

    }

}


module.exports = { registrarGasto, obtenerGastos, eliminarGasto, editarGasto };