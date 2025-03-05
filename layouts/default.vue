<template>
  <v-layout class="rounded rounded-md">
    <v-navigation-drawer expand-on-hover rail>
      <v-list>
        <v-list-item
          prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
          subtitle="sandra_a88@gmailcom"
          title="Sandra Adams"
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-folder"
          title="My Files"
          value="myfiles"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account-multiple"
          title="Shared with me"
          value="shared"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-star"
          title="Starred"
          value="starred"
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
