export default defineNuxtRouteMiddleware(async (to, from) => {
    // Solo ejecutar en el cliente
    if (process.server) return;
  
    const { $auth } = useNuxtApp();
  
    // Verificar si el usuario está autenticado
    const isAuthenticated = $auth.isAuthenticated();
  
    if (!isAuthenticated) {
      // Si no está autenticado, redirigir al login
      return navigateTo('/login');
    }
  
    // Si está autenticado, verificar que el token sea válido
    const isValidToken = await $auth.verifyToken();
  
    if (!isValidToken) {
      // Si el token no es válido, redirigir al login
      return navigateTo('/login');
    }
  });