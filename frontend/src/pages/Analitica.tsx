import { useEffect, useState } from 'react';

interface Resumen {
    conteos: Record<string, number>;
    iniciados: number;
    guardados: number;
    porcentajeExito: number;
}

interface EventoUltimo {
    id: number;
    evento: string;
    props: Record<string, string>;
    fecha: string;
}

const API = 'http://localhost:4000/api/analitica';

function Analitica() {

    const [resumen, setResumen] = useState<Resumen | null>(null);
    const [ultimos, setUltimos] = useState<EventoUltimo[]>([]);

    const cargar = async () => {
        try {
            const [resResumen, resUltimos] = await Promise.all([
                fetch(`${API}/resumen`),
                fetch(`${API}/ultimos`)
            ]);
            if (resResumen.ok) setResumen(await resResumen.json());
            if (resUltimos.ok) setUltimos(await resUltimos.json());
        } catch (error) {
            console.error('Error al cargar analitica:', error);
        }
    };

    useEffect(() => {
        cargar();
    }, []);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>

            <h1>Analítica de interacción</h1>
            <p style={{ color: '#555' }}>Panel propio · solo desarrollo</p>

            <section style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <h2>Flujo principal: registrar movimiento</h2>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }} data-testid="iniciados">
                            {resumen?.iniciados ?? 0}
                        </div>
                        <div>movimiento_iniciado</div>
                    </div>

                    <div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }} data-testid="guardados">
                            {resumen?.guardados ?? 0}
                        </div>
                        <div>movimiento_guardado</div>
                    </div>

                    <div style={{ padding: '10px 16px', backgroundColor: '#cfe2ff', borderRadius: '8px' }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }} data-testid="porcentaje">
                            {resumen?.porcentajeExito ?? 0}%
                        </div>
                        <div>terminan</div>
                    </div>
                </div>

                <p style={{ marginTop: '14px', fontSize: '14px', color: '#555' }}>
                    % = movimientos guardados / movimientos iniciados.
                </p>

                <button onClick={cargar} style={{ marginTop: '8px' }}>Actualizar</button>
            </section>

            <section style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
                <h2>Últimos eventos</h2>

                {ultimos.length === 0 ? (
                    <p>Sin eventos todavía.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {ultimos.map((e) => (
                            <li key={e.id} style={{
                                padding: '8px 10px',
                                borderBottom: '1px solid #eee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '10px',
                                flexWrap: 'wrap'
                            }}>
                                <span><strong>{e.evento}</strong> · {JSON.stringify(e.props)}</span>
                                <span style={{ color: '#555' }}>{new Date(e.fecha).toLocaleString('es-BO')}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

        </div>
    );
}

export default Analitica;
