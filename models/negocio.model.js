// models/negocio.model.js
const db = require('../db');

const Negocio = {

  /**
   * Actualiza la configuración de la tarjeta (premio, sellos, etc.) de un negocio.
   * INCLUYE LÓGICA DE AJUSTE AUTOMÁTICO (CAPPING)
   * @param {number} idNegocio - ID del negocio (viene del token).
   * @param {object} nuevaConfig - Objeto con los campos a actualizar.
   * @returns {Promise<object>} El negocio actualizado.
   */
  updateConfig: async (idNegocio, nuevaConfig) => {
    
    // 1. Obtener la config actual de la BD (para comparar)
    const negocioQuery = await db.query(
      'SELECT tarjeta_config FROM negocios WHERE id_usuario = $1',
      [idNegocio]
    );
    
    if (negocioQuery.rows.length === 0) {
      throw new Error('Negocio no encontrado.');
    }
    
    const configActual = negocioQuery.rows[0].tarjeta_config;

    // 2. Fusionar la config actual con la nueva
    const configActualizada = {
      ...configActual,
      nombre_tarjeta: nuevaConfig.nombre_tarjeta || configActual.nombre_tarjeta,
      imagen_fondo_url: nuevaConfig.imagen_fondo_url || configActual.imagen_fondo_url,
      premio: {
        ...configActual.premio,
        nombre_premio: nuevaConfig.premio?.nombre_premio || configActual.premio.nombre_premio,
        descripcion: nuevaConfig.premio?.descripcion || configActual.premio.descripcion,
        sellos_requeridos: nuevaConfig.premio?.sellos_requeridos || configActual.premio.sellos_requeridos,
        valor_aprox: nuevaConfig.premio?.valor_aprox || configActual.premio.valor_aprox,
      }
    };

    // 3. Guardar el objeto JSONB actualizado en la BD
    const updateQuery = `
      UPDATE negocios
      SET tarjeta_config = $1, actualizado_en = NOW()
      WHERE id_usuario = $2
      RETURNING *;
    `;
    
    const result = await db.query(updateQuery, [configActualizada, idNegocio]);
    const negocioActualizado = result.rows[0];

    // 4. --- ¡INICIO: LÓGICA DE AJUSTE AUTOMÁTICO (CAPPING)! ---
    
    // Extraemos los valores numéricos de sellos (antiguo y nuevo)
    const oldRequired = parseInt(configActual.premio?.sellos_requeridos, 10);
    const newRequired = parseInt(configActualizada.premio.sellos_requeridos, 10);

    // Verificamos si el valor es un número válido Y SI SE REDUJO
    if (!isNaN(oldRequired) && !isNaN(newRequired) && newRequired < oldRequired) {
        
        // 4a. Calcular el nuevo tope (ej. 2 sellos * 2 = 4)
        const nuevoTope = newRequired * 2;
        
        console.log(`[Negocio ID: ${idNegocio}] Detectó reducción de premio. Nuevo tope: ${nuevoTope}`);

        // 4b. Ejecutar el ajuste en TODAS las tarjetas de este negocio
        const ajusteQuery = `
            UPDATE tarjetas_lealtad
            SET cantidad_sellos = $1  -- Ajusta al nuevo tope
            WHERE id_negocio = $2     -- Solo de este negocio
            AND cantidad_sellos > $1; -- Solo a clientes que están por ENCIMA del nuevo tope
        `;
        
        try {
            // Ejecutamos la consulta de ajuste
            await db.query(ajusteQuery, [nuevoTope, idNegocio]);
        } catch (err) {
            // Si esto falla, no debemos detener la respuesta principal,
            // pero SÍ debemos registrarlo en la consola del servidor.
            console.error(`ERROR al ajustar tarjetas para negocio ${idNegocio}:`, err);
        }
    }
    
    // 5. --- FIN: LÓGICA DE AJUSTE ---

    // Devolver el negocio actualizado (de la primera consulta)
    return negocioActualizado;
  },

  // --- ¡AÑADE ESTA NUEVA FUNCIÓN! ---
  /**
   * (CLIENTE) Busca negocios cercanos a una coordenada GPS.
   * Utiliza la fórmula de Haversine para el cálculo.
   * @param {number} lat - Latitud del cliente.
   * @param {number} lon - Longitud del cliente.
   * @param {number} radiusInKm - Radio de búsqueda en kilómetros.
   * @returns {Promise<Array>} Lista de negocios cercanos.
   */
  findNearby: async (lat, lon, radiusInKm = 5) => {
    // Validar que la entrada sea numérica
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const radiusNum = parseFloat(radiusInKm);

    if (isNaN(latNum) || isNaN(lonNum)) {
      throw new Error('Latitud y longitud deben ser números válidos.');
    }

    // Esta consulta usa una sub-selección para calcular la distancia
    // (en km) para cada negocio y luego la filtra por el radio.
    const query = `
      SELECT * FROM (
        SELECT id_usuario, nombre_negocio, rubro, 
               ubicacion_local_lat, ubicacion_local_lon,
               ( 6371 * acos(
                   cos( radians($1) )
                   * cos( radians( ubicacion_local_lat ) )
                   * cos( radians( ubicacion_local_lon ) - radians($2) )
                   + sin( radians($1) )
                   * sin( radians( ubicacion_local_lat ) )
               ) ) AS distancia_km
        FROM negocios
        WHERE ubicacion_local_lat IS NOT NULL 
          AND ubicacion_local_lon IS NOT NULL
      ) AS negocios_con_distancia
      WHERE distancia_km < $3
      ORDER BY distancia_km;
    `;
    
    const params = [latNum, lonNum, radiusNum];
    const result = await db.query(query, params);
    return result.rows;
  },

  // --- ¡NUEVA FUNCIÓN! ---
  /**
   * (NEGOCIO) Busca los detalles de un negocio por su ID de usuario.
   * @param {number} idNegocio - ID del negocio (del token).
   * @returns {Promise<object>} Los detalles del negocio.
   */
  findById: async (idNegocio) => {
    const query = 'SELECT * FROM negocios WHERE id_usuario = $1';
    const result = await db.query(query, [idNegocio]);
    
    if (result.rows.length === 0) {
      throw new Error('Perfil de negocio no encontrado.');
    }
    return result.rows[0];
  }

};

module.exports = Negocio;