// models/tarjeta.model.js
const db = require('../db');

const Tarjeta = {

  /**
   * Busca todas las tarjetas de un cliente por su ID.
   * (Esta función no cambia)
   */
  findByClienteId: async (idCliente) => {
    const query = `
      SELECT * FROM tarjetas_lealtad 
      WHERE id_cliente = $1 
      ORDER BY favorita DESC, creado_en DESC
    `;
    
    const result = await db.query(query, [idCliente]);
    return result.rows;
  },

  /**
   * Otorga un sello (crea o actualiza) a un cliente de parte de un negocio.
   * APLICA LÓGICA DE TOPE: (sellos_requeridos * 2)
   * @param {number} idCliente - ID del cliente que recibe el sello.
   * @param {number} idNegocio - ID del negocio que da el sello.
   * @returns {Promise<object>} La tarjeta actualizada o recién creada.
   */
  grantStamp: async (idCliente, idNegocio) => {
    
    // 1. Obtener los datos del negocio (para sellos_requeridos y caché)
    const negocioQuery = await db.query('SELECT * FROM negocios WHERE id_usuario = $1', [idNegocio]);
    const negocio = negocioQuery.rows[0];
    
    if (!negocio) {
      throw new Error('El negocio que otorga el sello no existe.');
    }

    // 2. Extraer config y calcular el TOPE
    const { tarjeta_config, nombre_negocio } = negocio;
    const { premio } = tarjeta_config;
    const sellos_requeridos = premio.sellos_requeridos;
    
    // Tu lógica: El tope es el doble de los sellos requeridos.
    // Ej: 5 sellos req. -> tope = 10.
    const tope = sellos_requeridos * 2; 

    // 3. Buscar la tarjeta existente
    const tarjetaQuery = await db.query(
      'SELECT * FROM tarjetas_lealtad WHERE id_cliente = $1 AND id_negocio = $2',
      [idCliente, idNegocio]
    );
    const tarjetaExistente = tarjetaQuery.rows[0];

    // 4. Aplicar la lógica
    if (tarjetaExistente) {
      // --- CASO B: CLIENTE RECURRENTE ---
      const sellos_actuales = tarjetaExistente.cantidad_sellos;

      // 5. Verificar el TOPE
      // Ej: (9 sellos + 1) >= 10. Se bloquea.
      if ((sellos_actuales + 1) >= tope) {
        // Lanzamos un error con un código especial
        const err = new Error('Límite de premio alcanzado. El cliente debe canjear su premio antes de acumular más sellos.');
        err.code = 'LIMITE_PREMIO_ALCANZADO'; // Código personalizado
        throw err;
      }

      // 6. Si no hay bloqueo, actualizar (sumar 1)
      const updateQuery = `
        UPDATE tarjetas_lealtad 
        SET cantidad_sellos = cantidad_sellos + 1, actualizado_en = NOW() 
        WHERE id = $1 
        RETURNING *;
      `;
      const result = await db.query(updateQuery, [tarjetaExistente.id]);
      return result.rows[0];

    } else {
      // --- CASO A: CLIENTE NUEVO ---
      // No hay tope, es su primer sello.
      const insertQuery = `
        INSERT INTO tarjetas_lealtad 
          (id_cliente, id_negocio, cantidad_sellos, 
           cache_nombre_negocio, cache_imagen_tarjeta_url, cache_nombre_premio, cache_sellos_requeridos)
        VALUES 
          ($1, $2, 1, $3, $4, $5, $6)
        RETURNING *;
      `;
      
      const params = [
        idCliente, 
        idNegocio,
        nombre_negocio,
        tarjeta_config.imagen_fondo_url,
        premio.nombre_premio,
        sellos_requeridos
      ];

      const result = await db.query(insertQuery, params);
      return result.rows[0];
    }
  },

  /**
   * Canjea un premio en una tarjeta de lealtad específica.
   * Resta los sellos requeridos de la cantidad actual.
   * @param {number} idTarjeta - El ID (PK) de la tabla 'tarjetas_lealtad'.
   * @param {number} idNegocio - El ID del negocio que realiza el canje (para seguridad).
   * @returns {Promise<object>} La tarjeta actualizada.
   */
  redeemPrize: async (idTarjeta, idNegocio) => {
    // 1. Obtener la tarjeta y verificar que el negocio sea el dueño
    const tarjetaQuery = await db.query(
      'SELECT * FROM tarjetas_lealtad WHERE id = $1 AND id_negocio = $2',
      [idTarjeta, idNegocio]
    );
    const tarjeta = tarjetaQuery.rows[0];

    if (!tarjeta) {
      const err = new Error('No se encontró la tarjeta o no pertenece a este negocio.');
      err.code = 'TARJETA_NO_ENCONTRADA';
      throw err;
    }

    // 2. Verificar que el cliente tenga suficientes sellos para canjear
    const { cantidad_sellos, cache_sellos_requeridos } = tarjeta;

    if (cantidad_sellos < cache_sellos_requeridos) {
      const err = new Error('El cliente no tiene suficientes sellos para canjear este premio.');
      err.code = 'SELLOS_INSUFICIENTES';
      throw err;
    }

    // 3. ¡Lógica de resta! (Ej: 7 sellos - 5 req. = 2 restantes)
    const sellosRestantes = cantidad_sellos - cache_sellos_requeridos;

    const updateQuery = `
      UPDATE tarjetas_lealtad 
      SET cantidad_sellos = $1, actualizado_en = NOW()
      WHERE id = $2
      RETURNING *;
    `;
    
    const result = await db.query(updateQuery, [sellosRestantes, idTarjeta]);
    return result.rows[0];
  },

  /**
   * Actualiza el estado de 'favorita' de una tarjeta de lealtad.
   * @param {number} idTarjeta - El ID (PK) de la tabla 'tarjetas_lealtad'.
   * @param {boolean} favorita - El nuevo estado (true o false).
   * @param {number} idCliente - El ID del cliente (para seguridad).
   * @returns {Promise<object>} La tarjeta actualizada.
   */
  updateFavoriteStatus: async (idTarjeta, favorita, idCliente) => {
    const query = `
      UPDATE tarjetas_lealtad
      SET favorita = $1, actualizado_en = NOW()
      WHERE id = $2 AND id_cliente = $3
      RETURNING *;
    `;
    // El 'AND id_cliente' es la clave de seguridad.
    // Evita que un cliente marque como favorita la tarjeta de otro.
    const values = [favorita, idTarjeta, idCliente];
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      // Esto pasa si la tarjeta no existe O no le pertenece al usuario
      throw new Error('Tarjeta no encontrada o no pertenece a este usuario.');
    }
    return result.rows[0];
  }

};

module.exports = Tarjeta;