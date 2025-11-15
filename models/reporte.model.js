const db = require('../db');

const Reporte = {
  getUsuarios: async (rol = null) => {
    let query = `
      SELECT nombre, correo, rol, ubicacion_actual_lat, ubicacion_actual_lon, creado_en, actualizado_en
      FROM usuarios
    `;
    const params = [];

    if (rol) {
      query += ' WHERE rol = $1';
      params.push(rol);
    }

    query += ' ORDER BY creado_en DESC';

    const result = await db.query(query, params);
    return result.rows;
  },

  getNegocios: async (rubro = null, fechaInicio = null, fechaFin = null) => {
    let query = `
      SELECT nombre_negocio, rubro, ubicacion_local_lat, ubicacion_local_lon, creado_en, actualizado_en
      FROM negocios
    `;
    const params = [];
    const conditions = [];

    if (rubro) {
      conditions.push('rubro = $' + (params.length + 1));
      params.push(rubro);
    }

    if (fechaInicio) {
      conditions.push('creado_en >= $' + (params.length + 1));
      params.push(fechaInicio);
    }

    if (fechaFin) {
      conditions.push('creado_en <= $' + (params.length + 1));
      params.push(fechaFin);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY creado_en DESC';

    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = Reporte;
