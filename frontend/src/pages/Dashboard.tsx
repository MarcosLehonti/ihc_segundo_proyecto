import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Presupuesto {
    id: number;
    userId: number;
    mes: number;
    anio: number;
    limite: string | number;
}

interface ResumenPresupuesto {
    presupuesto: Presupuesto;
    gastado: number;
    disponible: number;
}

function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [resumen, setResumen] = useState<ResumenPresupuesto | null>(null);
    const [limite, setLimite] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(true);

    const navigate = useNavigate();

    const ahora = new Date();
    const mes = ahora.getMonth() + 1;
    const anio = ahora.getFullYear();

    const cargarPresupuesto = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:4000/api/presupuesto/obtener?mes=${mes}&anio=${anio}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setResumen(data);
                setLimite(String(data.presupuesto.limite));
            } else if (response.status === 404) {
                setResumen(null);
            } else {
                setError(data.error || 'Error al obtener el presupuesto');
            }
        } catch (error) {
            console.error('Error al obtener el presupuesto:', error);
            setError('No se pudo conectar con el servidor');
        }
    };

    useEffect(() => {
        const getUser = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(
                    'http://localhost:4000/api/auth/me',
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setUser(data);
                } else {
                    console.log(data.error);
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
            } catch (error) {
                console.error('Error al obtener el usuario:', error);
                setError('No se pudo obtener la información del usuario');
            }

            await cargarPresupuesto();
            setCargando(false);
        };

        getUser();
    }, [navigate]);

    const handleGuardarPresupuesto = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError('');
        setMensaje('');

        const limiteNumerico = Number(limite);

        if (!Number.isFinite(limiteNumerico) || limiteNumerico <= 0) {
            setError('El límite mensual debe ser mayor que cero');
            return;
        }

        if (resumen && limiteNumerico < resumen.gastado) {
            setError('El límite no puede ser menor que lo que ya has gastado en el mes');
            return;
        }

        if (resumen) {
            const confirmar = window.confirm(
                `¿Confirmas actualizar el límite mensual a Bs ${limiteNumerico.toFixed(2)}? Esta acción reemplazará el límite actual de Bs ${Number(resumen.presupuesto.limite).toFixed(2)}.`
            );
            if (!confirmar) return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(
                'http://localhost:4000/api/presupuesto/establecer',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        limite: limiteNumerico,
                        mes,
                        anio
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'No se pudo guardar el presupuesto');
                return;
            }

            setMensaje(data.message || 'Presupuesto guardado correctamente');
            await cargarPresupuesto();
        } catch (error) {
            console.error('Error al guardar el presupuesto:', error);
            setError('No se pudo conectar con el servidor');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (cargando) {
        return <div>Cargando dashboard...</div>;
    }

    return (
        <div>
            <h1>Dashboard</h1>

            {user && (
                <div>
                    <p>Bienvenido, {user.name}</p>
                    <p>Correo: {user.email}</p>
                    <p>Rol: {user.role}</p>
                </div>
            )}

            <hr />

            <section>
                <h2>Presupuesto mensual</h2>
                <p>Período: {mes}/{anio}</p>

                {resumen ? (
                    <div>
                        <p>
                            Límite mensual: Bs{' '}
                            {Number(resumen.presupuesto.limite).toFixed(2)}
                        </p>
                        <p>
                            Total gastado: Bs{' '}
                            {Number(resumen.gastado).toFixed(2)}
                        </p>
                        <p>
                            Saldo disponible: Bs{' '}
                            {Number(resumen.disponible).toFixed(2)}
                        </p>
                    </div>
                ) : (
                    <p>No has establecido un presupuesto para este mes.</p>
                )}

                <form onSubmit={handleGuardarPresupuesto}>
                    <div>
                        <label htmlFor="limite">
                            {resumen
                                ? 'Actualizar límite mensual (Bs)'
                                : 'Establecer límite mensual (Bs)'}
                        </label>

                        <input
                            id="limite"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={limite}
                            onChange={(event) => setLimite(event.target.value)}
                            required
                        />
                    </div>

                    <button type="submit">
                        Guardar presupuesto
                    </button>
                </form>

                {mensaje && <p role="status">{mensaje}</p>}
                {error && <p role="alert">{error}</p>}
            </section>

            <hr />

            <button onClick={handleLogout}>
                Cerrar sesión
            </button>
        </div>
    );
}

export default Dashboard;