import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {

    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleLogin = async () => {

        try {

            const response = await fetch('http://localhost:4000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem('token', data.token);

                console.log('Token guardado correctamente');

                navigate('/dashboard');

            } else {

                console.log(data.error);

            }

        } catch (error) {

            console.error('Error al conectar con el servidor:', error);

        }

    };

    return (
        <div>

            <h1>Iniciar sesión</h1>

            <input
                type="email"
                placeholder="Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>
                Iniciar sesión
            </button>

        </div>
    );

}

export default Login;