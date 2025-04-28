import express from 'express'
import { PORT } from './config.js'
import { UserRepository } from './user-repository.js'

const app = express()
app.use(express.json()) 

app.get('/', (res, req) => {
  res.send('Hello World!')
})

app.post('/login', (req, res) => {})

app.post('/register', (req, res) => {
    const { email, password, role } = req.body
    try {
        const id = UserRepository.create({ email, password, role })
        res.send({ id })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

app.post('/logout', (req, res) => {})

app.get('/protected', (req, res) => {})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
