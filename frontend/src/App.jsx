import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import ExportOptions from './components/ExportOptions';
import Login from './components/Login';
import Register from './components/Register';
import ProcessDataButton from './components/ProcessDataButton';

import { logoutUser, getProfile,getDocuments } from './services/api';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [resultados, setResultados] = useState([]);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [empresasData, setEmpresasData] = useState([]); 
  const [dataLoading, setDataLoading] = useState(false); 

  useEffect(() => {
    document.body.className = modoOscuro ? 'dark' : '';
  }, [modoOscuro]);


  useEffect(() => {
    const checkSession = async () => {
      try {

        const profileData = await getProfile();
        setUser(profileData.user);
      } catch (error) {
        console.log("No active session found or session expired:", error.message);
        setUser(null); 
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const cargarDatos = async () => {
    if (!user) return;
    
    setDataLoading(true);
    try {
      const response = await getDocuments();
      if (response && response.success && response.documents) {
        setEmpresasData(response.documents);
      }
    } catch (error) {
      console.error("Error cargando documentos:", error);
    } finally {
      setDataLoading(false);
    }
  };

  // Efecto para cargar datos cuando el usuario inicia sesión
  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user]);


  const buscarEmpresas = () => {
    const texto = terminoBusqueda.toLowerCase();
    const filtrados = empresasData.filter((empresa) => {
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
    setShowRegister(false); 
  }

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null); 
    } catch (error) {
      console.error("Error during logout:", error);

    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    if (showRegister) {
      return (
        <Register
          onRegisterSuccess={() => {
            setShowRegister(false);

          }}
          switchToLogin={() => setShowRegister(false)}
        />
      );
    } else {
      return (
        <Login
          onLogin={handleLoginSuccess} 
          switchToRegister={() => setShowRegister(true)}
        />
      );
    }
  }


  return (
    <div className="container">
      <Header modoOscuro={modoOscuro} toggleModoOscuro={() => setModoOscuro(!modoOscuro)} />
      <div className="user-info">
        <p>Bienvenido, {user.role === 'profesor' ? 'Profesor' : 'Estudiante'} ({user.email})</p>
        <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      
      {/* Botón para recargar datos */}
      <div className="reload-container">
        <button 
          onClick={cargarDatos} 
          disabled={dataLoading} 
          className="reload-button"
        >
          {dataLoading ? 'Cargando datos...' : 'Recargar datos'}
        </button>
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
      {user && (
        <div className="admin-section">
          <h3>Procesamiento de Datos</h3>
          <ProcessDataButton onProcessComplete={cargarDatos} />
        </div>
      )}
    </div>
  );
}

export default App;