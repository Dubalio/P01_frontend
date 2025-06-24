import React from 'react';

function ResultsList({ resultados }) {
  return (
    <>
      {resultados.length > 0 && (
        <>
          <p className="contador-resultados">
            Se encontraron {resultados.length} {resultados.length === 1 ? 'empresa' : 'empresas'}
          </p>
          {resultados.map((empresa, index) => (
            <div key={index} className="result-card">
              <p><strong>Razón Social:</strong> {empresa.razon_social}</p>
              <p><strong>Fundadores:</strong> {empresa.fundadores.join(', ')}</p>
              <p><strong>Fecha:</strong> {empresa.fecha}</p>
            </div>
          ))}
        </>
      )}
    </>
  );
}

export default ResultsList;