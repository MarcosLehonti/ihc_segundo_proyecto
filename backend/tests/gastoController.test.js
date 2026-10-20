const { pagarGasto, editarGasto, eliminarGasto, registrarGasto } = require('../src/controllers/gastoController');

const Gasto = require('../src/models/Gasto');
const Presupuesto = require('../src/models/Presupuesto');

jest.mock('../src/models/Gasto');
jest.mock('../src/models/Presupuesto');

describe('pagarGasto', () => {

    test('debe cambiar el estado de un gasto de pendiente a gastado', async () => {

        const gasto = {
            id: 1,
            monto: 100,
            motivo: 'Comida',
            estado: 'pendiente',
            userId: 1,
            save: jest.fn()
        };

        Gasto.findByPk.mockResolvedValue(gasto);

        const req = {
            params: {
                id: 1
            },
            user: {
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
            },
            user: {
                id: 1
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
            userId: 1,
            save: jest.fn().mockRejectedValue(new Error('Error de base de datos'))
        };

        Gasto.findByPk.mockResolvedValue(gasto);

        const req = {
            params: {
                id: 3
            },
            user: {
                id: 1
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
            userId: 1,
            save: jest.fn()
        };

        Gasto.findByPk.mockResolvedValue(gasto);

        const req = {
            params: {
                id: 3
            },
            user: {
                id: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await pagarGasto(req, res);

        expect(Gasto.findByPk).toHaveBeenCalledWith(3);

    });

    test('debe rechazar el pago si el gasto pertenece a otro usuario', async () => {

        const gasto = {
            id: 3,
            monto: 2000,
            motivo: 'Compra de materiales',
            estado: 'pendiente',
            userId: 2,
            save: jest.fn()
        };

        Gasto.findByPk.mockResolvedValue(gasto);

        const req = {
            params: {
                id: 3
            },
            user: {
                id: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await pagarGasto(req, res);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.json).toHaveBeenCalledWith({
            error: 'No tienes permiso para pagar este gasto'
        });

        expect(gasto.estado).toBe('pendiente');

        expect(gasto.save).not.toHaveBeenCalled();

    });

    test('debe rechazar la edicion de un gasto que pertenece a otro usuario', async () => {

        const gasto = {
            id: 3,
            monto: 2000,
            motivo: 'Compra de materiales',
            estado: 'pendiente',
            userId: 2,
            save: jest.fn()
        };

        Gasto.findByPk.mockResolvedValue(gasto);

        const req = {
            params: {
                id: 3
            },
            user: {
                id: 1
            },
            body: {
                monto: 500,
                motivo: 'Intento de modificación'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await editarGasto(req, res);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.json).toHaveBeenCalledWith({
            error: 'No tienes permiso para editar este gasto'
        });

        expect(gasto.monto).toBe(2000);

        expect(gasto.motivo).toBe('Compra de materiales');

        expect(gasto.estado).toBe('pendiente');

        expect(gasto.save).not.toHaveBeenCalled();

    });

    test('debe rechazar la eliminacion de un gasto que pertenece a otro usuario', async () => {

        const gasto = {
            id: 3,
            monto: 2000,
            motivo: 'Compra de materiales',
            estado: 'pendiente',
            userId: 2,
            destroy: jest.fn()
        };

        Gasto.findByPk.mockResolvedValue(gasto);

        const req = {
            params: {
                id: 3
            },
            user: {
                id: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await eliminarGasto(req, res);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.json).toHaveBeenCalledWith({
            error: 'No tienes permiso para eliminar este gasto'
        });

        expect(gasto.destroy).not.toHaveBeenCalled();

    });

});

describe('registrarGasto - Asignación de Usuario (Sub-issue #23)', () => {

    test('debe asociar obligatoriamente el gasto al usuario autenticado (userId)', async () => {
        Presupuesto.findOne.mockResolvedValue({ limite: 1000 });
        Gasto.findAll.mockResolvedValue([]);
        Gasto.create.mockImplementation(data => Promise.resolve({ id: 10, ...data }));

        const req = {
            body: {
                monto: 120,
                motivo: 'Materiales de estudio',
                tipo: 'gasto',
                categoria: 'estudio'
            },
            user: {
                id: 42
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await registrarGasto(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(Gasto.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 42,
                monto: 120,
                motivo: 'Materiales de estudio'
            })
        );
    });

});