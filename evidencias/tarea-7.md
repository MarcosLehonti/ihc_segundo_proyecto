# Tarea 7 · Mejora por feedback + funcionalidad del caso

## Feedback recibido

- Evaluador 1 (Fernando Javier Calani Garcia): `evidencias/feedback-fernando.md` — ver resumen abajo.
- Evaluador 2 (Roberto Anjel Santos Castro): `evidencias/feedback-roberto.md` — ver resumen abajo.

Commit de referencia probado por los revisores: `3cd48bc`.

### Observaciones que coinciden entre ambos revisores

1. **El presupuesto y los límites por categoría no se encuentran a la vista**
   Fernando: "no encontré en qué parte está el monto de mi presupuesto".
   Roberto: "Los límites por categoría están escondidos en la parte inferior del dashboard".
2. **La interfaz se ve plana y sin jerarquía visual**
   Fernando: pide "mejorar el dashboard del usuario".
   Roberto: "La interfaz es sumamente plana, austera y cruda… no hay jerarquía gráfica, los contrastes son mínimos".
3. **Inputs incómodos y sin padding**
   Roberto: "Inputs minúsculos y sin padding".
   Fernando: lo menciona de forma implícita al hablar de accesibilidad a la información.

El fix de esta entrega ataca las tres observaciones en simultáneo: reordena las secciones para que el presupuesto mensual y los límites por categoría queden al tope, las envuelve en *cards* con jerarquía clara, y normaliza el tamaño de los inputs y la tipografía.

## Commit 1 · `fix(dashboard): reordenar y rediseñar presupuesto visible arriba`

- Hash: `c18d0e8`
- Archivos:
  - `frontend/src/pages/Dashboard.css` — hoja nueva con tokens visuales (cards, grilla de resumen, inputs de 42 px de alto con padding, botones, mensajes de estado).
  - `frontend/src/pages/Dashboard.tsx` — refactor del layout. El bloque de **Presupuesto mensual** pasa a ser la primera tarjeta del Dashboard, con `límite`, `gastado` y `disponible` como tres *stat tiles* visibles sin necesidad de scroll. El bloque de **Presupuesto por categoría** queda como segunda tarjeta (ya no al final). Se aplican clases a tabla, formularios y lista de recurrentes.

### Evidencia

Antes: formulario plano sin estilos, presupuesto mensual mezclado con todo el contenido, categorías escondidas tras el formulario de mensual.

Después: tres tarjetas verticales. Al abrir `/dashboard` lo primero que ve el usuario es "Presupuesto mensual" con los tres números grandes (Límite / Gastado / Disponible) y acto seguido "Presupuesto por categoría" con la tabla.

Probado con `pnpm tsc --noEmit` (sin errores).

## Commit 2 · `feat(presupuesto): estados por categoria con semaforo`

- Hash: `d700d9d`
- Archivos:
  - `backend/src/controllers/presupuestoCategoriaController.js` — nueva función `calcularEstado(limite, consumido)` que devuelve uno de `ok` (<80%), `alerta` (≥80% y ≤100%), `excedido` (>100%) o `sin-limite`, más un porcentaje entero. El endpoint `GET /api/presupuesto-categoria/obtener` ahora incluye `estado` y `porcentaje` por categoría.
  - `frontend/src/pages/Dashboard.tsx` — la tabla de categorías suma una columna **Estado** (badge con color) y **Avance** (barra de progreso 0-100% coloreada con el mismo semáforo). Hay una función `derivarEstadoCategoria` como fallback por si la API devuelve la forma vieja.

### Evidencia

El requisito del caso "Presupuesto Estudiantil" pedía: *"Mostrar gasto acumulado, saldo y estados: dentro del límite, desde 80% y excedido."* Ahora, cada fila de la tabla muestra:

- Badge con uno de los textos: "Dentro del límite", "Desde 80%", "Excedido", "Sin límite".
- Barra de progreso coloreada (verde / amarillo / rojo / gris) con `aria-valuenow` igual al porcentaje consumido.

Probado con `node -c` (sintaxis backend OK) y `pnpm tsc --noEmit` (frontend OK).

## Comandos de verificación

```powershell
pnpm --dir backend dev
pnpm --dir frontend dev
```

Abrir `http://localhost:5173/dashboard`, iniciar sesión, fijar un presupuesto mensual y un límite por categoría, registrar un gasto superior al 80% del límite y verificar que la barra se pone amarilla; si se excede, roja.
