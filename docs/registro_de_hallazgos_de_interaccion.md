# Registro de Hallazgos de Interacción

Documento de análisis de interacción humano-computador basado en leyes clásicas de ergonomía y psicología cognitiva: **Ley de Fitts**, **Ley de Hick** y **Carga Cognitiva**.

---

## Tabla Resumen de Hallazgos

| # | Hallazgo | Captura obligatoria | Justificación breve | Estado al terminar |
|---|----------|---------------------|---------------------|--------------------|
| 1 | **Ley de Fitts**<br>*(¿La acción es suficientemente grande y cercana?)*<br>Botones de acción "Editar" y "Eliminar" con tamaño reducido y colocados contiguos sin margen de seguridad en la lista de movimientos. | **Vista: Gastos (`Gastos.tsx`)**<br><br>![Captura Ley de Fitts](evidencias/evidencia%20Fitts.png) | Los botones "Editar" y "Eliminar" de cada movimiento carecen de un área de toque o padding mínimo ergonómico (target size reducido). Además, están dispuestos de forma contigua sin espaciado de seguridad. De acuerdo con la Ley de Fitts ($T = a + b \log_2(2D/W)$), un ancho de objetivo ($W$) pequeño combinado con una distancia casi nula respecto a una acción destructiva ("Eliminar") incrementa el tiempo de apuntado y la probabilidad de clics erróneos accidentales. | **Documentado** |
| 2 | **Ley de Hick**<br>*(Opciones que compiten antes de decidir)*<br>Sobrecarga simultánea de 5 selectores y criterios de filtrado compitiendo al mismo nivel de jerarquía visual. | **Vista: Gastos (`Gastos.tsx`)**<br><br>![Captura Ley de Hick](evidencias/evidencia%20hick.png) | El panel de búsqueda y filtros expone en un solo bloque 5 controles independientes (Búsqueda por texto, Tipo, Categoría, Estado y Período con fechas). Según la Ley de Hick ($T = b \log_2(n + 1)$), el tiempo de decisión aumenta logarítmicamente con el número y complejidad de opciones compitiendo simultáneamente sin una jerarquía visual o divulgación progresiva. | **Documentado** |
| 3 | **Carga Cognitiva**<br>*(¿Qué debe recordar o procesar para continuar?)*<br>Ausencia de saldo disponible y contexto financiero al ejecutar un pago, obligando al cálculo y recuerdo mental. | **Vista: Pagos (`Pagos.tsx`)**<br><br>![Captura Carga Cognitiva](evidencias/evidencia%20carga%20cognitiva.png) | En la pantalla de pagos, el usuario debe decidir si liquidar un gasto pendiente, pero la interfaz no le muestra su saldo disponible ni el presupuesto mensual del Dashboard. Para no sobregirarse, el usuario debe recordar de memoria su saldo previo y calcular mentalmente si el monto a pagar cabe en su presupuesto, sobrecargando la memoria de trabajo (carga cognitiva extrínseca). | **Documentado** |

---

## Detalle y Justificación Técnica de los Hallazgos

### 1. Hallazgo: Ley de Fitts
* **Pregunta clave:** *¿La acción es suficientemente grande y cercana?*
* **Pantalla / Vista:** `Gastos` ([Gastos.tsx](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Gastos.tsx#L507-L523))
* **Componente y líneas de código:**
  - Botones de acción en cada tarjeta de movimiento: `<button onClick={...}>Editar</button>` y `<button onClick={...}>Eliminar</button>` ([Gastos.tsx:L507-L523](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Gastos.tsx#L507-L523)).
* **Análisis del problema:**
  1. **Tamaño del objetivo insuficiente ($W$ reducido):** Los botones "Editar" y "Eliminar" se renderizan con los estilos estándar del navegador sin un padding generoso ni un área mínima táctil recomendada (estándar Fitts / WCAG de al menos 44x44px). Al tener un ancho y alto pequeños, el usuario debe realizar una desaceleración motriz excesiva con el puntero para no errar el clic.
  2. **Distancia crítica y adyacencia de riesgo:** Ambos botones se encuentran inmediatamente contiguos horizontalmente, sin un margen de separación de seguridad (`margin`) ni diferenciación visual evidente (como colores de advertencia para acciones destructivas). La distancia física entre querer editar un registro y pulsar por accidente "Eliminar" es prácticamente inexistente.
  3. **Distancia a la acción de confirmación:** Al hacer clic en "Editar", la acción consecuente ("Guardar cambios") se activa en el formulario al inicio de la página, obligando al usuario a recorrer una distancia ($D$) considerable hacia arriba en lugar de resolver la acción en el contexto inmediato del registro.
* **Evidencia visual:**
  ![Captura Ley de Fitts](evidencias/evidencia%20Fitts.png)
* **Recomendación de mejora:** Incrementar el tamaño de objetivo (padding mínimo y altura de botón de 40px–44px), establecer una separación física clara entre ambos botones (margen horizontal de seguridad de al menos 12px a 16px) y aplicar diferenciación cromática semántica (botón neutro/azul para "Editar" y botón de alerta/rojo secundario para "Eliminar").

---

### 2. Hallazgo: Ley de Hick
* **Pregunta clave:** *Opciones que compiten antes de decidir.*
* **Pantalla / Vista:** `Gastos` ([Gastos.tsx](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Gastos.tsx#L349-L405))
* **Componente y líneas de código:**
  - Sección `<section>` con buscador e inputs `<select>`: búsqueda textual, `filtroTipo`, `filtroCategoria`, `filtroEstado`, `filtroPeriodo` ([Gastos.tsx:L349-L405](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Gastos.tsx#L349-L405)).
* **Análisis del problema:**
  1. **Competencia visual y decisional:** Al ingresar a la sección de movimientos, el usuario se encuentra con 5 controles desplegados simultáneamente en un mismo contenedor, cada uno con entre 3 y 5 opciones internas diferentes (más de 15 bifurcaciones posibles a primera vista).
  2. **Falta de ordenamiento progresivo:** No existe un filtro primario recomendado (por ejemplo, ver simplemente "Mes actual" o "Todos") ni filtros colapsables bajo un botón secundario de "Filtros avanzados".
  3. **Impacto en el usuario:** Se incrementa de forma directa el tiempo de selección y la indecisión al obligar al usuario a escanear mentalmente todos los menús desplegables antes de poder localizar una transacción específica.
* **Evidencia visual:**
  ![Captura Ley de Hick](evidencias/evidencia%20hick.png)
* **Recomendación de mejora:** Aplicar el principio de **divulgación progresiva (progressive disclosure)**: mantener una barra de búsqueda rápida visible y agrupar los filtros secundarios bajo un desplegable colapsable o botones con los filtros más comunes ya preseleccionados (chips rápidos: "Este mes", "Solo gastos").

---

### 3. Hallazgo: Carga Cognitiva
* **Pregunta clave:** *¿Qué debe recordar o procesar el usuario para continuar?*
* **Pantalla / Vista:** `Pagos` ([Pagos.tsx](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Pagos.tsx#L111-L157))
* **Componente y líneas de código:**
  - Listado de gastos por pagar y botón de acción: `<button onClick={() => handlePagarGasto(gasto.id)}>Pagar gasto</button>` ([Pagos.tsx:L146-L153](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Pagos.tsx#L146-L153)).
* **Análisis del problema:**
  1. **Esfuerzo de memoria de trabajo (Working Memory Load):** Para saber si es financieramente seguro pulsar el botón "Pagar gasto", el usuario debe **recordar mentalmente** la cifra de "Saldo disponible" que vio previamente en la pantalla del `Dashboard` ([Dashboard.tsx:L218-L221](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Dashboard.tsx#L218-L221)).
  2. **Cálculo mental no asistido:** El sistema no calcula ni muestra la resta (Saldo actual - Monto del gasto). Si el usuario tiene Bs 150 disponibles y el gasto es de Bs 80, él mismo tiene que hacer la operación mental: $150 - 80 = 70$.
  3. **Efecto de atención dividida (Split-attention):** La información necesaria para tomar una decisión no está presente en el lugar de la acción, forzando al usuario a saltar entre pantallas o confiar en su memoria a corto plazo, lo que genera ansiedad y propensión a sobregiro accidental.
* **Evidencia visual:**
  ![Captura Carga Cognitiva](evidencias/evidencia%20carga%20cognitiva.png)
* **Recomendación de mejora:** Incluir en la parte superior de la vista de Pagos un bloque resumen con el "Saldo disponible del mes" traído de la API de presupuestos, y mostrar un indicador visual o mensaje contextual antes de confirmar el pago (ej. *"Saldo restante tras este pago: Bs XX.XX"*).
