const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Config CORS
app.use(cors({
  origin: '*', // Allow connections from all origins, typical for cloud ECS backend routing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploads statically as fallback when S3 is not active
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes wiring
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint for AWS Target Group health monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.status(200).send('StockSync B2B inventory API service is running.');
});

// Unhandled error catcher
app.use((err, req, res, next) => {
  console.error('Server unhandled error catcher:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'An internal database or application error occurred.'
  });
});

// Authenticate DB connection and start server
const initApp = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection authenticated successfully.');
    app.listen(PORT, () => {
      console.log(`Express server initialized on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    process.exit(1);
  }
};

initApp();
