import { UserRepository } from '../repositories/user.repository.js'
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.utils.js'
import { ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } from '../config.js'

// Convertir expiraciones a milisegundos para las cookies
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000 // 15 minutos
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 días

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: maxAge
})

export const register = async (req, res) => {
  const { email, password, role } = req.body
  try {
    const id = UserRepository.create({ email, password, role })
    res.status(201).send({ message: 'Usuario registrado con éxito', id })
  } catch (error) {
    // Considerar diferentes códigos de estado (ej. 409 Conflict si el email ya existe)
    res.status(400).json({ error: error.message })
  }
}

export const login = async (req, res) => {
  const { email, password, role } = req.body
  try {
    const user = UserRepository.login({ email, password, role }) // Asume que login devuelve el usuario sin password

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    res.cookie('accessToken', accessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE))
    res.cookie('refreshToken', refreshToken, cookieOptions(REFRESH_TOKEN_MAX_AGE))

    res.send({ user }) // Envía datos del usuario (sin password)
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
}

export const refreshTokenHandler = async (req, res) => {
  const currentRefreshToken = req.cookies.refreshToken
  if (!currentRefreshToken) {
    return res.status(401).json({ error: 'No refresh token provided' })
  }

  try {
    const decoded = await verifyToken(currentRefreshToken)

    // Opcional: Verificar si el refresh token está revocado en la DB

    // Obtener datos frescos del usuario (importante si el rol o email cambian)
    const user = UserRepository.findById(decoded.id)
    if (!user) {
      // Si el usuario asociado al refresh token ya no existe
      res.clearCookie('accessToken', cookieOptions(0))
      res.clearCookie('refreshToken', cookieOptions(0))
      return res.status(403).json({ error: 'Invalid refresh token - user not found' })
    }

    const newAccessToken = generateAccessToken(user)

    res.cookie('accessToken', newAccessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE))

    // Opcional: Rotación de Refresh Tokens (más seguro)
    // const newRefreshToken = generateRefreshToken(user);
    // res.cookie('refreshToken', newRefreshToken, cookieOptions(REFRESH_TOKEN_MAX_AGE));

    res.json({ message: 'Access token refreshed' })
  } catch (err) {
    // Si el refresh token es inválido o expiró
    res.clearCookie('accessToken', cookieOptions(0))
    res.clearCookie('refreshToken', cookieOptions(0))
    return res.status(403).json({ error: 'Invalid or expired refresh token' })
  }
}

export const logout = async (req, res) => {
  // Limpia las cookies estableciendo maxAge a 0 o una fecha pasada
  res.clearCookie('accessToken', cookieOptions(0))
  res.clearCookie('refreshToken', cookieOptions(0))
  res.send({ success: true, message: 'Logout exitoso' })
}

export const getProfile = async (req, res) => {
  // req.user ya está disponible gracias al middleware authenticateToken
  // Podrías querer buscar datos más frescos del usuario en la DB aquí
  // const freshUser = UserRepository.findById(req.user.id);
  // if (!freshUser) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'Esta es una ruta protegida', user: req.user })
}