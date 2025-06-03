import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import SearchBar from './SearchBar';
import ResultsList from './ResultsList';
import ExportOptions from './ExportOptions';
import ProcessDataButton from './ProcessDataButton';
import { logoutUser, getDocuments } from '../services/api';
import './Dashboard.css';

function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [resultados, setResultados] = useState([]);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [empresasData, setEmpresasData] = useState([]); 
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    document.body.className = modoOscuro ? 'dark' : '';
  }, [modoOscuro]);

  const cargarDatos = async () => {
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

  useEffect(() => {
    cargarDatos();
  }, []);

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

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  
  const handleVerGrafo = () => {
    navigate('/graph', { state: { data: empresasData } });
  };

  return (
    <div className="container">
      <Header modoOscuro={modoOscuro} toggleModoOscuro={() => setModoOscuro(!modoOscuro)} />
      <div className="user-info">
        <p>Bienvenido, {user.role === 'profesor' ? 'Profesor' : 'Estudiante'} ({user.email})</p>
        <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      
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
      
      <div className="admin-section">
        <h3>Procesamiento de Datos</h3>
        <ProcessDataButton onProcessComplete={cargarDatos} />
      </div> 
      <div>
        <h3>Grafo de Relaciones</h3>
        <p>Aquí puedes visualizar el grafo de relaciones entre las empresas.</p>
        <button 
          onClick={handleVerGrafo}
          className="graph-button"
          disabled={empresasData.length === 0}
          style={{ marginTop: '10px' }}
        >
          Ver Grafo de Relaciones
        </button>
      </div>
    </div>
  );
}

export default Dashboard;