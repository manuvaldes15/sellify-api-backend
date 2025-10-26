// controllers/auth.controller.js
const Usuario = require('../models/usuario.model');
const bcrypt = require('bcryptjs'); // <--- Asegúrate de que esté importado
const jwt = require('jsonwebtoken');
require('dotenv').config();

const AuthController = {
  
  // ======================================================
  // ¡FUNCIÓN DE LOGIN ACTUALIZADA!
  // ======================================================
  login: async (req, res) => {
    try {
      const { correo, contrasena } = req.body;
      const usuario = await Usuario.findByEmail(correo);

      if (!usuario) {
        return res.status(404).json({ error: 'Credenciales incorrectas.' });
      }

      // 4. ¡CAMBIO IMPORTANTE!
      // Comparamos la contraseña de texto plano con el hash de la BD
      const contrasenaValida = bcrypt.compareSync(contrasena, usuario.hash_contrasena);

      if (!contrasenaValida) {
        // Usamos un mensaje genérico por seguridad
        return res.status(401).json({ error: 'Credenciales incorrectas.' });
      }
      
      // 5. Crear Token (sin cambios)
      const token = jwt.sign(
        { id: usuario.id, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // 6. Enviar respuesta (sin cambios)
      res.json({
        mensaje: 'Login exitoso',
        token: token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol
        }
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // ======================================================
  // ¡NUEVA FUNCIÓN DE REGISTRO!
  // ======================================================
  register: async (req, res) => {
    try {
      const { nombre, correo, contrasena } = req.body;

      // Validar entrada
      if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos.' });
      }

      // 1. Crear el usuario usando el modelo
      const nuevoUsuario = await Usuario.create(nombre, correo, contrasena);

      // 2. Crear un Token (igual que en el login)
      // El usuario se loguea automáticamente al registrarse
      const token = jwt.sign(
        { id: nuevoUsuario.id, rol: nuevoUsuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // 3. Enviar la respuesta
      res.status(201).json({
        mensaje: 'Usuario registrado exitosamente',
        token: token,
        usuario: nuevoUsuario
      });

    } catch (err) {
      console.error(err);
      // Manejar el error de correo duplicado que lanzamos desde el modelo
      if (err.message === 'El correo electrónico ya está registrado.') {
        return res.status(409).json({ error: err.message }); // 409 Conflict
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = AuthController;