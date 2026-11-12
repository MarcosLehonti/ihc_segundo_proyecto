# Tarea 9 · Analítica en todo el producto y aviso antes de superar el límite

## Integrantes

- Luis Enrique Franco Moron
- Ariany Claure Cota

Proyecto: **Presupuesto Estudiantil** (FinanzApp).

Entrega: jueves 12/11/2026, 18:00. Dos commits separados:

1. `feat(gastos): aviso antes de superar el limite de la categoria` (Parte B, funcionalidad).
2. `feat(analitica): eventos y embudos en todos los flujos principales` (Parte A, analítica).

---

## Parte A · Analítica en todo el producto

Extendimos lo de la Clase 21 (que solo medía *registrar movimiento*) a todos los flujos principales. Antes de programar marcamos en el app map dónde va cada evento:

```
Login ──► Dashboard (presupuesto) ──► Gastos (registrar / buscar) ──► Aviso de límite ──► Guardado
  ○ inicio   ○ inicio  ● error            ○ inicio  ● error  ● vacía      ○ mostrado          ○ éxito
  ○ éxito    ○ éxito                      ○ éxito                         ○ cancelado/confirmado
Metas: ○ meta creada ──► ○ fondos asignados   ● rechazo (fondos insuficientes)
```

○ evento de inicio o de éxito · ● evento de error (validación, permiso) o búsqueda vacía.

### Reglas que seguimos

- **Lista cerrada** de eventos y de props en `frontend/src/utils/analitica.ts`. Un evento fuera de la lista no se guarda y una prop desconocida se descarta.
- **Motivos de error de una lista fija** (`campos_vacios`, `motivo_numerico`, `sin_presupuesto`, `supera_presupuesto`, `limite_invalido`, `menor_que_gastado`, `credenciales`, `fondos_insuficientes`, `datos_invalidos`, `error_servidor`). Nunca se guarda el texto del backend.
- **Sin datos personales**: no se guarda correo, nombre, motivo escrito, nombre de la meta, monto exacto ni el texto buscado. Las E2E lo verifican.
- **No medimos** cada clic ni cada pantalla abierta, y no hay eventos sin una pregunta que respondan.

### Plan de eventos

| Evento | Flujo | archivo:línea | Pregunta que responde |
|---|---|---|---|
| `login_iniciado` | Iniciar sesión | `frontend/src/pages/Login.tsx:17` | ¿Cuántos intentan entrar? |
| `login_exitoso` | Iniciar sesión | `frontend/src/pages/Login.tsx:43` | ¿Cuántos de esos intentos terminan dentro de la app? |
| `login_rechazado` (`motivo`) | Iniciar sesión | `Login.tsx:20`, `:51`, `:58` | ¿Se traban por campos vacíos o por credenciales? |
| `presupuesto_iniciado` (`accion`) | Presupuesto mensual | `frontend/src/pages/Dashboard.tsx:280` | ¿Cuántos intentan fijar o cambiar su límite? |
| `presupuesto_guardado` (`accion`) | Presupuesto mensual | `Dashboard.tsx:333` | ¿Cuántos lo logran? |
| `presupuesto_rechazado` (`motivo`) | Presupuesto mensual | `Dashboard.tsx:283`, `:289`, `:328` | ¿El límite que ponen es inválido o menor a lo ya gastado? |
| `movimiento_iniciado` (`tipo`, `categoria`) | Registrar movimiento | `frontend/src/pages/Gastos.tsx:129` | ¿Cuántos empiezan a registrar un gasto o ingreso? |
| `movimiento_guardado` (`tipo`, `categoria`, `supera_limite`) | Registrar movimiento | `Gastos.tsx:182` | ¿Cuántos terminan? ¿Cuántos quedaron sobre el límite? |
| `movimiento_rechazado` (`motivo`) | Registrar movimiento | `Gastos.tsx:132`, `:139`, `:196`, `:203` | ¿Qué validación los frena más? |
| `aviso_limite_mostrado` (`categoria`, `accion`) | Aviso de límite (Tarea 9) | `Gastos.tsx:170`, `:305` | ¿Con qué frecuencia y en qué categoría aparece el aviso? |
| `aviso_limite_confirmado` | Aviso de límite (Tarea 9) | `Gastos.tsx:179`, `:314` | ¿Cuántos deciden pasarse igual? |
| `aviso_limite_cancelado` | Aviso de límite (Tarea 9) | `Gastos.tsx:437` | ¿El aviso los hace cambiar de idea? |
| `busqueda_sin_resultados` (`filtros`) | Buscar y filtrar | `Gastos.tsx:107` | ¿Qué combinación de filtros deja la lista vacía? |
| `meta_creada` | Metas (Tarea 8) | `frontend/src/pages/Metas.tsx:91` | ¿Cuántos crean metas? |
| `meta_fondos_asignados` | Metas (Tarea 8) | `Metas.tsx:92` | ¿Cuántos realmente ponen dinero en la meta? |
| `meta_rechazada` (`accion`, `motivo`) | Metas (Tarea 8) | `Metas.tsx:93` | ¿Se traban por fondos insuficientes? |

`busqueda_sin_resultados` guarda solo **qué** filtros estaban activos (`texto`, `tipo`, `categoria`, `estado`, `periodo`) y se registra **una vez** por combinación, no por cada tecla.

### Panel con embudos (`/analitica`)

`frontend/src/pages/Analitica.tsx` muestra:

- **Un embudo por flujo principal**: Iniciar sesión, Registrar movimiento, Aviso de límite, Presupuesto mensual y Metas de ahorro. Cada paso indica cuántos eventos hay y la **caída** respecto del paso anterior.
- **El paso con la mayor caída** de toda la app, destacado arriba.
- **Errores que frenan la tarea**, agrupados por evento y motivo.
- **Búsquedas o filtros sin resultados**, agrupados por filtros usados.
- Los últimos 10 eventos.

### Paso con la mayor caída y qué cambiaríamos

Datos de la sesión de prueba grabada por las E2E (`e2e/analitica.spec.ts`, prueba de registrar movimiento):

| Flujo | Paso | Eventos | Caída |
|---|---|---|---|
| Registrar movimiento | `movimiento_iniciado` → `movimiento_guardado` | 3 → 1 | **67 %** |
| Aviso de límite | `aviso_limite_mostrado` → `aviso_limite_confirmado` | 2 → 1 | 50 % |
| Iniciar sesión | `login_iniciado` → `login_exitoso` | 1 → 1 | 0 % |

**Mayor caída: registrar movimiento (67 %).** Los intentos que no terminan se reparten entre `movimiento_rechazado` con motivo `motivo_numerico` (validación) y `aviso_limite_cancelado`.

**Qué cambiaríamos:**

1. **Validar el motivo mientras se escribe**, no al presionar *Registrar Gasto*. Hoy el error aparece recién al final y obliga a reintentar.
2. **Mostrar el restante de la categoría junto al selector de categoría** (por ejemplo «Comida: te quedan Bs 40»). Así el aviso deja de ser una sorpresa y la persona ajusta el monto antes de enviarlo.

Estos números salen de datos de prueba. Para decidir de verdad hay que repetir la medición con usuarios reales en clase.

---

## Parte B · Aviso antes de superar el límite

**Regla:** si un gasto nuevo o editado haría pasar el límite de su **categoría** en ese mes, la app muestra **cuánto se pasaría** y pide confirmación. **Confirmar** guarda el gasto y la categoría queda en estado *excedido*. **Cancelar** no cambia nada. **Los ingresos no generan aviso.**

### Cómo funciona

- **Backend** (`backend/src/controllers/gastoController.js`): la función `calcularExcesoCategoria` suma los gastos del mes en esa categoría (sin ingresos y, al editar, sin contar dos veces el gasto que se edita). Si el nuevo total supera el límite y la petición no trae `confirmarExceso: true`, responde **409** con `limite`, `consumido`, `montoSolicitado` y `exceso`, y **no guarda nada**. La regla vive en el servidor, así que no se salta llamando a la API directamente.
- **Frontend** (`frontend/src/pages/Gastos.tsx`): al recibir el 409 muestra un `alertdialog` con «Te pasarías del límite de comida por Bs 30.00», el límite, lo ya gastado y el monto del gasto. Tiene dos botones, **Guardar de todas formas** (reenvía con `confirmarExceso: true`) y **Cancelar** (cierra el aviso sin enviar nada). Mientras el aviso está abierto, el botón de registrar queda deshabilitado para que no se envíe dos veces.
- Si no hay límite de categoría definido, no hay aviso. El tope del presupuesto mensual sigue igual que antes.

### Pruebas

| Caso pedido | Prueba | Resultado |
|---|---|---|
| Un gasto sin aviso | `e2e/aviso-limite.spec.ts` paso 1: Bs 60 con límite de comida Bs 100 | Se guarda, no aparece aviso, consumido = 60 |
| Uno con aviso cancelado (todo igual) | paso 2: Bs 70 → aviso «por Bs 30.00» → Cancelar | Consumido sigue en 60, estado `ok`, el gasto no aparece en la lista |
| Otro confirmado (queda excedido) | paso 3: mismo gasto → Guardar de todas formas | Consumido = 130, estado `excedido` |
| Ingresos no generan aviso | paso 4: ingreso Bs 500 en comida | Se guarda sin aviso |
| Editar también avisa | segunda prueba: editar Bs 40 → 150 | Aviso «por Bs 50.00»; al cancelar, consumido sigue en 40 |

Pruebas unitarias del backend: `backend/tests/avisoLimite.test.js` (sin aviso, 409 sin guardar, confirmado guarda, ingreso sin aviso, edición sin cambios al pedir confirmación).

### Comandos

```bash
pnpm --dir backend exec jest --runInBand
pnpm test:e2e e2e/aviso-limite.spec.ts e2e/analitica.spec.ts
pnpm exec playwright show-report
```

Resultado: backend **44/44**. E2E de la Tarea 9: **7/7** (2 de aviso de límite + 5 de analítica).

Suite E2E completa: 13 pasan y 5 fallan. Las 5 que fallan son de `e2e/presupuesto.spec.ts` y **ya fallaban antes de esta tarea**: buscan los textos «Total gastado:» y «Saldo disponible:», que desaparecieron con el rediseño del Dashboard de la Clase 20. Hay que actualizar esos selectores aparte.
