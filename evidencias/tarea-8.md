# Tarea 8 · Metas con fondos disponibles

## Integrantes

- Luis Enrique Franco Moron
- Ariany Claure Cota

Proyecto: **Presupuesto Estudiantil** (FinanzApp).

## Funcionalidad

Nueva sección **Metas** (`/metas`, enlace en la barra de navegación) donde el estudiante:

1. Crea metas de ahorro con **nombre, monto objetivo y fecha**.
2. **Asigna** dinero a una meta desde su saldo disponible.
3. **Retira** fondos de una meta (vuelven al disponible).
4. **Transfiere** fondos entre dos metas.
5. Consulta el **historial de movimientos**, incluidos los intentos **rechazados**.

Regla de negocio:

```
Disponible = ingresos − gastos − fondos reservados en metas
Saldo total = ingresos − gastos   (no cambia al mover dinero entre metas)
```

Las asignaciones **no** generan ingresos ni gastos ficticios: solo cambian cuánto está reservado.

## Decisiones

- **Estados de los fondos**: libre (disponible) → reservado en una meta → retirado (libre otra vez) o transferido (reservado en otra meta). Cada cambio queda en `MovimientoMeta` con tipo `asignacion`, `retiro`, `transferencia` o `rechazado`; el historial nunca se edita ni se borra.
- **Reglas y permisos**:
  - Montos deben ser positivos.
  - No se asigna más que el disponible; no se retira ni transfiere más de lo ahorrado en la meta de origen; origen y destino deben ser distintos.
  - Una meta solo existe para su dueño: si otro usuario intenta verla o mover fondos, la API responde **404** (no revela que existe).
  - Las operaciones corren en una **transacción** con bloqueo de fila, así dos operaciones simultáneas no pueden dejar el saldo negativo.
  - Los intentos sin fondos se rechazan (400) y se **guardan** como movimiento `rechazado`.
- **Interfaz**: el saldo (total, reservado, disponible) está arriba; cada meta muestra barra de avance; los errores aparecen con `role="alert"` y un mensaje que dice cuánto hay disponible; los campos tienen etiqueta visible.
- **Refactor evaluado**: el cálculo del disponible se aisló en `services/metaService.js` (función pura `calcularDisponible`) para probarlo con Jest y no mezclarlo con el cálculo mensual de `presupuestoController`. Las funcionalidades de las tareas 6 y 7 (presupuesto mensual, categorías con semáforo, recurrentes) no se modificaron.

## Archivos afectados

| Archivo | Cambio |
|---|---|
| `backend/src/models/Meta.js` | Nuevo modelo de meta (nombre, objetivo, fecha, ahorrado). |
| `backend/src/models/MovimientoMeta.js` | Nuevo modelo del historial de movimientos. |
| `backend/src/services/metaService.js` | Cálculo de ingresos, gastos, reservado y disponible. |
| `backend/src/controllers/metaController.js` | Listar, crear, asignar, retirar, transferir; validación, permisos y transacciones. |
| `backend/src/routes/metaRoutes.js` | Rutas `GET/POST /api/metas`, `POST /api/metas/:id/asignar`, `POST /api/metas/:id/retirar`, `POST /api/metas/transferir`. |
| `backend/src/app.js`, `backend/server.js` | Registro de rutas y sincronización de modelos. |
| `backend/tests/metaService.test.js` | Pruebas unitarias del cálculo del disponible. |
| `backend/tests/presupuestoCategoriaController.test.js` | Se ajustó a la respuesta de la tarea 7 (incluye `estado` y `porcentaje`); estaba fallando. |
| `frontend/src/pages/Metas.tsx` | Nueva pantalla. |
| `frontend/src/App.tsx`, `frontend/src/components/Navbar.tsx` | Ruta protegida `/metas` y enlace "Metas". |
| `e2e/metas.spec.ts` | Dos E2E nuevos. |

## Commits

- Funcionalidad: [`b230bc9`](https://github.com/ary10220/ihc_segundo_proyecto/commit/b230bc9) — `feat(metas): metas de ahorro con fondos disponibles, transferencias e historial`

## Pruebas E2E

`e2e/metas.spec.ts`. Cada prueba crea usuarios nuevos con correo único y les carga un ingreso de Bs 1000 por API, así los datos son reproducibles y no dependen de ejecuciones anteriores.

1. **Recorrido completo** (UI): crea las metas *Laptop* y *Viaje*, asigna 300 y 100, transfiere 50 de Laptop a Viaje, retira 30 de Viaje e intenta asignar 5000 (rechazado con alerta). Verifica que el **saldo total sigue en Bs 1000**, reservado Bs 370 y disponible Bs 630; **recarga la página** y comprueba que todo persiste y que el historial tiene 5 movimientos, incluido el rechazado.
2. **Restricción** (API, dos actores): asignar más que el disponible, retirar o transferir desde una meta vacía y montos negativos devuelven 400; un **usuario ajeno** recibe 404 al intentar retirar o asignar en la meta de otro y no la ve en su lista. El saldo del dueño queda intacto y los 3 rechazos por fondos quedan registrados.

### Comandos

```bash
pnpm install
pnpm install:e2e:browser
pnpm --dir backend test
pnpm test:e2e
```

Solo las pruebas de esta tarea:

```bash
node e2e/run-playwright.mjs test e2e/metas.spec.ts
```

(Requiere PostgreSQL con `backend/.env` configurado; Playwright levanta backend y frontend.)

### Resultado

- Jest (backend): **6 suites, 32 pruebas, todas pasan**.
- Playwright, suite completa: **4 pasan, 7 fallan**.
  - Pasan: los 2 E2E de metas, "sin sesión, el Dashboard redirige al inicio de sesión" y "el segundo usuario ve el estado vacío de recurrencias".

### Fallos pendientes explicados

Los 7 fallos son **regresiones anteriores a esta tarea**, no tocan archivos de metas:

- `presupuesto.spec.ts` (5 pruebas): buscan textos como `Total gastado:` y `Saldo disponible:` dentro de un `<p>`. En la tarea 7 el Dashboard se rediseñó con *stat tiles* ("Gastado", "Disponible"), así que esos selectores ya no existen. Hay que actualizar los selectores a los nuevos elementos del Dashboard.
- `estado-gastos.spec.ts`: no encuentra el gasto creado en la lista de Gastos (`Gasto pendiente E2E`); depende del filtro por defecto de la pantalla de Gastos cambiado en la clase 20.
- `capturas-clase-20.spec.ts`: es un script de capturas de la clase 20 que busca el título `Buscar y Filtrar Movimientos`, que ya no existe con ese texto.

Quedan como trabajo pendiente para la siguiente entrega.
