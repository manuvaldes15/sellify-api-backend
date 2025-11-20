// routes/negocio.routes.js
const express = require('express');
const router = express.Router();
const NegocioController = require('../controllers/negocio.controller'); // Asegúrate de exportar la nueva función 'uploadCardImage' aquí
const verificarToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

// --- ¡CAMBIO IMPORTANTE! ---
// Convertimos module.exports en una función que acepta el uploadParser
module.exports = (uploadParser) => {

  // Ruta para OBTENER detalles (Existente)
  router.get('/me',
    verificarToken,
    checkRole(['negocio']),
    NegocioController.getMyBusinessDetails
  );

  // Ruta para ACTUALIZAR config (JSON) (Existente)
  router.patch('/me/config',
    verificarToken,
    checkRole(['negocio']),
    NegocioController.updateMyConfig
  );

  // Ruta para DESCUBRIR negocios (Existente)
  router.get('/nearby',
    verificarToken,
    NegocioController.findNearbyBusinesses
  );

  // Ruta para VER mis promociones
  router.get('/me/promotions',
    verificarToken,
    checkRole(['negocio']),
    NegocioController.getMyPromotions
  );

  // Ruta para VER información de una promoción propia
  router.get('/me/promotions/:promotionId',
    verificarToken,
    checkRole(['negocio']),
    NegocioController.getPromotionInfo
  );
  
  // (Aquí puedes añadir la ruta GET /me/promotions si la tienes)

  // --- ¡NUEVA RUTA PARA SUBIR IMAGEN! ---
  // Esta ruta usa el uploadParser que recibimos
  router.post('/me/upload-image',
    verificarToken,
    checkRole(['negocio']),
    uploadParser.single('cardImage'), // <-- ¡Aquí se usa!
    NegocioController.uploadCardImage
  );

  // --- ¡NUEVA RUTA! ---
  // Ruta PÚBLICA (para clientes) para listar TODOS los negocios
  router.get('/',
    verificarToken, // Requiere login
    NegocioController.getAllBusinesses
  );

  // --- ¡NUEVA RUTA PARA VER CLIENTES DEL NEGOCIO! ---
  // Ruta para que el NEGOCIO vea sus clientes con sellos
  router.get('/me/clients',
    verificarToken,
    checkRole(['negocio']),
    NegocioController.getMyClients
  );

  // KPIs del negocio
  router.get('/me/stats',
    verificarToken,
    checkRole(['negocio']),
    NegocioController.getMyStats
  );

  // Devuelve el router configurado
  return router;
};