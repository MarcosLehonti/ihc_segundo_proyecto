import { useState } from 'react';

function ForgotPassword() {

    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [recoveryStarted, setRecoveryStarted] = useState(false);

    const handleForgotPassword = async () => {

        try {

            const response = await fetch('http://localhost:4000/api/auth/forgot-password', {

                method: 'POST',

                headers: {

                    'Content-Type': 'application/json'

                },

                body: JSON.stringify({

                    email

                })

            });

            const data = await response.json();

            if (response.ok) {

                setResetToken(data.resetToken);

                setRecoveryStarted(true);

            } else {

                console.log(data.error);

            }

        } catch (error) {

            console.error('Error al conectar con el servidor:', error);

        }

    };

    const handleResetPassword = async () => {

        try {

            const response = await fetch('http://localhost:4000/api/auth/reset-password', {

                method: 'POST',

                headers: {

                    'Content-Type': 'application/json'

                },

                body: JSON.stringify({

                    resetToken,

                    newPassword

                })

            });

            const data = await response.json();

            if (response.ok) {

                console.log('Contraseña actualizada correctamente');

            } else {

                console.log(data.error);

            }

        } catch (error) {

            console.error('Error al conectar con el servidor:', error);

        }

    };

    return (

        <div>

            <h1>Recuperar contraseña</h1>

            {!recoveryStarted && (

                <div>

                    <input

                        type="email"

                        placeholder="Correo"

                        value={email}

                        onChange={(e) => setEmail(e.target.value)}

                    />

                    <button onClick={handleForgotPassword}>

                        Continuar

                    </button>

                </div>

            )}

            {recoveryStarted && (

                <div>

                    <input

                        type="password"

                        placeholder="Nueva contraseña"

                        value={newPassword}

                        onChange={(e) => setNewPassword(e.target.value)}

                    />

                    <button onClick={handleResetPassword}>

                        Cambiar contraseña

                    </button>

                </div>

            )}

        </div>

    );

}

export default ForgotPassword;
