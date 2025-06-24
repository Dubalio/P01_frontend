import React from 'react';

function SearchBar({ terminoBusqueda, setTerminoBusqueda, filtro, setFiltro, buscarEmpresas }) {
  const handleKeyDown = (e) => { if (e.key === 'Enter') buscarEmpresas(); };

  return (
    <div className="search-bar">
      <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
        <option value="todos">Todos</option>
        <option value="razonSocial">Razón Social</option>
        <option value="fundadores">Fundadores</option>
        <option value="fecha">Fecha</option>
      </select>
      <div className="input-con-lupa">
        <span className="icono-lupa">🔍</span>
        <input
          type="text"
          placeholder="Buscar..."
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button onClick={buscarEmpresas}>Buscar</button>
    </div>
  );
}

export default SearchBar;