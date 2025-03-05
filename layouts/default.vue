<template>
  <v-layout class="rounded rounded-md">
    <v-navigation-drawer expand-on-hover rail>
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
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          value="dashboard"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account-multiple"
          title="Clientes"
          value="clientes"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-package-variant-closed"
          title="Productos"
          value="productos"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-file-document-outline"
          title="Facturas"
          value="facturas"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-file-document-edit-outline"
          title="Cotizaciones"
          value="cotizaciones"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-truck"
          title="Proveedores"
          value="proveedores"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cart"
          title="Compras"
          value="compras"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-chart-bar"
          title="Reportes"
          value="reportes"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cog"
          title="Configuración"
          value="configuracion"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-help-circle"
          title="Ayuda"
          value="ayuda"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-logout"
          title="Cerrar Sesión"
          value="logout"
        ></v-list-item>
      </v-list>
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
    </v-main>
  </v-layout>
</template>

<script setup>
import { useTheme } from "vuetify";
import { onMounted } from "vue";
import { ref } from "vue";
import logoImage from "@/assets/logo.png";

const theme = useTheme();

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
</style>
