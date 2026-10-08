import { useEffect, useState } from 'react';

interface Gasto {
    id: number;
    monto: number;
    motivo: string;
    fecha: string;
    estado: string;
}

function Gastos() {

    const [monto, setMonto] = useState('');
    const [motivo, setMotivo] = useState('');
    const [gastos, setGastos] = useState<Gasto[]>([]);

    const [gastoEditando, setGastoEditando] = useState<number | null>(null);

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

    useEffect(() => {
        obtenerGastos();
    }, []);

    const handleRegitrarGasto = async () => {

        if (!monto || !motivo) {
            console.log('Todos los campos son obligatorios');
            return;
        }

        try {

            const response = await fetch(
                'http://localhost:4000/api/gastos/registrar',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        monto,
                        motivo
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                console.log('Gasto registrado correctamente');

                setMonto('');
                setMotivo('');

                obtenerGastos();

            } else {

                console.log(data.error);

            }

        } catch (error) {
            console.error('Error al registrar el gasto:', error);
        }
    };

    const handleEliminarGasto = async (id: number) => {

        try {

            const response = await fetch(
                `http://localhost:4000/api/gastos/eliminar/${id}`,
                {
                    method: 'DELETE',
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
            console.error('Error al eliminar el gasto:', error);
        }
    };

    const handleEditarGasto = (gasto: Gasto) => {

        setGastoEditando(gasto.id);
        setMonto(String(gasto.monto));
        setMotivo(gasto.motivo);

    };

    const handleActualizarGasto = async () => {

        if (!monto || !motivo || gastoEditando === null) {
            console.log('Todos los campos son obligatorios');
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:4000/api/gastos/editar/${gastoEditando}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        monto,
                        motivo
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                console.log(data.message);

                setMonto('');
                setMotivo('');
                setGastoEditando(null);

                obtenerGastos();

            } else {

                console.log(data.error);

            }

        } catch (error) {
            console.error('Error al editar el gasto:', error);
        }
    };

    return (
        <div>

            <h1>Ingresar Gastos</h1>

            <input
                type="number"
                placeholder="Monto"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
            />

            <input
                type="text"
                placeholder="Motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
            />

            {gastoEditando === null ? (

                <button onClick={handleRegitrarGasto}>
                    Registrar Gasto
                </button>

            ) : (

                <button onClick={handleActualizarGasto}>
                    Guardar cambios
                </button>

            )}

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

                    <button
                        onClick={() => {
                            if (gasto.estado.toLowerCase().trim() === 'gastado') {
                                alert('No se puede editar este gasto porque ya está pagado.');
                                return;
                            }

                            handleEditarGasto(gasto);
                        }}
                    >
                        Editar
                    </button>

                    <button onClick={() => handleEliminarGasto(gasto.id)}>
                        Eliminar
                    </button>

                    <hr />

                </div>

            ))}

        </div>
    );
}

export default Gastos;