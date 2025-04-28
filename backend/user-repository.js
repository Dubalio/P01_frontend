import DBLocal from 'db-local'
import crypto from 'node:crypto'
import bcrypt from 'bcrypt'

import { SALT_ROUNDS } from './config.js'

const { Schema } = new DBLocal({ path: './db' })

const User = Schema('User', {
  _id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['profesor', 'estudiante'], default: 'estudiante' }
})

export class UserRepository {
    static validateEmail(email) {
        if (typeof email !== 'string') {
          throw new Error('Email debe ser un texto')
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          throw new Error('Email con formato inválido')
        }
        
        return true
      }
      static validatePassword(password) {
        if (typeof password !== 'string') {
          throw new Error('Password debe ser un texto')
        }
        
        if (password.length < 6) {
          throw new Error('Password debe contener al menos 6 caracteres')
        }
        
        return true
      }

  static create ({ email, password, role }) {
    this.validateEmail(email)
    this.validatePassword(password)
    const user= User.findOne ({ email })
    if (user) {
      throw new Error('Email ya registrado')
    }
    const id = crypto.randomUUID()

    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS)

    User.create({
        _id: id,
        email,
        password: hashedPassword,
        role
    }).save()
    return id
  }


  static login ({ email, password, role }) {
    this.validateEmail(email)
    this.validatePassword(password)
    const user = User.findOne({ email })
    if (!user) {
      throw new Error('Email no registrado')
    }
    const isValid = bcrypt.compareSync(password, user.password)
    if (!isValid) {
      throw new Error('Password incorrecto')
    }

    const {password: _, ...userWithoutPassword} = user
    return userWithoutPassword
  }
}
