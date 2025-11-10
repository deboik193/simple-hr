require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  email: {
    elastic: {
      apiKey: process.env.ELASTIC_EMAIL_API_KEY,
      from: process.env.ELASTIC_EMAIL_FROM,
      fromName: process.env.ELASTIC_EMAIL_FROM_NAME
    }
  }
};