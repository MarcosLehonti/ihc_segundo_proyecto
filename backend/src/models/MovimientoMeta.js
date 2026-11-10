const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Historial de movimientos entre el saldo disponible y las metas (nunca se borra).
// tipo: 'asignacion' (disponible -> meta), 'retiro' (meta -> disponible),
// 'transferencia' (meta -> meta), 'rechazado' (intento sin fondos).
const MovimientoMeta = sequelize.define('MovimientoMeta', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    tipo: { type: DataTypes.STRING, allowNull: false },
    monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    metaOrigenId: { type: DataTypes.INTEGER, allowNull: true },
    metaDestinoId: { type: DataTypes.INTEGER, allowNull: true },
    detalle: { type: DataTypes.STRING, allowNull: true }
});

module.exports = MovimientoMeta;
