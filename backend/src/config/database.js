require('dotenv').config();

const config = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'stocksync_db',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: 'postgres',
  dialectOptions: {},
  logging: process.env.NODE_ENV === 'development' ? console.log : false
};

if (process.env.DB_SSL === 'true') {
  config.dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false
  };
}

module.exports = {
  development: config,
  test: config,
  production: {
    ...config,
    logging: false
  }
};
