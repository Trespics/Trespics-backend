const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const projectsRouter = require('./src/routes/projects');
const testimonialsRouter = require('./src/routes/testimonials');
const contactRouter = require('./src/routes/contact');
const authRouter = require('./src/routes/auth');
const uploadRouter = require('./src/routes/upload');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/projects', projectsRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);

// Health check
app.get('/', (req, res) => {
  res.send('Trespics Backend API is running');
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server is Okay`);
});
