// controllers/usuario.controller.js
const Usuario = require('../models/usuario.model');

const UsuarioController = {

  /**
   * Permite a un usuario (cliente) solicitar una cuenta de negocio.
   */
  requestBusinessAccount: async (req, res) => {
    try {
      // 1. El ID del cliente viene del token
      const idCliente = req.usuario.id;

      // 2. Llamar al modelo
      const usuarioActualizado = await Usuario.requestBusinessRole(idCliente);

      res.json({
        mensaje: 'Solicitud de cuenta de negocio enviada exitosamente.',
        usuario: usuarioActualizado
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  },

  updateMyProfile: async (req, res) => {
    try {
      // 1. El ID del usuario viene del token
      const idUsuario = req.usuario.id;
      
      // 2. El nuevo nombre viene del body
      const { nombre } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El campo "nombre" es requerido.' });
      }

      // 3. Llamar al modelo
      const usuarioActualizado = await Usuario.updateProfile(idUsuario, nombre);

      res.json({
        mensaje: 'Perfil actualizado exitosamente.',
        usuario: usuarioActualizado
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  }

};

module.exports = UsuarioController;