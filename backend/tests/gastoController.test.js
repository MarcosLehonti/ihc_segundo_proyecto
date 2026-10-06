const { pagarGasto } = require('../src/controllers/gastoController');

const Gasto = require('../src/models/Gasto');

jest.mock('../src/models/Gasto');

describe('pagarGasto', () => {

    test('debe cambiar el estado de un gasto de pendiente a gastado', async () => {

        const gasto = {
            id: 1,
            monto: 100,
            motivo: 'Comida',
            estado: 'pendiente',
            save: jest.fn()
        };

        Gasto.findByPk.mockResolvedValue(gasto);

        const req = {
            params: {
                id: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await pagarGasto(req, res);

        expect(gasto.estado).toBe('gastado');

        expect(gasto.save).toHaveBeenCalled();

        expect(res.json).toHaveBeenCalledWith({
            message: 'Gasto pagado correctamente',
            gasto
        });

    });

    test('debe devolver error 404 si el gasto no existe', async () => {

        Gasto.findByPk.mockResolvedValue(null);

        const req = {
            params: {
                id: 99
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await pagarGasto(req, res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            error: 'Gasto no encontrado'
        });

    });

    test('debe devolver error 500 si ocurre un error al guardar el gasto', async () => {

        const gasto = {
            id: 3,
            monto: 2000,
            motivo: 'Compra de materiales',
            estado: 'pendiente',
            save: jest.fn().mockRejectedValue(new Error('Error de base de datos'))
        };

        Gasto.findByPk.mockResolvedValue(gasto);

        const req = {
            params: {
                id: 3
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await pagarGasto(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            error: 'Error al marcar el gasto como pagado'
        });

    });


    test('debe buscar el gasto utilizando el ID recibido', async () => {

        const gasto = {
            id: 3,
            monto: 2000,
            motivo: 'Compra de materiales',
            estado: 'pendiente',
            save: jest.fn()
        };

        Gasto.findByPk.mockResolvedValue(gasto);

        const req = {
            params: {
                id: 3
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await pagarGasto(req, res);

        expect(Gasto.findByPk).toHaveBeenCalledWith(3);

    });


});
