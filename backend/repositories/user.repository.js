import User from '../models/user.model.js';

export class UserRepository {
  static validateEmail (email) {
    if (typeof email !== 'string') {
      throw new Error('Email debe ser un texto');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email con formato inválido');
    }
    return true;
  }

  static validatePassword (password) {
    if (typeof password !== 'string') {
      throw new Error('Password debe ser un texto');
    }
    if (password.length < 6) {
      throw new Error('Password debe contener al menos 6 caracteres');
    }
    return true;
  }

  static async create ({ email, password, role }) {
    this.validateEmail(email);
    this.validatePassword(password);

    try {
      const newUser = new User({ email, password, role });
      await newUser.save();
      return newUser._id;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Email ya registrado');
      }
      throw new Error(error.message || 'Error al crear usuario');
    }
  }

  static async login ({ email, password, role }) {
    this.validateEmail(email);
    this.validatePassword(password);

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Email no registrado');
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new Error('Password incorrecto');
    }

    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }

  static async findById (id) {
    const user = await User.findById(id).select('-password');
    return user;
  }
}