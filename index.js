// index.js (Actualizado)

// 1. Importar librerías
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 2. Importar nuestras rutas
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes'); // <--- AÑADE ESTA LÍNEA
const stampRoutes = require('./routes/stamp.routes');
const negocioRoutes = require('./routes/negocio.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const adminRoutes = require('./routes/admin.routes'); // <--- AÑADE ESTA LÍNEA
const promocionRoutes = require('./routes/promocion.routes'); // <--- AÑADE ESTA LÍNEA

// 3. Inicializar la App
const app = express();
const PORT = process.env.PORT || 3000;

// 4. Middlewares
app.use(cors());
app.use(express.json());

// 5. Usar las Rutas
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes); // <--- AÑADE ESTA LÍNEA
app.use('/api/stamps', stampRoutes);
app.use('/api/businesses', negocioRoutes); // <--- AÑADE ESTA LÍNEA
app.use('/api/users', usuarioRoutes); // <--- AÑADE ESTA LÍNEA
app.use('/api/admin', adminRoutes); // <--- AÑADE ESTA LÍNEA
app.use('/api/promotions', promocionRoutes); // <--- AÑADE ESTA LÍNEA


// 6. Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor API de Sellify corriendo en http://localhost:${PORT}`);
});