// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// Definimos la ruta POST para /login
router.post('/login', AuthController.login);

// ¡NUEVA RUTA!
// Ruta para Registro
router.post('/register', AuthController.register);

// Podríamos añadir más rutas de auth aquí, como /forgot-password
// router.post('/forgot-password', AuthController.forgotPassword);

module.exports = router;