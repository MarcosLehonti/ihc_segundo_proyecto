const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Meta de ahorro: el dinero "ahorrado" queda reservado y se descuenta del saldo disponible.
const Meta = sequelize.define('Meta', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    nombre: { type: DataTypes.STRING, allowNull: false },
    montoObjetivo: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    fechaObjetivo: { type: DataTypes.DATEONLY, allowNull: false },
    ahorrado: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }
});

module.exports = Meta;
