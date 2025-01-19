const mysql = require("mysql2");
require('dotenv').config({ path: '../.env' });

// Подключение к базе данных
const pool = mysql.createPool({
  host: process.env.DB_HOST, // Хост базы данных
  user: process.env.DB_USER, // Пользователь MySQL
  password: process.env.DB_PWD, // Пароль MySQL
  database: process.env.DB_DB, // Название базы данных
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Промисификация соединения
const db = pool.promise();

module.exports = db;
