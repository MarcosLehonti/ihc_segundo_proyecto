import { useEffect, useState } from 'react';

interface Gasto {

    id: number;

    monto: number;

    motivo: string;

    fecha: string;

    estado: string;

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
                        Fecha: {new Date(gasto.fecha).toLocaleString()}
                    </p>

                    <p>
                        Estado: {gasto.estado}
                    </p>

                    {gasto.estado === 'pendiente' && (

                        <button onClick={() => handlePagarGasto(gasto.id)}>
                            Pagar gasto
                        </button>

                    )}

                    <hr />

                </div>

            ))}

        </div>

    );

}

export default Pagos;