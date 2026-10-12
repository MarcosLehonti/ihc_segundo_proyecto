const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const gastosRoutes = require('./routes/gastosRoutes');
const presupuestoRoutes = require('./routes/presupuestoRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/presupuesto', presupuestoRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la API de TruequeU' })
});

module.exports = app;