// controllers/negocio.controller.js
const Negocio = require('../models/negocio.model');

const NegocioController = {

  /**
   * Actualiza la configuración de la tarjeta del negocio autenticado.
   */
  updateMyConfig: async (req, res) => {
    try {
      // 1. El ID del negocio viene del token
      const idNegocio = req.usuario.id;
      
      // 2. La nueva data de config viene del body
      // La app Swift enviará solo los campos que quiere cambiar
      const nuevaConfig = req.body; 

      if (Object.keys(nuevaConfig).length === 0) {
        return res.status(400).json({ error: 'No se enviaron datos para actualizar.' });
      }

      // 3. Llamar al modelo
      const negocioActualizado = await Negocio.updateConfig(idNegocio, nuevaConfig);

      res.json({
        mensaje: 'Configuración de tarjeta actualizada.',
        negocio: negocioActualizado
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  },

  findNearbyBusinesses: async (req, res) => {
    // Los datos vienen de la URL: /api/businesses/nearby?lat=13.7&lon=-89.2
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Se requieren los parámetros de consulta "lat" y "lon".' });
    }

    try {
      // Usamos un radio de 5km por defecto
      const negocios = await Negocio.findNearby(lat, lon, 5);
      res.json(negocios);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  },

  // --- ¡NUEVA FUNCIÓN! ---
  /**
   * (GET) Obtiene los detalles del negocio autenticado.
   */
  getMyBusinessDetails: async (req, res) => {
    try {
      const idNegocio = req.usuario.id;
      const negocio = await Negocio.findById(idNegocio);
      res.json(negocio);
    } catch (err) {
      console.error(err);
      // Si el modelo lanza el error "no encontrado", respondemos 404
      res.status(404).json({ error: err.message });
    }
  }

};

module.exports = NegocioController;