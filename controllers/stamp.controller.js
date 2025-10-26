// controllers/stamp.controller.js
const Tarjeta = require('../models/tarjeta.model');

const StampController = {

  /**
   * Otorga un sello a un cliente.
   */
  grant: async (req, res) => {
    try {
      // El ID del negocio viene del token del usuario logueado
      const id_negocio = req.usuario.id;
      
      // El ID del cliente viene del body (del QR escaneado)
      const { idCliente } = req.body;

      if (!idCliente) {
        return res.status(400).json({ error: 'Se requiere el idCliente.' });
      }

      // Llamar al modelo para hacer la lógica (que ahora incluye el tope)
      const tarjetaActualizada = await Tarjeta.grantStamp(idCliente, id_negocio);
      
      // Si todo sale bien, se envía 201 Created
      res.status(201).json({
        mensaje: 'Sello otorgado exitosamente',
        tarjeta: tarjetaActualizada
      });

    } catch (err) {
      // --- ¡NUEVO MANEJO DE ERROR! ---
      // Capturamos el error personalizado del modelo
      if (err.code === 'LIMITE_PREMIO_ALCANZADO') {
        // 409 Conflict: La petición no se puede procesar por un conflicto de estado
        return res.status(409).json({ 
          error: 'Límite de premio alcanzado',
          mensaje: err.message // "El cliente debe canjear su premio..."
        });
      }
      
      // Loguea cualquier otro error inesperado
      console.error(err); 
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  } ,

  redeem: async (req, res) => {
    try {
      // 1. El ID del negocio viene del token
      const id_negocio = req.usuario.id;
      
      // 2. El ID de la *tarjeta* específica viene del body
      // (La app Swift del negocio sabrá qué tarjeta está canjeando)
      const { idTarjeta } = req.body;

      if (!idTarjeta) {
        return res.status(400).json({ error: 'Se requiere el idTarjeta.' });
      }

      // 3. Llamar al modelo para canjear
      const tarjetaActualizada = await Tarjeta.redeemPrize(idTarjeta, id_negocio);

      res.json({
        mensaje: 'Premio canjeado exitosamente',
        tarjeta: tarjetaActualizada
      });

    } catch (err) {
      // Manejar nuestros errores personalizados del modelo
      if (err.code === 'TARJETA_NO_ENCONTRADA') {
        return res.status(404).json({ error: err.message });
      }
      if (err.code === 'SELLOS_INSUFICIENTES') {
        return res.status(409).json({ error: err.message }); // 409 Conflict
      }

      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  }
  
  // Próximamente: canjear (redeem)
  // redeem: async (req, res) => { ... }

};

module.exports = StampController;