// routes/promocion.routes.js
const express = require('express');
const router = express.Router();
const PromocionController = require('../controllers/promocion.controller');
const verificarToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

// Ruta para que el NEGOCIO cree promociones
router.post('/',
  verificarToken,
  checkRole(['negocio']),
  PromocionController.create
);

// --- ¡CORRECCIÓN! ---
// Solo debe haber UNA definición para GET /
// Esta es la correcta, ya que requiere un token
router.get('/',
  verificarToken,
  PromocionController.getActive
);

module.exports = router;