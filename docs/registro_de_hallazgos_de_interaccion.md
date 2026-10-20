# Registro de Hallazgos de Interacción

Documento de análisis de interacción humano-computador basado en leyes clásicas de ergonomía y psicología cognitiva: **Ley de Fitts**, **Ley de Hick** y **Carga Cognitiva**.

---

## Tabla Resumen de Hallazgos

| # | Hallazgo | Captura obligatoria | Justificación breve | Estado al terminar |
|---|----------|---------------------|---------------------|--------------------|
| 1 | **Ley de Fitts**<br>*(¿La acción es suficientemente grande y cercana?)*<br>Botones de acción "Editar" y "Eliminar" con tamaño reducido y colocados contiguos sin margen de seguridad en la lista de movimientos. | **Vista: Gastos (`Gastos.tsx`)**<br><br>**Antes:**<br>![Fitts Antes](evidencias/clase_16/evidencia%20Fitts.png)<br><br>**Después:**<br>![Fitts Después](evidencias/clase_16/evidencia%20Fitts%20despues.png) | Los botones "Editar" y "Eliminar" de cada movimiento carecían de un área de toque o padding mínimo ergonómico (target size reducido). Además, estaban dispuestos de forma contigua sin espaciado de seguridad. De acuerdo con la Ley de Fitts ($T = a + b \log_2(2D/W)$), un ancho de objetivo ($W$) pequeño combinado con una distancia casi nula respecto a una acción destructiva ("Eliminar") incrementaba el tiempo de apuntado y la probabilidad de clics erróneos accidentales. | **Corregido** |
| 2 | **Ley de Hick**<br>*(Opciones que compiten antes de decidir)*<br>Sobrecarga simultánea de 5 selectores y criterios de filtrado compitiendo al mismo nivel de jerarquía visual. | **Vista: Gastos (`Gastos.tsx`)**<br><br>**Antes:**<br>![Hick Antes](evidencias/clase_16/evidencia%20de%20Hick.png)<br><br>**Después:**<br>![Hick Después](evidencias/clase_16/evidencia%20de%20Hick%20despues.png) | El panel de búsqueda y filtros exponía en un solo bloque 5 controles independientes sin jerarquía visual. Según la Ley de Hick ($T = b \log_2(n + 1)$), el tiempo de decisión aumentaba logarítmicamente con el número de opciones compitiendo a la vez. Se implementó divulgación progresiva con accesos directos rápidos ("Todos", "Solo gastos", "Solo ingresos", "Este mes") y un botón para desplegar/ocultar los filtros avanzados secundarios bajo demanda. | **Corregido** |
| 3 | **Carga Cognitiva**<br>*(¿Qué debe recordar o procesar para continuar?)*<br>Ausencia de saldo disponible y contexto financiero al ejecutar un pago, obligando al cálculo y recuerdo mental. | **Vista: Pagos (`Pagos.tsx`)**<br><br>**Antes:**<br>![Carga Cognitiva Antes](evidencias/clase_16/evidencia%20Carga%20cognitiva.png)<br><br>**Después:**<br>![Carga Cognitiva Después](evidencias/clase_16/evidencia%20Carga%20cognitiva%20despues.png) | La pantalla de pagos no mostraba el saldo disponible ni el impacto del gasto, obligando a recordar el saldo desde el Dashboard y calcular mentalmente la resta. Se implementó una tarjeta central de "Resumen Financiero del Mes" con el saldo disponible sincronizado y el cálculo automático del saldo proyectado tras cada pago con alertas de sobregiro. | **Corregido** |

---

## Detalle y Justificación Técnica de los Hallazgos

### 1. Hallazgo: Ley de Fitts
* **Pregunta clave:** *¿La acción es suficientemente grande y cercana?*
* **Pantalla / Vista:** `Gastos` ([Gastos.tsx](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Gastos.tsx#L507-L555))
* **Componente y líneas de código:**
  - Botones de acción en cada tarjeta de movimiento: `<button onClick={...}>Editar</button>` y `<button onClick={...}>Eliminar</button>` ([Gastos.tsx:L507-L555](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Gastos.tsx#L507-L555)).
* **Análisis del problema:**
  1. **Tamaño del objetivo insuficiente ($W$ reducido):** Los botones "Editar" y "Eliminar" se renderizaban con los estilos estándar del navegador sin un padding generoso ni un área mínima táctil recomendada (estándar Fitts / WCAG de al menos 44x44px). Al tener un ancho y alto pequeños, el usuario debía realizar una desaceleración motriz excesiva con el puntero para no errar el clic.
  2. **Distancia crítica y adyacencia de riesgo:** Ambos botones se encontraban inmediatamente contiguos horizontalmente, sin un margen de separación de seguridad (`margin`) ni diferenciación visual evidente (como colores de advertencia para acciones destructivas). La distancia física entre querer editar un registro y pulsar por accidente "Eliminar" era prácticamente inexistente.
  3. **Distancia a la acción de confirmación:** Al hacer clic en "Editar", la acción consecuente ("Guardar cambios") se activa en el formulario al inicio de la página, obligando al usuario a recorrer una distancia ($D$) considerable hacia arriba en lugar de resolver la acción en el contexto inmediato del registro.
* **Evidencias visuales (Carpeta `evidencias/clase_16/`):**
  * **Antes de la corrección (botones pequeños y contiguos sin estilo semántico):**
    ![Captura Ley de Fitts - Antes](evidencias/clase_16/evidencia%20Fitts.png)
  * **Después de la corrección (botones ergonómicos, separados con gap 14px y colores de acción):**
    ![Captura Ley de Fitts - Después](evidencias/clase_16/evidencia%20Fitts%20despues.png)
* **Solución implementada:**
  - **Ampliación del target size:** Se aumentó el padding a `9px 18px` con tipografía en negrita (`fontWeight: 'bold'`) y bordes redondeados ergonómicos.
  - **Margen de seguridad:** Se ubicaron dentro de un contenedor flex con separación explícita de `gap: 14px`, eliminando el riesgo de clic accidental entre acciones opuestas.
  - **Diferenciación cromática semántica:** El botón **Editar** se estilizó con azul primario (`#1976d2`), y el botón **Eliminar** con rojo de advertencia destructiva (`#d32f2f`).
* **Estado:** **Corregido**

---

### 2. Hallazgo: Ley de Hick
* **Pregunta clave:** *Opciones que compiten antes de decidir.*
* **Pantalla / Vista:** `Gastos` ([Gastos.tsx](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Gastos.tsx#L350-L450))
* **Componente y líneas de código:**
  - Sección `<section>` con buscador, accesos rápidos y panel desplegable de filtros: `buscar`, `filtroTipo`, `filtroCategoria`, `filtroEstado`, `filtroPeriodo` ([Gastos.tsx:L350-L450](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Gastos.tsx#L350-L450)).
* **Análisis del problema:**
  1. **Competencia visual y decisional:** Al ingresar a la sección de movimientos, el usuario se encontraba con 5 controles desplegados simultáneamente en un mismo contenedor, cada uno con entre 3 y 5 opciones internas diferentes (más de 15 bifurcaciones posibles a primera vista).
  2. **Falta de ordenamiento progresivo:** No existía un filtro primario recomendado (por ejemplo, ver simplemente "Mes actual" o "Todos") ni filtros colapsables bajo un botón secundario de "Filtros avanzados".
  3. **Impacto en el usuario:** Se incrementaba de forma directa el tiempo de selección y la indecisión al obligar al usuario a escanear mentalmente todos los menús desplegables antes de poder localizar una transacción específica ($T = b \log_2(n + 1)$).
* **Evidencias visuales (Carpeta `evidencias/clase_16/`):**
  * **Antes de la corrección (5 selectores compitiendo simultáneamente sin jerarquía):**
    ![Captura Ley de Hick - Antes](evidencias/clase_16/evidencia%20de%20Hick.png)
  * **Después de la corrección (divulgación progresiva con accesos rápidos y desplegable bajo demanda):**
    ![Captura Ley de Hick - Después](evidencias/clase_16/evidencia%20de%20Hick%20despues.png)
* **Solución implementada:**
  - **Divulgación progresiva (Progressive Disclosure):** Se mantuvo la barra de búsqueda rápida visible y se crearon botones de filtro rápido para las opciones más comunes (*"Todos"*, *"Solo gastos"*, *"Solo ingresos"*, *"Este mes"*), reduciendo drásticamente las alternativas ($n$) a primera vista.
  - **Ocultamiento de filtros secundarios:** Los 4 menús desplegables (`Tipo`, `Categoría`, `Estado`, `Período`) se agruparon en un contenedor secundario colapsable controlado mediante el botón *"▼ Más filtros"* / *"▲ Menos filtros"*, evitando que compitan visualmente de inicio.
* **Estado:** **Corregido**

---

### 3. Hallazgo: Carga Cognitiva
* **Pregunta clave:** *¿Qué debe recordar o procesar el usuario para continuar?*
* **Pantalla / Vista:** `Pagos` ([Pagos.tsx](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Pagos.tsx#L140-L215))
* **Componente y líneas de código:**
  - Resumen financiero central y tarjetas de gastos con proyección de saldo: `saldoDisponible`, contenedor de resumen centrado y bloque de cálculo asistido `(saldoDisponible - gasto.monto)` ([Pagos.tsx:L140-L215](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Pagos.tsx#L140-L215)).
* **Análisis del problema:**
  1. **Esfuerzo de memoria de trabajo (Working Memory Load):** Para saber si era financieramente seguro pulsar el botón "Marcar como pagado", el usuario debía **recordar mentalmente** la cifra de "Saldo disponible" que vio previamente en la pantalla del `Dashboard` ([Dashboard.tsx:L218-L221](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Dashboard.tsx#L218-L221)).
  2. **Cálculo mental no asistido:** El sistema no calculaba ni mostraba la resta (Saldo actual - Monto del gasto). Si el usuario tenía Bs 150 disponibles y el gasto era de Bs 80, él mismo tenía que hacer la operación mental: $150 - 80 = 70$.
  3. **Efecto de atención dividida (Split-attention):** La información necesaria para tomar una decisión no estaba presente en el lugar de la acción, forzando al usuario a saltar entre pantallas o confiar en su memoria a corto plazo, lo que generaba ansiedad y propensión a sobregiro accidental.
* **Evidencias visuales (Carpeta `evidencias/clase_16/`):**
  * **Antes de la corrección (pantalla de pagos sin contexto financiero ni saldo disponible):**
    ![Captura Carga Cognitiva - Antes](evidencias/clase_16/evidencia%20Carga%20cognitiva.png)
  * **Después de la corrección (tarjeta central de saldo disponible y cálculo asistido de saldo restante):**
    ![Captura Carga Cognitiva - Después](evidencias/clase_16/evidencia%20Carga%20cognitiva%20despues.png)
* **Solución implementada:**
  - **Contexto financiero visible e inmediato:** Se integró en la cabecera una tarjeta centrada en pantalla con el *"Resumen Financiero del Mes"*, mostrando el **Saldo disponible** en tiempo real consultado directamente a la API de presupuestos.
  - **Cálculo mental asistido:** Se añadió un bloque en cada gasto pendiente que calcula y muestra automáticamente el *"Saldo restante tras este pago: Bs XX.XX"*, junto con una advertencia visual si la operación supera el saldo disponible, liberando por completo la memoria de trabajo del usuario.
* **Estado:** **Corregido**
