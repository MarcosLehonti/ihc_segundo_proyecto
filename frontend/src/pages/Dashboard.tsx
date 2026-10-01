import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

interface User {

    id: number;

    name: string;

    email: string;

    role: string;

}

function Dashboard() {

    const [user, setUser] = useState<User | null>(null);

    const navigate = useNavigate();

    useEffect(() => {

        const getUser = async () => {

            const token = localStorage.getItem('token');

            if (!token) {

                navigate('/login');

                return;

            }

            try {

                const response = await fetch('http://localhost:4000/api/auth/me', {

                    method: 'GET',

                    headers: {

                        'Authorization': `Bearer ${token}`

                    }

                });

                const data = await response.json();

                if (response.ok) {

                    setUser(data);

                } else {

                    console.log(data.error);

                    localStorage.removeItem('token');

                    navigate('/login');

                }

            } catch (error) {

                console.error('Error al obtener el usuario:', error);

            }

        };

        getUser();

    }, [navigate]);

    const handleLogout = () => {

        localStorage.removeItem('token');

        navigate('/login');

    };

    return (

        <div>

            <h1>Dashboard</h1>

            {user && (

                <div>

                    <p>Bienvenido, {user.name}</p>

                    <p>Correo: {user.email}</p>

                    <p>Rol: {user.role}</p>

                </div>

            )}

            <button onClick={handleLogout}>

                Cerrar sesión

            </button>

        </div>

    );

}

export default Dashboard;
