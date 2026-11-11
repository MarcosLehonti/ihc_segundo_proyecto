# Feedback a otro proyecto – Clase 19

- **Nombre completo del evaluador**: Roberto Anjel Santos Castro
- **Mi grupo y caso de estudio**: Roberto Anjel Santos Castro - Voluntariado Cerca
- **Grupo y caso de estudio evaluado**: Presupuesto Estudiantil
- **Integrantes del proyecto evaluado**: Ariany Claure Cota
- **URL de la app y repositorio evaluado**: https://github.com/ary10220/ihc_segundo_proyecto.git
- **Fecha y versión/commit probado (si está disponible)**: https://github.com/ary10220/ihc_segundo_proyecto/commit/3cd48bcadac19d2869a7944ecea887598ab9adc9

---

# Flujo 1: Registro y Búsqueda / Filtrado de Gastos (Tarea Asignada por el Docente)

## Primera impresión
- **¿Qué entendí al entrar?**: Se logra identificar de forma inmediata el botón de acceso al módulo de gastos. Se entiende con rapidez que la acción principal disponible es dirigirse allí para asentar una salida de dinero.
- **¿Qué me confundió?**: La interfaz es sumamente plana, austera y cruda; carece por completo de un diseño visual que oriente o guíe el ojo del usuario hacia un flujo de interacción natural. No hay jerarquía gráfica, los contrastes son mínimos y la estructura de la información se siente desordenada y desarticulada desde el primer segundo.

## Funcionalidad asignada y resultado
- [x] La completé sin ayuda.

## Qué no funcionó
- **Inputs minúsculos y sin relleno**: Los campos de texto y selectores son diminutos y carecen por completo de `padding` interno.
- **Tipografía diminuta**: El tamaño de fuente utilizado en los textos e inputs es excesivamente pequeño.
- **Rigidez absoluta en las categorías**: El sistema obliga a elegir entre una lista estática y limitada de categorías predeterminadas.
- **Cero agilidad**: El caso de uso central exige rapidez de registro al vuelo, pero la incomodidad visual y motriz del formulario destruye esa inmediatez.

## Qué mejoraría y por qué
1. **Rediseño ergonómico integral del formulario**: Inputs con altura mínima de 42px a 44px, con padding interno generoso, bordes con radio suave, tipografía visible 14-16px.
2. **Categorización dinámica personalizada**: Permitir al usuario crear, editar y asignar nuevas categorías sobre la marcha.

## Qué quitaría y por qué
Quitaría la restricción cerrada de categorías estáticas preconfiguradas y cualquier paso o texto accesorio innecesario dentro del formulario.

---

# Flujo 2: Dashboard General, Límites de Categorías y Filtros Complejos

## Primera impresión
- **¿Qué me confundió?**:
  - Desorientación visual y falta de affordance.
  - Sobrecarga de información y ruido visual.
  - Falta grave de organización del layout.
  - **Información crítica completamente oculta**: Los límites de gastos por categoría no están a la vista; están relegados y sepultados en la parte inferior del dashboard.

## Funcionalidad asignada y resultado
- [x] La completé con ayuda. Requerí exploración prolongada por ensayo y error.

## Qué no funcionó
- **Límites por categoría incomprensibles y escondidos**: no se entiende cómo funcionan en primera instancia.
- **Layout plano sin modularidad**: ausencia total de contenedores visuales (`cards`).
- **Página de pagos y filtros sin retroalimentación**.

## Qué mejoraría y por qué
1. **Reestructuración modular del Dashboard en Tarjetas (`Cards`)**.
2. **Reubicación y visualización gráfica de los límites de categoría**: moverlos a la parte superior con barras de progreso visuales con código cromático (verde / amarillo / rojo).
3. **Sistema de filtrado intuitivo en pagos**.

## Qué quitaría y por qué
- Limpieza radical de datos y texto redundante.
- El scroll vertical infinito sin estructura.
