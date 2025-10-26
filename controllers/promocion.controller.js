// controllers/promocion.controller.js
const Promocion = require('../models/promocion.model');

const PromocionController = {

  /**
   * Crea una nueva promoción.
   * El negocio se identifica por el token.
   */
  create: async (req, res) => {
    try {
      // 1. El ID del negocio viene del token
      const idNegocio = req.usuario.id;
      
      // 2. Los datos de la promo vienen del body
      const { nombre, descripcion, inicia_en, termina_en } = req.body;

      // 3. Validación simple
      if (!nombre || !descripcion || !inicia_en || !termina_en) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
      }
      
      // 4. Crear el objeto de datos
      const promoData = {
        idNegocio,
        nombre,
        descripcion,
        inicia_en,
        termina_en
      };

      // 5. Llamar al modelo para crearla
      const nuevaPromocion = await Promocion.create(promoData);
      
      res.status(201).json({
        mensaje: 'Promoción creada exitosamente',
        promocion: nuevaPromocion
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  }

};

module.exports = PromocionController;