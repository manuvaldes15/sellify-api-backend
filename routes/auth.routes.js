// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const verificarToken = require('../middleware/authMiddleware');

// Definimos la ruta POST para /login
router.post('/login', AuthController.login);

// ¡NUEVA RUTA!
// Ruta para Registro
router.post('/register', AuthController.register);

// --- ¡NUEVA RUTA! ---
// Ruta para Cambiar Contraseña (requiere estar logueado)
router.post('/change-password',
  verificarToken,
  AuthController.changePassword
);

module.exports = router;