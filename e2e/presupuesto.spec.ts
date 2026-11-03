import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const correo = process.env.E2E_EMAIL ?? 'e2e@test.com';
const contrasena = process.env.E2E_PASSWORD ?? 'e2e12345';
const correoAlternativo = process.env.E2E_ALT_EMAIL ?? 'e2e-alternate@test.com';
const contrasenaAlternativa = process.env.E2E_ALT_PASSWORD ?? 'e2e-alternate123';
const montoPrueba = 1.25;

function hoyLocal() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

async function iniciarSesion(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('Correo').fill(email);
  await page.getByPlaceholder('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

test('registrar un gasto actualiza el presupuesto y pagarlo cambia su estado', async ({
  page,
  request,
}) => {
  let gastoId: number | undefined;
  let token: string | null = null;

  try {
    await page.goto('/login');
    await page.getByPlaceholder('Correo').fill(correo);
    await page.getByPlaceholder('Contraseña').fill(contrasena);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    token = await page.evaluate(() => localStorage.getItem('token'));

    const totalAntes = page.locator('p').filter({ hasText: 'Total gastado:' });
    await expect(totalAntes).toBeVisible();
    const textoTotalAntes = await totalAntes.innerText();
    const numeroAntes = textoTotalAntes.match(/Bs\s*([\d.]+)/);
    expect(numeroAntes, 'el Dashboard debe mostrar el total gastado').not.toBeNull();
    const totalInicial = Number(numeroAntes![1]);

    const respuestaRegistro = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/gastos/registrar') &&
        response.request().method() === 'POST',
    );

    await page.getByRole('link', { name: 'Gastos' }).click();
    await page.getByPlaceholder('Monto').fill(String(montoPrueba));
    const motivo = `E2E presupuesto ${Date.now()}`;
    await page.getByPlaceholder('Motivo').fill(motivo);
    await page.getByRole('combobox').nth(0).selectOption('gasto');
    await page.getByRole('combobox').nth(1).selectOption('comida');
    await page.getByRole('button', { name: 'Registrar Gasto' }).click();

    const registro = await respuestaRegistro;
    expect(registro.status()).toBe(201);
    const gastoCreado = await registro.json();
    gastoId = gastoCreado.id;
    await expect(page.getByText('Gasto registrado correctamente.')).toBeVisible();

    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(
      page.locator('p').filter({ hasText: 'Total gastado:' }),
    ).toContainText((totalInicial + montoPrueba).toFixed(2));

    await page.getByRole('link', { name: 'Pagos' }).click();
    const filaDelGasto = page
      .getByText(`Motivo: ${motivo}`, { exact: true })
      .locator('xpath=..');
    await filaDelGasto
      .getByRole('button', { name: 'Marcar como pagado' })
      .click();
    await expect(filaDelGasto.getByRole('button', { name: 'Pagado' })).toBeDisabled();

    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(
      page.locator('p').filter({ hasText: 'Total gastado:' }),
    ).toContainText((totalInicial + montoPrueba).toFixed(2));
  } finally {
    // Elimina solo el gasto creado por esta prueba para que se pueda repetir.
    if (gastoId && token) {
      await request.delete(`http://127.0.0.1:4000/api/gastos/eliminar/${gastoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  }
});

test('rechaza un gasto que supera el saldo y conserva el total', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Correo').fill(correo);
  await page.getByPlaceholder('Contraseña').fill(contrasena);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  const totalGastado = page.locator('p').filter({ hasText: 'Total gastado:' });
  const saldoDisponible = page.locator('p').filter({ hasText: 'Saldo disponible:' });
  await expect(totalGastado).toBeVisible();
  await expect(saldoDisponible).toBeVisible();

  const textoTotal = await totalGastado.innerText();
  const totalInicial = Number(textoTotal.match(/Bs\s*([\d.]+)/)?.[1]);
  const textoSaldo = await saldoDisponible.innerText();
  const saldo = Number(textoSaldo.match(/Bs\s*([\d.]+)/)?.[1]);
  expect(Number.isFinite(totalInicial)).toBeTruthy();
  expect(Number.isFinite(saldo)).toBeTruthy();

  await page.getByRole('link', { name: 'Gastos' }).click();
  await page.getByPlaceholder('Monto').fill((saldo + 1).toFixed(2));
  const motivo = `E2E gasto rechazado ${Date.now()}`;
  await page.getByPlaceholder('Motivo').fill(motivo);
  await page.getByRole('combobox').nth(0).selectOption('gasto');
  await page.getByRole('combobox').nth(1).selectOption('comida');

  const respuestaRegistro = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/gastos/registrar') &&
      response.request().method() === 'POST',
  );
  const alerta = page.waitForEvent('dialog').then(async (dialog) => {
    const mensaje = dialog.message();
    await dialog.accept();
    return mensaje;
  });
  await page.getByRole('button', { name: 'Registrar Gasto' }).click();

  const [respuesta, mensajeAlerta] = await Promise.all([respuestaRegistro, alerta]);
  expect(respuesta.status()).toBe(400);
  expect(mensajeAlerta).toBe('El gasto supera el presupuesto mensual disponible');

  await expect(page.getByText(`Motivo: ${motivo}`, { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(totalGastado).toContainText(totalInicial.toFixed(2));
});

test('sin sesión, el Dashboard redirige al inicio de sesión', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
});

test('el segundo usuario ve el estado vacío de recurrencias y puede crearlas', async ({ page }) => {
  await iniciarSesion(page, correoAlternativo, contrasenaAlternativa);
  const seccion = page.locator('#gastos-recurrentes');
  await expect(seccion.getByText('No tienes gastos recurrentes. Puedes crear uno con el formulario.')).toBeVisible();
  await expect(seccion.getByRole('button', { name: 'Guardar gasto recurrente' })).toBeVisible();
});

for (const frecuencia of ['semanal', 'mensual'] as const) {
  test(`crea un gasto recurrente ${frecuencia}, aumenta el consumo y persiste por usuario`, async ({
    page,
    request,
  }) => {
    let recurrenciaId: number | undefined;
    let gastoId: number | undefined;
    let token: string | null = null;

    try {
      await iniciarSesion(page, correo, contrasena);
      token = await page.evaluate(() => localStorage.getItem('token'));
      const totalGastado = page.locator('p').filter({ hasText: 'Total gastado:' });
      const textoTotalInicial = await totalGastado.innerText();
      const totalInicial = Number(textoTotalInicial.match(/Bs\s*([\d.]+)/)?.[1]);
      expect(Number.isFinite(totalInicial)).toBeTruthy();

      const motivo = `E2E recurrente ${frecuencia} ${Date.now()}`;
      const seccion = page.locator('#gastos-recurrentes');
      await seccion.getByLabel('Monto recurrente (Bs)').fill('2.50');
      await seccion.getByLabel('Motivo').fill(motivo);
      await seccion.getByLabel('Categoría').selectOption('comida');
      await seccion.getByLabel('Frecuencia').selectOption(frecuencia);
      await seccion.getByLabel('Primera ocurrencia').fill(hoyLocal());

      const respuestaCrear = page.waitForResponse(
        (response) =>
          response.url().endsWith('/api/gastos-recurrentes') &&
          response.request().method() === 'POST',
      );
      await seccion.getByRole('button', { name: 'Guardar gasto recurrente' }).click();
      const respuesta = await respuestaCrear;
      expect(respuesta.status()).toBe(201);
      const cuerpo = await respuesta.json();
      recurrenciaId = cuerpo.recurrencia.id;
      gastoId = cuerpo.gastoGenerado?.id;
      expect(gastoId).toBeTruthy();

      await expect(seccion.getByText('Gasto recurrente guardado correctamente')).toBeVisible();
      const fila = seccion.getByText(motivo, { exact: true }).locator('xpath=..');
      await expect(fila).toContainText(`Frecuencia: ${frecuencia}`);
      await expect(fila).toContainText('Próxima ocurrencia:');
      await expect(totalGastado).toContainText((totalInicial + 2.5).toFixed(2));

      const accesibilidad = await new AxeBuilder({ page })
        .include('#gastos-recurrentes')
        .analyze();
      expect(accesibilidad.violations).toEqual([]);
      await test.info().attach(`Dashboard con recurrencia ${frecuencia}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });

      await page.reload();
      const filaPersistida = page.locator('#gastos-recurrentes').getByText(motivo, { exact: true }).locator('xpath=..');
      await expect(filaPersistida).toBeVisible();
      await expect(page.locator('p').filter({ hasText: 'Total gastado:' }))
        .toContainText((totalInicial + 2.5).toFixed(2));

      await page.getByRole('button', { name: 'Cerrar sesión' }).first().click();
      await iniciarSesion(page, correoAlternativo, contrasenaAlternativa);
      await expect(page.locator('#gastos-recurrentes').getByText(motivo, { exact: true })).toHaveCount(0);
      await expect(page.locator('#gastos-recurrentes').getByText(
        'No tienes gastos recurrentes. Puedes crear uno con el formulario.',
      )).toBeVisible();
    } finally {
      if (token) {
        if (recurrenciaId) {
          await request.delete(`http://127.0.0.1:4000/api/gastos-recurrentes/${recurrenciaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        if (gastoId) {
          await request.delete(`http://127.0.0.1:4000/api/gastos/eliminar/${gastoId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }
    }
  });
}

test('rechaza una recurrencia que excede el saldo y muestra cómo corregirla', async ({ page }) => {
  await iniciarSesion(page, correo, contrasena);
  const saldoDisponible = page.locator('p').filter({ hasText: 'Saldo disponible:' });
  const textoSaldo = await saldoDisponible.innerText();
  const saldo = Number(textoSaldo.match(/Bs\s*([\d.]+)/)?.[1]);
  expect(Number.isFinite(saldo)).toBeTruthy();

  const seccion = page.locator('#gastos-recurrentes');
  const motivo = `E2E recurrencia excedida ${Date.now()}`;
  await seccion.getByLabel('Monto recurrente (Bs)').fill((saldo + 1).toFixed(2));
  await seccion.getByLabel('Motivo').fill(motivo);
  await seccion.getByLabel('Categoría').selectOption('comida');
  await seccion.getByLabel('Frecuencia').selectOption('semanal');
  await seccion.getByLabel('Primera ocurrencia').fill(hoyLocal());

  const respuestaCrear = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/gastos-recurrentes') &&
      response.request().method() === 'POST',
  );
  await seccion.getByRole('button', { name: 'Guardar gasto recurrente' }).click();
  expect((await respuestaCrear).status()).toBe(400);
  await expect(seccion.getByRole('alert')).toContainText(
    'El gasto recurrente supera el presupuesto mensual disponible',
  );
  await expect(seccion.getByText(motivo, { exact: true })).toHaveCount(0);
});
