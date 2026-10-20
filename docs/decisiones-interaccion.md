# Decisiones de Diseño de Interacción — Historial de Movimientos del Mes

Documento de justificación técnica y ergonomía de interacción para la funcionalidad de **Historial de Movimientos del Mes**, basado en las leyes clásicas de HCI: **Ley de Fitts**, **Ley de Hick** y **Carga Cognitiva**.

---

## Tabla Resumen de Decisiones

| # | Decisión de Diseño | Principio HCI | Antes | Después | Estado |
|---|--------------------|---------------|-------|---------|--------|
| 1 | **Acceso ergonómico y visible al Historial** | **Ley de Fitts**<br>*(Objetivo táctil fácil de alcanzar)* | ![Fitts Antes](evidencias/evidencia%20fitts%20historial%20antes.png) | *(Captura pendiente)* | En desarrollo |
| 2 | **Organización limpia por pestañas rápidas** | **Ley de Hick**<br>*(Minimizar alternativas simultáneas)* | ![Hick Antes](evidencias/evidencia%20hick%20historial%20antes.png) | *(Captura pendiente)* | En desarrollo |
| 3 | **Contexto inmediato y Estado Vacío orientativo** | **Carga Cognitiva**<br>*(Evitar memoria de trabajo y split-attention)* | ![Cognitiva Antes](evidencias/evidencia%20cognitiva%20historial%20antes.png) | *(Captura pendiente)* | En desarrollo |

---

## 1. Decisión 1: Ley de Fitts

### Pregunta clave:
*¿La entrada al historial y la acción frecuente tienen un objetivo fácil y rápido de alcanzar?*

### Justificación ergonómica:
De acuerdo con la **Ley de Fitts** ($T = a + b \log_2(2D/W)$), el tiempo para alcanzar un objetivo depende de la distancia ($D$) y del tamaño del objetivo ($W$). 

* **Problema (Antes):** En la barra de navegación no existía ningún enlace o botón para acceder al historial de movimientos del mes. El usuario debía adivinar rutas o no tenía forma directa de consultar su historial, forzando un tiempo de desplazamiento indefinido.
* **Solución aplicada:** Se agregó el enlace directo **Historial** en la barra de navegación superior con un tamaño táctil ergonómico mínimo de **$44\text{px}$** (`minHeight: '44px'`, `padding: '10px 16px'`) cumpliendo las directrices WCAG/Fitts de target size.
* **Referencias al código:**
  - Configuración del target size ergonómico: [Navbar.tsx:L11-L22](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/components/Navbar.tsx#L11-L22)
  - Botón de navegación al historial: [Navbar.tsx:L50-L53](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/components/Navbar.tsx#L50-L53)
* **Evidencias visuales:**
  * **Antes:**
    ![Fitts Antes](evidencias/evidencia%20fitts%20historial%20antes.png)
  * **Después:**
    *(Espacio para captura del después con el botón Historial en el Navbar)*

---

## 2. Decisión 2: Ley de Hick

### Pregunta clave:
*¿Los tipos de eventos, estados o filtros compiten entre sí sin organización?*

### Justificación cognitiva:
Según la **Ley de Hick** ($T = b \log_2(n + 1)$), el tiempo necesario para tomar una decisión aumenta logarítmicamente con el número de alternativas ($n$) presentadas simultáneamente.

* **Problema (Antes):** En las vistas previas, para filtrar movimientos se desplegaban de golpe múltiples menús de selección (Tipo, Categoría, Estado, Fechas), presentando más de 15 opciones compitiendo a la vez sin jerarquía clara.
* **Solución aplicada:** En la pantalla de Historial se simplificó la interacción a solo **3 pestañas rápidas y mutuamente excluyentes**:
  1. `Todos (N)`
  2. `Solo Gastos`
  3. `Solo Ingresos`
  Reduciendo la decisión a una sola pulsación directa sin menús anidados.
* **Referencias al código:**
  - Pestañas de filtrado rápido: [Historial.tsx:L85-L147](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Historial.tsx#L85-L147)
* **Evidencias visuales:**
  * **Antes:**
    ![Hick Antes](evidencias/evidencia%20hick%20historial%20antes.png)
  * **Después:**
    *(Espacio para captura del después con los tabs rápidos en el Historial)*

---

## 3. Decisión 3: Carga Cognitiva y Estado Vacío Orientativo

### Pregunta clave:
*¿Cada evento muestra primero lo necesario para comprender qué pasó sin tener que recordar otras pantallas? ¿El estado vacío orienta qué hacer después?*

### Justificación psicológica:
La **Teoría de Carga Cognitiva** (Sweller) indica que la memoria de trabajo humana tiene capacidad limitada. Obligar al usuario a recordar cifras previas genera carga extrínseca innecesaria. Además, una interfaz vacía sin orientación genera desorientación (*Split-attention* y frustración).

* **Problema (Antes):** La consulta de movimientos no ofrecía un resumen del período ni del total mensual, forzando al usuario a memorizar cifras del Dashboard. Además, si no había movimientos, la lista quedaba en blanco sin ninguna indicación de cómo proceder.
* **Solución aplicada:**
  1. **Tarjeta de Resumen Inmediato:** Se añadió un bloque superior que informa el **período actual (mes y año)**, el **total de movimientos** y el **total gastado este mes (Bs)**, contextualizando la pantalla de inmediato.
  2. **Tarjetas semánticas digeribles:** Cada transacción muestra en un solo bloque el concepto, fecha legible, categoría, estado y monto con color semántico (rojo `- Bs` para gasto, verde `+ Bs` para ingreso).
  3. **Estado Vacío Orientativo (Empty State):** Si el usuario no tiene registros este mes, la pantalla muestra una tarjeta explicativa con el mensaje *"No tienes movimientos registrados este mes"* y un botón de llamada a la acción destacado **`+ Registrar un nuevo gasto`** que lo guía a la acción siguiente.
* **Referencias al código:**
  - Resumen financiero del mes: [Historial.tsx:L65-L84](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Historial.tsx#L65-L84)
  - Estado vacío con botón orientativo: [Historial.tsx:L152-L187](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Historial.tsx#L152-L187)
  - Tarjetas semánticas del evento: [Historial.tsx:L200-L245](file:///c:/Users/HP/Desktop/Universidad/Interaccion%20Hombre%20Computador/segundo_proyecto/frontend/src/pages/Historial.tsx#L200-L245)
* **Evidencias visuales:**
  * **Antes:**
    ![Cognitiva Antes](evidencias/evidencia%20cognitiva%20historial%20antes.png)
  * **Después:**
    *(Espacio para captura del después con resumen mensual y estado vacío / tarjetas en Historial)*
