const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GastoRecurrente = sequelize.define('GastoRecurrente', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0.01 }
    },
    motivo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'otros'
    },
    frecuencia: {
        type: DataTypes.ENUM('semanal', 'mensual'),
        allowNull: false
    },
    proximaFecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    activa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    ultimoError: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
});

module.exports = GastoRecurrente;
