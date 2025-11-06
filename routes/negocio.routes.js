// routes/negocio.routes.js
const express = require('express');
const router = express.Router();
// Asegúrate de importar ambas funciones del controlador
const { updateMyConfig, findNearbyBusinesses } = require('../controllers/negocio.controller');
const verificarToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

// Ruta para que un negocio OBTENGA sus propios detalles
router.get('/me',
  verificarToken,
  checkRole(['negocio']),
  getMyBusinessDetails // <--- Asegúrate que tu controlador también exporte esta
);

// Ruta para que un negocio ACTUALICE su config
router.patch('/me/config',
  verificarToken,
  checkRole(['negocio']),
  updateMyConfig
);

// Ruta para que un cliente DESCUBRA negocios cercanos
router.get('/nearby',
  verificarToken, // Solo requiere estar logueado
  findNearbyBusinesses
);

module.exports = router;