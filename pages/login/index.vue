<template>
    <v-app>
      <v-main>
        <v-container fluid class="login-container fill-height">
          <v-row justify="center" align="center" class="fill-height">
            <v-col cols="12" sm="8" md="5" lg="4" xl="3">
              <v-card class="login-card elevation-24" rounded="xl">
                <!-- Logo y título -->
                <v-card-text class="text-center pa-8">
                  <div class="logo-container mb-6">
                    <v-avatar size="80" class="logo-avatar mb-4">
                      <v-icon size="60" color="white">mdi-calculator-variant</v-icon>
                    </v-avatar>
                    
                    <h1 class="app-title text-h4 font-weight-light mb-2">
                      Facturalize
                    </h1>
                    <p class="welcome-text text-h6 text--secondary mb-0">
                      Bienvenido a tu sistema de facturación
                    </p>
                  </div>
  
                  <!-- Formulario de login -->
                  <v-form @submit.prevent="handleLogin" ref="loginForm" class="login-form">
                    <v-text-field
                      v-model="formData.usuario"
                      label="Usuario"
                      prepend-inner-icon="mdi-account-circle"
                      :rules="usuarioRules"
                      required
                      :disabled="loading"
                      variant="outlined"
                      color="primary"
                      class="mb-3"
                      @keyup.enter="handleLogin"
                    ></v-text-field>
  
                    <v-text-field
                      v-model="formData.password"
                      :label="'Contraseña'"
                      prepend-inner-icon="mdi-lock"
                      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="showPassword ? 'text' : 'password'"
                      :rules="passwordRules"
                      required
                      :disabled="loading"
                      variant="outlined"
                      color="primary"
                      class="mb-4"
                      @click:append-inner="showPassword = !showPassword"
                      @keyup.enter="handleLogin"
                    ></v-text-field>
  
                    <v-alert
                      v-if="error"
                      type="error"
                      variant="tonal"
                      class="mb-4 text-left"
                      closable
                      @click:close="error = ''"
                    >
                      {{ error }}
                    </v-alert>
  
                    <v-btn
                      type="submit"
                      color="primary"
                      size="large"
                      block
                      :loading="loading"
                      :disabled="loading"
                      class="login-btn mb-3"
                      elevation="2"
                    >
                      <v-icon left class="mr-2">mdi-login</v-icon>
                      Iniciar Sesión
                    </v-btn>
                  </v-form>
                </v-card-text>
  
                <!-- Footer -->
                <v-divider></v-divider>
                <v-card-actions class="justify-center pa-4">
                  <small class="text--secondary">
                    © 2024 Facturalize - Sistema de Facturación
                  </small>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
          
          <!-- Elementos decorativos de fondo -->
          <div class="bg-decoration">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
          </div>
        </v-container>
      </v-main>
    </v-app>
  </template>
  
  <script setup>
  // Meta de la página
  definePageMeta({
    layout: false // No usar layout por defecto
  });
  
  // Reactive data
  const formData = ref({
    usuario: '',
    password: ''
  });
  
  const loading = ref(false);
  const error = ref('');
  const loginForm = ref(null);
  const showPassword = ref(false);
  
  // Reglas de validación
  const usuarioRules = [
    v => !!v || 'El usuario es requerido'
  ];
  
  const passwordRules = [
    v => !!v || 'La contraseña es requerida'
  ];
  
  // Obtener auth del plugin
  const { $auth } = useNuxtApp();
  
  // Función para manejar el login
  const handleLogin = async () => {
    // Validar formulario
    const { valid } = await loginForm.value.validate();
    if (!valid) return;
  
    loading.value = true;
    error.value = '';
  
    try {
      await $auth.login({
        usuario: formData.value.usuario,
        password: formData.value.password
      });
      
      // Después del login exitoso, ir a una página específica
      await navigateTo('/home'); // O cambia por la página que prefieras
      
    } catch (err) {
      console.error('Error en login:', err);
      error.value = err.data?.message || err.message || 'Error al iniciar sesión';
    } finally {
      loading.value = false;
    }
  };
  
  // Verificar si ya está logueado al cargar la página
  onMounted(() => {
    // No redirigir automáticamente desde el login
    // El usuario debe hacer login manualmente
  });
  </script>
  
  <style scoped>
  .login-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    position: relative;
    overflow: hidden;
  }
  
  .login-card {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid rgba(255, 255, 255, 0.2);
    max-width: 450px;
    margin: 0 auto;
  }
  
  .logo-container {
    position: relative;
  }
  
  .logo-avatar {
    background: linear-gradient(45deg, #2196f3, #21cbf3);
    box-shadow: 0 8px 32px rgba(33, 150, 243, 0.3);
  }
  
  .app-title {
    background: linear-gradient(45deg, #2196f3, #21cbf3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 600 !important;
    letter-spacing: -0.5px;
  }
  
  .welcome-text {
    color: #666 !important;
    font-weight: 400;
  }
  
  .login-form {
    margin-top: 2rem;
  }
  
  .login-btn {
    height: 56px !important;
    font-weight: 600;
    letter-spacing: 0.5px;
    background: linear-gradient(45deg, #2196f3, #21cbf3) !important;
  }
  
  .login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(33, 150, 243, 0.4) !important;
    transition: all 0.3s ease;
  }
  
  /* Elementos decorativos de fondo */
  .bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }
  
  .circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }
  
  .circle-1 {
    width: 200px;
    height: 200px;
    top: -100px;
    right: -100px;
    animation: float 6s ease-in-out infinite;
  }
  
  .circle-2 {
    width: 150px;
    height: 150px;
    bottom: -75px;
    left: -75px;
    animation: float 8s ease-in-out infinite reverse;
  }
  
  .circle-3 {
    width: 100px;
    height: 100px;
    top: 50%;
    right: 10%;
    animation: float 10s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  
  /* Responsividad */
  @media (max-width: 600px) {
    .login-card {
      margin: 1rem;
    }
    
    .app-title {
      font-size: 1.8rem !important;
    }
    
    .welcome-text {
      font-size: 1rem !important;
    }
  }
  
  /* Animaciones suaves */
  .v-card {
    transition: all 0.3s ease;
  }
  
  .v-text-field {
    transition: all 0.3s ease;
  }
  
  .v-btn {
    transition: all 0.3s ease;
  }
  
  /* Estilos para campos focus */
  .v-text-field--focused {
    transform: scale(1.02);
  }
  </style>