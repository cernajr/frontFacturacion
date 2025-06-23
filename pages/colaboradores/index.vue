<template>
  <v-container>
    <div>
      <v-breadcrumbs :items="itemsBread">
        <template v-slot:divider>
          <v-icon icon="mdi-chevron-right"></v-icon>
        </template>
      </v-breadcrumbs>
    </div>

    <v-card>
      <v-card-title class="d-flex align-center mb-4"> 
        Colaboradores 
        <v-spacer></v-spacer>
        <v-btn
          prepend-icon="mdi-plus"
          variant="tonal"
          color="primary"
          @click="dialogCrear = true"
          class="mr-4"
        >
          Agregar Colaborador
        </v-btn>
        <v-text-field
          v-model="search"
          placeholder="Buscar ..."
          append-inner-icon="mdi-magnify"
          single-line
          hide-details
          density="compact"
          variant="outlined"
          style="max-width: 300px"
        />
      </v-card-title>

      <v-card-text>
        <v-tabs v-model="activeTab" bg-color="transparent" centered>
          <v-tab value="activos" class="text-primary font-weight-bold">Colaboradores Habilitados</v-tab>
          <v-tab value="inactivos" class="text-grey-darken-1 font-weight-bold">Colaboradores Deshabilitados</v-tab>
        </v-tabs>
        
        <v-window v-model="activeTab" class="mt-4">
          <!-- Colaboradores Activos -->
          <v-window-item value="activos">
            <div class="d-flex justify-center">
              <div style="width: 90%;">
                <v-data-table :headers="hearders" :items="colaboradoresActivos" :search="search" class="mt-4"
                               :loading="loading" loading-text="Cargando colaboradores...">
                  <template #[`item.estado`]="{ item }">
                    <v-chip
                      :color="resolveStatusVariant(item.estado).color"
                      class="font-weight-medium"
                      size="small"
                    >
                      {{ resolveStatusVariant(item.estado).text }}
                    </v-chip>
                  </template>
                  <template #[`item.rolNombre`]="{ item }">
                    {{ getRolName(item.rolId) }}
                  </template>
                  <template #[`item.actions`]="{ item }">
                    <div class="d-flex gap-1">
                      <v-btn
                        icon="mdi-eye"
                        size="small"
                        variant="text"
                        color="info"
                        @click="viewDetails(item.id)"
                      ></v-btn>
                      <v-btn
                        icon="mdi-pencil"
                        size="small"
                        variant="text"
                        @click="editItem(item.id)"
                      ></v-btn>
                      <v-btn
                        icon="mdi-close-circle"
                        size="small"
                        variant="text"
                        color="error"
                        @click="disableItem(item.id)"
                        title="Deshabilitar"
                      ></v-btn>
                    </div>
                  </template>
                  <template v-slot:no-data>
                    No hay colaboradores activos disponibles
                  </template>
                </v-data-table>
              </div>
            </div>
          </v-window-item>
          
          <!-- Colaboradores Inactivos -->
          <v-window-item value="inactivos">
            <div class="d-flex justify-center">
              <div style="width: 90%;">
                <v-data-table :headers="hearders" :items="colaboradoresInactivos" :search="search" class="mt-4"
                               :loading="loading" loading-text="Cargando colaboradores...">
                  <template #[`item.estado`]="{ item }">
                    <v-chip
                      :color="resolveStatusVariant(item.estado).color"
                      class="font-weight-medium"
                      size="small"
                    >
                      {{ resolveStatusVariant(item.estado).text }}
                    </v-chip>
                  </template>
                  <template #[`item.rolNombre`]="{ item }">
                    {{ getRolName(item.rolId) }}
                  </template>
                  <template #[`item.actions`]="{ item }">
                    <div class="d-flex gap-1">
                      <v-btn
                        icon="mdi-eye"
                        size="small"
                        variant="text"
                        color="info"
                        @click="viewDetails(item.id)"
                      ></v-btn>
                      <v-btn
                        icon="mdi-pencil"
                        size="small"
                        variant="text"
                        @click="editItem(item.id)"
                      ></v-btn>
                      <v-btn
                        icon="mdi-check-circle"
                        size="small"
                        variant="text"
                        color="success"
                        @click="enableItem(item.id)"
                        title="Habilitar"
                      ></v-btn>
                    </div>
                  </template>
                  <template v-slot:no-data>
                    No hay colaboradores inactivos disponibles
                  </template>
                </v-data-table>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <v-snackbar
      v-model="isSnackbarVisible"
      :color="snackbarColor"
      timeout="3000"
      location="top"
    >
      {{ snackbarMessage }}
    </v-snackbar>

    <!--dialog crear-->
    <v-dialog v-model="dialogCrear" width="800">
      <v-card>
        <v-card-title> Nuevo Colaborador </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="formData.nombre"
                  label="Nombre completo"
                  placeholder="Ej. Juan Pérez"
                  :rules="[rules.required, rules.nombre]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="formData.usuarioNombre"
                  label="Nombre de usuario"
                  placeholder="Ej. jperez"
                  :rules="[rules.required, rules.usuarioNombre]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="formData.contrasena"
                  label="Contraseña"
                  placeholder="********"
                  :rules="[rules.required, rules.contrasena]"
                  type="password"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="formData.correo"
                  label="Correo electrónico"
                  placeholder="Ej. juan.perez@ejemplo.com"
                  :rules="[rules.required, rules.correo]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="formData.direccion"
                  label="Dirección"
                  placeholder="Ej. Colonia El Sauce, Calle 5, Casa #20"
                  :rules="[rules.required, rules.direccion]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="formData.telefono"
                  label="Teléfono"
                  placeholder="Ej. 98765432"
                  :rules="[rules.required, rules.telefono]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="formData.rolId"
                  :items="roles"
                  label="Rol"
                  :rules="[rules.required]"
                  required
                  item-title="descripcion`"
                  item-value="id"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="formData.estado"
                  :items="estadoOptions"
                  label="Estado"
                  :rules="[rules.estadoRequired]"
                  required
                  item-title="descripcion"
                  item-value="value"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="closeDialog"
            >Cancelar</v-btn
          >
          <v-btn color="success" variant="text" @click="handleCreate"
            >Guardar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--dialog editar-->
    <v-dialog v-model="dialogEditar" width="800">
      <v-card>
        <v-card-title> Editar Colaborador </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="formData.nombre"
                  label="Nombre completo"
                  placeholder="Ej. Juan Pérez"
                  :rules="[rules.required, rules.nombre]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="formData.usuarioNombre"
                  label="Nombre de usuario"
                  placeholder="Ej. jperez"
                  :rules="[rules.required, rules.usuarioNombre]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6" v-if="isNewPassword">
                <v-text-field
                  v-model="formData.contrasena"
                  label="Nueva contraseña"
                  placeholder="********"
                  :rules="[rules.contrasena]"
                  type="password"
                ></v-text-field>
              </v-col>
              <v-col cols="6" v-else>
                <v-btn 
                  color="primary" 
                  variant="tonal" 
                  @click="togglePasswordEdit"
                >
                  Cambiar contraseña
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="formData.correo"
                  label="Correo electrónico"
                  placeholder="Ej. juan.perez@ejemplo.com"
                  :rules="[rules.required, rules.correo]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="formData.direccion"
                  label="Dirección"
                  placeholder="Ej. Colonia El Sauce, Calle 5, Casa #20"
                  :rules="[rules.required, rules.direccion]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="formData.telefono"
                  label="Teléfono"
                  placeholder="Ej. 98765432"
                  :rules="[rules.required, rules.telefono]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="formData.rolId"
                  :items="roles"
                  label="Rol"
                  :rules="[rules.required]"
                  required
                  item-title="descripcion"
                  item-value="id"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="formData.estado"
                  :items="estadoOptions"
                  label="Estado"
                  :rules="[rules.estadoRequired]"
                  required
                  item-title="descripcion"
                  item-value="value"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="closeDialog"
            >Cancelar</v-btn
          >
          <v-btn color="success" variant="text" @click="handleUpdate"
            >Actualizar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--dialog detalles-->
    <v-dialog v-model="dialogDetalles" width="800">
      <v-card>
        <v-card-title> Detalles del Colaborador </v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="detallesData.nombre"
                  label="Nombre completo"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="detallesData.usuarioNombre"
                  label="Nombre de usuario"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="detallesData.correo"
                  label="Correo electrónico"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="detallesData.direccion"
                  label="Dirección"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="detallesData.telefono"
                  label="Teléfono"
                  readonly
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="detallesData.rolNombre"
                  label="Rol"
                  readonly
                  item-title="descripcion"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="detallesData.estado"
                  :items="estadoOptions"
                  label="Estado"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  item-title="descripcion"
                  item-value="value"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="editItem(detallesData.id)">
            Editar
          </v-btn>
          <v-btn color="error" variant="text" @click="closeDialog">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog de confirmar deshabilitación -->
    <v-dialog v-model="isConfirmDisableDialogVisible" persistent width="500">
      <v-card title="Confirmar deshabilitación">
        <v-card-text>
          ¿Está seguro que desea deshabilitar este colaborador?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            variant="tonal"
            @click="isConfirmDisableDialogVisible = false"
          >
            Cancelar
          </v-btn>
          <v-btn color="error" @click="handleDisable"> Deshabilitar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog de confirmar habilitación -->
    <v-dialog v-model="isConfirmEnableDialogVisible" persistent width="500">
      <v-card title="Confirmar habilitación">
        <v-card-text>
          ¿Está seguro que desea habilitar este colaborador?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            variant="tonal"
            @click="isConfirmEnableDialogVisible = false"
          >
            Cancelar
          </v-btn>
          <v-btn color="success" @click="handleEnable"> Habilitar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de carga -->
    <v-dialog v-model="dialogProcess" persistent width="300">
      <v-card color="primary" width="300">
        <v-card-text class="pt-3">
          {{ loadingMessage }}
          <v-progress-linear
            indeterminate
            bg-color="rgba(var(--v-theme-surface), 0.1)"
            :height="8"
            class="mb-0 mt-4"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
const runtimeConfig = useRuntimeConfig();

const search = ref("");
const datos = ref([]);
const roles = ref([]);
const error = ref();
const isSnackbarVisible = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");
const form = ref(null);
const isNewPassword = ref(false);
const activeTab = ref("activos");
const loadingMessage = ref("Procesando...");
const loading = ref(false);

// Variables para los diálogos
const isConfirmDisableDialogVisible = ref(false);
const isConfirmEnableDialogVisible = ref(false);
const editingItemId = ref(null);
const actionItemId = ref(null);
const dialogCrear = ref(false);
const dialogEditar = ref(false);
const dialogProcess = ref(false);
const dialogDetalles = ref(false);

// Reemplazar estas funciones en tu código existente

const handleDisable = async () => {
  dialogProcess.value = true;
  loadingMessage.value = "Deshabilitando colaborador...";
  isConfirmDisableDialogVisible.value = false;
  
  try {
    const response = await $fetch(
      `${runtimeConfig.public.apiBase}/usuario/disable/${actionItemId.value}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    if (response.success) {
      snackbarColor.value = "success";
      snackbarMessage.value = "Colaborador deshabilitado exitosamente";
      isSnackbarVisible.value = true;
      
      // Recargar datos y cambiar a tab de inactivos
      await getData();
      activeTab.value = "inactivos";
    } else {
      throw new Error(response.message || 'Error al deshabilitar');
    }
  } catch (e) {
    console.error('Error al deshabilitar:', e);
    snackbarColor.value = "error";
    snackbarMessage.value = e.data?.message || "Error al deshabilitar el colaborador";
    isSnackbarVisible.value = true;
  } finally {
    dialogProcess.value = false;
    actionItemId.value = null;
  }
};

const handleEnable = async () => {
  dialogProcess.value = true;
  loadingMessage.value = "Habilitando colaborador...";
  isConfirmEnableDialogVisible.value = false;
  
  try {
    const response = await $fetch(
      `${runtimeConfig.public.apiBase}/usuario/enable/${actionItemId.value}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    if (response.success) {
      snackbarColor.value = "success";
      snackbarMessage.value = "Colaborador habilitado exitosamente";
      isSnackbarVisible.value = true;
      
      // Recargar datos y cambiar a tab de activos
      await getData();
      activeTab.value = "activos";
    } else {
      throw new Error(response.message || 'Error al habilitar');
    }
  } catch (e) {
    console.error('Error al habilitar:', e);
    snackbarColor.value = "error";
    snackbarMessage.value = e.data?.message || "Error al habilitar el colaborador";
    isSnackbarVisible.value = true;
  } finally {
    dialogProcess.value = false;
    actionItemId.value = null;
  }
};

// También arreglar los computed properties - agregar estos si no los tienes
const colaboradoresActivos = computed(() => {
  return datos.value.filter(item => item.estado === 1 || item.estado === true);
});

const colaboradoresInactivos = computed(() => {
  return datos.value.filter(item => item.estado === 0 || item.estado === false);
});

// Datos para el modal de detalles
const detallesData = ref({
  id: null,
  nombre: "",
  usuarioNombre: "",
  correo: "",
  direccion: "",
  telefono: "",
  rolId: null,
  rolNombre: "",
  estado: true,
});

const formData = ref({
  nombre: "",
  correo: "",
  usuarioNombre: "",
  contrasena: "",
  rolId: null,
  direccion: "",
  telefono: "",
  estado: true,
});

const itemsBread = ref([
  {
    title: "Inicio",
    disabled: false,
  },
  {
    title: "Colaboradores",
    disabled: false,
    href: "/colaborador",
  },
]);

const hearders = [
  {
    title: "N°",
    key: "nro",
    sortable: true,
  },
  {
    title: "Nombre",
    key: "nombre",
  },
  {
    title: "Usuario",
    key: "usuarioNombre",
  },
  {
    title: "Teléfono",
    key: "telefono",
  },
  {
    title: "Rol",
    key: "nombreRol",
  },
  {
    title: "Estado",
    key: "estado",
  },
  {
    title: "Acciones",
    key: "actions",
    sortable: false,
  },
];

const estadoOptions = [
  { descripcion: "Activo", value: 1 },
  { descripcion: "Inactivo", value: 0 },
];

const rules = {
  required: (v) => !!v || "Este campo es requerido",
  nombre: (v) =>
    /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{3,100}$/.test(v) ||
    "Ingrese un nombre válido (solo letras y espacios)",
  usuarioNombre: (v) =>
    /^[a-zA-Z0-9_]{3,20}$/.test(v) ||
    "Ingrese un nombre de usuario válido (letras, números y guiones bajos, 3-20 caracteres)",
  contrasena: (v) =>
    !v || /^.{8,}$/.test(v) ||
    "La contraseña debe tener al menos 8 caracteres",
  direccion: (v) =>
    /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s.,#-]{5,200}$/.test(v) ||
    "Ingrese una dirección válida",
  telefono: (v) =>
    /^[0-9]{8,15}$/.test(v) ||
    "Ingrese un número de teléfono válido (solo números, 8-15 dígitos)",
  correo: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
    "Ingrese un correo electrónico válido",
  estadoRequired: (v) => v !== undefined || "Este campo es requerido",
};

const resolveStatusVariant = (estado) => {
  if (estado === 1) return { color: "success", text: "Activo" };
  return { color: "error", text: "Inactivo" };
};

const getData = async () => {
  loading.value = true;
  try {
    const response = await $fetch(runtimeConfig.public.apiBase +"/usuario", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    datos.value = response.map((item, index) => ({
      ...item,
      nro: index + 1,
    }));
  } catch (e) {
    error.value = e;
    snackbarColor.value = "error";
    snackbarMessage.value = e.data?.message || "Error al cargar los datos";
    isSnackbarVisible.value = true;
  } finally {
    loading.value = false;
  }
};

const getRoles = async () => {
  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/rol", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    roles.value = response;
  } catch (e) {
    error.value = e;
    snackbarColor.value = "error";
    snackbarMessage.value = e.data?.message || "Error al cargar los roles";
    isSnackbarVisible.value = true;
  }
};

onMounted(() => {
  getData();
  getRoles();
});

const handleCreate = async () => {
  const { valid } = await form.value?.validate();

  if (!valid) {
    snackbarColor.value = "error";
    snackbarMessage.value =
      "Por favor, complete correctamente todos los campos";
    isSnackbarVisible.value = true;
    return;
  }

  dialogProcess.value = true;
  loadingMessage.value = "Creando colaborador...";

  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/usuario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: formData.value,
    });

    if (response) {
      snackbarColor.value = "success";
      snackbarMessage.value = "Colaborador creado exitosamente";
      isSnackbarVisible.value = true;
      await getData();
      closeDialog();
    } else {
      throw new Error(response.message);
    }
  } catch (e) {
    snackbarColor.value = "error";
    snackbarMessage.value = e.data?.message || "Error al crear el colaborador";
    isSnackbarVisible.value = true;
  } finally {
    dialogProcess.value = false;
  }
};

const handleUpdate = async () => {
  const { valid } = await form.value?.validate();

  if (!valid) {
    snackbarColor.value = "error";
    snackbarMessage.value =
      "Por favor, complete correctamente todos los campos";
    isSnackbarVisible.value = true;
    return;
  }

  dialogProcess.value = true;
  loadingMessage.value = "Actualizando colaborador...";

  // Crear una copia del objeto para manipularlo
  const dataToUpdate = { ...formData.value };
  
  // Si no se está cambiando la contraseña, eliminar el campo para no enviarla
  if (!isNewPassword.value || !dataToUpdate.contrasena) {
    delete dataToUpdate.contrasena;
  }

  try {
    const response = await $fetch(
      `${runtimeConfig.public.apiBase}/usuario/${editingItemId.value}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: dataToUpdate,
      }
    );

    snackbarColor.value = "success";
    snackbarMessage.value = "Colaborador actualizado exitosamente";
    isSnackbarVisible.value = true;
    await getData();
  } catch (e) {
    console.error("Error al actualizar:", e);
    snackbarColor.value = "error";
    snackbarMessage.value =
      e.data?.message || "Error al actualizar el colaborador";
    isSnackbarVisible.value = true;
  } finally {
    dialogProcess.value = false;
    closeDialog();
  }
};

// Funciones para habilitar/deshabilitar colaboradores
const disableItem = (id) => {
  actionItemId.value = id;
  isConfirmDisableDialogVisible.value = true;
};

const enableItem = (id) => {
  actionItemId.value = id;
  isConfirmEnableDialogVisible.value = true;
};



const togglePasswordEdit = () => {
  isNewPassword.value = true;
  formData.value.contrasena = "";
};

const editItem = async (id) => {
  editingItemId.value = id;
  dialogDetalles.value = false;
  isNewPassword.value = false;

  try {
    const response = await $fetch(
      `${runtimeConfig.public.apiBase}/usuario/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    formData.value = {
      nombre: response.nombre,
      usuarioNombre: response.usuarioNombre,
      correo: response.correo,
      rolId: response.rolId,
      direccion: response.direccion,
      telefono: response.telefono,
      estado: response.estado,
    };
    dialogEditar.value = true;
  } catch (e) {
    snackbarColor.value = "error";
    snackbarMessage.value =
      e.data?.message || "Error al cargar los datos del colaborador";
    isSnackbarVisible.value = true;
  }
};

// Función para obtener el nombre del rol a partir del ID
const getRolName = (rolId) => {
  if (rolId === null || rolId === undefined) return 'No asignado';
  // Convertir ambos IDs a números para evitar problemas de comparación entre string y number
  const rol = roles.value.find(r => Number(r.id) === Number(rolId));
  return rol ? rol.nombre : 'No asignado';
};

// Modificando viewDetails para mostrar correctamente el nombre del rol
const viewDetails = async (id) => {
  try {
    const response = await $fetch(
      `${runtimeConfig.public.apiBase}/usuario/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Obtener el nombre del rol usando la función getRolName
    const rolNombre = getRolName(response.rolId);

    detallesData.value = {
      id: response.id,
      nombre: response.nombre,
      usuarioNombre: response.usuarioNombre,
      correo: response.correo,
      direccion: response.direccion,
      telefono: response.telefono,
      rolId: response.rolId,
      rolNombre: rolNombre,
      estado: response.estado,
    };
    
    dialogDetalles.value = true;
  } catch (e) {
    snackbarColor.value = "error";
    snackbarMessage.value =
      e.data?.message || "Error al cargar los detalles del colaborador";
    isSnackbarVisible.value = true;
  }
};

const closeDialog = () => {
  dialogCrear.value = false;
  dialogEditar.value = false;
  dialogDetalles.value = false;
  isConfirmDisableDialogVisible.value = false;
  isConfirmEnableDialogVisible.value = false;
  dialogProcess.value = false;
  editingItemId.value = null;
  actionItemId.value = null;
  isNewPassword.value = false;
  formData.value = {
    nombre: "",
    correo: "",
    usuarioNombre: "",
    contrasena: "",
    rolId: null,
    direccion: "",
    telefono: "",
    estado: true,
  };
};
</script>