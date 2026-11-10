import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

// Tarea 8 · Metas de ahorro con fondos disponibles.
// Cada prueba crea sus propios usuarios (correo único) para que los datos sean reproducibles.
const api = 'http://127.0.0.1:4000/api';
const INGRESO = 1000;

async function crearUsuarioConIngreso(request: APIRequestContext, sufijo: string) {
  const email = `metas-${sufijo}-${Date.now()}@test.com`;
  const password = 'metas12345';
  const registro = await request.post(`${api}/auth/register`, {
    data: { name: `Metas ${sufijo}`, email, password },
  });
  expect(registro.ok(), await registro.text()).toBeTruthy();
  const { token } = await registro.json();
  const headers = { Authorization: `Bearer ${token}` };

  const ahora = new Date();
  const presupuesto = await request.post(`${api}/presupuesto/establecer`, {
    headers,
    data: { limite: 50_000, mes: ahora.getMonth() + 1, anio: ahora.getFullYear() },
  });
  expect(presupuesto.ok(), await presupuesto.text()).toBeTruthy();

  const ingreso = await request.post(`${api}/gastos/registrar`, {
    headers,
    data: { monto: INGRESO, motivo: 'Mesada E2E', tipo: 'ingreso', categoria: 'otros' },
  });
  expect(ingreso.ok(), await ingreso.text()).toBeTruthy();
  return { email, password, token, headers };
}

async function iniciarSesion(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('Correo').fill(email);
  await page.getByPlaceholder('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

async function crearMeta(page: Page, nombre: string, objetivo: number) {
  await page.getByLabel('Nombre de la meta').fill(nombre);
  await page.getByLabel('Monto objetivo (Bs)').fill(String(objetivo));
  await page.getByLabel('Fecha objetivo').fill('2027-06-30');
  await page.getByRole('button', { name: 'Crear meta' }).click();
  await expect(page.getByRole('status')).toContainText(`Meta "${nombre}" creada`);
}

async function moverFondos(page: Page, meta: string, monto: number, accion: 'Asignar' | 'Retirar') {
  const tarjeta = page.getByRole('article', { name: `Meta ${meta}` });
  await tarjeta.getByLabel(`Monto para ${meta}`).fill(String(monto));
  await tarjeta.getByRole('button', { name: accion }).click();
}

const ahorrado = (page: Page, meta: string) =>
  page.getByRole('article', { name: `Meta ${meta}` }).getByTestId('meta-ahorrado');

test('recorrido completo: dos metas, asignación, transferencia, retiro e intento sin fondos', async ({ page, request }) => {
  const usuario = await crearUsuarioConIngreso(request, 'recorrido');
  await iniciarSesion(page, usuario.email, usuario.password);

  await page.getByRole('link', { name: 'Metas' }).click();
  await expect(page.getByRole('heading', { name: 'Metas de ahorro' })).toBeVisible();
  await expect(page.getByTestId('saldo-disponible')).toHaveText('Bs 1000.00');

  await crearMeta(page, 'Laptop', 3000);
  await crearMeta(page, 'Viaje', 800);

  // Asignar desde el disponible
  await moverFondos(page, 'Laptop', 300, 'Asignar');
  await expect(ahorrado(page, 'Laptop')).toHaveText('Bs 300.00');
  await moverFondos(page, 'Viaje', 100, 'Asignar');
  await expect(ahorrado(page, 'Viaje')).toHaveText('Bs 100.00');
  await expect(page.getByTestId('saldo-disponible')).toHaveText('Bs 600.00');

  // Transferencia entre metas: el disponible no cambia
  await page.getByLabel('Desde').selectOption({ label: 'Laptop' });
  await page.getByLabel('Hacia').selectOption({ label: 'Viaje' });
  await page.getByLabel('Monto a transferir (Bs)').fill('50');
  await page.getByRole('button', { name: 'Transferir' }).click();
  await expect(ahorrado(page, 'Laptop')).toHaveText('Bs 250.00');
  await expect(ahorrado(page, 'Viaje')).toHaveText('Bs 150.00');
  await expect(page.getByTestId('saldo-disponible')).toHaveText('Bs 600.00');

  // Retiro: vuelve al disponible
  await moverFondos(page, 'Viaje', 30, 'Retirar');
  await expect(ahorrado(page, 'Viaje')).toHaveText('Bs 120.00');
  await expect(page.getByTestId('saldo-disponible')).toHaveText('Bs 630.00');

  // Intento sin fondos: se rechaza y nada cambia
  await moverFondos(page, 'Laptop', 5000, 'Asignar');
  await expect(page.getByRole('alert')).toContainText('Fondos insuficientes');
  await expect(ahorrado(page, 'Laptop')).toHaveText('Bs 250.00');

  // El saldo total se conserva: las metas no crean ingresos ni gastos
  await expect(page.getByTestId('saldo-total')).toHaveText('Bs 1000.00');
  await expect(page.getByTestId('saldo-reservado')).toHaveText('Bs 370.00');

  // Persistencia al recargar + historial de movimientos (incluido el rechazado)
  await page.reload();
  await expect(ahorrado(page, 'Laptop')).toHaveText('Bs 250.00');
  await expect(ahorrado(page, 'Viaje')).toHaveText('Bs 120.00');
  await expect(page.getByTestId('saldo-disponible')).toHaveText('Bs 630.00');
  const historial = page.getByRole('list', { name: 'Movimientos de metas' });
  await expect(historial.getByRole('listitem')).toHaveCount(5);
  await expect(historial).toContainText('Rechazado');
  await expect(historial).toContainText('Transferencia');
  await expect(historial).toContainText('Retiro');
});

test('restricción: sin fondos no se asigna, retira ni transfiere, y un usuario ajeno no puede mover metas', async ({ request }) => {
  const duenio = await crearUsuarioConIngreso(request, 'duenio');
  const ajeno = await crearUsuarioConIngreso(request, 'ajeno');

  const crear = async (nombre: string) => {
    const r = await request.post(`${api}/metas`, {
      headers: duenio.headers,
      data: { nombre, montoObjetivo: 500, fechaObjetivo: '2027-01-01' },
    });
    expect(r.status()).toBe(201);
    return (await r.json()).meta.id as number;
  };
  const a = await crear('Fondo A');
  const b = await crear('Fondo B');

  // Asignar más que el disponible
  const sinFondos = await request.post(`${api}/metas/${a}/asignar`, { headers: duenio.headers, data: { monto: INGRESO + 1 } });
  expect(sinFondos.status()).toBe(400);
  expect((await sinFondos.json()).error).toContain('Fondos insuficientes');

  // Retirar o transferir desde una meta vacía
  const retiro = await request.post(`${api}/metas/${a}/retirar`, { headers: duenio.headers, data: { monto: 1 } });
  expect(retiro.status()).toBe(400);
  const transf = await request.post(`${api}/metas/transferir`, {
    headers: duenio.headers, data: { origenId: a, destinoId: b, monto: 1 },
  });
  expect(transf.status()).toBe(400);

  // Montos inválidos
  const negativo = await request.post(`${api}/metas/${a}/asignar`, { headers: duenio.headers, data: { monto: -5 } });
  expect(negativo.status()).toBe(400);

  // El dueño asigna 200; un usuario ajeno no puede tocar esa meta
  expect((await request.post(`${api}/metas/${a}/asignar`, { headers: duenio.headers, data: { monto: 200 } })).ok()).toBeTruthy();
  const ajenoRetira = await request.post(`${api}/metas/${a}/retirar`, { headers: ajeno.headers, data: { monto: 200 } });
  expect(ajenoRetira.status()).toBe(404);
  const ajenoAsigna = await request.post(`${api}/metas/${a}/asignar`, { headers: ajeno.headers, data: { monto: 10 } });
  expect(ajenoAsigna.status()).toBe(404);
  const ajenoLista = await (await request.get(`${api}/metas`, { headers: ajeno.headers })).json();
  expect(ajenoLista.metas).toHaveLength(0);

  // Estado final del dueño intacto y saldo total conservado
  const final = await (await request.get(`${api}/metas`, { headers: duenio.headers })).json();
  expect(final.saldoTotal).toBe(INGRESO);
  expect(final.reservado).toBe(200);
  expect(final.disponible).toBe(INGRESO - 200);
  expect(final.movimientos.filter((m: { tipo: string }) => m.tipo === 'rechazado')).toHaveLength(3);
});
