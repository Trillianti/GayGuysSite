const winston = require("winston");

// Настройка логгера
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // Логирование в консоль
    new winston.transports.File({ filename: "bot.log" }), // Логирование в файл
  ],
});

module.exports = logger;
