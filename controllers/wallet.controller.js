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
  }

};

module.exports = WalletController;