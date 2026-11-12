// Clase 21 - Analitica de interaccion (Parte A: toda la app).
// Los eventos se guardan en el navegador (localStorage), NO en una API.
// Props permitidas: tipo, categoria, mes, supera_limite, motivo, flujo.
//   - motivo: de una LISTA FIJA (ver MotivoError), no texto libre del usuario.
// Nunca se guarda informacion personal: nombre del usuario, email, descripcion libre, monto exacto.

const CLAVE = 'eventos';

// Motivos permitidos para los eventos de error. Lista fija para no guardar texto libre.
export type MotivoError =
    | 'campos_obligatorios'
    | 'motivo_invalido'
    | 'credenciales_invalidas'
    | 'limite_mensual_excedido'
    | 'sin_sesion'
    | 'servidor';

export type PropsEvento = {
    tipo?: string;
    categoria?: string;
    mes?: string;
    supera_limite?: boolean;
    motivo?: MotivoError;
    flujo?: string;
};

export interface RegistroEvento {
    evento: string;
    props: PropsEvento;
    fecha: string;
}

// Lista en memoria + persistencia en localStorage.
export const eventos: RegistroEvento[] = cargarDesdeAlmacenamiento();

function cargarDesdeAlmacenamiento(): RegistroEvento[] {
    try {
        const crudo = localStorage.getItem(CLAVE);
        if (!crudo) return [];
        const parseado = JSON.parse(crudo);
        return Array.isArray(parseado) ? parseado : [];
    } catch {
        return [];
    }
}

function guardarEvento(registro: RegistroEvento) {
    eventos.push(registro);
    try {
        localStorage.setItem(CLAVE, JSON.stringify(eventos));
    } catch {
        // si el storage esta lleno o bloqueado, no romper la UI
    }
}

// La funcion de siete lineas (slide):
export function track(evento: string, props: PropsEvento) {
    const registro: RegistroEvento = {
        evento,
        props,
        fecha: new Date().toISOString()
    };
    guardarEvento(registro);
    console.log('[evento]', registro);
}

// Utilidades para el panel /analitica y los tests:
export function obtenerEventos(): RegistroEvento[] {
    return [...eventos];
}

export function limpiarEventos() {
    eventos.length = 0;
    try { localStorage.removeItem(CLAVE); } catch { /* noop */ }
}
