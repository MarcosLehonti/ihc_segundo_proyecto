import { test, request } from '@playwright/test';

const API = 'http://localhost:4000/api';
const APP = 'http://localhost:5173';

test('capturas antes y despues para evidencia de clase 20', async ({ page }) => {
  const ts = Date.now();
  const email = `evid+${ts}@test.com`;
  const password = 'e2e12345';

  const api = await request.newContext();

  const reg = await api.post(`${API}/auth/register`, {
    data: { name: 'Evidencia Clase 20', email, password }
  });
  const { token } = await reg.json();

  const ahora = new Date();
  const mes = ahora.getMonth() + 1;
  const anio = ahora.getFullYear();

  await api.post(`${API}/presupuesto/establecer`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { limite: 1000, mes, anio }
  });

  await api.post(`${API}/gastos/registrar`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { monto: 20, motivo: 'Almuerzo pendiente', tipo: 'gasto', categoria: 'comida' }
  });

  const g2 = await api.post(`${API}/gastos/registrar`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { monto: 30, motivo: 'Pasaje pagado', tipo: 'gasto', categoria: 'transporte' }
  });
  const g2Json = await g2.json();

  await api.put(`${API}/gastos/pagar/${g2Json.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  await page.goto(APP);
  await page.evaluate((t) => localStorage.setItem('token', t), token);
  await page.goto(`${APP}/gastos`);

  // DESPUES: tabs de estado visibles en los filtros rapidos
  await page.locator('h2:has-text("Buscar y Filtrar Movimientos")').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'evidencias/clase-20/despues-filtros-rapidos.png', fullPage: true });

  // ANTES: estado escondido dentro de "Mas filtros"
  // Oculto los botones nuevos con CSS y abro Mas filtros para reproducir el estado anterior
  await page.addStyleTag({
    content: `
      button:has-text("Todos los estados"),
      button:has-text("Pendientes"),
      button:has-text("Pagados"),
      span:has-text("| Estado:") { display: none !important; }
    `
  });
  await page.getByRole('button', { name: /Más filtros|Mas filtros/ }).click();
  await page.screenshot({ path: 'evidencias/clase-20/antes-estado-escondido.png', fullPage: true });
});
