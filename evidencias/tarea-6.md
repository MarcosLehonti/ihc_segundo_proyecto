# Tarea 6 · Recurrencias y pruebas E2E

## Feature elegida

El presupuesto permite programar un gasto **semanal o mensual**. Cuando llega la fecha, se genera un movimiento `Gasto`, la próxima fecha avanza y el movimiento entra en el consumo del presupuesto mensual. Cada recurrencia pertenece a su usuario. Si falta el presupuesto mensual o no queda saldo, la ocurrencia no se genera y el motivo aparece en el Dashboard.

Al crear una recurrencia con primera fecha de hoy, se genera su primera ocurrencia en ese momento. Las próximas ocurrencias vencidas se procesan al consultar el Dashboard y mediante el procesador del backend al iniciar y cada minuto. Desactivar una recurrencia detiene futuras ocurrencias y conserva los gastos ya creados.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/src/models/GastoRecurrente.js` | Modelo persistente con monto, categoría, frecuencia, próxima fecha y estado. |
| `backend/src/models/Gasto.js` | Campos opcionales para relacionar el movimiento con su recurrencia y fecha programada; índice único para impedir duplicar una ocurrencia. |
| `backend/src/services/gastoRecurrenteService.js` | Cálculo semanal/mensual, ajuste de fin de mes, creación de ocurrencias vencidas y validación del presupuesto. Usa transacción y bloqueo de fila. |
| `backend/src/controllers/gastoRecurrenteController.js` | Crear, consultar y desactivar recurrencias; valida datos y propiedad por usuario. |
| `backend/src/routes/gastoRecurrenteRoutes.js` | Rutas protegidas `POST`, `GET` y `DELETE` bajo `/api/gastos-recurrentes`. |
| `backend/src/app.js`, `backend/server.js` | Montaje de rutas y ejecución periódica del procesador. `sequelize.sync({ alter: true })` incorpora el modelo en desarrollo. |
| `frontend/src/pages/Dashboard.tsx` | Formulario semanal/mensual, próxima fecha, estado vacío, errores y acción para desactivar. Al generarse una ocurrencia refresca los totales mensual y por categoría. |
| `backend/tests/gastoRecurrenteService.test.js` | Pruebas de fechas, ocurrencia dentro del límite y bloqueo por falta de presupuesto. |
| `e2e/global-setup.mjs` | Prepara dos cuentas E2E y presupuesto mensual vigente para que la suite no dependa de datos antiguos. |
| `e2e/presupuesto.spec.ts` | Flujos de presupuesto existentes y pruebas de recurrencia, error, acceso, persistencia, aislamiento, accesibilidad y captura visual. |
| `playwright.config.ts` | Ejecuta el setup y levanta o reutiliza frontend/backend. |

## Matriz de pruebas

| Criterio de la clase | Prueba o evidencia |
|---|---|
| Éxito: mensaje y dato nuevo | Registrar gasto normal; crear recurrencia semanal o mensual; se muestra el mensaje y se genera el primer gasto cuando vence hoy. |
| Vacío: mensaje y acción | La cuenta E2E alternativa ve que no tiene recurrencias y puede usar el formulario. |
| Error: qué corregir | Un gasto que supera el límite devuelve `400`; una recurrencia que supera el saldo muestra el mensaje del backend y no se crea. |
| Permiso | Abrir `/dashboard` sin sesión redirige a `/login`; las rutas de recurrencia exigen JWT. |
| Persistencia | Recargar el Dashboard conserva la recurrencia y el total consumido. |
| Relación | La segunda cuenta no ve la recurrencia creada por la primera. |
| Alternativas | Frecuencia semanal, mensual, exceso de presupuesto, estado vacío y acceso sin iniciar sesión. |
| Accesibilidad | axe-core revisa la sección de gastos recurrentes; el test espera cero violaciones. |
| Visual | La prueba adjunta una captura del Dashboard al informe HTML de Playwright para revisión. No es comparación automática píxel por píxel. |
| Semilla | `global-setup.mjs` crea las cuentas de prueba si faltan y prepara el presupuesto del mes actual. |

## Suite antes y después

**Antes de la feature:** la suite contenía dos flujos E2E: registrar/pagar un gasto y rechazar un gasto sobre el saldo. En la primera corrida de esta rama, ambas pruebas fallaron porque la cuenta de prueba no tenía presupuesto del mes actual. Era una precondición de datos ausente; `global-setup.mjs` la prepara ahora antes de ejecutar la suite.

**Después de la feature:** 7 pruebas E2E en Chromium. Cubren los dos flujos anteriores, la redirección sin sesión, estado vacío para la otra cuenta, recurrencia semanal, recurrencia mensual, recarga, aislamiento entre usuarios, error por saldo y axe-core. Las pruebas que crean una ocurrencia eliminan sus propios registros al terminar.

También hay 30 pruebas Jest del backend y una compilación de producción del frontend.

## Comandos

Desde la carpeta raíz del repositorio:

```powershell
pnpm install
pnpm install:e2e:browser
pnpm --dir backend install
pnpm --dir backend test -- --runInBand
pnpm test:e2e
pnpm test:e2e:headed
```

Playwright levanta o reutiliza los servidores configurados. Para abrir la aplicación manualmente en dos terminales:

```powershell
pnpm --dir backend dev
pnpm --dir frontend dev
```

La web queda en `http://localhost:5173`; la API, en `http://localhost:4000`. El backend requiere PostgreSQL y el archivo local `backend/.env`.

## Límites conocidos

- Esta feature implementa recurrencias semanales y mensuales; no agrega un límite diario.
- La regla de bloqueo de gasto sigue siendo el presupuesto mensual. El presupuesto por categoría muestra consumo, pero el comportamiento existente no lo usa como segundo bloqueo.
- El programador opera dentro del proceso del backend. Si el servidor estuvo apagado cuando vencía una ocurrencia, la genera al volver a iniciar o al consultar recurrencias.
