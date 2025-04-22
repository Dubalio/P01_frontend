import React from 'react';

function ExportOptions({ resultados }) {
  const exportarResultados = (formato) => {
    if (formato === 'json') {
      const blob = new Blob([JSON.stringify(resultados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resultados.json';
      a.click();
      URL.revokeObjectURL(url);
    } else if (formato === 'csv') {
      const encabezados = ['Razón Social', 'Fundadores', 'Fecha'];
      const filas = resultados.map(e => [
        e.razon_social,
        `"${e.fundadores.join('; ')}"`,
        e.fecha
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

  return (
    <div className="acciones-contenedor">
      <select
        onChange={(e) => {
          if (e.target.value) exportarResultados(e.target.value);
        }}
        className="exportar-select"
      >
        <option value="">Descargar archivo</option>
        <option value="json">Exportar como JSON</option>
        <option value="csv">Exportar como CSV</option>
      </select>
    </div>
  );
}

export default ExportOptions;