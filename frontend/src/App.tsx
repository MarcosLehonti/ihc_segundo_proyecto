import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Gastos from './pages/Gastos';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import Pagos from './pages/Pagos';

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<ProtectedRoute />}>

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/pagos" element={<Pagos />} />

        </Route>

      </Routes>

    </BrowserRouter>

  );

}

export default App;