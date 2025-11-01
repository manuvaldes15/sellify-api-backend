
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes'); 
const stampRoutes = require('./routes/stamp.routes');
const negocioRoutes = require('./routes/negocio.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const adminRoutes = require('./routes/admin.routes'); 
const promocionRoutes = require('./routes/promocion.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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