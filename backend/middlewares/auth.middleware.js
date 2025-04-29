import { verifyToken } from '../utils/jwt.utils.js'

export const authenticateToken = async (req, res, next) => {
  const accessToken = req.cookies.accessToken

  if (!accessToken) {
    return res.status(401).json({ error: 'Acceso denegado: No hay token' })
  }

  try {
    const user = await verifyToken(accessToken)
    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' })
    }
    return res.status(403).json({ error: 'Token inválido' })
  }
}