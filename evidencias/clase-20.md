# Clase 20 · Arquitectura de información

**Integrantes:** Franco Enrique · Ariany Claure

## Problema identificado

En la pantalla **Gastos** el usuario que quiere ver solo los movimientos **pendientes** o solo los **pagados** tiene que:

1. Abrir el panel "▼ Más filtros".
2. Buscar el desplegable "Estado".
3. Elegir "Pendiente" o "Pagado".

Son **tres clics** y el filtro está escondido detrás de un desplegable, aunque es una de las decisiones más frecuentes al revisar la lista. La tarea que resulta difícil de encontrar es: *"ver qué tengo pendiente de pagar este mes"*.

## Propuesta (mockup)

Subir el filtro de estado al **primer nivel**, al lado de los filtros rápidos ya existentes. Mantener los mismos botones redondeados, los mismos colores suaves del proyecto y el patrón de tab activo con fondo distinto.

```
Filtros rápidos:  [ Todos ] [ Solo gastos ] [ Solo ingresos ] [ Este mes ]
                  | Estado: [ Todos los estados ] [ Pendientes ] [ Pagados ]   [ ▼ Más filtros ]
```

**Motivo:** reducir de tres clics a uno la tarea más frecuente, sin romper el resto de los filtros. Se mantiene el desplegable completo dentro de "Más filtros" para los filtros menos usados (categoría, rango de fechas).

## Implementación

Archivo modificado:

- [frontend/src/pages/Gastos.tsx](../frontend/src/pages/Gastos.tsx) — se agregaron tres botones de estado (`Todos los estados`, `Pendientes`, `Pagados`) en la barra de "Filtros rápidos", reutilizando el estado `filtroEstado` que ya existía. No se cambió la lógica del backend ni el estilo del resto de la interfaz.

## Capturas

- **Antes (estado escondido en "Más filtros"):** [clase-20/antes-estado-escondido.png](clase-20/antes-estado-escondido.png)
- **Después (tabs de estado en los filtros rápidos):** [clase-20/despues-filtros-rapidos.png](clase-20/despues-filtros-rapidos.png)

## Prueba con otra persona

(Completar después de la prueba en clase)

- Nombre y grupo: __________________________
- Tarea pedida: "Mostrame solo los gastos que todavía no pagaste."
- Resultado: sin ayuda / con ayuda / no la encontró
- Dónde dudó: __________________________
- Qué ajustamos después: __________________________

## Prueba E2E (Playwright)

Archivo: [e2e/estado-gastos.spec.ts](../e2e/estado-gastos.spec.ts)

Pasos automatizados:

1. Registra un usuario nuevo por API y obtiene token.
2. Establece un presupuesto del mes y registra dos gastos: *"Gasto pendiente E2E"* y *"Gasto pagado E2E"*.
3. Marca el segundo como pagado (`PUT /api/gastos/pagar/:id`).
4. Abre `/gastos` con el token en `localStorage`.
5. Verifica que al clickear **Pendientes** se ve solo el pendiente y desaparece el pagado.
6. Verifica que al clickear **Pagados** se ve solo el pagado y desaparece el pendiente.
7. Verifica que **Todos los estados** vuelve a mostrar los dos.

**Resultado:** `1 passed (3.2 s)` corriendo con `pnpm exec playwright test e2e/estado-gastos.spec.ts --project=chromium`.

## Enlace al commit

https://github.com/ary10220/ihc_segundo_proyecto/commit/5e74901
