// db.js (Actualizado)

require('dotenv').config();
const { Pool } = require('pg');

// 1. Crear el Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
  // Si estás usando SSL en producción (como en Render), añade esto:
  /*
  ssl: {
    rejectUnauthorized: false
  }
  */
});

// 2. Exportar *ambos*
module.exports = {
  // La función 'query' para consultas simples
  query: (text, params) => pool.query(text, params),
  
  // El 'pool' completo para transacciones (para connect() y release())
  pool: pool, 
};