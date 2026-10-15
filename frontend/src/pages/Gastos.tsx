import { useEffect, useState } from 'react';

interface Gasto {
    id: number;
    monto: number;
    motivo: string;
    fecha: string;
    estado: string;
    tipo?: string;
    categoria?: string;
}

function Gastos() {

    const [monto, setMonto] = useState('');
    const [motivo, setMotivo] = useState('');
    const [tipo, setTipo] = useState('gasto');
    const [categoria, setCategoria] = useState('otros');
    const [gastos, setGastos] = useState<Gasto[]>([]);
    const [mensajeExito, setMensajeExito] = useState('');

    const [buscar, setBuscar] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroPeriodo, setFiltroPeriodo] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [totalFiltrado, setTotalFiltrado] = useState(0);

    const [gastoEditando, setGastoEditando] = useState<number | null>(null);

    const token = localStorage.getItem('token');

    const obtenerGastos = async () => {

        try {

            const params = new URLSearchParams();

            if (buscar.trim()) params.append('buscar', buscar.trim());
            if (filtroTipo) params.append('tipo', filtroTipo);
            if (filtroCategoria) params.append('categoria', filtroCategoria);
            if (filtroEstado) params.append('estado', filtroEstado);
            if (filtroPeriodo) params.append('periodo', filtroPeriodo);
            if (filtroPeriodo === 'rango' && fechaDesde) params.append('desde', fechaDesde);
            if (filtroPeriodo === 'rango' && fechaHasta) params.append('hasta', fechaHasta);

            const queryString = params.toString();
            const url = queryString
                ? `http://localhost:4000/api/gastos/filtrar?${queryString}`
                : 'http://localhost:4000/api/gastos/filtrar';

            const response = await fetch(
                url,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setGastos(data.movimientos || []);
                setTotalFiltrado(Number(data.total) || 0);
            } else {
                console.log(data.error);
            }

        } catch (error) {
            console.error('Error al obtener los gastos:', error);
        }
    };

    useEffect(() => {
        obtenerGastos();
    }, [buscar, filtroTipo, filtroCategoria, filtroEstado, filtroPeriodo, fechaDesde, fechaHasta]);

    const handleRegitrarGasto = async () => {

        if (!monto || !motivo) {
            console.log('Todos los campos son obligatorios');
            return;
        }

        try {

            const response = await fetch(
                'http://localhost:4000/api/gastos/registrar',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        monto,
                        motivo,
                        tipo,
                        categoria
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                setMensajeExito('Gasto registrado correctamente.');
                setTimeout(() => setMensajeExito(''), 3000);

                setMonto('');
                setMotivo('');
                setTipo('gasto');
                setCategoria('otros');

                obtenerGastos();

            } else {

                console.log(data.error);
                alert(data.error);

            }

        } catch (error) {
            console.error('Error al registrar el gasto:', error);
        }
    };


    const handleEliminarGasto = async (id: number) => {

        const confirmar = window.confirm(
            'Estas seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.'
        );

        if (!confirmar) {
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:4000/api/gastos/eliminar/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {

                alert('Gasto eliminado correctamente.');

                obtenerGastos();

            } else {

                alert(data.error);

            }

        } catch (error) {

            console.error('Error al eliminar el gasto:', error);

            alert('Ocurrió un error al intentar eliminar el gasto.');

        }

    };


    const handleEditarGasto = (gasto: Gasto) => {

        setGastoEditando(gasto.id);
        setMonto(String(gasto.monto));
        setMotivo(gasto.motivo);
        if (gasto.tipo) setTipo(gasto.tipo);
        if (gasto.categoria) setCategoria(gasto.categoria);

    };

    const handleActualizarGasto = async () => {

        if (!monto || !motivo || gastoEditando === null) {
            console.log('Todos los campos son obligatorios');
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:4000/api/gastos/editar/${gastoEditando}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        monto,
                        motivo,
                        tipo,
                        categoria
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                setMensajeExito('Gasto actualizado correctamente.');
                setTimeout(() => setMensajeExito(''), 3000);

                setMonto('');
                setMotivo('');
                setTipo('gasto');
                setCategoria('otros');
                setGastoEditando(null);

                obtenerGastos();

            } else {

                console.log(data.error);
                alert(data.error);

            }

        } catch (error) {
            console.error('Error al editar el gasto:', error);
        }
    };

    return (
        <div>

            <h1>Ingresar Gastos</h1>

            <input
                type="number"
                placeholder="Monto"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
            />

            <input
                type="text"
                placeholder="Motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
            />

            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="gasto">Gasto</option>
                <option value="ingreso">Ingreso</option>
            </select>

            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="otros">Otros</option>
                <option value="comida">Comida</option>
                <option value="transporte">Transporte</option>
                <option value="estudio">Estudio</option>
            </select>

            {gastoEditando === null ? (

                <button onClick={handleRegitrarGasto}>
                    Registrar Gasto
                </button>

            ) : (

                <button onClick={handleActualizarGasto}>
                    Guardar cambios
                </button>

            )}

            {mensajeExito && (
                <p role="status" style={{ color: 'green', fontWeight: 'bold', marginTop: '8px' }}>
                    {mensajeExito}
                </p>
            )}

            <hr />

            <section>
                <h2>Buscar y Filtrar Movimientos</h2>

                <div>
                    <input
                        type="text"
                        placeholder="Buscar por concepto o descripción..."
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                    />
                </div>

                <div>
                    <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                        <option value="">Todos los tipos</option>
                        <option value="gasto">Solo gastos</option>
                        <option value="ingreso">Solo ingresos</option>
                    </select>

                    <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                        <option value="">Todas las categorías</option>
                        <option value="comida">Comida</option>
                        <option value="transporte">Transporte</option>
                        <option value="estudio">Estudio</option>
                        <option value="otros">Otros</option>
                    </select>

                    <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                        <option value="">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="pagado">Pagado</option>
                    </select>

                    <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
                        <option value="">Todos los períodos</option>
                        <option value="este_mes">Este mes</option>
                        <option value="mes_anterior">Mes anterior</option>
                        <option value="rango">Rango de fechas</option>
                    </select>

                    {filtroPeriodo === 'rango' && (
                        <div>
                            <label>Desde: </label>
                            <input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                            />
                            <label>Hasta: </label>
                            <input
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {(buscar || filtroTipo || filtroCategoria || filtroEstado || filtroPeriodo) && (
                    <div style={{ marginTop: '10px' }}>
                        <p><strong>Filtros activos:</strong></p>
                        {buscar && (
                            <span>
                                Concepto: "{buscar}" <button onClick={() => setBuscar('')}>✕</button>{' '}
                            </span>
                        )}
                        {filtroTipo && (
                            <span>
                                Tipo: {filtroTipo} <button onClick={() => setFiltroTipo('')}>✕</button>{' '}
                            </span>
                        )}
                        {filtroCategoria && (
                            <span>
                                Categoría: {filtroCategoria} <button onClick={() => setFiltroCategoria('')}>✕</button>{' '}
                            </span>
                        )}
                        {filtroEstado && (
                            <span>
                                Estado: {filtroEstado} <button onClick={() => setFiltroEstado('')}>✕</button>{' '}
                            </span>
                        )}
                        {filtroPeriodo && (
                            <span>
                                Período: {filtroPeriodo === 'rango' ? `${fechaDesde || 'inicio'} a ${fechaHasta || 'hoy'}` : filtroPeriodo.replace('_', ' ')}{' '}
                                <button onClick={() => { setFiltroPeriodo(''); setFechaDesde(''); setFechaHasta(''); }}>✕</button>{' '}
                            </span>
                        )}
                        <div>
                            <button
                                onClick={() => {
                                    setBuscar('');
                                    setFiltroTipo('');
                                    setFiltroCategoria('');
                                    setFiltroEstado('');
                                    setFiltroPeriodo('');
                                    setFechaDesde('');
                                    setFechaHasta('');
                                }}
                            >
                                Limpiar todos los filtros
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <h2>Lista de movimientos</h2>
            <p><strong>Total filtrado: Bs {totalFiltrado.toFixed(2)}</strong></p>

            {gastos.length === 0 ? (
                <p>No se encontraron movimientos con los filtros seleccionados.</p>
            ) : (
                gastos.map((gasto) => (

                    <div key={gasto.id}>

                        <p>
                            Monto: {gasto.monto}
                        </p>

                        <p>
                            Motivo: {gasto.motivo}
                        </p>

                        <p>
                            Tipo: {gasto.tipo || 'gasto'}
                        </p>

                        <p>
                            Categoría: {gasto.categoria || 'otros'}
                        </p>

                        <p>
                            Fecha: {new Date(gasto.fecha).toLocaleString()}
                        </p>

                        <p>
                            Estado: {gasto.estado}
                        </p>

                        <button
                            onClick={() => {
                                if (gasto.estado.toLowerCase().trim() === 'gastado') {
                                    alert('No se puede editar este gasto porque ya está pagado.');
                                    return;
                                }

                                handleEditarGasto(gasto);
                            }}
                        >
                            Editar
                        </button>

                        <button onClick={() => handleEliminarGasto(gasto.id)}>
                            Eliminar
                        </button>

                        <hr />

                    </div>

                ))
            )}

        </div>
    );
}

export default Gastos;