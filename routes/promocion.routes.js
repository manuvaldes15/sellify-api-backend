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

// Próximamente: una ruta GET pública para que los clientes vean las promos
// router.get('/', PromocionController.getActive);

module.exports = router;