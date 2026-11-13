import { useEffect, useState } from 'react';
import { obtenerEventos, limpiarEventos, EMBUDOS, type RegistroEvento } from '../utils/analitica';

const tarjeta = { border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '20px' };

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

    // Tarea 9: un embudo por flujo con la caida entre pasos.
    const embudos = EMBUDOS.map(({ flujo, pasos }) => {
        const filas = pasos.map((paso, i) => {
            const cantidad = conteos[paso] || 0;
            const anterior = i === 0 ? null : conteos[pasos[i - 1]] || 0;
            const caida = anterior ? Math.max(0, Math.round(((anterior - cantidad) / anterior) * 100)) : null;
            return { paso, cantidad, caida };
        });
        return { flujo, filas };
    });

    // Paso con la mayor caida de toda la app.
    let mayorCaida: { flujo: string; paso: string; caida: number } | null = null;
    for (const { flujo, filas } of embudos) {
        for (const fila of filas) {
            if (fila.caida !== null && (!mayorCaida || fila.caida > mayorCaida.caida)) {
                mayorCaida = { flujo, paso: fila.paso, caida: fila.caida };
            }
        }
    }

    // Errores que frenan la tarea, agrupados por motivo (lista fija).
    const errores: Record<string, number> = {};
    for (const e of eventos) {
        if (e.evento.endsWith('_rechazado') || e.evento === 'meta_rechazada') {
            const clave = `${e.evento} · ${e.props.motivo || 'sin_motivo'}`;
            errores[clave] = (errores[clave] || 0) + 1;
        }
    }

    const busquedasVacias: Record<string, number> = {};
    for (const e of eventos) {
        if (e.evento === 'busqueda_sin_resultados') {
            const clave = e.props.filtros || 'sin_filtros';
            busquedasVacias[clave] = (busquedasVacias[clave] || 0) + 1;
        }
    }

    const ultimos = [...eventos].reverse().slice(0, 10);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>

            <h1>Analítica de interacción</h1>
            <p style={{ color: '#555' }}>Panel propio · solo desarrollo · eventos guardados en el navegador</p>

            <div style={{ marginBottom: '20px' }}>
                <button type="button" onClick={refrescar} style={{ marginRight: '8px' }}>Actualizar</button>
                <button type="button" onClick={() => { limpiarEventos(); refrescar(); }}>Limpiar eventos</button>
            </div>

            <section style={{ ...tarjeta, backgroundColor: '#fff3cd', color: '#1f2328' }} aria-labelledby="titulo-mayor-caida">
                <h2 id="titulo-mayor-caida">Paso con la mayor caída</h2>
                <p data-testid="mayor-caida">
                    {mayorCaida
                        ? `${mayorCaida.flujo}: ${mayorCaida.caida}% no llega a ${mayorCaida.paso}`
                        : 'Sin datos suficientes todavía.'}
                </p>
            </section>

            {embudos.map(({ flujo, filas }) => (
                <section key={flujo} style={tarjeta} aria-label={`Embudo ${flujo}`}>
                    <h2>{flujo}</h2>
                    <ol style={{ paddingLeft: '20px' }}>
                        {filas.map(({ paso, cantidad, caida }) => (
                            <li key={paso} style={{ marginBottom: '6px' }}>
                                <strong>{paso}</strong>: <span data-testid={`conteo-${paso}`}>{cantidad}</span>
                                {caida !== null && (
                                    <span style={{ color: caida > 0 ? '#8a1c12' : '#555' }}> · caída {caida}%</span>
                                )}
                            </li>
                        ))}
                    </ol>
                </section>
            ))}

            <section style={tarjeta} aria-labelledby="titulo-errores">
                <h2 id="titulo-errores">Errores que frenan la tarea</h2>
                {Object.keys(errores).length === 0 ? (
                    <p>Sin errores registrados.</p>
                ) : (
                    <ul>
                        {Object.entries(errores).map(([clave, cantidad]) => (
                            <li key={clave}>{clave}: {cantidad}</li>
                        ))}
                    </ul>
                )}
            </section>

            <section style={tarjeta} aria-labelledby="titulo-busquedas">
                <h2 id="titulo-busquedas">Búsquedas o filtros sin resultados</h2>
                {Object.keys(busquedasVacias).length === 0 ? (
                    <p>Ninguna búsqueda vacía.</p>
                ) : (
                    <ul>
                        {Object.entries(busquedasVacias).map(([filtros, cantidad]) => (
                            <li key={filtros}>Filtros {filtros}: {cantidad}</li>
                        ))}
                    </ul>
                )}
            </section>

            <section style={tarjeta}>
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
