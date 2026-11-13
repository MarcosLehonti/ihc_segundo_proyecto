const {
    registrarEvento,
    obtenerResumen
} = require('../src/controllers/analiticaController');

const Evento = require('../src/models/Evento');

jest.mock('../src/models/Evento');

function crearRes() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

describe('registrarEvento - movimiento_iniciado', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('registra el evento una sola vez con las props esperadas', async () => {

        Evento.create.mockResolvedValue({
            id: 1,
            evento: 'movimiento_iniciado',
            props: { tipo: 'gasto', categoria: 'transporte' },
            fecha: new Date()
        });

        const req = {
            body: {
                evento: 'movimiento_iniciado',
                props: { tipo: 'gasto', categoria: 'transporte' }
            }
        };

        const res = crearRes();

        await registrarEvento(req, res);

        expect(Evento.create).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(201);

        const argumento = Evento.create.mock.calls[0][0];
        expect(argumento.evento).toBe('movimiento_iniciado');
        expect(argumento.props).toEqual({ tipo: 'gasto', categoria: 'transporte' });
    });

    test('no guarda datos personales: descarta motivo, monto, userId y nombre', async () => {

        Evento.create.mockResolvedValue({
            id: 2,
            evento: 'movimiento_iniciado',
            props: { tipo: 'gasto', categoria: 'comida' },
            fecha: new Date()
        });

        const req = {
            body: {
                evento: 'movimiento_iniciado',
                props: {
                    tipo: 'gasto',
                    categoria: 'comida',
                    motivo: 'Almuerzo con Juan',
                    monto: 35,
                    userId: 42,
                    nombre: 'Ariany'
                }
            }
        };

        const res = crearRes();

        await registrarEvento(req, res);

        const argumento = Evento.create.mock.calls[0][0];
        expect(argumento.props).not.toHaveProperty('motivo');
        expect(argumento.props).not.toHaveProperty('monto');
        expect(argumento.props).not.toHaveProperty('userId');
        expect(argumento.props).not.toHaveProperty('nombre');
    });

});

describe('registrarEvento - movimiento_guardado', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('registra el evento una sola vez con las props esperadas', async () => {

        Evento.create.mockResolvedValue({
            id: 3,
            evento: 'movimiento_guardado',
            props: { tipo: 'ingreso', categoria: 'otros' },
            fecha: new Date()
        });

        const req = {
            body: {
                evento: 'movimiento_guardado',
                props: { tipo: 'ingreso', categoria: 'otros' }
            }
        };

        const res = crearRes();

        await registrarEvento(req, res);

        expect(Evento.create).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(201);

        const argumento = Evento.create.mock.calls[0][0];
        expect(argumento.evento).toBe('movimiento_guardado');
        expect(argumento.props).toEqual({ tipo: 'ingreso', categoria: 'otros' });
    });

});

describe('registrarEvento - validaciones', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('rechaza un evento que no esta en la lista permitida', async () => {

        const req = {
            body: {
                evento: 'login_exitoso',
                props: {}
            }
        };

        const res = crearRes();

        await registrarEvento(req, res);

        expect(Evento.create).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Evento no permitido' });
    });

    test('rechaza un pedido sin nombre de evento', async () => {

        const req = { body: { props: {} } };
        const res = crearRes();

        await registrarEvento(req, res);

        expect(Evento.create).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

});

describe('obtenerResumen', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('devuelve el conteo por evento y el porcentaje de exito', async () => {

        Evento.findAll.mockResolvedValue([
            { get: (campo) => (campo === 'evento' ? 'movimiento_iniciado' : '8') },
            { get: (campo) => (campo === 'evento' ? 'movimiento_guardado' : '5') }
        ]);

        const req = {};
        const res = { json: jest.fn() };

        await obtenerResumen(req, res);

        expect(res.json).toHaveBeenCalledWith({
            conteos: { movimiento_iniciado: 8, movimiento_guardado: 5 },
            iniciados: 8,
            guardados: 5,
            porcentajeExito: 63
        });
    });

    test('si no hay movimientos iniciados el porcentaje es cero', async () => {

        Evento.findAll.mockResolvedValue([]);

        const req = {};
        const res = { json: jest.fn() };

        await obtenerResumen(req, res);

        expect(res.json).toHaveBeenCalledWith({
            conteos: {},
            iniciados: 0,
            guardados: 0,
            porcentajeExito: 0
        });
    });

});
