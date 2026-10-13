const { filtrarGastos } = require('../src/controllers/gastoController');
const Gasto = require('../src/models/Gasto');

jest.mock('../src/models/Gasto');

describe('filtrarGastos', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('debe devolver movimientos filtrados y el calculo correcto del total (caso con resultados)', async () => {

        const movimientosSimulados = [
            {
                id: 1,
                monto: 50,
                motivo: 'Almuerzo universitario',
                tipo: 'gasto',
                categoria: 'comida',
                estado: 'gastado',
                fecha: new Date('2026-03-10')
            },
            {
                id: 2,
                monto: 35.5,
                motivo: 'Cena rápida',
                tipo: 'gasto',
                categoria: 'comida',
                estado: 'gastado',
                fecha: new Date('2026-03-12')
            }
        ];

        Gasto.findAll.mockResolvedValue(movimientosSimulados);

        const req = {
            user: { id: 1 },
            query: {
                buscar: 'Almuerzo',
                tipo: 'gasto',
                categoria: 'comida',
                estado: 'gastado',
                periodo: 'este_mes'
            }
        };

        const res = {
            json: jest.fn()
        };

        await filtrarGastos(req, res);

        expect(Gasto.findAll).toHaveBeenCalled();

        expect(res.json).toHaveBeenCalledWith({
            movimientos: movimientosSimulados,
            total: 85.5,
            cantidad: 2
        });

    });

    test('debe devolver lista vacia y total 0 cuando ningun movimiento coincida (caso sin resultados)', async () => {

        Gasto.findAll.mockResolvedValue([]);

        const req = {
            user: { id: 1 },
            query: {
                buscar: 'ConceptoInexistente',
                categoria: 'estudio'
            }
        };

        const res = {
            json: jest.fn()
        };

        await filtrarGastos(req, res);

        expect(Gasto.findAll).toHaveBeenCalled();

        expect(res.json).toHaveBeenCalledWith({
            movimientos: [],
            total: 0,
            cantidad: 0
        });

    });

    test('debe calcular el total del periodo este_mes coincidiendo con los gastos del mes', async () => {

        const gastosDelMes = [
            { id: 1, monto: 120, motivo: 'Material de estudio', tipo: 'gasto' },
            { id: 2, monto: 80, motivo: 'Fotocopias', tipo: 'gasto' }
        ];

        Gasto.findAll.mockResolvedValue(gastosDelMes);

        const req = {
            user: { id: 1 },
            query: {
                periodo: 'este_mes',
                tipo: 'gasto'
            }
        };

        const res = {
            json: jest.fn()
        };

        await filtrarGastos(req, res);

        expect(res.json).toHaveBeenCalledWith({
            movimientos: gastosDelMes,
            total: 200,
            cantidad: 2
        });

    });

});
