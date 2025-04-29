import express from 'express'
import cookieParser from 'cookie-parser'
import { PORT } from './config.js'
import authRouter from './routes/auth.routes.js' // Importar el router de autenticación

const app = express()

// Middlewares globales
app.use(express.json())
app.use(cookieParser())

// Configurar CORS middleware (Permitir credenciales)
app.use((req, res, next) => {
  // Asegúrate que el puerto coincida con tu frontend (Vite suele usar 5173 por defecto)
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'] // Añade los orígenes permitidos
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Credentials', 'true') // Permitir envío de cookies
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200) // Responder OK a las pre-flight requests
  }
  next()
})

// Rutas
app.get('/', (req, res) => {
  res.send('API Backend P01 is running!')
})

// Montar el router de autenticación bajo un prefijo (opcional pero recomendado)
app.use('/api/auth', authRouter) // Todas las rutas en auth.routes.js estarán bajo /api/auth/...

// Manejo de errores básico (opcional)
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})