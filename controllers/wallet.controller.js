// controllers/wallet.controller.js
const Tarjeta = require('../models/tarjeta.model');

const WalletController = {

  /**
   * Obtiene la billetera (lista de tarjetas) del usuario autenticado.
   */
  getMiBilletera: async (req, res) => {
    try {
      // ¡Aquí está la magia!
      // No usamos req.params. Usamos el ID de usuario que
      // el 'authMiddleware' puso en 'req.usuario'
      const id_cliente = req.usuario.id;

      // 2. Pedir los datos al Modelo
      const tarjetas = await Tarjeta.findByClienteId(id_cliente);

      // 3. Enviar la respuesta
      res.json(tarjetas);
      
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  
  toggleFavorite: async (req, res) => {
    try {
      // ID de la tarjeta viene de la URL (ej. /api/wallet/cards/12)
      const { id } = req.params;
      
      // Nuevo estado (true/false) viene del body
      const { favorita } = req.body;
      
      // ID del cliente viene del token
      const idCliente = req.usuario.id;

      if (typeof favorita !== 'boolean') {
        return res.status(400).json({ error: 'El campo "favorita" debe ser booleano (true/false).' });
      }

      const tarjetaActualizada = await Tarjeta.updateFavoriteStatus(id, favorita, idCliente);
      
      res.json({
        mensaje: 'Tarjeta actualizada.',
        tarjeta: tarjetaActualizada
      });

    } catch (err) {
      // Si el modelo lanza el error de "no encontrada", lo atrapamos aquí
      console.error(err);
      res.status(404).json({ error: err.message });
    }
  }

};

module.exports = WalletController;