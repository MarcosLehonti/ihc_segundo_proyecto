# Clase 17 · Análisis del proyecto recibido

## Proyecto recibido

- **Nombre**: Presupuesto Estudiantil (una app para registrar gastos mensuales y controlarlos con un límite).
- **Grupo anterior**: Guzman Montalvan Marcos Lehonti
- **Enlace al repositorio**: _(a completar con la URL de GitHub)_
- **Modalidad original**: hecho **sin IA**.
- **Stack**:
  - Frontend: **React 19 + TypeScript + Vite**, con `react-router-dom` para la navegación ([frontend/package.json](../frontend/package.json)).
  - Backend: **Node.js + Express 5**, autenticación con **JWT** (`jsonwebtoken`), hash de contraseñas con `bcrypt`, ORM **Sequelize** ([backend/package.json](../backend/package.json)).
  - Base de datos: **PostgreSQL**, conectada por Sequelize en [backend/src/config/database.js](../backend/src/config/database.js). Al arrancar hace `sequelize.sync({ alter: true })` ([backend/server.js:14](../backend/server.js#L14)), así que crea/ajusta las tablas automáticamente a partir de los modelos.
- **Conexión**: el frontend hace `fetch` directo contra `http://localhost:4000/api/...` (URL hardcodeada en los componentes, p. ej. [frontend/src/pages/Dashboard.tsx:49](../frontend/src/pages/Dashboard.tsx#L49)), y manda el token JWT en el header `Authorization: Bearer <token>`.

## Ejecución

El proyecto no trae un `README` general ni un `.env.example`. Las claves de entorno del `.env` del backend se deducen de [backend/src/config/database.js:4-9](../backend/src/config/database.js#L4-L9) y del middleware JWT ([backend/src/middleware/authMiddleware.js:9](../backend/src/middleware/authMiddleware.js#L9)):

```
DB_NAME=<nombre_de_la_base>
DB_USER=<usuario_postgres>
DB_PASSWORD=<password_postgres>
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=<cadena_cualquiera>
```

Comandos usados, en orden:

```bash
# 1) Backend (puerto 4000)
cd backend
npm install
npm run dev
```

```bash
# 2) Frontend (puerto 5173 por defecto)
cd frontend
npm install
npm run dev
```

No hay script de migración: Sequelize crea las tablas (`Users`, `Gastos`, `Presupuestos`) al iniciar el backend por `sync({ alter: true })` ([backend/server.js:14](../backend/server.js#L14)).

![Proyecto funcionando](clase-17-ejecucion.png)

### Pruebas

Sí tiene pruebas automatizadas en el backend, con **Jest**. Están en [backend/tests/](../backend/tests/):

- [backend/tests/presupuestoController.test.js](../backend/tests/presupuestoController.test.js) — cubre `establecerPresupuesto` (happy path, límite menor que lo gastado, límite en cero) y la regla de límite mensual al registrar gasto.
- [backend/tests/gastoController.test.js](../backend/tests/gastoController.test.js)
- [backend/tests/filtradoGastos.test.js](../backend/tests/filtradoGastos.test.js)

Para correrlas:

```bash
cd backend
npm test
```

Resultado real al correrlas en este análisis:

```
> backend@1.0.0 test
> jest

Test Suites: 3 passed, 3 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        1.907 s
Ran all test suites.
```

El frontend **no tiene** pruebas automatizadas (no define `scripts.test` en [frontend/package.json](../frontend/package.json); solo `dev`, `build`, `lint` con `oxlint` y `preview`).

### Usuario de prueba para entrar al Dashboard

El proyecto **no trae seeds ni usuarios de prueba** (la tabla `Users` quedó vacía después del `sync` inicial). Para entrar al Dashboard hay que **registrarse desde la propia app**:

1. En http://localhost:5173/ ir a **Registrarse**.
2. Completar nombre, email y una contraseña cualquiera (el backend hace `POST /api/auth/register` y lo deja logueado automáticamente, [frontend/src/pages/Register.tsx:14-50](../frontend/src/pages/Register.tsx#L14-L50)).
3. El token JWT se guarda en `localStorage` y la app redirige al **Dashboard**, donde ya se puede probar "Guardar presupuesto".

## Recorrido: pantalla → acción → regla → datos

### Acción principal: Dashboard → "Guardar presupuesto"

| Paso | Qué pasa | Archivo:líneas |
|------|----------|----------------|
| 1 | El usuario ingresa el monto en el input "Establecer / Actualizar límite mensual (Bs)" y pulsa el botón **Guardar presupuesto**. | [frontend/src/pages/Dashboard.tsx:227-249](../frontend/src/pages/Dashboard.tsx#L227-L249) |
| 2 | El submit del `<form>` dispara `handleGuardarPresupuesto(event)`. | [frontend/src/pages/Dashboard.tsx:116-119](../frontend/src/pages/Dashboard.tsx#L116-L119) |
| 3 | **Validación cliente 1**: límite finito y > 0. Si no, muestra el error "El límite mensual debe ser mayor que cero". | [frontend/src/pages/Dashboard.tsx:123-128](../frontend/src/pages/Dashboard.tsx#L123-L128) |
| 4 | **Validación cliente 2**: si ya hay resumen cargado, el nuevo límite no puede ser menor que lo ya gastado en el mes. | [frontend/src/pages/Dashboard.tsx:130-133](../frontend/src/pages/Dashboard.tsx#L130-L133) |
| 5 | Si ya existía un presupuesto, pide confirmación con `window.confirm` antes de reemplazarlo. | [frontend/src/pages/Dashboard.tsx:135-140](../frontend/src/pages/Dashboard.tsx#L135-L140) |
| 6 | Toma el `token` del `localStorage`; si no hay, redirige a `/login`. | [frontend/src/pages/Dashboard.tsx:142-147](../frontend/src/pages/Dashboard.tsx#L142-L147) |
| 7 | **Llamada HTTP**: `POST http://localhost:4000/api/presupuesto/establecer` con body `{ limite, mes, anio }` y header `Authorization: Bearer <token>`. | [frontend/src/pages/Dashboard.tsx:150-164](../frontend/src/pages/Dashboard.tsx#L150-L164) |
| 8 | **Ruta backend**: `router.post('/establecer', authenticateToken, establecerPresupuesto)`. | [backend/src/routes/presupuestoRoutes.js:10](../backend/src/routes/presupuestoRoutes.js#L10) |
| 9 | **Middleware** `authenticateToken` valida el JWT con `JWT_SECRET` y pone `req.user`. Si falta → 401; si es inválido → 403. | [backend/src/middleware/authMiddleware.js:3-14](../backend/src/middleware/authMiddleware.js#L3-L14) |
| 10 | **Validación servidor**: `limite` positivo y finito, `mes` entero entre 1 y 12, `anio` entero ≥ 2000. Si no se cumple → 400. | [backend/src/controllers/presupuestoController.js:10-23](../backend/src/controllers/presupuestoController.js#L10-L23) |
| 11 | **Consulta a datos (gastos del mes)**: `Gasto.findAll` filtrando `userId` y `fecha` en `[inicio del mes, inicio del mes siguiente)`. | [backend/src/controllers/presupuestoController.js:25-37](../backend/src/controllers/presupuestoController.js#L25-L37) |
| 12 | **Cálculo**: `gastado = suma(gastos.monto)` con `reduce`. | [backend/src/controllers/presupuestoController.js:39-42](../backend/src/controllers/presupuestoController.js#L39-L42) |
| 13 | **Regla de negocio**: si `limite < gastado` → 400 "El límite no puede ser menor que lo que ya has gastado en el mes". | [backend/src/controllers/presupuestoController.js:44-48](../backend/src/controllers/presupuestoController.js#L44-L48) |
| 14 | **Upsert** por `(userId, mes, anio)`: si ya hay registro, actualiza `limite` con `save()`; si no, crea uno nuevo con `Presupuesto.create`. | [backend/src/controllers/presupuestoController.js:50-74](../backend/src/controllers/presupuestoController.js#L50-L74) |
| 15 | **Datos (tabla `Presupuestos`)**: columnas `id`, `userId`, `mes` (1-12), `anio` (≥2000), `limite` (`DECIMAL(10,2)`, min 0.01), con índice único `(userId, mes, anio)`. | [backend/src/models/Presupuesto.js](../backend/src/models/Presupuesto.js) |
| 16 | El backend responde `201` (creado) o `200` con el mensaje y el objeto `presupuesto`. El frontend muestra el mensaje y vuelve a llamar `cargarPresupuesto()` para refrescar la pantalla. | [frontend/src/pages/Dashboard.tsx:166-174](../frontend/src/pages/Dashboard.tsx#L166-L174) |

### Cálculo de "Total gastado" y "Saldo disponible"

| Paso | Qué pasa | Archivo:líneas |
|------|----------|----------------|
| 1 | Al cargar el Dashboard, se llama `cargarPresupuesto()`: `GET http://localhost:4000/api/presupuesto/obtener?mes=X&anio=Y` con el token. | [frontend/src/pages/Dashboard.tsx:47-56](../frontend/src/pages/Dashboard.tsx#L47-L56) |
| 2 | Ruta backend: `router.get('/obtener', authenticateToken, obtenerPresupuesto)`. | [backend/src/routes/presupuestoRoutes.js:11](../backend/src/routes/presupuestoRoutes.js#L11) |
| 3 | El controlador valida `mes` y `anio`, busca el presupuesto del usuario (`Presupuesto.findOne`); si no existe → 404. | [backend/src/controllers/presupuestoController.js:83-109](../backend/src/controllers/presupuestoController.js#L83-L109) |
| 4 | Consulta los gastos del mes con el mismo rango `[inicioMes, inicioMesSiguiente)` y suma los `monto` → `gastado`. | [backend/src/controllers/presupuestoController.js:111-128](../backend/src/controllers/presupuestoController.js#L111-L128) |
| 5 | Devuelve `{ presupuesto, gastado, disponible: limite - gastado }`, ambos redondeados a 2 decimales. | [backend/src/controllers/presupuestoController.js:130-136](../backend/src/controllers/presupuestoController.js#L130-L136) |
| 6 | El Dashboard renderiza los 3 valores: Límite mensual, Total gastado y Saldo disponible. | [frontend/src/pages/Dashboard.tsx:208-222](../frontend/src/pages/Dashboard.tsx#L208-L222) |

## Observaciones

Lo que está bien:

- Validación duplicada (cliente y servidor) del límite positivo en Dashboard y `establecerPresupuesto` ([frontend/src/pages/Dashboard.tsx:125-128](../frontend/src/pages/Dashboard.tsx#L125-L128), [backend/src/controllers/presupuestoController.js:10-23](../backend/src/controllers/presupuestoController.js#L10-L23)).
- Regla de negocio coherente: no se permite bajar el límite por debajo de lo ya gastado ([backend/src/controllers/presupuestoController.js:44-48](../backend/src/controllers/presupuestoController.js#L44-L48)).
- Índice único `(userId, mes, anio)` a nivel modelo, que evita duplicados en base ([backend/src/models/Presupuesto.js:37-42](../backend/src/models/Presupuesto.js#L37-L42)).
- Rango mensual con `Op.gte` + `Op.lt` del mes siguiente, sin problemas de off-by-one ni de "últimos días" ([backend/src/controllers/presupuestoController.js:25-37](../backend/src/controllers/presupuestoController.js#L25-L37)).
- Todas las rutas de presupuesto exigen token JWT ([backend/src/routes/presupuestoRoutes.js:10-11](../backend/src/routes/presupuestoRoutes.js#L10-L11)).
- Hay pruebas Jest para los dos puntos críticos del dominio (límite inválido y bloqueo al superar presupuesto) en [backend/tests/presupuestoController.test.js](../backend/tests/presupuestoController.test.js).

Lo que podría fallar o conviene vigilar:

- URL del backend hardcodeada en el frontend (`http://localhost:4000`) en [frontend/src/pages/Dashboard.tsx:49](../frontend/src/pages/Dashboard.tsx#L49) y [:151](../frontend/src/pages/Dashboard.tsx#L151) (y previsiblemente en el resto de pantallas). Si cambia el host, hay que editar varios archivos.
- No existe `.env.example` ni README raíz, así que las claves de entorno hay que leerlas del código ([backend/src/config/database.js:4-9](../backend/src/config/database.js#L4-L9)) — pequeño fricción para quien levanta el proyecto por primera vez.
- `sequelize.sync({ alter: true })` en [backend/server.js:14](../backend/server.js#L14) ajusta el esquema en cada arranque. Es cómodo en desarrollo pero riesgoso si llegara a producción.
- Ruta raíz `/` responde "Bienvenido a la API de TruequeU" en [backend/src/app.js:14-16](../backend/src/app.js#L14-L16): leftover del nombre de otro proyecto. Es solo cosmético, pero conviene saberlo.
- `obtenerGastos` ([backend/src/controllers/gastoController.js:102-114](../backend/src/controllers/gastoController.js#L102-L114)) devuelve **todos** los gastos del usuario sin filtro de fecha, mientras que `obtenerHistorialMesActual` ([backend/src/controllers/gastoController.js:393-419](../backend/src/controllers/gastoController.js#L393-L419)) sí filtra al mes actual. Son dos endpoints distintos; no es un bug pero puede confundir si no se recuerda cuál se está usando.
- La confirmación al actualizar el límite se hace con `window.confirm` ([frontend/src/pages/Dashboard.tsx:136-140](../frontend/src/pages/Dashboard.tsx#L136-L140)). Funciona y respeta el estilo simple del proyecto; es solo algo a tener en cuenta si Tarea 5 pide mejoras de interacción en ese flujo.
- No hay pruebas automatizadas en el frontend.

## Impacto para la Tarea 5

Mientras no tengamos la consigna formal de la Tarea 5, lo que ya se puede anticipar:

- **Qué se mantiene igual (respetamos el método del grupo anterior)**:
  - Stack: React + TS + Vite (frontend), Express + Sequelize + Postgres (backend).
  - Convenciones: controladores en `backend/src/controllers/`, rutas en `backend/src/routes/`, modelos en `backend/src/models/`; páginas planas en `frontend/src/pages/`; estilo simple, sin librerías de UI ni state manager, `fetch` directo.
  - Autenticación por JWT en header `Authorization: Bearer`.
  - Reglas de negocio existentes: validación de límite positivo y de que el límite no baje del gastado.

- **Qué partes son fáciles de extender** (siguiendo el mismo patrón):
  - Agregar nuevos filtros al historial: ya existe `filtrarGastos` ([backend/src/controllers/gastoController.js:291-391](../backend/src/controllers/gastoController.js#L291-L391)) con `buscar`, `tipo`, `categoria`, `estado`, `periodo`, `desde`, `hasta`.
  - Agregar nuevos campos al modelo `Gasto` (ya tiene `tipo` y `categoria` como strings libres).
  - Agregar nuevas pantallas: basta con copiar el patrón de una página existente y registrarla en `frontend/src/routes/`.

- **Qué partes son más difíciles de extender**:
  - Cambiar la base URL del backend: hay que tocar cada `fetch` en las páginas (está hardcodeada).
  - Introducir conceptos nuevos de dominio (p. ej. compartir presupuesto entre varios usuarios, metas de ahorro, multi-moneda): requiere nuevos modelos, nuevas migraciones y repensar la clave única `(userId, mes, anio)`.
  - Hacer la UI responsive o accesible: casi no hay CSS propio, el markup es muy plano.

- **Qué archivos habría que crear o cambiar en una extensión típica** (por ejemplo, un historial que compare meses):
  - Backend: nuevo método en [backend/src/controllers/gastoController.js](../backend/src/controllers/gastoController.js) y su ruta en [backend/src/routes/gastosRoutes.js](../backend/src/routes/gastosRoutes.js).
  - Frontend: nueva página en `frontend/src/pages/` + entrada en `frontend/src/routes/`.
  - Prueba Jest en `backend/tests/`.

- **Qué pruebas conviene escribir ANTES de refactorizar algo**:
  1. Caso de **actualización** de presupuesto (hoy los tests solo cubren creación): verificar que la segunda llamada a `establecerPresupuesto` para el mismo `(userId, mes, anio)` **no** crea un segundo registro sino que llama a `save()` ([backend/src/controllers/presupuestoController.js:50-62](../backend/src/controllers/presupuestoController.js#L50-L62)).
  2. Validación de `mes`/`anio` fuera de rango (hoy el test solo cubre `limite: 0`).
  3. Cálculo de `disponible` en `obtenerPresupuesto` cuando no hay gastos ⇒ `disponible === limite` ([backend/src/controllers/presupuestoController.js:130-136](../backend/src/controllers/presupuestoController.js#L130-L136)).
  4. Comportamiento de `authenticateToken` con token ausente / inválido en la ruta de presupuesto.
  5. Si se tocaran los `fetch` del frontend (por ejemplo, moverlos a una base URL única), vale la pena agregar antes al menos un test de la lógica de validación de `handleGuardarPresupuesto` ([frontend/src/pages/Dashboard.tsx:116-179](../frontend/src/pages/Dashboard.tsx#L116-L179)) con alguna herramienta de testing de React.

- **Riesgos**:
  - Cualquier cambio en `sequelize.sync({ alter: true })` o en los modelos puede alterar las tablas en la base real al próximo arranque.
  - El índice único `(userId, mes, anio)` significa que renombrar/renumerar meses rompería datos existentes.
  - Si se toca `fetch` o el token en una página, es fácil olvidar otra: no hay un cliente HTTP centralizado.

## Modalidad del análisis

Proyecto original hecho **sin IA** (grupo anterior). Este análisis se hizo con apoyo de IA (Claude Code), con verificación nuestra en los archivos reales del repo.
