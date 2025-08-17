const fs = require('fs');
const path = require('path');

const API_KEY_FILE = path.join(__dirname, '../api_keys.json');
let apiKeys = {};
try {
  const data = fs.readFileSync(API_KEY_FILE, 'utf8');
  apiKeys = JSON.parse(data);
} catch (err) {
  apiKeys = {};
}

const authenticateApiKey = (req, res, next) => {
  const apikey = req.headers['x-api-key'] || req.query.apikey;
  if (!apikey) {
    return res.status(401).json({
      error: 'API KEY es requerida',
      message: 'Incluye un apikey en el header X-API-KEY o como parametro apiKey'
    });
  }
  if (!apiKeys[apikey]) {
    return res.status(403).json({
      error: 'API KEY no valida',
      message: 'La API KEY proporcionada no es valida o no existe'
    });
  }
  req.client = apiKeys[apikey];
  next();
};

module.exports = { authenticateApiKey };