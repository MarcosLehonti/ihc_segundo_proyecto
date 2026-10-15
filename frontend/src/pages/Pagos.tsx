import { useEffect, useState } from 'react';

interface Gasto {

    id: number;

    monto: number;

    motivo: string;

    fecha: string;

    estado: string;

    tipo?: string;

    categoria?: string;

}

function normalizarEstado(estado: string): string {
    const e = estado.toLowerCase().trim();
    if (e === 'gastado' || e === 'pagado') return 'Pagado';
    if (e === 'pendiente') return 'Pendiente';
    return estado;
}

function Pagos() {

    const [gastos, setGastos] = useState<Gasto[]>([]);

    const token = localStorage.getItem('token');

    const obtenerGastos = async () => {

        try {

            const response = await fetch(
                'http://localhost:4000/api/gastos/obtener',
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {

                setGastos(data);

            } else {

                console.log(data.error);

            }

        } catch (error) {

            console.error('Error al obtener los gastos:', error);

        }

    };

    const handlePagarGasto = async (id: number) => {

        try {

            const response = await fetch(
                `http://localhost:4000/api/gastos/pagar/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {

                console.log(data.message);

                obtenerGastos();

            } else {

                console.log(data.error);

            }

        } catch (error) {

            console.error('Error al pagar el gasto:', error);

        }

    };

    useEffect(() => {

        obtenerGastos();

    }, []);

    return (

        <div>

            <h1>Pagos</h1>

            <h2>Lista de gastos</h2>

            {gastos.map((gasto) => (

                <div key={gasto.id}>

                    <p>
                        Monto: {gasto.monto}
                    </p>

                    <p>
                        Motivo: {gasto.motivo}
                    </p>

                    <p>
                        Tipo: {gasto.tipo || 'gasto'}
                    </p>

                    <p>
                        Categoría: {gasto.categoria || 'otros'}
                    </p>

                    <p>
                        Fecha: {new Date(gasto.fecha).toLocaleString()}
                    </p>

                    <p>
                        Estado: {normalizarEstado(gasto.estado)}
                    </p>

                    <button
                        onClick={() => handlePagarGasto(gasto.id)}
                        disabled={gasto.estado.toLowerCase().trim() === 'gastado'}
                    >
                        {gasto.estado.toLowerCase().trim() === 'gastado'
                            ? 'Pagado'
                            : 'Marcar como pagado'}
                    </button>

                    <hr />

                </div>

            ))}

        </div>

    );

}

export default Pagos;
