const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');

//Registro de usuarios

async function register(req, res) {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashPassword,
            role
        });

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error al registrar el usuario' });
    }
}

//Login de usuarios

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error al iniciar sesión' });
    }
}

async function forgotPassword(req, res) {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'El correo es obligatorio'
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

        user.resetToken = resetToken;
        user.resetTokenExpires = resetTokenExpires;

        await user.save();

        res.json({
            message: 'Token de recuperación generado',
            resetToken
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: 'Error al recuperar la contraseña'
        });
    }
}

async function resetPassword(req, res) {

    try {

        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({
                error: 'El token y la nueva contraseña son obligatorios'
            });
        }

        const user = await User.findOne({
            where: { resetToken }
        });

        if (!user) {
            return res.status(400).json({
                error: 'Token de recuperación inválido'
            });
        }

        if (new Date() > user.resetTokenExpires) {
            return res.status(400).json({
                error: 'El token de recuperación ha expirado'
            });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;

        await user.save();

        return res.json({
            message: 'Contraseña actualizada correctamente'
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: 'Error al cambiar la contraseña'
        });
    }
}

async function getMe(req, res) {

    try {

        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'role']
        });
        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json(user);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: 'Error al obtener el usuario'
        });
    }
}

module.exports = { register, login, forgotPassword, resetPassword, getMe };