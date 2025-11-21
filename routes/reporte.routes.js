const express = require('express');
const router = express.Router();
const ReporteController = require('../controllers/reporte.controller');
const verificarToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

const esAdmin = checkRole(['admin']);

// Ruta para obtener reporte de usuarios (solo admin)
router.get('/usuarios', ReporteController.getUsuarios);

// Ruta para obtener reporte de negocios (solo admin)
router.get('/negocios', ReporteController.getNegocios);

module.exports = router;
