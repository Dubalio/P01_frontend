import React, { useState } from 'react';
import { processDocuments } from '../services/api';

const ProcessDataButton = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleProcess = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await processDocuments();
      setResult({
        success: true,
        message: response.message || 'Procesamiento completado',
        data: response.result
      });
    } catch (error) {
      setResult({
        success: false,
        message: error.message || 'Error en el procesamiento'
      });
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
        {loading ? 'Procesando PDFs...' : 'Procesar PDFs de hoy'}
      </button>
      
      {result && (
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