import { useEffect, useState } from 'react';
import { obtenerEventos, limpiarEventos, type RegistroEvento } from '../utils/analitica';

interface Embudo {
    titulo: string;
    pasos: { nombre: string; eventos: string[]; cantidad: number }[];
    caidaMayor: { desde: string; hacia: string; caida: number } | null;
}

// Definicion de los embudos (flujos principales) de la app.
const DEFINICIONES_EMBUDOS = [
    {
        titulo: 'Registrar movimiento',
        pasos: [
            { nombre: 'Inicio', eventos: ['movimiento_iniciado'] },
            { nombre: 'Éxito', eventos: ['movimiento_guardado'] }
        ]
    },
    {
        titulo: 'Login',
        pasos: [
            { nombre: 'Inicio', eventos: ['login_iniciado'] },
            { nombre: 'Éxito', eventos: ['login_exitoso'] }
        ]
    },
    {
        titulo: 'Aviso de límite por categoría',
        pasos: [
            { nombre: 'Mostrado', eventos: ['aviso_limite_mostrado'] },
            { nombre: 'Confirmado', eventos: ['aviso_limite_confirmado'] }
        ]
    }
];

function contarEventos(eventos: RegistroEvento[], nombres: string[]): number {
    return eventos.filter((e) => nombres.includes(e.evento)).length;
}

function construirEmbudo(todos: RegistroEvento[], def: typeof DEFINICIONES_EMBUDOS[number]): Embudo {
    const pasos = def.pasos.map((p) => ({
        nombre: p.nombre,
        eventos: p.eventos,
        cantidad: contarEventos(todos, p.eventos)
    }));

    let caidaMayor: Embudo['caidaMayor'] = null;
    for (let i = 1; i < pasos.length; i++) {
        const caida = Math.max(0, pasos[i - 1].cantidad - pasos[i].cantidad);
        if (caida > 0 && (!caidaMayor || caida > caidaMayor.caida)) {
            caidaMayor = { desde: pasos[i - 1].nombre, hacia: pasos[i].nombre, caida };
        }
    }

    return { titulo: def.titulo, pasos, caidaMayor };
}

function Analitica() {

    const [eventos, setEventos] = useState<RegistroEvento[]>([]);

    const refrescar = () => setEventos(obtenerEventos());

    useEffect(() => {
        refrescar();
    }, []);

    const embudos = DEFINICIONES_EMBUDOS.map((d) => construirEmbudo(eventos, d));

    // Conteo de errores por motivo (motivo viene de una lista fija).
    const errores = eventos.filter((e) => e.evento === 'error_validacion' || e.evento === 'login_fallido' || e.evento === 'movimiento_rechazado');
    const conteosError: Record<string, number> = {};
    for (const e of errores) {
        const clave = `${e.evento} · ${e.props.motivo || 'sin_motivo'}`;
        conteosError[clave] = (conteosError[clave] || 0) + 1;
    }

    // Filtros sin resultado.
    const filtrosVacios = eventos.filter((e) => e.evento === 'filtro_sin_resultado').length;

    const ultimos = [...eventos].reverse().slice(0, 15);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left', padding: '0 16px' }}>

            <h1>Analítica de interacción</h1>
            <p style={{ color: '#555' }}>Panel propio · toda la app · eventos guardados en el navegador</p>

            <section style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                    <button type="button" onClick={refrescar}>Actualizar</button>
                    <button type="button" onClick={() => { limpiarEventos(); refrescar(); }}>Limpiar eventos</button>
                </div>

                <h2>Embudos por flujo</h2>

                {embudos.map((e) => {
                    const pct = e.pasos[0].cantidad > 0
                        ? Math.round((e.pasos[e.pasos.length - 1].cantidad / e.pasos[0].cantidad) * 100)
                        : 0;
                    return (
                        <div key={e.titulo} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                            <h3 style={{ margin: '4px 0' }}>{e.titulo}</h3>
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                                {e.pasos.map((p) => (
                                    <div key={p.nombre}>
                                        <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{p.cantidad}</div>
                                        <div style={{ fontSize: '13px', color: '#555' }}>{p.nombre}</div>
                                    </div>
                                ))}
                                <div style={{ padding: '8px 14px', backgroundColor: '#cfe2ff', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{pct}%</div>
                                    <div style={{ fontSize: '13px' }}>terminan</div>
                                </div>
                                {e.caidaMayor && (
                                    <div style={{ fontSize: '13px', color: '#8a1c12' }}>
                                        Caída: {e.caidaMayor.desde} → {e.caidaMayor.hacia} (−{e.caidaMayor.caida})
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </section>

            <section style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <h2>Errores por motivo</h2>
                {Object.keys(conteosError).length === 0 ? (
                    <p>Sin errores registrados.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {Object.entries(conteosError).map(([clave, n]) => (
                            <li key={clave} style={{ padding: '4px 0' }}>
                                <strong>{n}</strong> · {clave}
                            </li>
                        ))}
                    </ul>
                )}
                <p style={{ fontSize: '13px', color: '#555' }}>Filtros sin resultado: <strong>{filtrosVacios}</strong></p>
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
