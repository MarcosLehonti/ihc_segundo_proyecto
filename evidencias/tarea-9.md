# Tarea 9 · Analítica en todo el producto + Aviso antes de superar el límite

**Integrantes:** Franco Enrique · Ariany Claure
**Entrega:** 2026-11-12 18:00

---

## Parte A · Analítica en toda la app

### App map con eventos

```
┌──────────┐   ┌────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────┐
│  Inicio  │ → │ Buscar │ → │   Detalle    │ → │  Formulario  │ → │  Éxito   │
└──────────┘   └────────┘   └──────┬───────┘   └──────┬───────┘   └────┬─────┘
                                   ○ validación      ● error limite     ○ guardado
                                                     ○ aviso limite
```

### Plan de eventos

| evento | flujo | archivo:línea | pregunta que responde |
|---|---|---|---|
| `login_iniciado` | login | [frontend/src/pages/Login.tsx:24](../frontend/src/pages/Login.tsx) | ¿cuánta gente intenta entrar? |
| `login_exitoso` | login | [Login.tsx:47](../frontend/src/pages/Login.tsx) | ¿cuánta termina entrando? |
| `login_fallido` | login | [Login.tsx:55,64](../frontend/src/pages/Login.tsx) | ¿qué motivo frena? (`credenciales_invalidas`, `servidor`) |
| `movimiento_iniciado` | registrar gasto | [frontend/src/pages/Gastos.tsx:102](../frontend/src/pages/Gastos.tsx) | ¿cuántos intentan registrar? |
| `movimiento_guardado` | registrar gasto | [Gastos.tsx:140](../frontend/src/pages/Gastos.tsx) | ¿cuántos terminan con éxito? |
| `movimiento_rechazado` | registrar gasto | [Gastos.tsx:155,166](../frontend/src/pages/Gastos.tsx) | ¿qué motivo rechaza? (`limite_mensual_excedido`, `servidor`) |
| `error_validacion` | login + registrar gasto | Login.tsx:18 · Gastos.tsx:88,95 | ¿qué validaciones frenan al usuario? (motivo de lista fija) |
| `aviso_limite_mostrado` | registrar gasto | [Gastos.tsx:111](../frontend/src/pages/Gastos.tsx) | ¿cuántos usuarios ven el aviso de límite? |
| `aviso_limite_confirmado` | registrar gasto | [Gastos.tsx:118](../frontend/src/pages/Gastos.tsx) | ¿cuántos confirman con exceso? |
| `aviso_limite_cancelado` | registrar gasto | [Gastos.tsx:114](../frontend/src/pages/Gastos.tsx) | ¿cuántos abortan al ver el aviso? |
| `filtro_sin_resultado` | buscar/filtrar movimientos | [Gastos.tsx:76](../frontend/src/pages/Gastos.tsx) | ¿qué filtros no devuelven nada? |

### Qué NO se trackea (regla "Dónde no")

- No se guarda cada clic ni cada pantalla abierta.
- No se guarda el `motivo` libre del gasto (texto del usuario).
- No se guarda el email, nombre, ni monto exacto.
- Los campos de `motivo` en eventos de error vienen de una **lista fija** (`MotivoError` en [frontend/src/utils/analitica.ts](../frontend/src/utils/analitica.ts)), no texto libre.

### Panel con embudos

- Ruta: [frontend/src/pages/Analitica.tsx](../frontend/src/pages/Analitica.tsx)
- URL: http://localhost:5173/analitica
- Muestra 3 embudos con la caída entre pasos + conteo de errores por motivo + filtros sin resultado + últimos 15 eventos.

### Paso con la mayor caída (hoy)

Según la corrida de pruebas en sesión del equipo:
- **Embudo "Registrar movimiento"**: la caída más grande se da en `Inicio → Éxito` cuando el gasto excede el presupuesto mensual (el backend rechaza). Motivo que domina: `limite_mensual_excedido`.
- **Embudo "Aviso de límite por categoría"**: muchos usuarios ven el aviso pero algunos cancelan al ver el exceso. Esto es **el comportamiento deseado** (la Parte B evita gastos por error).

### Qué cambiaríamos

1. En la caída `Inicio → Éxito` por `limite_mensual_excedido`: agregar el **aviso también para el presupuesto mensual general** (no solo por categoría), para que el usuario sepa *antes* de tocar "Registrar".
2. En el filtro de movimientos: si `filtro_sin_resultado` es muy frecuente, ofrecer un botón "Limpiar filtros" más visible (ya está hecho en la mejora de Clase 20).

---

## Parte B · Aviso antes de superar el límite

### Qué hace

Cuando el usuario toca **Registrar Gasto** y el gasto haría **pasar el límite de la categoría + mes**:

1. La app calcula cuánto se pasaría (consultando `GET /api/presupuesto-categoria/obtener?mes=X&anio=Y`).
2. Muestra `window.confirm("Te pasarías Bs X del límite de <categoría>. ¿Guardar igual?")`.
3. **Confirmar** → el gasto se guarda (queda excedido).
4. **Cancelar** → nada cambia (ni se envía el POST al backend).
5. **Los ingresos NO** disparan el aviso (`tipo === 'gasto'` es el gate).

### Archivos tocados

| Archivo | Cambio |
|---|---|
| [frontend/src/pages/Gastos.tsx](../frontend/src/pages/Gastos.tsx) | Función `calcularExcedenteCategoria()` + lógica de aviso en `handleRegitrarGasto()` |
| [frontend/src/utils/analitica.ts](../frontend/src/utils/analitica.ts) | Ampliación de `PropsEvento` con `supera_limite`, `motivo`, `flujo` |
| [e2e/aviso-limite-categoria.spec.ts](../e2e/aviso-limite-categoria.spec.ts) | 3 tests nuevos |

### Pruebas E2E (3 casos — los mismos que pide la slide)

Archivo: [e2e/aviso-limite-categoria.spec.ts](../e2e/aviso-limite-categoria.spec.ts)

| Caso | Qué hace | Resultado esperado |
|---|---|---|
| **1 · Sin aviso** | gasto de Bs 30 con límite de Bs 100 en `comida` | El gasto se guarda, no aparece `window.confirm`. |
| **2 · Aviso cancelado** | gasto de Bs 150 con límite de Bs 100 en `comida`, usuario **cancela** | No se envía el POST, no aparece en la lista, el backend tiene 0 gastos. |
| **3 · Aviso confirmado** | gasto de Bs 150 con límite de Bs 100 en `comida`, usuario **confirma** | El gasto se guarda, la categoría queda con `estado: 'excedido'` y `consumido: 150`. |

**Resultado de la corrida:** `3 passed (21.0 s)` corriendo con:

```bash
pnpm exec playwright test e2e/aviso-limite-categoria.spec.ts --project=chromium
```

### Lo que NO se tocó

- Modelo/schema de BD (no hace falta — se reutiliza `PresupuestoCategoria`).
- Backend del endpoint `POST /api/gastos/registrar` (sigue aceptando el POST; el aviso es lógica de UI).
- Flujo de ingresos (no genera aviso, como pide la slide).

---

## Cómo probar manualmente (10 seg)

1. Login con `e2e@test.com` / `e2e12345`.
2. En **Dashboard**, poner un límite para la categoría `comida` de **Bs 100**.
3. En **Gastos**, registrar un gasto de `monto: 150, motivo: "test", categoria: comida, tipo: gasto`.
4. Ver el `window.confirm` que dice `"Te pasarías Bs 50.00 del límite de comida..."`.
5. Cancelar → nada cambia. Confirmar → el gasto se guarda.
6. Entrar a **http://localhost:5173/analitica** → ver el embudo "Aviso de límite por categoría" y los eventos.
