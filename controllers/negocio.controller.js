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
  }

};

module.exports = NegocioController;