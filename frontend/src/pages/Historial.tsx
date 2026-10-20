import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

interface Movimiento {
    id: number;
    monto: number;
    motivo: string;
    fecha: string;
    estado: string;
    tipo?: string;
    categoria?: string;
}

function Historial() {
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
    const [filtroTipo, setFiltroTipo] = useState<'todos' | 'gasto' | 'ingreso'>('todos');
    const [cargando, setCargando] = useState(true);

    const token = localStorage.getItem('token');

    const cargarHistorial = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/gastos/historial-mes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setMovimientos(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error al cargar historial:', error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarHistorial();
    }, []);

    const filtrados = movimientos.filter((m) => {
        if (filtroTipo === 'todos') return true;
        return (m.tipo || 'gasto').toLowerCase() === filtroTipo;
    });

    return (
        <div>
            <Navbar />
            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
                <h1>Historial de Movimientos del Mes</h1>

                {/* Filtros simples con minima carga decisional segun Ley de Hick */}
                <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
                    <button
                        type="button"
                        onClick={() => setFiltroTipo('todos')}
                        style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            backgroundColor: filtroTipo === 'todos' ? '#0066cc' : '#f5f5f5',
                            color: filtroTipo === 'todos' ? '#fff' : '#333',
                            fontWeight: 'bold'
                        }}
                    >
                        Todos ({movimientos.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFiltroTipo('gasto')}
                        style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            backgroundColor: filtroTipo === 'gasto' ? '#d32f2f' : '#f5f5f5',
                            color: filtroTipo === 'gasto' ? '#fff' : '#333',
                            fontWeight: 'bold'
                        }}
                    >
                        Solo Gastos
                    </button>
                    <button
                        type="button"
                        onClick={() => setFiltroTipo('ingreso')}
                        style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            backgroundColor: filtroTipo === 'ingreso' ? '#2e7d32' : '#f5f5f5',
                            color: filtroTipo === 'ingreso' ? '#fff' : '#333',
                            fontWeight: 'bold'
                        }}
                    >
                        Solo Ingresos
                    </button>
                </div>

                {cargando ? (
                    <p>Cargando movimientos del mes...</p>
                ) : (
                    <div>
                        {filtrados.map((m) => (
                            <div key={m.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                                <strong>{m.motivo}</strong> - Bs {Number(m.monto).toFixed(2)} ({m.tipo || 'gasto'})
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Historial;
