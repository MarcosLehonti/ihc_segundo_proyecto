import { useEffect, useState } from 'react';
import { obtenerEventos, limpiarEventos, type RegistroEvento } from '../utils/analitica';

function Analitica() {

    const [eventos, setEventos] = useState<RegistroEvento[]>([]);

    const refrescar = () => setEventos(obtenerEventos());

    useEffect(() => {
        refrescar();
    }, []);

    const conteos: Record<string, number> = {};
    for (const e of eventos) {
        conteos[e.evento] = (conteos[e.evento] || 0) + 1;
    }

    const iniciados = conteos['movimiento_iniciado'] || 0;
    const guardados = conteos['movimiento_guardado'] || 0;
    const porcentajeExito = iniciados > 0 ? Math.round((guardados / iniciados) * 100) : 0;

    const ultimos = [...eventos].reverse().slice(0, 10);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>

            <h1>Analítica de interacción</h1>
            <p style={{ color: '#555' }}>Panel propio · solo desarrollo · eventos guardados en el navegador</p>

            <section style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <h2>Flujo principal: registrar movimiento</h2>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{iniciados}</div>
                        <div>movimiento_iniciado</div>
                    </div>

                    <div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{guardados}</div>
                        <div>movimiento_guardado</div>
                    </div>

                    <div style={{ padding: '10px 16px', backgroundColor: '#cfe2ff', borderRadius: '8px' }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{porcentajeExito}%</div>
                        <div>terminan</div>
                    </div>
                </div>

                <p style={{ marginTop: '14px', fontSize: '14px', color: '#555' }}>
                    % = movimientos guardados / movimientos iniciados.
                </p>

                <button type="button" onClick={refrescar} style={{ marginRight: '8px' }}>Actualizar</button>
                <button type="button" onClick={() => { limpiarEventos(); refrescar(); }}>Limpiar eventos</button>
            </section>

            <section style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
                <h2>Últimos eventos</h2>

                {ultimos.length === 0 ? (
                    <p>Sin eventos todavía.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {ultimos.map((e, i) => (
                            <li key={i} style={{
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
