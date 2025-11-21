require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- 1. AÑADE LAS LIBRERÍAS DE UPLOAD ---
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// --- 2. CONFIGURA CLOUDINARY (Usa las claves de Render) ---
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // req.usuario es añadido por tu middleware 'verificarToken'
    return {
      folder: 'sellify-cards',
      format: 'png',
      public_id: `card-${req.usuario.id}-${Date.now()}`
    };
  },
});

// --- 3. CREA EL PARSER DE UPLOAD ---
const uploadParser = multer({ storage: storage });


// --- 4. IMPORTA LAS RUTAS (¡Aquí está el cambio!) ---
// Pasa el 'uploadParser' a las rutas de negocio
const negocioRoutes = require('./routes/negocio.routes')(uploadParser); 
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes'); 
const stampRoutes = require('./routes/stamp.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const adminRoutes = require('./routes/admin.routes'); 
const promocionRoutes = require('./routes/promocion.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173', // frontend origin
  credentials: true               // permite enviar cookies/autenticación
}));
app.use(express.json());

// --- 5. USA LAS RUTAS (Sin cambios) ---
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes); 
app.use('/api/stamps', stampRoutes);
app.use('/api/businesses', negocioRoutes); 
app.use('/api/users', usuarioRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/promotions', promocionRoutes); 

app.listen(PORT, () => {
  console.log(`Servidor API de Sellify corriendo en http://localhost:${PORT}`);
});