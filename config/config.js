require('dotenv').config();

const {
  DB_USERNAME, DB_PASSWORD, DB_NAME, DB_HOST,
} = process.env;

module.exports = {
  development: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    dialect: 'mysql',
    dialectOptions: {
      useUTC: false,
    },
    timezone: '+07:00',
  },
  test: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    dialect: 'mysql',
    dialectOptions: {
      useUTC: false,
    },
    timezone: '+07:00',
  },
  production: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    dialect: 'mysql',
    dialectOptions: {
      useUTC: false,
    },
    timezone: '+07:00',
  },
};
