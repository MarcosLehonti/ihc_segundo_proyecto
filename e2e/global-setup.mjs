const apiUrl = 'http://127.0.0.1:4000';

async function esperarBackend() {
  for (let intento = 0; intento < 30; intento += 1) {
    try {
      const response = await fetch(apiUrl);
      if (response.ok) return;
    } catch {
      // Playwright puede ejecutar este setup mientras el backend termina de iniciar.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('El backend no respondió en http://127.0.0.1:4000');
}

async function autenticar(email, password, name) {
  const registro = await fetch(`${apiUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (registro.ok) return (await registro.json()).token;

  const login = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!login.ok) {
    throw new Error(`No se pudo preparar la cuenta E2E ${email}: ${await login.text()}`);
  }
  return (await login.json()).token;
}

async function asegurarPresupuesto(token) {
  const ahora = new Date();
  const mes = ahora.getMonth() + 1;
  const anio = ahora.getFullYear();
  const headers = { Authorization: `Bearer ${token}` };
  const consulta = await fetch(`${apiUrl}/api/presupuesto/obtener?mes=${mes}&anio=${anio}`, { headers });

  let limite = 10_000;
  if (consulta.ok) {
    const resumen = await consulta.json();
    if (Number(resumen.disponible) >= 100) return;
    limite = Number(resumen.gastado) + 1_000;
  } else if (consulta.status !== 404) {
    throw new Error(`No se pudo preparar el presupuesto E2E: ${await consulta.text()}`);
  }

  const guardado = await fetch(`${apiUrl}/api/presupuesto/establecer`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ limite, mes, anio })
  });
  if (!guardado.ok) {
    throw new Error(`No se pudo crear el presupuesto de prueba: ${await guardado.text()}`);
  }
}

export default async function globalSetup() {
  await esperarBackend();

  const cuentas = [
    {
      email: process.env.E2E_EMAIL ?? 'e2e@test.com',
      password: process.env.E2E_PASSWORD ?? 'e2e12345',
      name: 'Usuario E2E'
    },
    {
      email: process.env.E2E_ALT_EMAIL ?? 'e2e-alternate@test.com',
      password: process.env.E2E_ALT_PASSWORD ?? 'e2e-alternate123',
      name: 'Usuario E2E alternativo'
    }
  ];

  for (const cuenta of cuentas) {
    const token = await autenticar(cuenta.email, cuenta.password, cuenta.name);
    await asegurarPresupuesto(token);
  }
}
