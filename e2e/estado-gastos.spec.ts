import { test, expect, request } from '@playwright/test';

const API = 'http://localhost:4000/api';
const APP = 'http://localhost:5173';

test('filtros Pendientes y Pagados funcionan desde la barra de filtros rapidos', async ({ page }) => {
  const ts = Date.now();
  const email = `e2e+${ts}@test.com`;
  const password = 'e2e12345';

  const api = await request.newContext();

  const reg = await api.post(`${API}/auth/register`, {
    data: { name: 'E2E Estado', email, password }
  });
  expect(reg.ok()).toBeTruthy();
  const { token } = await reg.json();

  const ahora = new Date();
  const mes = ahora.getMonth() + 1;
  const anio = ahora.getFullYear();

  const presu = await api.post(`${API}/presupuesto/establecer`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { limite: 1000, mes, anio }
  });
  expect(presu.ok()).toBeTruthy();

  const g1 = await api.post(`${API}/gastos/registrar`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { monto: 20, motivo: 'Gasto pendiente E2E', tipo: 'gasto', categoria: 'comida' }
  });
  expect(g1.ok()).toBeTruthy();

  const g2 = await api.post(`${API}/gastos/registrar`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { monto: 30, motivo: 'Gasto pagado E2E', tipo: 'gasto', categoria: 'transporte' }
  });
  expect(g2.ok()).toBeTruthy();
  const gastoPagado = await g2.json();

  const pagar = await api.put(`${API}/gastos/pagar/${gastoPagado.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(pagar.ok()).toBeTruthy();

  await page.goto(APP);
  await page.evaluate((t) => localStorage.setItem('token', t), token);
  await page.goto(`${APP}/gastos`);

  await expect(page.getByText('Gasto pendiente E2E')).toBeVisible();
  await expect(page.getByText('Gasto pagado E2E')).toBeVisible();

  await page.getByRole('button', { name: 'Pendientes', exact: true }).click();
  await expect(page.getByText('Gasto pendiente E2E')).toBeVisible();
  await expect(page.getByText('Gasto pagado E2E')).toHaveCount(0);

  await page.getByRole('button', { name: 'Pagados', exact: true }).click();
  await expect(page.getByText('Gasto pagado E2E')).toBeVisible();
  await expect(page.getByText('Gasto pendiente E2E')).toHaveCount(0);

  await page.getByRole('button', { name: 'Todos los estados', exact: true }).click();
  await expect(page.getByText('Gasto pendiente E2E')).toBeVisible();
  await expect(page.getByText('Gasto pagado E2E')).toBeVisible();
});
