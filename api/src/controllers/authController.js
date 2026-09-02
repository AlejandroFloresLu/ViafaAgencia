const UserModel = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await UserModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (user.usu_estado !== 'ACT') {
      return res.status(403).json({ error: 'Usuario desactivado' });
    }

    const isMatch = await bcrypt.compare(password, user.usu_contrasenia);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const payload = {
      id: user.usu_id,
      rol_nivel: user.roles.rol_nivel,
      rol_nombre: user.roles.rol_nombre
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_key', { expiresIn: '8h' });

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.usu_id,
        nombre: user.usu_nombre,
        email: user.usu_correo,
        rol: user.roles.rol_nombre
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
