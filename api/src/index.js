const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Habilita el parseo de JSON en el body

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const cardRoutes = require('./routes/cardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const accountStatementRoutes = require('./routes/accountStatementRoutes');
const logRoutes = require('./routes/logRoutes');

// Montar rutas base
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/statements', accountStatementRoutes);
app.use('/api/logs', logRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API Neo-Banking funcionando correctamente.' });
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de desarrollo encendido en puerto ${PORT}`);
});
