// models/promocion.model.js
const db = require('../db');

const Promocion = {

  /**
   * Crea una nueva promoción para un negocio.
   * @param {object} promoData - Datos de la promoción.
   * @param {number} promoData.idNegocio - ID del negocio (del token).
   * @param {string} promoData.nombre - Título de la promo (ej. "Jueves 2x1").
   * @param {string} promoData.descripcion - Detalles.
   * @param {string} promoData.inicia_en - Fecha/hora de inicio (ISO string).
   * @param {string} promoData.termina_en - Fecha/hora de fin (ISO string).
   * @returns {Promise<object>} La promoción recién creada.
   */
  create: async ({ idNegocio, nombre, descripcion, inicia_en, termina_en }) => {
    
    // 1. Obtener el nombre del negocio para el caché
    // (Usamos pool.connect para una mini-transacción)
    const client = await db.pool.connect(); 
    let nombreNegocio;
    
    try {
      const negocioQuery = await client.query(
        'SELECT nombre_negocio FROM negocios WHERE id_usuario = $1',
        [idNegocio]
      );
      
      if (negocioQuery.rows.length === 0) {
        throw new Error('Negocio no encontrado');
      }
      nombreNegocio = negocioQuery.rows[0].nombre_negocio;

      // 2. Insertar la promoción
      const insertQuery = `
        INSERT INTO promociones 
          (id_negocio, nombre_negocio, nombre, descripcion, inicia_en, termina_en)
        VALUES 
          ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      
      const params = [
        idNegocio,
        nombreNegocio, // El caché que obtuvimos
        nombre,
        descripcion,
        inicia_en,
        termina_en
      ];
      
      const result = await client.query(insertQuery, params);
      return result.rows[0];

    } catch (err) {
      console.error('Error al crear promoción:', err);
      throw err; // Lanza el error para que el controlador lo atrape
    } finally {
      client.release(); // Libera la conexión
    }
  },

  findActive: async () => {
    const query = `
      SELECT 
        p.id, 
        p.id_negocio, 
        p.nombre_negocio, 
        p.nombre, 
        p.descripcion, 
        p.termina_en,
        n.rubro,             -- <-- ¡LA CATEGORÍA REAL!
        n.tarjeta_config     -- <-- ¡LA TARJETA DEL NEGOCIO!
      FROM promociones AS p
      JOIN negocios AS n ON p.id_negocio = n.id_usuario
      WHERE NOW() BETWEEN p.inicia_en AND p.termina_en
      ORDER BY p.termina_en ASC;
    `;
    
    const result = await db.query(query);
    return result.rows;
  }


  ,

  /**
   * Busca promociones por id de negocio.
   * @param {number} idNegocio
   * @returns {Promise<Array>} Lista de promociones del negocio
   */
  findByNegocioId: async (idNegocio) => {
    const query = `
      SELECT
        id,
        id_negocio,
        nombre_negocio,
        nombre,
        descripcion,
        inicia_en,
        termina_en
      FROM promociones
      WHERE id_negocio = $1
      ORDER BY inicia_en DESC;
    `;

    const result = await db.query(query, [idNegocio]);
    return result.rows;
  }


  ,

  /**
   * Obtiene la información de una promoción por su id.
   * @param {number|string} idPromocion
   * @returns {Promise<object|null>} La promoción o null si no existe
   */
  getInfoPromotion: async (idPromocion) => {
    const query = `
      SELECT
        id,
        id_negocio,
        nombre_negocio,
        nombre,
        descripcion,
        inicia_en,
        termina_en
      FROM promociones
      WHERE id = $1
      LIMIT 1;
    `;

    const result = await db.query(query, [idPromocion]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }



};

module.exports = Promocion;