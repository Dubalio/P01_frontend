import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

test('muestra el saludo con el email del usuario', () => {
  const user = { role: 'profesor', email: 'test@correo.com' };
  render(<Dashboard user={user} setUser={() => {}} />);
  expect(screen.getByText(/Bienvenido, Profesor/i)).toBeInTheDocument();
  expect(screen.getByText(/test@correo.com/i)).toBeInTheDocument();
});

test('muestra el botón Cerrar Sesión', () => {
  const user = { role: 'profesor', email: 'test@correo.com' };
  render(<Dashboard user={user} setUser={() => {}} />);
  expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
});

test('muestra el botón Recargar datos', () => {
  const user = { role: 'estudiante', email: 'alumno@correo.com' };
  render(<Dashboard user={user} setUser={() => {}} />);
  expect(screen.getByRole('button', { name: /recargar datos/i })).toBeInTheDocument();
});
