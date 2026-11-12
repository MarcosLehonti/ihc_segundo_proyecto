const Evento = require('../models/Evento');
const sequelize = require('../config/database');

// Lista cerrada: solo aceptamos los eventos del flujo principal (inicio y exito).
const EVENTOS_PERMITIDOS = ['movimiento_iniciado', 'movimiento_guardado'];

// Props permitidas por evento: lo demas se descarta para no guardar datos personales
// (ni el motivo, ni el monto exacto, ni el nombre del usuario).
const PROPS_PERMITIDAS = ['tipo', 'categoria'];

function sanitizarProps(props) {
    if (!props || typeof props !== 'object') return {};
    const limpio = {};
    for (const clave of PROPS_PERMITIDAS) {
        if (props[clave] !== undefined && props[clave] !== null) {
            limpio[clave] = String(props[clave]).toLowerCase().trim();
        }
    }
    return limpio;
}

async function registrarEvento(req, res) {
    try {
        const { evento, props } = req.body || {};
        const nombre = String(evento || '').trim();

        if (!nombre) {
            return res.status(400).json({ error: 'Debes indicar el nombre del evento' });
        }

        if (!EVENTOS_PERMITIDOS.includes(nombre)) {
            return res.status(400).json({ error: 'Evento no permitido' });
        }

        const registro = await Evento.create({
            evento: nombre,
            props: sanitizarProps(props),
            fecha: new Date()
        });

        console.log('[evento]', {
            evento: registro.evento,
            props: registro.props,
            fecha: registro.fecha
        });

        return res.status(201).json(registro);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error al registrar el evento' });
    }
}

async function obtenerResumen(req, res) {
    try {
        const filas = await Evento.findAll({
            attributes: [
                'evento',
                [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
            ],
            group: ['evento'],
            order: [['evento', 'ASC']]
        });

        const conteos = {};
        for (const fila of filas) {
            conteos[fila.get('evento')] = Number(fila.get('cantidad'));
        }

        const iniciados = conteos['movimiento_iniciado'] || 0;
        const guardados = conteos['movimiento_guardado'] || 0;
        const porcentajeExito = iniciados > 0
            ? Math.round((guardados / iniciados) * 100)
            : 0;

        return res.json({
            conteos,
            iniciados,
            guardados,
            porcentajeExito
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error al calcular el resumen' });
    }
}

async function obtenerUltimos(req, res) {
    try {
        const eventos = await Evento.findAll({
            order: [['fecha', 'DESC'], ['id', 'DESC']],
            limit: 10
        });
        return res.json(eventos);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error al obtener los ultimos eventos' });
    }
}

module.exports = {
    registrarEvento,
    obtenerResumen,
    obtenerUltimos,
    EVENTOS_PERMITIDOS,
    PROPS_PERMITIDAS
};
