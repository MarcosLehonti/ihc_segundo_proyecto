# Feedback a otro proyecto - Clase 19

- Nombre completo del evaluador: Franco Moron Luis Enrique
- Mi grupo y caso de estudio: [COMPLETAR: grupo] - Presupuesto Estudiantil
- Grupo y caso de estudio evaluado: [COMPLETAR: grupo] - StudyMatch
- Integrantes del proyecto evaluado: Calani Garcia Fernando Javier [COMPLETAR: otros integrantes si los hay]
- URL de la app y repositorio evaluado: https://github.com/FernandojCg737/2do-Proyecto-Fork.git
- Fecha y versión/commit probado (si está disponible): 03/11/2026 - [078621244d99a0531e62da299268fe212f1f353b](https://github.com/FernandojCg737/2do-Proyecto-Fork/commit/078621244d99a0531e62da299268fe212f1f353b) (feat(tarea-6): implementacion de lista de espera con orden FIFO y suite completa E2E Playwright con accesibilidad axe-core)

## Primera impresión

Al entrar no entendí bien para qué sirve el proyecto ni cuál es su funcionalidad principal. No hay una presentación visible que explique qué es StudyMatch ni qué se puede hacer con la app.

Más tarde descubrí que sí existe una pantalla de presentación, pero solo se llega a ella haciendo clic en el texto "StudyMatch". Al iniciar sesión la app no me lleva a esa pantalla, así que un usuario nuevo no la ve y queda sin contexto.

## Funcionalidad asignada y resultado

### Flujo 1: Buscar sesión de estudio por materia

- [x] La completé sin ayuda.
- [ ] La completé con ayuda. ¿Cuál?
- [ ] No pude completarla. ¿Dónde me detuve?

### Flujo 2: Crear una nueva sesión de estudio

- [x] La completé sin ayuda.
- [ ] La completé con ayuda. ¿Cuál?
- [ ] No pude completarla. ¿Dónde me detuve?

## Qué no funcionó

### Flujo 1: Buscar sesión por materia

- **Pasos:** busco una sesión filtrando por materia y entre los resultados aparece una sesión con fecha ya pasada.
- **Resultado esperado:** que la sesión indique claramente que las inscripciones ya cerraron.
- **Resultado observado:** el estado sigue diciendo "Inscripciones Abiertas" en color verde. El botón de solicitar sí aparece deshabilitado, pero el mensaje verde se contradice con eso y me da la curiosidad de presionar un botón que no funciona.

### Flujo 2: Crear nueva sesión de estudio

- **Pasos:** completo el formulario de nueva sesión y presiono el botón para crearla.
- **Resultado esperado:** que me pida confirmar o revisar los datos antes de crearla.
- **Resultado observado:** la sesión se crea directamente, sin ninguna confirmación. Si me equivoqué en un dato, ya está creada.

## Qué mejoraría y por qué

- **Flujo 1:** el estado de inscripción muestra "Inscripciones Abiertas" en todas las sesiones, aunque la fecha ya haya pasado. Propongo calcular el estado según la fecha (por ejemplo "Inscripciones cerradas" en gris o rojo) y explicar con un texto por qué no se puede solicitar, en lugar de solo bajar la opacidad del botón. Así el usuario entiende qué pasa sin tener que adivinar.
- **Flujo 2:** en el campo "Materia" permitiría elegir entre materias ya existentes (lista desplegable o autocompletado). Así se evitan materias duplicadas o escritas de forma distinta, y el filtro por materia del Flujo 1 funciona mejor.
- **General:** que la pantalla de presentación se muestre al entrar o al iniciar sesión por primera vez, para que se entienda de qué trata la app desde el inicio.

## Qué quitaría y por qué

- **Flujo 1:** quitaría la posibilidad de elegir un rango de fechas ya pasado en el filtro, porque buscar sesiones que ya ocurrieron no tiene sentido para quien quiere unirse a una.
- **Flujo 2:** quitaría el selector de "Inscripciones Abiertas o Cerradas" del formulario de creación, ya que no tiene sentido crear una sesión con las inscripciones cerradas.
- **Flujo 2:** reemplazaría el botón "Ver Sesiones" dentro del formulario por un botón "Cancelar". Hoy, si alguien le da clic por curiosidad, vuelve al panel y pierde todo lo que había rellenado, sin aviso.
