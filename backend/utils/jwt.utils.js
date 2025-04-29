import jwt from 'jsonwebtoken'
import { SECRET_JWT_KEY, ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } from '../config.js'

export const generateAccessToken = (user) => {
  // Asegúrate de que user tenga id, email y role
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role },
    SECRET_JWT_KEY,
    { expiresIn: ACCESS_TOKEN_EXPIRATION }
  )
}

export const generateRefreshToken = (user) => {
  // Solo necesitamos el id para el refresh token
  return jwt.sign(
    { id: user._id || user.id },
    SECRET_JWT_KEY,
    { expiresIn: REFRESH_TOKEN_EXPIRATION }
  )
}

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET_JWT_KEY, (err, decoded) => {
      if (err) {
        return reject(err)
      }
      resolve(decoded)
    })
  })
}