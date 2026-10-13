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



});
