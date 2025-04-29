import { UserRepository } from '../repositories/user.repository.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.utils.js';
import { ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } from '../config.js';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: maxAge
});

export const register = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const id = await UserRepository.create({ email, password, role });
    res.status(201).send({ message: 'Usuario registrado con éxito', id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await UserRepository.login({ email, password, role });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('accessToken', accessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE));
    res.cookie('refreshToken', refreshToken, cookieOptions(REFRESH_TOKEN_MAX_AGE));

    res.send({ user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const refreshTokenHandler = async (req, res) => {
  const currentRefreshToken = req.cookies.refreshToken;
  if (!currentRefreshToken) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  try {
    const decoded = await verifyToken(currentRefreshToken);

    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      res.clearCookie('accessToken', cookieOptions(0));
      res.clearCookie('refreshToken', cookieOptions(0));
      return res.status(403).json({ error: 'Invalid refresh token - user not found' });
    }

    const newAccessToken = generateAccessToken(user);

    res.cookie('accessToken', newAccessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE));

    res.json({ message: 'Access token refreshed' });
  } catch (err) {
    res.clearCookie('accessToken', cookieOptions(0));
    res.clearCookie('refreshToken', cookieOptions(0));
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('accessToken', cookieOptions(0));
  res.clearCookie('refreshToken', cookieOptions(0));
  res.send({ success: true, message: 'Logout exitoso' });
};

export const getProfile = async (req, res) => {
  res.json({ message: 'Esta es una ruta protegida', user: req.user });
};