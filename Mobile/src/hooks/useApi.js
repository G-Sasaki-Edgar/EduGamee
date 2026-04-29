import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../constants/Config';

export const useApi = () => {
  const { token } = useAuth();

  const apiRequest = async (endpoint, options = {}, requireToken = true) => {
    try {
      const url = `${API_URL}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (requireToken && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = 'Error en la petición';
        if (response.status === 401) {
          if (requireToken) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          } else {
            errorMessage = 'Credenciales inválidas o usuario ya existe.';
          }
        } else if (response.status === 403) {
          errorMessage = 'No tienes permisos para realizar esta acción.';
        } else if (response.status === 404) {
          errorMessage = 'Recurso no encontrado.';
        } else if (response.status >= 500) {
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
        } else {
          const errorData = await response.json().catch(() => ({}));
          errorMessage = errorData.detail || errorData.message || `Error ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      // Para respuestas vacías (como 204), devolver null
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // Error de red, servidor no responde
        throw new Error('No se pudo conectar al servidor. Verifica que el contenedor de Django esté corriendo en 0.0.0.0:8000.');
      }
      // Re-lanzar errores personalizados
      throw error;
    }
  };

  const checkServer = async () => {
    try {
      await fetch(`${API_URL.replace('/api', '')}`, { method: 'HEAD' });
      return true;
    } catch {
      return false;
    }
  };

  return { apiRequest, checkServer };
};