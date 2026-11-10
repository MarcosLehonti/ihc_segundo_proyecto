jest.mock('../src/models/Gasto', () => ({}));
jest.mock('../src/models/Meta', () => ({}));

const { calcularDisponible } = require('../src/services/metaService');

describe('calcularDisponible', () => {
    test('disponible = ingresos - gastos - fondos reservados', () => {
        const r = calcularDisponible(
            [{ tipo: 'ingreso', monto: '1000' }, { tipo: 'gasto', monto: '200' }, { monto: 50 }],
            [{ ahorrado: '300' }, { ahorrado: 100 }]
        );
        expect(r).toEqual({ ingresos: 1000, gastos: 250, reservado: 400, disponible: 350, saldoTotal: 750 });
    });

    test('mover fondos entre metas no cambia el saldo total ni el disponible', () => {
        const movs = [{ tipo: 'ingreso', monto: 500 }];
        const antes = calcularDisponible(movs, [{ ahorrado: 100 }, { ahorrado: 0 }]);
        const despues = calcularDisponible(movs, [{ ahorrado: 40 }, { ahorrado: 60 }]);
        expect(despues.saldoTotal).toBe(antes.saldoTotal);
        expect(despues.disponible).toBe(antes.disponible);
    });
});
