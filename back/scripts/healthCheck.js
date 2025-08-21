const fetch = require('node-fetch');

const API_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const checkHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    
    if (response.ok) {
        console.log('Health check successful:', data);
    } else {
        console.error('Health check failed:', data);
    }
  } catch (error) {
    console.error('Health check error:', error.message);
    console.error('Timestamp:', new Date().toISOString());
  }
};

// Vérifier toutes les 30 secondes
setInterval(checkHealth, 30000);
checkHealth(); // Premier check immédiat