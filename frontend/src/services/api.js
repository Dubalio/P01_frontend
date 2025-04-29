// filepath: c:\Users\dubal\Documents\UAI\SEMESTRE 9\PROGRA PROFESIONAL\P01\frontend\src\services\api.js
const API_URL = 'http://localhost:5000'; // URL de tu backend

// Función auxiliar para manejar fetch con credenciales y errores
const fetchWithCredentials = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // ¡Importante para enviar/recibir cookies!
    ...options,
  };

  const response = await fetch(url, defaultOptions);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // Si la respuesta no es JSON
      errorData = { error: `Error ${response.status}: ${response.statusText}` };
    }
     // Adjuntar el status code al error
    const error = new Error(errorData.error || `Error ${response.status}`);
    error.status = response.status;
    error.code = errorData.code; // Añadir código de error si existe (ej: TOKEN_EXPIRED)
    throw error;
  }

  // Si la respuesta no tiene contenido (ej: 204 No Content)
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const loginUser = async (credentials) => {
  return fetchWithCredentials(`${API_URL}/login`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const registerUser = async (userData) => {
  return fetchWithCredentials(`${API_URL}/register`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const logoutUser = async () => {
  return fetchWithCredentials(`${API_URL}/logout`, {
    method: 'POST',
  });
};

// Función para intentar refrescar el token
export const refreshToken = async () => {
  try {
    await fetchWithCredentials(`${API_URL}/refresh`, { method: 'POST' });
    return true; // Refresco exitoso
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return false; // Refresco fallido
  }
};

// Ejemplo de cómo podrías interceptar llamadas API para manejar refresh
export const fetchProtectedData = async (endpoint) => {
  try {
    return await fetchWithCredentials(`${API_URL}${endpoint}`);
  } catch (error) {
    if (error.code === 'TOKEN_EXPIRED') {
      console.log("Access token expired, attempting refresh...");
      const refreshed = await refreshToken();
      if (refreshed) {
        console.log("Token refreshed, retrying original request...");
        // Reintentar la solicitud original después del refresh
        return await fetchWithCredentials(`${API_URL}${endpoint}`);
      } else {
        // Si el refresh falla, probablemente redirigir a login
        console.error("Refresh token failed. User needs to log in again.");
        // Aquí podrías llamar a una función de logout o redirigir
        throw new Error("Authentication required.");
      }
    }
    // Propagar otros errores
    throw error;
  }
};

// Ejemplo de uso para obtener datos del perfil
export const getProfile = async () => {
    return fetchProtectedData('/profile');
}