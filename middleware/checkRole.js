// checkRole.js

/**
 * Middleware que genera un verificador de roles.
 * @param {Array<string>} rolesPermitidos - Array de roles permitidos (ej. ['negocio', 'admin'])
 */
const checkRole = (rolesPermitidos) => {
  return (req, res, next) => {
    // Primero, nos aseguramos de que el middleware 'verificarToken' ya se ejecutó
    if (!req.usuario) {
      return res.status(500).json({ error: 'Error de autenticación interna' });
    }

    const { rol } = req.usuario;

    if (rolesPermitidos.includes(rol)) {
      // ¡Permiso concedido! El rol está en la lista.
      next();
    } else {
      // ¡Permiso denegado!
      res.status(403).json({ error: 'Acceso prohibido. Rol no autorizado.' });
    }
  };
};

module.exports = checkRole;