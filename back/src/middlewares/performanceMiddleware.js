const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Logger pour les routes critiques
    if (req.path.includes('/api/orders') || req.path.includes('/api/stripe')) {
      console.log(`[PERF] ${req.method} ${req.path} - ${duration}ms - ${res.statusCode}`);
      
      // Alerter si > 2000ms
      if (duration > 2000) {
        console.warn(`[PERF WARNING] Slow request: ${req.path} took ${duration}ms`);
      }
    }
  });
  
  next();
};

module.exports = performanceMiddleware;