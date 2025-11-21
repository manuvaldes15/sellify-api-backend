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
   * Genera un código de acceso de 5 caracteres mezclando letras y números.
   */
  generateAccessCode: () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  /**
   * Guarda el código de acceso para un usuario.
   * El id se obtiene del token (req.user.id).
   */
  saveAccessCode: async (req, res) => {
    try {
      const { id } = req.params;
      const code = AdminController.generateAccessCode();

      const query = `
        UPDATE usuarios 
        SET codigo_acceso = $1, actualizado_en = NOW() 
        WHERE id = $2 
        RETURNING id, nombre, correo, rol, codigo_acceso
      `;
      const result = await db.query(query, [code, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      // Devuelve la fila como JSON
      return res.json({ success: true, usuario: result.rows[0] });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Actualiza códigos de acceso para todos los usuarios.
   */
  updateAllAccessCodes: async (req, res) => {
    try {
      const usuarios = await Usuario.findAll();

      for (const usuario of usuarios) {
        const newCode = AdminController.generateAccessCode();
        await db.query(
          'UPDATE usuarios SET codigo_acceso = $1, actualizado_en = NOW() WHERE id = $2',
          [newCode, usuario.id]
        );
      }

      return res.json({ success: true, message: 'Códigos de acceso actualizados correctamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

};

module.exports = AdminController;
