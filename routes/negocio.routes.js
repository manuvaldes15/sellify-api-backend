// routes/negocio.routes.js
const express = require('express');
const router = express.Router();
const NegocioController = require('../controllers/negocio.controller');
const verificarToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

// --- ¡NUEVA RUTA! ---
// Ruta para que un negocio OBTENGA sus propios detalles
// (Esta es la que soluciona tu error -1011)
router.get('/me',
  verificarToken,
  checkRole(['negocio']),
  NegocioController.getMyBusinessDetails
);

// Definimos la ruta PATCH para /me/config
// Solo un 'negocio' logueado puede editar su propia config
router.patch('/me/config',
  verificarToken,
  checkRole(['negocio']),
  NegocioController.updateMyConfig
);

// --- ¡NUEVA RUTA! ---
// Ruta para que un cliente descubra negocios cercanos
router.get('/nearby',
  verificarToken, // Solo requiere estar logueado
  NegocioController.findNearbyBusinesses
);

module.exports = router;