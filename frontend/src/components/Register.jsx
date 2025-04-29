import React, { useState } from 'react';
import { registerUser } from '../services/api';
import './Login.css';

function Register({ onRegisterSuccess, switchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('estudiante');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validaciones básicas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const result = await registerUser({ email, password, role });
      setLoading(false);
      onRegisterSuccess(result);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Correo:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="role">Rol:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="estudiante">Estudiante</option>
            <option value="profesor">Profesor</option>
          </select>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      <p className="switch-auth">
        ¿Ya tienes una cuenta? <a href="#" onClick={switchToLogin}>Iniciar Sesión</a>
      </p>
    </div>
  );
}

export default Register;