<template>
  <v-layout class="rounded rounded-md">
    <v-navigation-drawer expand-on-hover rail class="d-flex flex-column">
      <div>
        <v-list>
          <v-list-item
            :prepend-avatar="logoImage"
            subtitle="Rapido y Eficaz"
            title="Facturalize"
          ></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item
            prepend-icon="mdi-home"
            title="Home"
            to="/home"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-cash-register"
            title="Caja"
            to="/caja"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-account-multiple"
            title="Clientes"
            to="/clientes"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-account"
            title="Colaboradores"
            to="/colaboradores"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-package-variant"
            title="Inventario"
            to="/inventario"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-chart-bar"
            title="Reportes"
            to="/reporte"
          ></v-list-item>
          <v-list-group value="Parametros">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-cog"
                title="Parámetros"
                class="parameter-group"
              ></v-list-item>
            </template>

            <v-list-item
              v-for="subItem in parameterMenuItems"
              :key="subItem.title"
              :prepend-icon="subItem.icon"
              :title="subItem.title"
              :to="subItem.to"
              :value="subItem.title.toLowerCase()"
              class="parameter-item"
            >
              <template v-slot:prepend>
                <v-icon size="20" class="me-2">{{ subItem.icon }}</v-icon>
              </template>
              <template v-slot:title>
                <span class="text-truncate" style="max-width: 180px">{{
                  subItem.title
                }}</span>
              </template>
            </v-list-item>
          </v-list-group>
        </v-list>
      </div>

      <!-- Botón de cerrar sesión al final -->
      <div class="mt-auto">
        <v-divider></v-divider>
        <v-list density="compact">
          <v-list-item
            prepend-icon="mdi-logout"
            title="Cerrar Sesión"
            @click="logout"
            class="logout-item"
          ></v-list-item>
        </v-list>
      </div>
    </v-navigation-drawer>

    <v-app-bar title=""
      ><v-spacer></v-spacer>
      <v-btn class="mx-2" icon variant="text" @click="toggleTheme">
        <v-icon>{{
          theme.global.current.value.dark
            ? "mdi-weather-sunny"
            : "mdi-weather-night"
        }}</v-icon>
      </v-btn></v-app-bar
    >

    <v-main
      class="d-flex align-center justify-center"
      style="min-height: 300px"
    >
      <slot />
    </v-main>
  </v-layout>
</template>

<script setup>
import { useTheme } from "vuetify";
import { onMounted } from "vue";
import { ref } from "vue";
import logoImage from "@/assets/logo.png";

const theme = useTheme();

// Función para cerrar sesión
const { $auth } = useNuxtApp();

const logout = async () => {
  try {
    await $auth.logout();
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // Forzar limpieza y redirección si hay error
    $auth.removeToken();
    await navigateTo('/login');
  }
};

function toggleTheme() {
  const newTheme = theme.global.current.value.dark
    ? "myCustomLightTheme"
    : "dark";
  theme.global.name.value = newTheme;

  // Solo acceder a localStorage en el cliente
  if (process.client) {
    window.localStorage.setItem("theme", newTheme);
  }
}

const parameterMenuItems = [
  { title: "Proveedores", to: "/proveedores", icon: "mdi-truck-delivery" },
  {
    title: "Categoría",
    to: "/categoria",
    icon: "mdi-shape-outline",
  },
  { title: "Unidad de Medida", to: "/unidad", icon: "mdi-scale" },
];

// Inicializar el tema solo en el cliente
onMounted(() => {
  if (process.client) {
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme) {
      theme.global.name.value = savedTheme;
    }
  }
});
</script>

<style scoped>
.v-btn--icon {
  transition: transform 0.2s ease-in-out;
}

.v-btn--icon:hover {
  transform: scale(1.1);
}

:deep(.parameter-group) {
  margin-bottom: 4px;
}

:deep(.parameter-item) {
  padding-left: 12px !important;
  min-height: 40px !important;
}

:deep(.v-list-group__items .v-list-item) {
  padding-left: 16px;
}

:deep(.v-list-group--prepend) {
  padding-inline-start: 0px !important;
}

:deep(.v-list-item--active) {
  background-color: rgb(var(--v-theme-primary), 0.1) !important;
}

:deep(.v-list-item--active::before) {
  opacity: 0 !important;
}

:deep(.v-list-group__items .v-icon) {
  opacity: 0.8;
}

/* Estilos para el botón de logout */
:deep(.logout-item) {
  color: rgb(var(--v-theme-error)) !important;
}

:deep(.logout-item:hover) {
  background-color: rgba(var(--v-theme-error), 0.1) !important;
}

:deep(.logout-item .v-icon) {
  color: rgb(var(--v-theme-error)) !important;
}
</style>