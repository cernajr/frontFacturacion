export default defineNuxtRouteMiddleware((to, from) => {
    // Solo ejecutar en el cliente
    if (process.server) return;
  
    const { $auth } = useNuxtApp();
  
    // Si está en la página de login, no hacer nada
    if (to.path === '/login') return;
  
    // Si no está autenticado, redirigir al login
    if (!$auth.isAuthenticated()) {
      return navigateTo('/login');
    }
  });