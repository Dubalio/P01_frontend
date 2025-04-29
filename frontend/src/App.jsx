// filepath: c:\Users\dubal\Documents\UAI\SEMESTRE 9\PROGRA PROFESIONAL\P01\frontend\src\App.jsx
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import ExportOptions from './components/ExportOptions';
import Login from './components/Login';
import Register from './components/Register';
// Importa las funciones de API necesarias
import { logoutUser, getProfile } from './services/api';
import datosEmpresas from './data/datos.json'; // Considera cargar esto desde el backend si es dinámico
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [resultados, setResultados] = useState([]);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Estado para verificar sesión inicial

  useEffect(() => {
    document.body.className = modoOscuro ? 'dark' : '';
  }, [modoOscuro]);

  // Verificar sesión al cargar la app
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Intenta obtener datos de una ruta protegida
        const profileData = await getProfile();
        setUser(profileData.user); // Establece el usuario si la sesión es válida
      } catch (error) {
        console.log("No active session found or session expired:", error.message);
        setUser(null); // Asegúrate de que el usuario sea null si hay error
      } finally {
        setIsLoading(false); // Termina la carga inicial
      }
    };
    checkSession();
  }, []); // Se ejecuta solo una vez al montar el componente


  const buscarEmpresas = () => {
    // ... (lógica de búsqueda sin cambios)
    const texto = terminoBusqueda.toLowerCase();
    const filtrados = datosEmpresas.filter((empresa) => {
      if (filtro === 'razonSocial') return empresa.razon_social.toLowerCase().includes(texto);
      if (filtro === 'fundadores') return empresa.fundadores.some(f => f.toLowerCase().includes(texto));
      if (filtro === 'fecha') return empresa.fecha.includes(texto);
      return (
        empresa.razon_social.toLowerCase().includes(texto) ||
        empresa.fundadores.some(f => f.toLowerCase().includes(texto)) ||
        empresa.fecha.includes(texto)
      );
    });
    setResultados(filtrados);
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setShowRegister(false); // Asegúrate de volver a la vista principal
  }

  const handleLogout = async () => {
    try {
      await logoutUser(); // Llama a la API de logout
      setUser(null); // Limpia el estado del usuario en el frontend
    } catch (error) {
      console.error("Error during logout:", error);
      // Opcional: Mostrar un mensaje de error al usuario
    }
  };

  // Muestra un indicador de carga mientras se verifica la sesión
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  // Renderiza Login o Register si no hay usuario
  if (!user) {
    if (showRegister) {
      return (
        <Register
          onRegisterSuccess={() => {
            setShowRegister(false);
            // Opcional: Mostrar mensaje de éxito o redirigir a login
          }}
          switchToLogin={() => setShowRegister(false)}
        />
      );
    } else {
      return (
        <Login
          onLogin={handleLoginSuccess} // Usa la nueva función handler
          switchToRegister={() => setShowRegister(true)}
        />
      );
    }
  }

  // Renderiza la app principal si hay usuario
  return (
    <div className="container">
      <Header modoOscuro={modoOscuro} toggleModoOscuro={() => setModoOscuro(!modoOscuro)} />
      <div className="user-info">
        {/* Asegúrate de que user no sea null antes de acceder a sus propiedades */}
        <p>Bienvenido, {user.role === 'profesor' ? 'Profesor' : 'Estudiante'} ({user.email})</p>
        <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      <SearchBar
        terminoBusqueda={terminoBusqueda}
        setTerminoBusqueda={setTerminoBusqueda}
        filtro={filtro}
        setFiltro={setFiltro}
        buscarEmpresas={buscarEmpresas}
      />
      <ResultsList resultados={resultados} />
      <ExportOptions resultados={resultados} />
    </div>
  );
}

export default App;