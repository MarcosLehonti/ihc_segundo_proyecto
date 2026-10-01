import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';

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

        </Route>

      </Routes>

    </BrowserRouter>

  );

}

export default App;