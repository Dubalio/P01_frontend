import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../config.js';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Por favor, introduce un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  role: {
    type: String,
    enum: {
        values: ['profesor', 'estudiante'],
        message: '{VALUE} no es un rol válido'
    },
    default: 'estudiante'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

export default User;