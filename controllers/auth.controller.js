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
  },

  // --- ¡AÑADE ESTA NUEVA FUNCIÓN! ---
  /**
   * Permite a un usuario autenticado cambiar su contraseña.
   */
  changePassword: async (req, res) => {
    try {
      // 1. El ID del usuario viene del token verificado
      const idUsuario = req.usuario.id;

      // 2. Obtener contraseñas del body
      const { contrasenaActual, nuevaContrasena } = req.body;

      if (!contrasenaActual || !nuevaContrasena) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
      }

      // 3. Buscar al usuario en la BD (necesitamos su hash actual)
      const usuario = await Usuario.findById(idUsuario);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      // 4. Comparar la contraseña "actual" con el hash de la BD
      const contrasenaValida = bcrypt.compareSync(contrasenaActual, usuario.hash_contrasena);

      if (!contrasenaValida) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta.' }); // 401 Unauthorized
      }

      // 5. Si es válida, hashear la *nueva* contraseña
      const salt = bcrypt.genSaltSync(10);
      const nuevoHash = bcrypt.hashSync(nuevaContrasena, salt);

      // 6. Guardar el nuevo hash en la BD
      await Usuario.updatePassword(idUsuario, nuevoHash);

      res.json({ mensaje: 'Contraseña actualizada exitosamente.' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  }
};

module.exports = AuthController;