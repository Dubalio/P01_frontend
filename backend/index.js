import express from 'express'
import { PORT } from './config.js'
import { UserRepository } from './user-repository.js'

const app = express()
app.use(express.json())

// Configurar CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/login', (req, res) => {
  const { email, password, role } = req.body
  try {
    const user = UserRepository.login({ email, password, role })
    res.send({ user })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})

app.post('/register', (req, res) => {
  const { email, password, role } = req.body
  try {
    const id = UserRepository.create({ email, password, role })
    res.send({ id })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post('/logout', (req, res) => {
  res.send({ success: true })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})