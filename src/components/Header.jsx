import React from 'react';

function Header({ modoOscuro, toggleModoOscuro }) {
  return (
    <div className="header">
      <h1>P01 - Listado de Empresas</h1>
      <div className="modo-toggle" onClick={toggleModoOscuro}>
        {modoOscuro ? '🌙' : '☀️'}
        <div className={`switch ${modoOscuro ? 'active' : ''}`}></div>
      </div>
    </div>
  );
}

export default Header;