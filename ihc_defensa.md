# IHC · Defensa: presupuesto estudiantil

## Qué se implementó

Se añadieron gastos recurrentes semanales y mensuales. El Dashboard permite crear una recurrencia, ver su próxima fecha y desactivarla. Cuando vence, el backend crea el movimiento y actualiza el consumo mensual. También se agregaron pruebas E2E de éxito, error, sesión, persistencia, aislamiento, accesibilidad y evidencia visual.

## Dónde cambió

- **Backend y datos:** `backend/src/models/GastoRecurrente.js`, `backend/src/models/Gasto.js`, `backend/src/services/gastoRecurrenteService.js`, `backend/src/controllers/gastoRecurrenteController.js`, `backend/src/routes/gastoRecurrenteRoutes.js`, `backend/src/app.js` y `backend/server.js`.
- **Interfaz:** `frontend/src/pages/Dashboard.tsx`.
- **Pruebas:** `backend/tests/gastoRecurrenteService.test.js`, `e2e/presupuesto.spec.ts`, `e2e/global-setup.mjs` y `playwright.config.ts`.
- **Matriz de aceptación:** `evidencias/tarea-6.md`.

## Cómo correrlo

Desde la raíz del proyecto, con PostgreSQL activo y `backend/.env` configurado:

```powershell
pnpm install
pnpm --dir backend install
pnpm install:e2e:browser
pnpm --dir backend test -- --runInBand
pnpm test:e2e
pnpm test:e2e:headed
```

Playwright inicia o reutiliza backend y frontend. Si quieres abrir la app por separado, ejecuta `pnpm --dir backend dev` y `pnpm --dir frontend dev` en terminales distintas. La app queda en `http://localhost:5173`.

Las pruebas preparan dos cuentas de desarrollo si no existen: `e2e@test.com` y `e2e-alternate@test.com`. Se pueden cambiar con `E2E_EMAIL`, `E2E_PASSWORD`, `E2E_ALT_EMAIL` y `E2E_ALT_PASSWORD`.

**Resultado comprobado:** 30 pruebas Jest aprobadas, build de frontend aprobado y 7 pruebas E2E en Chromium aprobadas. Node de esta máquina: v24.19.0; la guía de clase pide Node 22 LTS, así que verifica `node -v` si el ingeniero requiere esa versión exacta.

## 20 preguntas que podría hacer el ingeniero

1. **¿Qué es una prueba E2E?** — Simula acciones de una persona en el navegador y verifica el resultado entre interfaz, API y datos.
2. **¿En qué se diferencia de Jest?** — Jest prueba funciones/controladores aislados; Playwright recorre la aplicación real desde la pantalla.
3. **¿Qué feature se eligió?** — Programar gastos semanales o mensuales y ver cómo afectan el presupuesto.
4. **¿Dónde se guarda la regla recurrente?** — En la tabla `GastoRecurrentes`, con usuario, monto, categoría, frecuencia, próxima fecha y estado.
5. **¿Dónde queda cada ocurrencia generada?** — Como `Gasto`, relacionada por `recurrenciaId` y `fechaProgramada`.
6. **¿Qué pasa si la primera fecha es hoy?** — Se crea la primera ocurrencia inmediatamente y la próxima fecha avanza una semana o un mes.
7. **¿Cómo se genera una ocurrencia que vence después?** — El backend procesa fechas vencidas al consultar recurrencias, al iniciar y cada minuto mientras está activo.
8. **¿Cómo evita generar dos veces el mismo gasto?** — Usa transacción, bloqueo de la recurrencia e índice único de recurrencia más fecha programada.
9. **¿Cómo calcula la frecuencia semanal?** — Suma siete días a la fecha programada.
10. **¿Qué pasa con fechas como el 31 al repetir mensualmente?** — Se ajusta al último día del mes destino; por ejemplo, 31 de enero pasa a 28/29 de febrero.
11. **¿Cómo se actualiza el presupuesto?** — La ocurrencia se guarda como gasto y el resumen mensual suma sus montos.
12. **¿Qué pasa si no hay presupuesto mensual?** — La ocurrencia queda pendiente, no se crea y el Dashboard muestra el motivo.
13. **¿Qué pasa si la ocurrencia excede el saldo?** — El backend la rechaza y devuelve un error visible; el consumo no sube.
14. **¿Cómo se asegura que cada persona vea sus datos?** — Las rutas requieren JWT y consultan/actualizan las recurrencias usando el `userId` del token.
15. **¿Qué prueba el estado vacío?** — La segunda cuenta ve el mensaje de que no tiene recurrencias y el formulario para crear una.
16. **¿Cómo se probó la persistencia?** — Se crea una recurrencia, se recarga el Dashboard y se vuelve a comprobar la fila y el total.
17. **¿Cómo se prueba el permiso?** — Abrir `/dashboard` sin token debe redirigir a `/login`.
18. **¿Qué verifica axe-core?** — Revisa problemas de accesibilidad en la sección de gastos recurrentes; la prueba espera cero violaciones.
19. **¿Qué evidencia visual se guarda?** — Cada prueba de recurrencia adjunta una captura de pantalla al informe HTML de Playwright.
20. **¿Qué no incluye esta feature?** — No añade límite diario. La recurrencia respeta el límite mensual; el límite por categoría sigue siendo informativo, como antes.

## Nota de la línea base

Antes de la feature, las dos pruebas E2E existentes fallaron porque la cuenta no tenía presupuesto para el mes actual. `e2e/global-setup.mjs` ahora asegura esa precondición. Después se ejecutaron 7 pruebas E2E y todas pasaron.
