// models/usuario.model.js
const db = require('../db');
const bcrypt = require('bcryptjs');

const Usuario = {
  /**
   * Busca un usuario por su correo electrónico.
   */
  findByEmail: async (correo) => {
    const query = 'SELECT * FROM usuarios WHERE correo = $1';
    const result = await db.query(query, [correo]);
    return result.rows[0];
  },


  /**
   * Crea un nuevo usuario en la base de datos.
   */
  create: async (nombre, correo, contrasenaPlana) => {
    const salt = bcrypt.genSaltSync(10);
    const hash_contrasena = bcrypt.hashSync(contrasenaPlana, salt);
    const query = `
      INSERT INTO usuarios (nombre, correo, hash_contrasena, rol)
      VALUES ($1, $2, $3, 'cliente')
      RETURNING id, nombre, correo, rol, creado_en;
    `;
    const params = [nombre, correo, hash_contrasena];
    try {
      const result = await db.query(query, params);
      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') {
        throw new Error('El correo electrónico ya está registrado.');
      }
      throw err;
    }
  },

  /**
   * Marca a un usuario cliente como "solicitante de negocio".
   */
  requestBusinessRole: async (idCliente) => {
    const query = `
      UPDATE usuarios
      SET negocio_solicitado = TRUE, actualizado_en = NOW()
      WHERE id = $1 AND rol = 'cliente'
      RETURNING id, nombre, correo, rol, negocio_solicitado;
    `;
    const result = await db.query(query, [idCliente]);
    if (result.rows.length === 0) {
      throw new Error('No se pudo actualizar el usuario. Es posible que ya sea un negocio o no exista.');
    }
    return result.rows[0];
  },

  // --- ¡ESTA ES LA FUNCIÓN QUE FALTABA! ---
  /**
   * (ADMIN) Busca todos los usuarios que han solicitado ser negocio.
   * @returns {Promise<Array>} Lista de usuarios pendientes.
   */
  findPendingRequests: async () => {
    const query = `
      SELECT id, nombre, correo, creado_en
      FROM usuarios
      WHERE negocio_solicitado = TRUE AND rol = 'cliente'
      ORDER BY creado_en ASC;
    `;
    const result = await db.query(query);
    return result.rows;
  },
  // --- FIN DE LA FUNCIÓN QUE FALTABA ---

  /**
   * (ADMIN) Aprueba la solicitud de un usuario para ser negocio.
   */
  approveBusinessRequest: async (idUsuario) => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const updateUserQuery = `
        UPDATE usuarios
        SET rol = 'negocio', negocio_solicitado = FALSE, actualizado_en = NOW()
        WHERE id = $1 AND rol = 'cliente'
        RETURNING *;
      `;
      const userResult = await client.query(updateUserQuery, [idUsuario]);

      if (userResult.rows.length === 0) {
        throw new Error('No se encontró el usuario o ya es un negocio.');
      }
      
      const usuarioAprobado = userResult.rows[0];

      const createBusinessQuery = `
        INSERT INTO negocios (id_usuario, nombre_negocio, rubro)
        VALUES ($1, $2, 'otros');
      `;
      await client.query(createBusinessQuery, [idUsuario, usuarioAprobado.nombre]);

      await client.query('COMMIT');
      return usuarioAprobado;

    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error en la transacción de aprobación:', err);
      throw new Error('No se pudo aprobar la solicitud. ' + err.message);
    } finally {
      client.release();
    }
  }
};

module.exports = Usuario;