import { useState } from "react";

function Gastos() {

    const [monto, setMonto] = useState('');
    const [motivo, setMotivo] = useState('');

    const handleRegitrarGasto = () => {
        const fecha = new Date()
        console.log('Monto', monto);
        console.log('Motivo', motivo);
        console.log('Fecha', fecha);


    }


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

            <button onClick={handleRegitrarGasto}>Registrar Gasto</button>

        </div>
    );

}

export default Gastos;
