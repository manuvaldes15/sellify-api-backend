// controllers/admin.controller.js
const Usuario = require('../models/usuario.model');
const Negocio = require('../models/negocio.model');

const AdminController = {

  /**
   * Obtiene todas las solicitudes pendientes de negocio.
   */
  getPendingRequests: async (req, res) => {
    try {
      const solicitudes = await Usuario.findPendingRequests();
      res.json(solicitudes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  /**
   * Aprueba una solicitud de negocio.
   */
  approveRequest: async (req, res) => {
    try {
      // El ID del usuario a aprobar viene de la URL (ej. /api/admin/approve/5)
      const { id } = req.params;

      const usuarioAprobado = await Usuario.approveBusinessRequest(id);

      res.json({
        mensaje: 'Usuario aprobado como negocio exitosamente.',
        usuario: usuarioAprobado
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  },

  /**
   * Obtiene todos los usuarios.
   */
  getAllUsers: async (req, res) => {
    try {
      const usuarios = await Usuario.findAll();
      res.json(usuarios);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  /**
   * Cambia el rol de un usuario a "admin".
   */
  changeRoleToAdmin: async (req, res) => {
    try {
      const { id, rol } = req.params;
      const usuarioActualizado = await Usuario.updateRole(id, rol);
      res.json({
        mensaje: 'Rol del usuario cambiado exitosamente.',
        usuario: usuarioActualizado
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  },


  /**
   * Guarda el código de acceso para un usuario.
   * El id se obtiene del token (req.user.id).
   */
  saveAccessCode: async (req, res) => {
    try {
      const { id } = req.params;

      const negocio = await Negocio.saveAccessCode(id);

      // Devuelve el negocio actualizado como JSON
      return res.json({ success: true, negocio });
    } catch (error) {
      console.error(error);
      if (error.message === 'Negocio no encontrado.') {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Actualiza códigos de acceso para todos los negocios.
   */
  updateAllAccessCodes: async (req, res) => {
    try {
      const result = await Negocio.updateAllAccessCodes();
      res.json({
        mensaje: 'Códigos de acceso actualizados exitosamente.',
        result: result
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  }

};

module.exports = AdminController;
