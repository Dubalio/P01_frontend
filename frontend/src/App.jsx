import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import ExportOptions from './components/ExportOptions';
import Login from './components/Login'; 
import datosEmpresas from './data/datos.json';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [resultados, setResultados] = useState([]);
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    document.body.className = modoOscuro ? 'dark' : '';
  }, [modoOscuro]);

  const buscarEmpresas = () => {
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

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="container">
      <Header modoOscuro={modoOscuro} toggleModoOscuro={() => setModoOscuro(!modoOscuro)} />
      <p>Bienvenido, {user.role === 'profesor' ? 'Profesor' : 'Estudiante'} ({user.email})</p>
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