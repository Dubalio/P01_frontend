// filepath: c:\Users\dubal\Documents\UAI\SEMESTRE 9\PROGRA PROFESIONAL\P01\backend\index.js
import express from 'express'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser' // Importar cookie-parser
import { PORT, SECRET_JWT_KEY, ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } from './config.js' // Importar configuraciones JWT
import { UserRepository } from './user-repository.js'

const app = express()
app.use(express.json())
app.use(cookieParser()) // Usar cookie-parser

// Configurar CORS middleware (Permitir credenciales)
app.use((req, res, next) => {
  // Ajusta 'http://localhost:3000' a la URL de tu frontend si es diferente
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true'); // Permitir envío de cookies
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// --- Funciones Auxiliares JWT ---
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, SECRET_JWT_KEY, { expiresIn: ACCESS_TOKEN_EXPIRATION });
}

const generateRefreshToken = (user) => {
  // Podrías querer almacenar los refresh tokens en la DB para invalidarlos si es necesario
  return jwt.sign({ id: user._id }, SECRET_JWT_KEY, { expiresIn: REFRESH_TOKEN_EXPIRATION });
}

// --- Middleware de Autenticación ---
const authenticateToken = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ error: 'Acceso denegado: No hay token' });
  }

  jwt.verify(accessToken, SECRET_JWT_KEY, (err, user) => {
    if (err) {
      // Si el token es inválido o expiró
      if (err.name === 'TokenExpiredError') {
         return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
      }
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user; // Adjunta la información del usuario al request
    next();
  });
};


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/login', (req, res) => {
  const { email, password, role } = req.body
  try {
    const user = UserRepository.login({ email, password, role }) // Asume que login devuelve el usuario sin password

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Configura las cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true, // No accesible por JS
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'lax', // O 'strict'
      maxAge: 15 * 60 * 1000 // 15 minutos (igual que ACCESS_TOKEN_EXPIRATION en ms)
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días (igual que REFRESH_TOKEN_EXPIRATION en ms)
    });

    res.send({ user }); // Envía datos del usuario (sin password)

  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})

app.post('/register', (req, res) => {
  const { email, password, role } = req.body
  try {
    const id = UserRepository.create({ email, password, role })
    // Podrías loguear automáticamente al usuario aquí si quisieras
    res.status(201).send({ message: 'Usuario registrado con éxito', id })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// --- Nueva Ruta para Refrescar Token ---
app.post('/refresh', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided' });
    }

    jwt.verify(refreshToken, SECRET_JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Opcional: Verificar si el refresh token está revocado en la DB

        // Generar nuevo access token (necesitas obtener los datos del usuario)
        // Esta parte asume que puedes obtener el usuario solo con el ID del token
        // Podrías necesitar buscar en la DB si no guardaste role/email en el refresh token
        const userPayload = { _id: decoded.id /*, email: ..., role: ... */ }; // Completa si es necesario
        const newAccessToken = generateAccessToken(userPayload);

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutos
        });

        res.json({ message: 'Access token refreshed' });
    });
});


app.post('/logout', (req, res) => {
  // Limpia las cookies
  res.clearCookie('accessToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  res.send({ success: true, message: 'Logout exitoso' })
})

// --- Ruta Protegida de Ejemplo ---
app.get('/profile', authenticateToken, (req, res) => {
  // req.user contiene la info del token verificado
  res.json({ message: 'Esta es una ruta protegida', user: req.user });
});


// La ruta /protected original parece incompleta, la comento o elimino
// app.get('/protected', (req, res) => {
//     res.render('protected')
// })

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})