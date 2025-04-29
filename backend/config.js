export const {
  PORT = 5000,
  SALT_ROUNDS = 10,
  SECRET_JWT_KEY= "este-es-la-clave-secreta-de-jwt",
  ACCESS_TOKEN_EXPIRATION = '15m',
  REFRESH_TOKEN_EXPIRATION = '7d'
} = process.env