// Clase 21 - Analitica de interaccion.
// Envia un evento del flujo principal a nuestro backend (panel propio, obligatorio)
// y, si esta configurado, tambien a Google Analytics 4 (extra).
// Nunca mandar: motivo, nombre del usuario, descripcion libre, monto exacto.
// Props permitidas: tipo, categoria.

const API = 'http://localhost:4000/api/analitica';

export type PropsEvento = {
    tipo?: string;
    categoria?: string;
};

// Google Analytics 4: gtag se inicializa en index.html.
// Si el bloque no se cargo (bloqueador, modo offline), gtag queda undefined y se omite.
declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

export async function track(evento: string, props: PropsEvento = {}) {
    const registro = {
        evento,
        props,
        fecha: new Date().toISOString()
    };

    console.log('[evento]', registro);

    // 1) Panel propio (obligatorio): nuestra tabla eventos.
    try {
        await fetch(`${API}/evento`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                evento: registro.evento,
                props: registro.props
            })
        });
    } catch (error) {
        console.log('[evento] no se pudo enviar al panel propio', error);
    }

    // 2) Google Analytics 4 (extra): mismo evento, mismas props.
    try {
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
            window.gtag('event', registro.evento, registro.props);
        }
    } catch (error) {
        console.log('[evento] no se pudo enviar a GA', error);
    }
}
