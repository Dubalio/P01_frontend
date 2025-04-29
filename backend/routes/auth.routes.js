import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { authenticateToken } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refreshTokenHandler)
router.post('/logout', authController.logout)

// Aplicar middleware de autenticación a esta ruta
router.get('/profile', authenticateToken, authController.getProfile)

export default router