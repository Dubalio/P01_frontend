import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard'; // Nuevo componente para organizar mejor
import { getProfile } from './services/api';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const profileData = await getProfile();
        setUser(profileData.user);
      } catch (error) {
        console.log("No active session found:", error.message);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    navigate('/dashboard');
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login onLogin={handleLoginSuccess} /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register onRegisterSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default App;