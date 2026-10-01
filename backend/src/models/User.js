const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const User = sequelize.define('User', {

    id: {

        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true

    },

    name: {

        type: DataTypes.STRING(50),
        allowNull: false

    },

    email: {

        type: DataTypes.STRING,
        allowNull: false,
        unique: true

    },

    password: {

        type: DataTypes.STRING(255),
        allowNull: false

    },

    role: {

        type: DataTypes.STRING(20),
        defaultValue: 'user',
        validate: {

            isIn: [['user', 'admin']]

        }

    },

    resetToken: {

        type: DataTypes.STRING,
        allowNull: true

    },

    resetTokenExpires: {

        type: DataTypes.DATE,
        allowNull: true

    }

});

module.exports = User;