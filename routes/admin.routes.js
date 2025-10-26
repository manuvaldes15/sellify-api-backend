// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const verificarToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

// Ambas rutas requieren ser Admin
const esAdmin = checkRole(['admin']);

// Ruta para VER todas las solicitudes pendientes
router.get('/requests',
  verificarToken,
  esAdmin,
  AdminController.getPendingRequests
);

// Ruta para APROBAR una solicitud específica
// :id es el ID del usuario que será aprobado
router.patch('/approve/:id',
  verificarToken,
  esAdmin,
  AdminController.approveRequest
);

module.exports = router;