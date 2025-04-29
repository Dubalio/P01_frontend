const API_BASE_URL = 'http://localhost:5000/api/auth'; // URL base de la API de autenticación

// --- Función auxiliar para manejar fetch con credenciales y errores ---
// --- ASEGÚRATE DE QUE ESTA FUNCIÓN ESTÉ DEFINIDA AQUÍ ---
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
      errorData = { error: `Error ${response.status}: ${response.statusText}` };
    }
    const error = new Error(errorData.error || `Error ${response.status}`);
    error.status = response.status;
    error.code = errorData.code; // Añadir código de error si existe (ej: TOKEN_EXPIRED)
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  // Solo intenta parsear como JSON si hay contenido
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
  } else {
      // Si no es JSON, podrías devolver el texto o null, según necesites
      // return response.text();
      return null; // O manejarlo como prefieras
  }
};
// --- FIN DE LA DEFINICIÓN DE fetchWithCredentials ---


// --- Funciones Exportadas (que usan fetchWithCredentials) ---

export const loginUser = async (credentials) => {
  return fetchWithCredentials(`${API_BASE_URL}/login`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const registerUser = async (userData) => {
  return fetchWithCredentials(`${API_BASE_URL}/register`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const logoutUser = async () => {
  // Logout podría no devolver JSON, ajusta fetchWithCredentials si es necesario o maneja aquí
   await fetchWithCredentials(`${API_BASE_URL}/logout`, {
    method: 'POST',
  });
   return { success: true }; // Asume éxito si no hay error
};

export const refreshToken = async () => {
  try {
    // Refresh podría no devolver JSON, ajusta fetchWithCredentials o maneja aquí
    await fetchWithCredentials(`${API_BASE_URL}/refresh`, { method: 'POST' });
    return true;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return false;
  }
};

export const fetchProtectedData = async (endpoint) => {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    return await fetchWithCredentials(url); // Llama a la función definida arriba
  } catch (error) {
    if (error.code === 'TOKEN_EXPIRED') {
      console.log("Access token expired, attempting refresh...");
      const refreshed = await refreshToken();
      if (refreshed) {
        console.log("Token refreshed, retrying original request...");
        return await fetchWithCredentials(url); // Reintenta
      } else {
        console.error("Refresh token failed. User needs to log in again.");
        // Aquí podrías forzar un logout o redirigir
        // await logoutUser(); // Opcional: limpiar cookies si el refresh falla
        // window.location.href = '/login'; // Opcional: redirigir
        throw new Error("Authentication required.");
      }
    }
    throw error;
  }
};

export const getProfile = async () => {
    return fetchProtectedData('/profile');
}