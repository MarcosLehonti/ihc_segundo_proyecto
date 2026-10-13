const { establecerPresupuesto, obtenerPresupuesto } = require('../src/controllers/presupuestoController');
const { registrarGasto } = require('../src/controllers/gastoController');

const Presupuesto = require('../src/models/Presupuesto');
const Gasto = require('../src/models/Gasto');

jest.mock('../src/models/Presupuesto');
jest.mock('../src/models/Gasto');

describe('establecerPresupuesto', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('debe permitir definir un limite mensual mayor a cero', async () => {

        Gasto.findAll.mockResolvedValue([
            { monto: 100 }
        ]);

        Presupuesto.findOne.mockResolvedValue(null);

        const nuevoPresupuesto = {
            id: 1,
            userId: 1,
            limite: 500,
            mes: 3,
            anio: 2026
        };

        Presupuesto.create.mockResolvedValue(nuevoPresupuesto);

        const req = {
            body: {
                limite: 500,
                mes: 3,
                anio: 2026
            },
            user: {
                id: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await establecerPresupuesto(req, res);

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Presupuesto mensual establecido correctamente',
            presupuesto: nuevoPresupuesto
        });

    });

    test('debe rechazar el limite si es menor a lo que ya se gasto en el mes', async () => {

        Gasto.findAll.mockResolvedValue([
            { monto: 200 },
            { monto: 150 }
        ]);

        const req = {
            body: {
                limite: 250,
                mes: 3,
                anio: 2026
            },
            user: {
                id: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await establecerPresupuesto(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            error: 'El límite no puede ser menor que lo que ya has gastado en el mes'
        });

        expect(Presupuesto.create).not.toHaveBeenCalled();

    });

    test('debe rechazar un limite vacio, en cero o negativo', async () => {

        const req = {
            body: {
                limite: 0,
                mes: 3,
                anio: 2026
            },
            user: {
                id: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await establecerPresupuesto(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            error: 'Debes proporcionar un límite positivo, un mes válido y un año válido'
        });

    });

});

describe('regla de limite mensual al registrar gasto', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('debe permitir registrar un gasto si el total del mes no supera el limite', async () => {

        Presupuesto.findOne.mockResolvedValue({
            id: 1,
            userId: 1,
            limite: 1000
        });

        Gasto.findAll.mockResolvedValue([
            { monto: 300 }
        ]);

        const nuevoGasto = {
            id: 1,
            monto: 200,
            motivo: 'Material de estudio',
            userId: 1
        };

        Gasto.create.mockResolvedValue(nuevoGasto);

        const req = {
            body: {
                monto: 200,
                motivo: 'Material de estudio'
            },
            user: {
                id: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await registrarGasto(req, res);

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith(nuevoGasto);

    });

    test('debe bloquear el gasto si hace que el total del mes supere el limite', async () => {

        Presupuesto.findOne.mockResolvedValue({
            id: 1,
            userId: 1,
            limite: 500
        });

        Gasto.findAll.mockResolvedValue([
            { monto: 400 }
        ]);

        const req = {
            body: {
                monto: 150,
                motivo: 'Salida de fin de semana'
            },
            user: {
                id: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await registrarGasto(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: 'El gasto supera el presupuesto mensual disponible'
            })
        );

        expect(Gasto.create).not.toHaveBeenCalled();

    });

});
