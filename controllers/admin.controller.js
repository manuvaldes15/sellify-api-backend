// controllers/admin.controller.js
const Usuario = require('../models/usuario.model');

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
  }

};

module.exports = AdminController;