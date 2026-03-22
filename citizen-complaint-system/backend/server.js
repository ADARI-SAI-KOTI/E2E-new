require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const seedDepartments = require('./utils/seedData');

// Import routes
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const userRoutes = require('./routes/users');
const departmentRoutes = require('./routes/departments');

const app = express();

// Connect to MongoDB and seed initial data
const startServer = async () => {
  await connectDB();
  await seedDepartments();
};

startServer().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN || 'http://localhost:3000'
    : 'http://localhost:3000', // allow localhost:3000 in development
  credentials: true
}));

// Allow larger payloads for image uploads (base64) and deep JSON
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: err })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = parseInt(process.env.PORT, 10) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the process using it and restart the server.`);
    console.error(`On Windows, run: netstat -ano | findstr :${PORT}  
then: taskkill /PID <pid> /F`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
