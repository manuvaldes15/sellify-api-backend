// controllers/negocio.controller.js
const Negocio = require('../models/negocio.model');
const Promocion = require('../models/promocion.model');
const Tarjeta = require('../models/tarjeta.model');

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
  },


  getMyPromotions: async (req, res) => {
    try {
      // El ID del negocio viene del token
      const idNegocio = req.usuario.id;
      // Llama al modelo de Promocion
      const promociones = await Promocion.findByNegocioId(idNegocio);
      res.json(promociones);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  /**
   * Obtiene la información de una promoción específica (propia).
   * Ruta esperada: GET /me/promotions/:promotionId
   */
  getPromotionInfo: async (req, res) => {
    try {
      const idNegocio = req.usuario.id;
      const promotionId = req.params.promotionId;

      if (!promotionId) {
        return res.status(400).json({ error: 'ID de promoción requerido.' });
      }

      const promocion = await Promocion.getInfoPromotion(promotionId);

      if (!promocion) {
        return res.status(404).json({ error: 'Promoción no encontrada.' });
      }

      // Verificar que la promoción pertenezca al negocio autenticado
      if (String(promocion.id_negocio) !== String(idNegocio)) {
        return res.status(403).json({ error: 'No autorizado para ver esta promoción.' });
      }

      res.json(promocion);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  },

  uploadCardImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo.' });
      }

      // 1. 'req.file.path' es la URL segura que Cloudinary te devuelve
      const imageUrl = req.file.path;
      const idNegocio = req.usuario.id;

      // 2. Llama a tu modelo existente para guardar solo esta URL
      const negocioActualizado = await Negocio.updateConfig(idNegocio, { 
          imagen_fondo_url: imageUrl 
      });

      // 3. Devuelve la respuesta que Swift espera (UpdateConfigResponse)
      res.json({
        mensaje: 'Imagen subida y guardada.',
        negocio: negocioActualizado
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  },

  getAllBusinesses: async (req, res) => {
    try {
      const negocios = await Negocio.findAllPublic();
      res.json(negocios);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  /**
   * Obtiene la lista de clientes del negocio autenticado (con al menos 1 sello).
   * Ruta: GET /api/businesses/me/clients
   */
  getMyClients: async (req, res) => {
    try {
      const idNegocio = req.usuario.id;
      const clientes = await Tarjeta.findClientsByNegocioId(idNegocio);
      res.json(clientes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  },

  /**
   * KPIs del negocio sobre sus clientes y sellos.
   */
  getMyStats: async (req, res) => {
    try {
      const idNegocio = req.usuario.id;
      const stats = await Tarjeta.getBusinessStats(idNegocio);

      const response = {
        clientesActivos: Number(stats?.clientes_activos) || 0,
        clientesListosParaPremio: Number(stats?.clientes_listos_premio) || 0,
        sellosAcumulados: Number(stats?.sellos_acumulados) || 0,
        promedioSellosPorCliente: Number(stats?.promedio_sellos_por_cliente) || 0
      };

      res.json(response);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
  },
  /**
   * Verifica si el código de acceso coincide con el del usuario.
   */
  verifyAccessCode: async (req, res) => {
    try {
      const { id } = req.usuario.id; // id desde el token
      const { code } = req.body; // código enviado por el cliente

      const query = 'SELECT codigo_acceso FROM usuarios WHERE id = $1';
      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const storedCode = result.rows[0].codigo_acceso;

      if (storedCode === code) {
        return res.json({ success: true, message: 'Código verificado correctamente' });
      } else {
        return res.status(400).json({ success: false, message: 'Código incorrecto' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Error al verificar el código de acceso' });
    }
  }

};

module.exports = NegocioController;