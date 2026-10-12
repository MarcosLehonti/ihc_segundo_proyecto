const Gasto = require('../models/Gasto');
const Presupuesto = require('../models/Presupuesto');
const { Op } = require('sequelize');

async function registrarGasto(req, res) {
    try {
        const { monto, motivo } = req.body;
        const userId = req.user.id;
        const montoNumerico = Number(monto);

        // Validar los datos recibidos
        if (
            monto === undefined ||
            monto === null ||
            monto === '' ||
            !Number.isFinite(montoNumerico) ||
            montoNumerico <= 0 ||
            !motivo ||
            !String(motivo).trim()
        ) {
            return res.status(400).json({
                error: 'Debes ingresar un monto positivo y un motivo válido'
            });
        }

        // Obtener el mes y año actuales
        const ahora = new Date();
        const mes = ahora.getMonth() + 1;
        const anio = ahora.getFullYear();

        // Buscar el presupuesto del usuario para el mes actual
        const presupuesto = await Presupuesto.findOne({
            where: {
                userId,
                mes,
                anio
            }
        });

        if (!presupuesto) {
            return res.status(400).json({
                error: 'No tienes un presupuesto establecido para el mes actual. Establece tu presupuesto antes de registrar gastos.'
            });
        }

        // Definir el inicio y el final del mes
        const inicioMes = new Date(anio, mes - 1, 1);
        const inicioMesSiguiente = new Date(anio, mes, 1);

        // Obtener los gastos registrados durante el mes actual
        const gastos = await Gasto.findAll({
            where: {
                userId,
                fecha: {
                    [Op.gte]: inicioMes,
                    [Op.lt]: inicioMesSiguiente
                }
            },
            attributes: ['monto']
        });

        // Calcular el total gastado
        const gastado = gastos.reduce(
            (total, gasto) => total + Number(gasto.monto),
            0
        );

        const limite = Number(presupuesto.limite);
        const disponible = Number((limite - gastado).toFixed(2));

        // Validar que el nuevo gasto no supere el saldo disponible
        if (montoNumerico > disponible) {
            return res.status(400).json({
                error: 'El gasto supera el presupuesto mensual disponible',
                limite: Number(limite.toFixed(2)),
                gastado: Number(gastado.toFixed(2)),
                disponible,
                montoSolicitado: Number(montoNumerico.toFixed(2))
            });
        }

        // Registrar el gasto si está dentro del presupuesto
        const gasto = await Gasto.create({
            monto: montoNumerico,
            motivo: String(motivo).trim(),
            fecha: ahora,
            userId
        });

        return res.status(201).json(gasto);

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
        if (Number(gasto.userId) !== Number(req.user.id)) {
            return res.status(403).json({
                error: 'No tienes permiso para eliminar este gasto'
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

        if (Number(gasto.userId) !== Number(req.user.id)) {
            return res.status(403).json({
                error: 'No tienes permiso para editar este gasto'
            });
        }

        if (gasto.estado.toLowerCase().trim() === 'gastado') {

            return res.status(400).json({
                error: 'No se puede editar este gasto porque ya está pagado'
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

async function pagarGasto(req, res) {
    try {
        const { id } = req.params;

        const gasto = await Gasto.findByPk(id);
        if (!gasto) {
            return res.status(404).json({
                error: 'Gasto no encontrado'
            })
        }

        if (Number(gasto.userId) !== Number(req.user.id)) {
            return res.status(403).json({
                error: 'No tienes permiso para pagar este gasto'
            });
        }

        gasto.estado = 'gastado';
        await gasto.save();

        return res.json({
            message: 'Gasto pagado correctamente',
            gasto
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Error al marcar el gasto como pagado'
        });

    }

}


module.exports = { registrarGasto, obtenerGastos, eliminarGasto, editarGasto, pagarGasto };