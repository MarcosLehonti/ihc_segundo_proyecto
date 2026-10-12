const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Presupuesto = sequelize.define('Presupuesto', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    mes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 12
        }
    },
    anio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 2000
        }
    },
    limite: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['userId', 'mes', 'anio']
        }
    ]
});

module.exports = Presupuesto;
