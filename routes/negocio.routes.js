// routes/negocio.routes.js
const express = require('express');
const router = express.Router();
const NegocioController = require('../controllers/negocio.controller');
const verificarToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

// Definimos la ruta PATCH para /me/config
// Solo un 'negocio' logueado puede editar su propia config
router.patch('/me/config',
  verificarToken,
  checkRole(['negocio']),
  NegocioController.updateMyConfig
);

module.exports = router;