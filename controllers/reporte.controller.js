const Reporte = require('../models/reporte.model');

const ReporteController = {
  getUsuarios: async (req, res) => {
    try {
      const { rol } = req.query; // Filtro opcional por rol
      const usuarios = await Reporte.getUsuarios(rol);
      res.status(200).json({
        success: true,
        data: usuarios
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  getNegocios: async (req, res) => {
    try {
      const { rubro, fechaInicio, fechaFin } = req.query; // Filtros opcionales
      const negocios = await Reporte.getNegocios(rubro, fechaInicio, fechaFin);
      res.status(200).json({
        success: true,
        data: negocios
      });
    } catch (error) {
      console.error('Error al obtener negocios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = ReporteController;