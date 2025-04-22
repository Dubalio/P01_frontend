
import React, { useState, useEffect } from 'react';
import datosEmpresas from './data/datos.json';
import './index.css';

function App() {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [resultados, setResultados] = useState([]);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [formatoExportacion, setFormatoExportacion] = useState('');

  const toggleModoOscuro = () => setModoOscuro(!modoOscuro);

  const buscarEmpresas = () => {
    const texto = terminoBusqueda.toLowerCase();
    const filtrados = datosEmpresas.filter((empresa) => {
      if (filtro === 'rut') return empresa.rut.toLowerCase().includes(texto);
      if (filtro === 'razonSocial') return empresa.razonSocial.toLowerCase().includes(texto);
      if (filtro === 'accionista') return empresa.accionistas.some(a => a.toLowerCase().includes(texto));
      return (
        empresa.rut.toLowerCase().includes(texto) ||
        empresa.razonSocial.toLowerCase().includes(texto) ||
        empresa.accionistas.some(a => a.toLowerCase().includes(texto))
      );
    });
    setResultados(filtrados);
  };

  const handleInputChange = (e) => setTerminoBusqueda(e.target.value);
  const handleKeyDown = (e) => { if (e.key === 'Enter') buscarEmpresas(); }

  const exportarResultados = () => {
    if (formatoExportacion === 'json') {
      const blob = new Blob([JSON.stringify(resultados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resultados.json';
      a.click();
      URL.revokeObjectURL(url);
    } else if (formatoExportacion === 'csv') {
      const encabezados = ['RUT', 'Razón Social', 'Accionistas'];
      const filas = resultados.map(e => [
        e.rut,
        e.razonSocial,
        `"${e.accionistas.join('; ')}"`
      ]);
      const contenido = [encabezados, ...filas].map(f => f.join(',')).join('\n');
      const blob = new Blob([contenido], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resultados.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    document.body.className = modoOscuro ? 'dark' : '';
  }, [modoOscuro]);

  return (
    <div className="container">
      <div className="header">
        <h1>P01 - Listado de Empresas</h1>
        <div className="modo-toggle" onClick={toggleModoOscuro}>
          {modoOscuro ? '🌙' : '☀️'}
          <div className={`switch ${modoOscuro ? 'active' : ''}`}></div>
        </div>
      </div>

      <p className="busqueda-texto">Busca accionistas o empresas por su nombre o RUT</p>

      <div className="search-bar">
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="rut">RUT</option>
          <option value="razonSocial">Razón Social</option>
          <option value="accionista">Accionista</option>
        </select>

        <div className="input-con-lupa">
          <span className="icono-lupa">🔍</span>
          <input
            type="text"
            placeholder="Buscar..."
            value={terminoBusqueda}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button onClick={buscarEmpresas}>Buscar</button>
      </div>

      {resultados.length > 0 && (
        <>
          <p className="contador-resultados">
            Se encontraron {resultados.length} {resultados.length === 1 ? 'empresa' : 'empresas'}
          </p>

          {resultados.map((empresa, index) => (
            <div key={index} className="result-card">
              <p><strong>RUT:</strong> {empresa.rut}</p>
              <p><strong>Razón Social:</strong> {empresa.razonSocial}</p>
              <p><strong>Accionistas:</strong> {empresa.accionistas.join(', ')}</p>
            </div>
          ))}
        </>
      )}

      <div className="acciones-contenedor">
        <button className="acceder-boton">Acceder</button>
        <select
          value={formatoExportacion}
          onChange={(e) => {
            setFormatoExportacion('');
            if (e.target.value !== '') {
              setFormatoExportacion(e.target.value);
              setTimeout(() => exportarResultados(), 100);
            }
          }}
          className="exportar-select"
        >
          <option value="">Descargar archivo</option>
          <option value="json">Exportar como JSON</option>
          <option value="csv">Exportar como CSV</option>
        </select>
      </div>
    </div>
  );
}

export default App;
