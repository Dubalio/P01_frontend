const API_BASE_URL = 'http://localhost:5000/api/auth';

const fetchWithCredentials = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
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
    error.code = errorData.code;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
  } else {
      return null;
  }
};


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
   await fetchWithCredentials(`${API_BASE_URL}/logout`, {
    method: 'POST',
  });
   return { success: true };
};

export const refreshToken = async () => {
  try {
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
    return await fetchWithCredentials(url);
  } catch (error) {
    if (error.code === 'TOKEN_EXPIRED') {
      console.log("Access token expired, attempting refresh...");
      const refreshed = await refreshToken();
      if (refreshed) {
        console.log("Token refreshed, retrying original request...");
        return await fetchWithCredentials(url);
      } else {
        console.error("Refresh token failed. User needs to log in again.");
        throw new Error("Authentication required.");
      }
    }
    throw error;
  }
};

export const getProfile = async () => {
    return fetchProtectedData('/profile');
}