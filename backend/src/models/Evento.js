const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Clase 21 - Analitica de interaccion.
// Un evento por cada paso del flujo principal (inicio y exito).
// Nunca se guarda informacion personal: solo metadatos del flujo.
const Evento = sequelize.define('Evento', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    evento: {
        type: DataTypes.STRING,
        allowNull: false
    },
    props: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Evento;
