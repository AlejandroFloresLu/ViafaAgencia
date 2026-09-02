const UserModel = require('../models/UserModel');
const bcrypt = require('bcrypt');

exports.getUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    // No devolver las contraseñas
    const cleanUsers = users.map(u => {
      const { usu_contrasenia, ...resto } = u;
      return resto;
    });
    res.json(cleanUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { rol_id, nombre, correo, password } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserModel.createUser({
      rol_id,
      usu_nombre: nombre,
      usu_correo: correo,
      usu_contrasenia: hashedPassword,
      usu_estado: 'ACT'
    });

    delete newUser.usu_contrasenia;
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
