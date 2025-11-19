// controllers/stamp.controller.js
const Tarjeta = require('../models/tarjeta.model');
const Usuario = require('../models/usuario.model');
const admin = require('firebase-admin');

const StampController = {

grant: async (req, res) => {
    try {
      const id_negocio = req.usuario.id;
      const { idCliente } = req.body;

      if (!idCliente) {
        return res.status(400).json({ error: 'Se requiere el idCliente.' });
      }

      // 1. Otorgar el sello en la BD
      const tarjetaActualizada = await Tarjeta.grantStamp(idCliente, id_negocio);
      
      // --- 2. LÓGICA DE NOTIFICACIÓN INTELIGENTE ---
      try {
        // Buscamos al cliente para obtener su token FCM
        const cliente = await Usuario.findById(idCliente);
        
        if (cliente && cliente.token_dispositivo) {
          
          // A. Definir el mensaje por defecto (Solo un sello más)
          let tituloNotif = "¡Nuevo Sello Recibido!";
          let cuerpoNotif = `Has recibido un sello de ${tarjetaActualizada.cache_nombre_negocio}.`;

          // B. Verificar si completó la tarjeta (¡Premio!)
          const sellosTiene = tarjetaActualizada.cantidad_sellos;
          const sellosNecesita = tarjetaActualizada.cache_sellos_requeridos;

          if (sellosTiene >= sellosNecesita) {
             tituloNotif = "🏆 ¡Felicidades! Premio Desbloqueado";
             cuerpoNotif = `¡Has completado tu tarjeta en ${tarjetaActualizada.cache_nombre_negocio}! Ve a canjear tu premio.`;
          }

          // C. Construir el mensaje para Firebase
          const mensaje = {
            notification: {
              title: tituloNotif,
              body: cuerpoNotif
            },
            // Opcional: Datos extra para que al tocar la noti se abra la tarjeta
            data: {
                tipo: "sello_otorgado",
                tarjetaId: String(tarjetaActualizada.id)
            },
            token: cliente.token_dispositivo
          };
          
          // D. Enviar
          await admin.messaging().send(mensaje);
          console.log("Notificación enviada a cliente:", idCliente);
        }
      } catch (notifError) {
        console.error("Error al enviar notificación (no detiene el proceso):", notifError);
      }
      // --- FIN LÓGICA NOTIFICACIÓN ---

      res.status(201).json({
        mensaje: 'Sello otorgado exitosamente',
        tarjeta: tarjetaActualizada
      });

    } catch (err) {
      if (err.code === 'LIMITE_PREMIO_ALCANZADO') {
        return res.status(409).json({ 
          error: 'Límite de premio alcanzado', 
          mensaje: err.message 
        });
      }
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  },
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
