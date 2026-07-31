const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV,

  port: Number(process.env.PORT),

  database: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,

    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  },

  cookies: {
    cookieExpiresIn: process.env.COOKIE_EXPIRES_IN,
  },

  encryption: {
    encryptionKey: process.env.ENCRYPTION_KEY,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
};

module.exports = env;
