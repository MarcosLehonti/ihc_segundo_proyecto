# Task 02 - Pruebas unitarias del cambio de estado de gastos

## 1. Objetivo

Implementar y ejecutar pruebas unitarias para validar el flujo de cambio de estado de un gasto mediante la función `pagarGasto`.

El flujo probado permite cambiar el estado de un gasto de:

```text
pendiente → gastado
```

Las pruebas verifican tanto el funcionamiento correcto como el manejo de errores del controlador.

---

## 2. Herramienta utilizada

Para realizar las pruebas unitarias se utilizó:

* **Jest 30.5.2**
* Node.js
* JavaScript

Jest fue instalado como dependencia de desarrollo mediante:

```bash
npm install --save-dev jest
```

---

## 3. Ubicación de las pruebas

Las pruebas unitarias se encuentran en:

```text
backend/tests/gastoController.test.js
```

El archivo contiene las pruebas correspondientes a la función:

```text
pagarGasto
```

del controlador:

```text
backend/src/controllers/gastoController.js
```

---

## 4. Pruebas implementadas

Se implementaron 4 pruebas unitarias ejecutables.

### Prueba 1 - Cambio de estado correcto

**Nombre:**

```text
debe cambiar el estado de un gasto de pendiente a gastado
```

**Objetivo:**

Verificar que un gasto que se encuentra en estado `pendiente` cambie correctamente a `gastado`.

**Resultado esperado:**

```text
pendiente → gastado
```

También se verifica que se ejecute correctamente el método `save()` y que el controlador devuelva la respuesta correspondiente.

**Resultado:** PASS

---

### Prueba 2 - Gasto inexistente

**Nombre:**

```text
debe devolver error 404 si el gasto no existe
```

**Objetivo:**

Verificar el comportamiento del controlador cuando se intenta pagar un gasto que no existe.

**Resultado esperado:**

El controlador debe responder con código HTTP:

```text
404
```

y devolver el mensaje:

```text
Gasto no encontrado
```

**Resultado:** PASS

---

### Prueba 3 - Error al guardar

**Nombre:**

```text
debe devolver error 500 si ocurre un error al guardar el gasto
```

**Objetivo:**

Verificar que el controlador maneje correctamente un error producido durante el guardado del gasto.

Para esta prueba se simula un error en el método `save()`.

**Resultado esperado:**

El controlador debe responder con código HTTP:

```text
500
```

y devolver el mensaje:

```text
Error al marcar el gasto como pagado
```

**Resultado:** PASS

---

### Prueba 4 - Uso correcto del ID

**Nombre:**

```text
debe buscar el gasto utilizando el ID recibido
```

**Objetivo:**

Verificar que el controlador utilice correctamente el ID recibido mediante los parámetros de la solicitud para buscar el gasto.

Por ejemplo, si se recibe:

```text
id = 3
```

se debe realizar la búsqueda:

```text
Gasto.findByPk(3)
```

**Resultado esperado:**

El método `findByPk()` debe ser llamado utilizando exactamente el ID recibido.

**Resultado:** PASS

---

## 5. Ejecución de las pruebas

Para ejecutar todas las pruebas unitarias se debe ingresar a la carpeta `backend` y ejecutar:

```bash
npm test
```

También se puede ejecutar directamente mediante:

```bash
npx jest
```

El comando configurado en `package.json` es:

```json
"test": "jest"
```

---

## 6. Resultado de ejecución

Las cuatro pruebas fueron ejecutadas correctamente mediante:

```bash
npm test
```

Resultado obtenido:

```text
PASS  tests/gastoController.test.js

✓ debe cambiar el estado de un gasto de pendiente a gastado
✓ debe devolver error 404 si el gasto no existe
✓ debe devolver error 500 si ocurre un error al guardar el gasto
✓ debe buscar el gasto utilizando el ID recibido

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
```

Por lo tanto:

```text
4 pruebas ejecutadas
4 pruebas aprobadas
0 pruebas fallidas
```

## 7. Conclusión

Las pruebas unitarias implementadas permiten verificar el funcionamiento de la lógica de cambio de estado de los gastos y el manejo de los principales escenarios de éxito y error.

El conjunto de pruebas fue ejecutado mediante Jest y las **4 pruebas fueron aprobadas satisfactoriamente**.
