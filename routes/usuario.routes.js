// routes/usuario.routes.js
const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuario.controller');
const verificarToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

// Definimos la ruta PATCH para /me/request-business
// Solo un 'cliente' logueado puede hacer esta solicitud
router.patch('/me/request-business',
  verificarToken,
  checkRole(['cliente']), // Solo los clientes pueden solicitar
  UsuarioController.requestBusinessAccount
);

// --- ¡NUEVA RUTA! ---
// Ruta para que un usuario actualice su perfil (nombre)
router.patch('/me',
  verificarToken, // Solo requiere estar logueado
  UsuarioController.updateMyProfile
);

module.exports = router;