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
        <v-card-title> Categorias </v-card-title>
        <v-card-text>
          <v-row class="d-flex align-center">
            <v-col cols="12" md="6" class="d-flex justify-start">
              <v-btn
                prepend-icon="mdi-plus"
                variant="tonal"
                color="primary"
                @click="dialogCrear = true"
              >
                Agregar Categorias
              </v-btn>
            </v-col>
            <v-col cols="12" md="6" class="d-flex justify-end">
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
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-data-table :headers="hearders" :items="datos" :search="search">
                <template #[`item.estado`]="{ item }">
                  <v-chip
                    :color="resolveStatusVariant(item.estado).color"
                    class="font-weight-medium"
                    size="small"
                  >
                    {{ resolveStatusVariant(item.estado).text }}
                  </v-chip>
                </template>
                <template #[`item.actions`]="{ item }">
                  <div class="d-flex gap-1">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editItem(item.id)"
                    ></v-btn>
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteItem(item.id)"
                    ></v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-col>
          </v-row>
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
          <v-card-title> Nueva categoria </v-card-title>
          <v-card-text>
            <v-form ref="form">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.descripcion"
                    label="Nombre de la categoria"
                    placeholder="Ej. Lacteos"
                    :rules="[rules.required, rules.text]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
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
      <v-dialog v-model="dialogEditar" width="500">
        <v-card>
          <v-card-title> Editar categoria </v-card-title>
          <v-card-text>
            <v-form ref="form">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.descripcion"
                    label="Nombre de la categoria"
                    placeholder="Ej. Lacteos"
                    :rules="[rules.required, rules.text]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
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
  
      <!-- dialog de confirmar -->
      <v-dialog v-model="isConfirmDialogVisible" persistent width="500">
        <v-card title="Confirmar eliminación">
          <v-card-text>
            ¿Está seguro que desea eliminar esta categoria? Esta acción no se
            puede deshacer.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="secondary"
              variant="tonal"
              @click="isConfirmDialogVisible = false"
            >
              Cancelar
            </v-btn>
            <v-btn color="error" @click="handleDelete"> Eliminar </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Diálogo de carga -->
      <v-dialog v-model="dialogEliminar" persistent width="300">
        <v-card color="primary" width="300">
          <v-card-text class="pt-3">
            Eliminando categoria...
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
  const error = ref();
  const isSnackbarVisible = ref(false);
  const snackbarMessage = ref("");
  const snackbarColor = ref("success");
  const form = ref(null);
  
  //variables para el dialog de eliminar
  const isConfirmDialogVisible = ref(false);
  const editingItemId = ref(null);
  const deleteItemId = ref(null);
  const dialogCrear = ref(false);
  const dialogEditar = ref(false);
  const dialogEliminar = ref(false);
  
  const formData = ref({
   
    descripcion: "",
  estado: true,
  });
  
  const itemsBread = ref([
    {
      title: "Inicio",
      disabled: false,
    },
    {
      title: "Categorias",
      disabled: false,
      href: "/categoria",
    },
  ]);
  
  const hearders = [
  {
    title: "N°",
    key: "nro",
    sortable: true,
  },
  {
    title: "Descripcion",
    key: "descripcion",
  },
  {
    title: "Estado",
    key: "estado",
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
  },
];
  
  const estadoOptions = [
    { descripcion: "Activo", value: true },
    { descripcion: "Inactivo", value: false },
  ];
  
  const rules = {
    required: (v) => !!v || "Este campo es requerido",
    text: (v) =>
      /^[a-zA-Z0-9\s¿?¡!%#-]+$/.test(v) ||
      "Solo se permiten letras, números, espacios y los caracteres ¿?¡!%#-",
    estadoRequired: (v) => v !== undefined || "Este campo es requerido",
  };
  
  const resolveStatusVariant = (estado) => {
    if (estado === true) return { color: "success", text: "Activo" };
    return { color: "error", text: "Inactivo" };
  };
  
  const getData = async () => {
    try {
      const response = await $fetch(runtimeConfig.public.apiBase + "/categoria", {
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
      snackbarMessage.value = e.data.message || "Error al cargar los datos";
      isSnackbarVisible.value = true;
    }
  };
  
  onMounted(() => {
    getData();
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
  
    try {
      const response = await $fetch(runtimeConfig.public.apiBase + "/categoria", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: formData.value,
      });
  
      if (response) {
        snackbarColor.value = "success";
        snackbarMessage.value = "categoria creada exitosamente";
        isSnackbarVisible.value = true;
        closeDialog();
        getData();
      } else {
        throw new Error(response.message);
      }
    } catch (e) {
      snackbarColor.value = "error";
      snackbarMessage.value = e.data.message || "Error al crear el categoria";
      isSnackbarVisible.value = true;
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
  
    try {
      const response = await $fetch(
        `${runtimeConfig.public.apiBase}/categoria/${editingItemId.value}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: formData.value,
        }
      );
  
      snackbarColor.value = "success";
      snackbarMessage.value = "categoria actualizado exitosamente";
      isSnackbarVisible.value = true;
      closeDialog();
      getData();
    } catch (e) {
      snackbarColor.value = "error";
      snackbarMessage.value =
        e.data.message || "Error al actualizar el categoria";
      isSnackbarVisible.value = true;
    }
  };
  
  const handleDelete = async () => {
    isConfirmDialogVisible.value = false;
    dialogEliminar.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await $fetch(`${runtimeConfig.public.apiBase}/categoria/${deleteItemId.value}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      })
  
      await new Promise((resolve) => setTimeout(resolve, 500));
      dialogEliminar.value = false;
      snackbarColor.value = "success";
      snackbarMessage.value = "Categoria eliminada exitosamente";
      isSnackbarVisible.value = true;
  
      await getData();
      closeDialog();
    } catch (error) {
      snackbarColor.value = "error";
      snackbarMessage.value =
        error.data.message || "Error al eliminar el categoria";
      isSnackbarVisible.value = true;
    } finally {
      closeDialog();
    }
  };
  
  const editItem = async (id) => {
    editingItemId.value = id;
  
    try {
      const response = await $fetch(
        `${runtimeConfig.public.apiBase}/categoria/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      formData.value = {
        descripcion: response.descripcion,
        estado: response.estado,
      };
      dialogEditar.value = true;
    } catch (e) {
      snackbarColor.value = "error";
      snackbarMessage.value =
        e.data.message || "Error al cargar los datos el categoria";
      isSnackbarVisible.value = true;
    }
  };
  
  const deleteItem = async (id) => {
    deleteItemId.value = id;
    isConfirmDialogVisible.value = true;
  };
  
  const closeDialog = () => {
    dialogCrear.value = false;
    dialogEditar.value = false;
    isConfirmDialogVisible.value = false;
    dialogEliminar.value = false;
    editingItemId.value = null;
    deleteItemId.value = null;
    formData.value = {
      descripcion: "",
      estado: true,
    };
  };
  </script>
  