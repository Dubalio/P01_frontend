import React, { useState } from 'react';
import { processDocuments } from '../services/api';

const ProcessDataButton = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  
const handleProcess = async () => {
  setLoading(true);
  setResult(null);
  setStatusMessage('Procesando información del Diario Oficial...');
  
  try {
    const response = await processDocuments();
    setResult({
      success: true,
      message: response.message || 'Procesamiento completado',
      data: response.result
    });
    setStatusMessage('Procesamiento completado');
    
    // Llamar a la función para recargar datos
    if (props.onProcessComplete) {
      props.onProcessComplete();
    }
  } catch (error) {
    // Resto del código de manejo de errores
  } finally {
    setLoading(false);
  }
};
  
  return (
    <div className="process-container">
      <button 
        onClick={handleProcess} 
        disabled={loading}
        className="process-button"
      >
        {loading ? 'Procesando...' : 'Procesar PDFs de hoy'}
      </button>
      
      {loading && (
        <div className="processing-status">
          <p>{statusMessage}</p>
        </div>
      )}
      
      {!loading && result && (
        <div className={`result-box ${result.success ? 'success' : 'error'}`}>
          <h4>{result.success ? '✅ Éxito' : '❌ Error'}</h4>
          <p>{result.message}</p>
          {result.success && result.data && (
            <div>
              <p>Documentos procesados: {result.data.procesados || 0}</p>
              <p>Documentos omitidos: {result.data.saltados || 0}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessDataButton;