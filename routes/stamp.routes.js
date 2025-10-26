// routes/stamp.routes.js
const express = require('express');
const router = express.Router();
const StampController = require('../controllers/stamp.controller');
const verificarToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole'); // Importa el nuevo guardia

// Definimos la ruta POST para /grant
// ¡Cadena de middlewares!
// 1. Petición llega a POST /api/stamps/grant
// 2. Se ejecuta 'verificarToken' (para ver si está logueado)
// 3. Se ejecuta 'checkRole(['negocio'])' (para ver si es un negocio)
// 4. Si ambos pasan, se ejecuta 'StampController.grant'
router.post('/grant', 
  verificarToken, 
  checkRole(['negocio']), 
  StampController.grant
);

// --- ¡NUEVA RUTA! ---
// Ruta para Canjear Premio
router.post('/redeem',
  verificarToken,
  checkRole(['negocio']), // Solo un negocio puede canjear
  StampController.redeem
);

module.exports = router;