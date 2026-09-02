// apiClient.js
// Wrapper nativo con 'fetch' para inyectar automáticamente el JWT en todas las peticiones.

const BASE_URL = 'https://viafaagencia.onrender.com';

const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición');
  }

  return data;
};

export default apiClient;
