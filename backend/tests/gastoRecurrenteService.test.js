jest.mock('../src/config/database', () => ({
    transaction: jest.fn()
}));
jest.mock('../src/models/Gasto', () => ({
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn()
}));
jest.mock('../src/models/GastoRecurrente', () => ({
    findAll: jest.fn()
}));
jest.mock('../src/models/Presupuesto', () => ({
    findOne: jest.fn()
}));

const sequelize = require('../src/config/database');
const Gasto = require('../src/models/Gasto');
const GastoRecurrente = require('../src/models/GastoRecurrente');
const Presupuesto = require('../src/models/Presupuesto');
const {
    fechaLocalHoy,
    fechaValida,
    siguienteFecha,
    procesarRecurrenciasVencidas
} = require('../src/services/gastoRecurrenteService');

describe('gastoRecurrenteService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        sequelize.transaction.mockImplementation((callback) => callback({ LOCK: { UPDATE: 'UPDATE' } }));
        Gasto.findOne.mockResolvedValue(null);
        Gasto.findAll.mockResolvedValue([{ monto: '10.00' }]);
        Gasto.create.mockResolvedValue({ id: 20 });
        Presupuesto.findOne.mockResolvedValue({ limite: '100.00' });
    });

    test('valida fecha ISO y suma siete días a la frecuencia semanal', () => {
        expect(fechaValida('2026-11-03')).toBe(true);
        expect(fechaValida('2026-02-30')).toBe(false);
        expect(fechaValida('03/11/2026')).toBe(false);
        expect(siguienteFecha('2026-11-03', 'semanal')).toBe('2026-11-10');
    });

    test('la frecuencia mensual avanza al mes siguiente y ajusta fin de mes', () => {
        expect(siguienteFecha('2026-01-31', 'mensual')).toBe('2026-02-28');
        expect(siguienteFecha('2028-01-31', 'mensual')).toBe('2028-02-29');
    });

    test('crea la ocurrencia vencida dentro del presupuesto y avanza la fecha', async () => {
        const fecha = fechaLocalHoy();
        const recurrencia = {
            id: 4,
            userId: 9,
            monto: '25.00',
            motivo: 'Pasaje',
            categoria: 'transporte',
            frecuencia: 'semanal',
            proximaFecha: fecha,
            ultimoError: null,
            save: jest.fn()
        };
        GastoRecurrente.findAll.mockResolvedValue([recurrencia]);

        await procesarRecurrenciasVencidas(9);

        expect(Gasto.create).toHaveBeenCalledWith(
            expect.objectContaining({
                recurrenciaId: 4,
                fechaProgramada: fecha,
                monto: 25,
                categoria: 'transporte'
            }),
            expect.any(Object)
        );
        expect(recurrencia.proximaFecha).toBe(siguienteFecha(fecha, 'semanal'));
        expect(recurrencia.ultimoError).toBeNull();
    });

    test('no genera una ocurrencia si falta el presupuesto y conserva la fecha vencida', async () => {
        const fecha = fechaLocalHoy();
        const recurrencia = {
            id: 5,
            userId: 9,
            monto: '25.00',
            motivo: 'Pasaje',
            categoria: 'transporte',
            frecuencia: 'mensual',
            proximaFecha: fecha,
            ultimoError: null,
            save: jest.fn()
        };
        GastoRecurrente.findAll.mockResolvedValue([recurrencia]);
        Presupuesto.findOne.mockResolvedValue(null);

        await procesarRecurrenciasVencidas(9);

        expect(Gasto.create).not.toHaveBeenCalled();
        expect(recurrencia.proximaFecha).toBe(fecha);
        expect(recurrencia.ultimoError).toMatch(/presupuesto mensual/i);
    });
});
