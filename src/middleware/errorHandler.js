const errorHandler = (err, req, res, next) => {
  console.error('--- ERROR START ---');
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.error('Message:', err.message);
  console.error('Status:', err.status);
  console.error('Code:', err.code);
  if (err.stack) console.error('Stack:', err.stack);
  console.error('--- ERROR END ---');
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: {
      message,
      status,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = errorHandler;
