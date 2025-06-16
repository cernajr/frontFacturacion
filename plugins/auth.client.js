export default defineNuxtPlugin(() => {
  // Plugin para inicializar autenticación en el cliente
  
  // Función para obtener token del localStorage
  const getToken = () => {
    if (process.client) {
      return localStorage.getItem('auth_token');
    }
    return null;
  };

  // Función para guardar token
  const setToken = (token) => {
    if (process.client) {
      localStorage.setItem('auth_token', token);
    }
  };

  // Función para eliminar token
  const removeToken = () => {
    if (process.client) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  };

  // Función para obtener usuario
  const getUser = () => {
    if (process.client) {
      const user = localStorage.getItem('auth_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  };

  // Función para guardar usuario
  const setUser = (user) => {
    if (process.client) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  };

  // Función para verificar si está autenticado
  const isAuthenticated = () => {
    return !!getToken();
  };

  // Función de login
  const login = async (credentials) => {
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          usuario: credentials.usuario,
          password: credentials.password
        }
      });

      if (response.success) {
        setToken(response.token);
        setUser(response.usuario);
        return { success: true, user: response.usuario };
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      // Llamar al endpoint de logout (opcional)
      await $fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar datos locales
      removeToken();
      // Redirigir al login
      await navigateTo('/login');
    }
  };

  // Función para verificar token
  const verifyToken = async () => {
    try {
      const token = getToken();
      if (!token) {
        return false;
      }

      const response = await $fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.success) {
        setUser(response.usuario);
        return true;
      } else {
        removeToken();
        return false;
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      removeToken();
      return false;
    }
  };

  // Proveer las funciones globalmente
  return {
    provide: {
      auth: {
        login,
        logout,
        verifyToken,
        isAuthenticated,
        getToken,
        getUser,
        setToken,
        setUser,
        removeToken
      }
    }
  };
});