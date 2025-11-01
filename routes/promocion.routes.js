// routes/promocion.routes.js
const express = require('express');
const router = express.Router();
const PromocionController = require('../controllers/promocion.controller');
const verificarToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

// Definimos la ruta POST para /
// Solo un 'negocio' logueado puede crear una promoción
router.post('/',
  verificarToken,
  checkRole(['negocio']),
  PromocionController.create
);

router.get('/', PromocionController.getActive);// --- ¡NUEVA RUTA! ---
// Ruta para que el CLIENTE vea las promociones activas
// (Cualquier usuario logueado puede verlas)
router.get('/',
  verificarToken,
  PromocionController.getActive
);

module.exports = router