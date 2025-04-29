// filepath: c:\Users\dubal\Documents\UAI\SEMESTRE 9\PROGRA PROFESIONAL\P01\backend\config.js
export const {
  PORT = 5000,
  SALT_ROUNDS = 10,
  SECRET_JWT_KEY= "este-es-la-clave-secreta-de-jwt", // ¡Mantén esto secreto en producción!
  ACCESS_TOKEN_EXPIRATION = '15m', // Ejemplo: 15 minutos
  REFRESH_TOKEN_EXPIRATION = '7d'  // Ejemplo: 7 días
} = process.env