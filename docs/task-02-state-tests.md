# Task 02 - Pruebas unitarias del cambio de estado y control de acceso a gastos

## 1. Objetivo

Implementar y ejecutar pruebas unitarias para validar el flujo de cambio de estado de un gasto mediante la función `pagarGasto`, así como comprobar que un usuario no pueda pagar gastos pertenecientes a otro usuario.

El flujo probado permite cambiar el estado de un gasto de:

```text
pendiente → gastado
```

Además, se verifica que el backend rechace las solicitudes no autorizadas, protegiendo la información de los usuarios.

Las pruebas validan el funcionamiento correcto del controlador, el manejo de errores y las restricciones de acceso por propietario.

---

## 2. Herramienta utilizada

Para realizar las pruebas unitarias se utilizaron las siguientes herramientas:

- **Jest 30.5.2**
- Node.js
- JavaScript

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

Para las pruebas se simulan los registros de gastos y sus operaciones mediante el uso de funciones mock de Jest, evitando modificar registros reales de la base de datos durante la ejecución de las pruebas unitarias.

---

## 4. Pruebas implementadas

Se implementaron **5 pruebas unitarias** para validar el cambio de estado, el manejo de errores y el control de acceso por usuario.

### Prueba 1 - Cambio de estado correcto

**Nombre:**

```text
debe cambiar el estado de un gasto de pendiente a gastado
```

**Objetivo:**

Verificar que un gasto que se encuentra en estado `pendiente` cambie correctamente a `gastado` cuando el usuario autenticado es propietario del gasto.

**Resultado esperado:**

```text
pendiente → gastado
```

También se verifica que se ejecute correctamente el método `save()` y que el controlador devuelva el mensaje de confirmación correspondiente.

**Resultado:** PASS (según la ejecución anterior).

---

### Prueba 2 - Gasto inexistente

**Nombre:**

```text
debe devolver error 404 si el gasto no existe
```

**Objetivo:**

Verificar el comportamiento del controlador cuando se intenta pagar un gasto que no existe en el sistema.

**Resultado esperado:**

El controlador debe responder con el código HTTP:

```text
404
```

Y devolver el mensaje:

```text
Gasto no encontrado
```

**Resultado:** PASS (según la ejecución anterior).

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

El controlador debe responder con el código HTTP:

```text
500
```

Y devolver el mensaje:

```text
Error al marcar el gasto como pagado
```

**Resultado:** PASS (según la ejecución anterior).

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

Se debe realizar la búsqueda:

```js
Gasto.findByPk(3)
```

**Resultado esperado:**

El método `findByPk()` debe ser llamado utilizando exactamente el ID recibido.

**Resultado:** PASS (según la ejecución anterior).

---

### Prueba 5 - Rechazo del pago de un gasto ajeno

**Nombre:**

```text
debe rechazar el pago si el gasto pertenece a otro usuario
```

**Objetivo:**

Verificar que un usuario autenticado no pueda cambiar el estado de pago de un gasto perteneciente a otro usuario.

Para esta prueba se simula el siguiente escenario:

- Usuario autenticado: ID `1`.
- Propietario del gasto: ID `2`.
- Estado inicial del gasto: `pendiente`.

El usuario autenticado intenta pagar un gasto que no le pertenece.

**Resultado esperado:**

El backend debe rechazar la solicitud y responder con el código HTTP:

```text
403
```

El mensaje de respuesta debe ser:

```text
No tienes permiso para pagar este gasto
```

También se verifica que:

- El estado del gasto permanezca en `pendiente`.
- El método `save()` no sea ejecutado.

De esta manera se comprueba que la validación de propiedad impide modificar el estado de un gasto ajeno.

**Resultado:** Pendiente de confirmar con la última ejecución de `npm test`.

---

## 5. Ejecución de las pruebas

Para ejecutar todas las pruebas unitarias, se debe ingresar a la carpeta `backend` y ejecutar:

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

Las pruebas deben ejecutarse mediante:

```bash
npm test
```

Una vez confirmada la ejecución exitosa, el resultado esperado será:

```text
PASS tests/gastoController.test.js

✓ debe cambiar el estado de un gasto de pendiente a gastado
✓ debe devolver error 404 si el gasto no existe
✓ debe devolver error 500 si ocurre un error al guardar el gasto
✓ debe buscar el gasto utilizando el ID recibido
✓ debe rechazar el pago si el gasto pertenece a otro usuario

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
```

El resultado definitivo debe coincidir con la salida real de Jest.

---

## 7. Conclusión

Las pruebas unitarias permiten verificar el funcionamiento de la lógica de cambio de estado de los gastos, el manejo de errores y el control de acceso por propietario en la función `pagarGasto`.

Las cuatro pruebas originales validan el cambio de estado, el manejo de gastos inexistentes, los errores de guardado y el uso correcto del identificador recibido.

La quinta prueba amplía la cobertura de seguridad al verificar que un usuario no pueda pagar un gasto perteneciente a otra persona, que el backend responda con HTTP 403 y que el estado del gasto no sea modificado.

Con esta ampliación se fortalece la validación del criterio de aceptación relacionado con el cambio de estado de pago de gastos ajenos. Las pruebas de autorización para las funciones `editarGasto` y `eliminarGasto` se documentarán por separado cuando sean implementadas y ejecutadas.
