// authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function verificarToken(req, res, next) {
  // 1. Buscar el token en la cabecera 'Authorization'
  const authHeader = req.headers['authorization'];
  
  // El formato es: "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(' ')[1];

  // 2. Si no hay token, no hay acceso
  if (token == null) {
    return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
  }

  // 3. Verificar si el token es válido
  jwt.verify(token, process.env.JWT_SECRET, (err, usuarioDecodificado) => {
    
    // 4. Si el token es inválido (mal escrito, expirado, etc.)
    if (err) {
      console.log('Error al verificar token:', err.message);
      return res.status(403).json({ error: 'Acceso prohibido. Token inválido.' });
    }

    // 5. ¡Éxito! El token es válido.
    // Guardamos los datos del usuario (id, rol) en el objeto 'req'
    // para que el siguiente endpoint (el controlador) pueda usarlo.
    req.usuario = usuarioDecodificado;
    
    // 6. Dejar pasar la petición
    next();
  });
}

module.exports = verificarToken;