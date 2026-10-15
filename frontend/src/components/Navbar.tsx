import { NavLink, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const linkStyle = ({ isActive }: { isActive: boolean }) => ({
        padding: '8px 14px',
        textDecoration: 'none',
        borderRadius: '6px',
        fontWeight: (isActive ? 'bold' : '500') as 'bold' | '500',
        backgroundColor: isActive ? '#0066cc' : 'rgba(0, 0, 0, 0.05)',
        color: isActive ? '#ffffff' : 'inherit',
        border: isActive ? '1px solid #005bb5' : '1px solid #ccc',
        transition: 'all 0.2s ease',
        display: 'inline-block'
    });

    return (
        <header
            style={{
                width: '100%',
                padding: '12px 20px',
                borderBottom: '1px solid #e0e0e0',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                boxSizing: 'border-box'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '1.15rem' }}>FinanzApp</strong>
            </div>

            <nav style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <NavLink to="/dashboard" style={linkStyle}>
                    Dashboard
                </NavLink>
                <NavLink to="/gastos" style={linkStyle}>
                    Gastos
                </NavLink>
                <NavLink to="/pagos" style={linkStyle}>
                    Pagos
                </NavLink>
            </nav>

            <div>
                <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                        padding: '6px 14px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    Cerrar sesión
                </button>
            </div>
        </header>
    );
}

export default Navbar;
