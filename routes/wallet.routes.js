// routes/wallet.routes.js
const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/wallet.controller');
const verificarToken = require('../middleware/authMiddleware'); // Importa el guardia

// Definimos la ruta GET para /me
// ¡Observa cómo 'verificarToken' va en medio!
// 1. Petición llega a GET /api/wallet/me
// 2. Se ejecuta 'verificarToken' (el guardia)
// 3. Si el token es válido, se ejecuta 'WalletController.getMiBilletera'
router.get('/me', verificarToken, WalletController.getMiBilletera);

router.patch('/cards/:id', verificarToken, WalletController.toggleFavorite);

module.exports = router;