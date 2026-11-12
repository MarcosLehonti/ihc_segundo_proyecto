import { test, expect, request, type APIRequestContext, type Page } from '@playwright/test';

// Tarea 9 - Parte B: aviso antes de superar el limite por categoria.
// Cada test crea su propio usuario para no mezclar datos entre corridas.

const API = 'http://127.0.0.1:4000/api';

async function crearUsuarioConPresupuesto(request: APIRequestContext, sufijo: string, limiteCategoria: number) {
    const email = `aviso-${sufijo}-${Date.now()}@test.com`;
    const password = 'aviso12345';

    const registro = await request.post(`${API}/auth/register`, {
        data: { name: `Aviso ${sufijo}`, email, password }
    });
    expect(registro.ok(), await registro.text()).toBeTruthy();
    const { token } = await registro.json();
    const headers = { Authorization: `Bearer ${token}` };

    const ahora = new Date();
    const mes = ahora.getMonth() + 1;
    const anio = ahora.getFullYear();

    // Presupuesto mensual alto para no colisionar con el chequeo general del backend.
    const presupuesto = await request.post(`${API}/presupuesto/establecer`, {
        headers,
        data: { limite: 10000, mes, anio }
    });
    expect(presupuesto.ok(), await presupuesto.text()).toBeTruthy();

    // Limite por categoria 'comida' = X Bs.
    const categoria = await request.post(`${API}/presupuesto-categoria/establecer`, {
        headers,
        data: { categoria: 'comida', limite: limiteCategoria, mes, anio }
    });
    expect(categoria.ok(), await categoria.text()).toBeTruthy();

    return { email, password, token, headers };
}

async function iniciarSesionEnGastos(page: Page, token: string) {
    await page.goto('http://localhost:5173');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.goto('http://localhost:5173/gastos');
}

async function rellenarGasto(page: Page, monto: number, motivo: string, categoria: string) {
    await page.getByPlaceholder('Monto').fill(String(monto));
    await page.getByPlaceholder('Motivo').fill(motivo);
    await page.getByRole('combobox').nth(0).selectOption('gasto');
    await page.getByRole('combobox').nth(1).selectOption(categoria);
}

test('caso 1 - sin aviso: gasto dentro del limite se guarda normal', async ({ page }) => {
    const api = await request.newContext();
    const usuario = await crearUsuarioConPresupuesto(api, 'sin-aviso', 100);

    await iniciarSesionEnGastos(page, usuario.token);

    // Gasto de Bs 30, muy por debajo del limite de Bs 100 -> sin aviso.
    let dialogoAparecio = false;
    page.on('dialog', async (d) => { dialogoAparecio = true; await d.accept(); });

    await rellenarGasto(page, 30, 'Gasto dentro del limite', 'comida');
    await page.getByRole('button', { name: 'Registrar Gasto' }).click();

    await expect(page.getByText('Gasto registrado correctamente.')).toBeVisible();
    expect(dialogoAparecio).toBe(false);
    await expect(page.getByText('Motivo: Gasto dentro del limite')).toBeVisible();
});

test('caso 2 - aviso cancelado: el gasto NO se guarda y nada cambia', async ({ page }) => {
    const api = await request.newContext();
    const usuario = await crearUsuarioConPresupuesto(api, 'cancelado', 100);

    await iniciarSesionEnGastos(page, usuario.token);

    // Gasto de Bs 150, supera el limite de Bs 100. Cancelo.
    page.once('dialog', async (d) => {
        expect(d.message()).toContain('Te pasarías');
        expect(d.message()).toContain('comida');
        await d.dismiss();
    });

    await rellenarGasto(page, 150, 'Gasto que excede', 'comida');
    await page.getByRole('button', { name: 'Registrar Gasto' }).click();

    // Nada debe cambiar: el gasto no esta en la lista y no hay mensaje de exito.
    await expect(page.getByText('Gasto registrado correctamente.')).toHaveCount(0);
    await expect(page.getByText('Motivo: Gasto que excede')).toHaveCount(0);

    // Verificacion en backend: no se guardo.
    const ajeno = await request.newContext();
    const r = await ajeno.get(`${API}/gastos/obtener`, { headers: usuario.headers });
    const gastos = await r.json();
    expect(gastos).toHaveLength(0);
});

test('caso 3 - aviso confirmado: el gasto se guarda y la categoria queda excedida', async ({ page }) => {
    const api = await request.newContext();
    const usuario = await crearUsuarioConPresupuesto(api, 'confirmado', 100);

    await iniciarSesionEnGastos(page, usuario.token);

    // Gasto de Bs 150, supera el limite de Bs 100. Confirmo.
    page.once('dialog', async (d) => {
        expect(d.message()).toContain('Te pasarías');
        await d.accept();
    });

    await rellenarGasto(page, 150, 'Gasto confirmado excedido', 'comida');
    await page.getByRole('button', { name: 'Registrar Gasto' }).click();

    await expect(page.getByText('Gasto registrado correctamente.')).toBeVisible();
    await expect(page.getByText('Motivo: Gasto confirmado excedido')).toBeVisible();

    // Verificacion en backend: la categoria quedo excedida.
    const ajeno = await request.newContext();
    const ahora = new Date();
    const r = await ajeno.get(
        `${API}/presupuesto-categoria/obtener?mes=${ahora.getMonth() + 1}&anio=${ahora.getFullYear()}`,
        { headers: usuario.headers }
    );
    const data = await r.json();
    const comida = data.categorias.find((c: { categoria: string }) => c.categoria === 'comida');
    expect(comida.estado).toBe('excedido');
    expect(Number(comida.consumido)).toBe(150);
});
