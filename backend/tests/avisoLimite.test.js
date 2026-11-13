const { registrarGasto, editarGasto } = require('../src/controllers/gastoController');

const Gasto = require('../src/models/Gasto');
const Presupuesto = require('../src/models/Presupuesto');
const PresupuestoCategoria = require('../src/models/PresupuestoCategoria');

jest.mock('../src/models/Gasto');
jest.mock('../src/models/Presupuesto');
jest.mock('../src/models/PresupuestoCategoria');

// Tarea 9 - Aviso antes de superar el limite de la categoria.
function crearRes() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

beforeEach(() => {
    jest.resetAllMocks();
    // Presupuesto mensual amplio: el unico tope en juego es el de la categoria.
    Presupuesto.findOne.mockResolvedValue({ limite: 10000 });
    // Comida: limite 100 y ya se gastaron 80 este mes.
    PresupuestoCategoria.findOne.mockResolvedValue({ limite: 100 });
    Gasto.findAll.mockResolvedValue([{ monto: 80 }]);
    Gasto.create.mockImplementation(async (datos) => ({ id: 10, ...datos }));
});

describe('registrarGasto con aviso de limite', () => {

    test('un gasto que no pasa el limite se guarda sin aviso', async () => {
        const req = { user: { id: 1 }, body: { monto: 15, motivo: 'Almuerzo', tipo: 'gasto', categoria: 'comida' } };
        const res = crearRes();

        await registrarGasto(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(Gasto.create).toHaveBeenCalled();
    });

    test('si el gasto pasa el limite responde 409 con cuanto se pasaria y no guarda', async () => {
        const req = { user: { id: 1 }, body: { monto: 50, motivo: 'Cena', tipo: 'gasto', categoria: 'comida' } };
        const res = crearRes();

        await registrarGasto(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            requiereConfirmacion: true,
            categoria: 'comida',
            limite: 100,
            consumido: 80,
            exceso: 30
        }));
        expect(Gasto.create).not.toHaveBeenCalled();
    });

    test('con confirmarExceso el gasto se guarda aunque quede excedido', async () => {
        const req = { user: { id: 1 }, body: { monto: 50, motivo: 'Cena', tipo: 'gasto', categoria: 'comida', confirmarExceso: true } };
        const res = crearRes();

        await registrarGasto(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(Gasto.create).toHaveBeenCalledWith(expect.objectContaining({ monto: 50, categoria: 'comida' }));
    });

    test('los ingresos nunca generan aviso', async () => {
        const req = { user: { id: 1 }, body: { monto: 500, motivo: 'Mesada', tipo: 'ingreso', categoria: 'comida' } };
        const res = crearRes();

        await registrarGasto(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(PresupuestoCategoria.findOne).not.toHaveBeenCalled();
    });
});

describe('editarGasto con aviso de limite', () => {

    test('una edicion que pasa el limite pide confirmacion y no cambia el gasto', async () => {
        const gasto = {
            id: 7, userId: 1, monto: 10, motivo: 'Snack', estado: 'pendiente',
            tipo: 'gasto', categoria: 'comida', fecha: new Date(), save: jest.fn()
        };
        Gasto.findByPk.mockResolvedValue(gasto);
        const req = { user: { id: 1 }, params: { id: 7 }, body: { monto: 40, motivo: 'Snack', tipo: 'gasto', categoria: 'comida' } };
        const res = crearRes();

        await editarGasto(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ exceso: 20 }));
        expect(gasto.monto).toBe(10);
        expect(gasto.save).not.toHaveBeenCalled();
    });
});
