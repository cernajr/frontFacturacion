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
      <v-card-title> Productos e Inventario </v-card-title>
      <v-card-text>
        <v-row class="d-flex align-center">
          <v-col cols="12" md="6" class="d-flex justify-start gap-4">
            <v-btn
              prepend-icon="mdi-plus"
              variant="tonal"
              color="primary"
              @click="dialogCrearProducto = true"
            >
              Crear Producto
            </v-btn>
            <v-btn
              prepend-icon="mdi-package-variant-plus"
              variant="tonal"
              color="success"
              @click="openAddInventoryDialog"
            >
              Añadir Inventario
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
            <v-data-table
              :headers="headers"
              :items="productos"
              :search="search"
            >
              <template #[`item.estado`]="{ item }">
                <v-chip
                  :color="resolveStatusVariant(item.estado).color"
                  class="font-weight-medium"
                  size="small"
                >
                  {{ resolveStatusVariant(item.estado).text }}
                </v-chip>
              </template>
              <template #[`item.precio`]="{ item }">
                {{ formatCurrency(item.precio) }}
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
                    @click="editProduct(item.id)"
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

    <!-- Dialog Crear Producto -->
    <v-dialog v-model="dialogCrearProducto" width="800">
      <v-card>
        <v-card-title> Nuevo Producto </v-card-title>
        <v-card-text>
          <v-form ref="formProducto">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="formDataProducto.nombre"
                  label="Nombre del producto"
                  placeholder="Ej. Leche Entera"
                  :rules="[rules.required, rules.nombre]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="formDataProducto.codigoProducto"
                  label="Código del producto"
                  placeholder="Ej. PRD001"
                  :rules="[rules.required, rules.codigo]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formDataProducto.descripcion"
                  label="Descripción del producto"
                  placeholder="Ej. Leche entera pasteurizada 1L"
                  :rules="[rules.required, rules.descripcion]"
                  required
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="formDataProducto.precio"
                  label="Precio"
                  placeholder="Ej. 100.00"
                  type="number"
                  :rules="[rules.required, rules.precio]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="formDataProducto.proveedorId"
                  :items="proveedores"
                  label="Proveedor"
                  :rules="[rules.required]"
                  required
                  item-title="nombre"
                  item-value="id"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="formDataProducto.categoriaId"
                  :items="categorias"
                  label="Categoría"
                  :rules="[rules.required]"
                  required
                  item-title="descripcion"
                  item-value="id"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="formDataProducto.unidadId"
                  :items="unidades"
                  label="Unidad"
                  :rules="[rules.required]"
                  required
                  item-title="descripcion"
                  item-value="id"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formDataProducto.estado"
                  :items="estadoOptions"
                  label="Estado"
                  :rules="[rules.estadoRequired]"
                  required
                  item-title="descripcion"
                  item-value="value"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-divider class="my-3"></v-divider>
                <h3 class="text-subtitle-1 mb-2">Información de Inventario</h3>
              </v-col>

              <v-col cols="4">
                <v-text-field
                  v-model="formDataProducto.stockActual"
                  label="Stock Actual"
                  placeholder="Ej. 100"
                  type="number"
                  :rules="[rules.required, rules.stock]"
                  required
                  @input="validateStockLimits"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="formDataProducto.stockMinimo"
                  label="Stock Mínimo"
                  placeholder="Ej. 10"
                  type="number"
                  :rules="[rules.required, rules.stock]"
                  required
                  @input="validateStockLimits"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="formDataProducto.stockMaximo"
                  label="Stock Máximo"
                  placeholder="Ej. 500"
                  type="number"
                  :rules="[rules.required, rules.stock]"
                  required
                  @input="validateStockLimits"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="closeDialog"
            >Cancelar</v-btn
          >
          <v-btn color="success" variant="text" @click="handleCreateProduct"
            >Guardar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Editar Producto -->
    <v-dialog v-model="dialogEditarProducto" width="800">
      <v-card>
        <v-card-title> Editar Producto </v-card-title>
        <v-card-text>
          <v-form ref="formProducto">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="formDataProducto.nombre"
                  label="Nombre del producto"
                  placeholder="Ej. Leche Entera"
                  :rules="[rules.required, rules.nombre]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="formDataProducto.codigoProducto"
                  label="Código del producto"
                  placeholder="Ej. PRD001"
                  :rules="[rules.required, rules.codigo]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formDataProducto.descripcion"
                  label="Descripción del producto"
                  placeholder="Ej. Leche entera pasteurizada 1L"
                  :rules="[rules.required, rules.descripcion]"
                  required
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="formDataProducto.precio"
                  label="Precio"
                  placeholder="Ej. 100.00"
                  type="number"
                  :rules="[rules.required, rules.precio]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="formDataProducto.proveedorId"
                  :items="proveedores"
                  label="Proveedor"
                  :rules="[rules.required]"
                  required
                  item-title="nombre"
                  item-value="id"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="formDataProducto.categoriaId"
                  :items="categorias"
                  label="Categoría"
                  :rules="[rules.required]"
                  required
                  item-title="descripcion"
                  item-value="id"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="formDataProducto.unidadId"
                  :items="unidades"
                  label="Unidad"
                  :rules="[rules.required]"
                  required
                  item-title="descripcion"
                  item-value="id"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formDataProducto.estado"
                  :items="estadoOptions"
                  label="Estado"
                  :rules="[rules.estadoRequired]"
                  required
                  item-title="descripcion"
                  item-value="value"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-divider class="my-3"></v-divider>
                <h3 class="text-subtitle-1 mb-2">Información de Inventario</h3>
              </v-col>

              <template v-if="formDataInventario.id">
                <!-- Si hay inventario existente -->
                <v-col cols="4">
                  <v-text-field
                    :model-value="formDataInventario.stockActual"
                    label="Stock Actual"
                    readonly
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="formDataInventario.stockMinimo"
                    label="Stock Mínimo"
                    type="number"
                    :rules="[rules.required, rules.stock]"
                    required
                    @input="validateStockLimits"
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="formDataInventario.stockMaximo"
                    label="Stock Máximo"
                    type="number"
                    :rules="[rules.required, rules.stock]"
                    required
                    @input="validateStockLimits"
                  ></v-text-field>
                </v-col>
              </template>
              <template v-else>
                <!-- Si no hay inventario existente -->
                <v-col cols="4">
                  <v-text-field
                    v-model="formDataInventario.stockActual"
                    label="Stock Actual"
                    type="number"
                    :rules="[rules.required, rules.stock]"
                    required
                    placeholder="Ej. 100"
                    @input="validateStockLimits"
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="formDataInventario.stockMinimo"
                    label="Stock Mínimo"
                    type="number"
                    :rules="[rules.required, rules.stock]"
                    required
                    placeholder="Ej. 10"
                    @input="validateStockLimits"
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="formDataInventario.stockMaximo"
                    label="Stock Máximo"
                    type="number"
                    :rules="[rules.required, rules.stock]"
                    required
                    placeholder="Ej. 500"
                    @input="validateStockLimits"
                  ></v-text-field>
                </v-col>
              </template>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="closeDialog"
            >Cancelar</v-btn
          >
          <v-btn color="success" variant="text" @click="handleUpdateProduct"
            >Actualizar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Añadir Inventario -->
    <v-dialog v-model="dialogAddInventory" width="600">
      <v-card>
        <v-card-title> Añadir Inventario </v-card-title>
        <v-card-text>
          <v-form ref="formInventario">
            <v-row v-for="(item, index) in inventarioItems" :key="index">
              <v-col cols="7">
                <v-select
                  v-model="item.productoId"
                  :items="productos"
                  label="Producto"
                  :rules="[rules.required]"
                  required
                  item-title="nombre"
                  item-value="id"
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="item.stockActual"
                  label="Cantidad a añadir"
                  type="number"
                  :rules="[rules.required, rules.stock]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="1" class="d-flex align-center">
                <v-btn
                  v-if="index === inventarioItems.length - 1"
                  icon="mdi-plus"
                  size="small"
                  variant="text"
                  color="success"
                  @click="addInventoryItem"
                ></v-btn>
                <v-btn
                  v-if="inventarioItems.length > 1"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="removeInventoryItem(index)"
                ></v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-btn color="error" variant="text" @click="closeDialog"
                >Cancelar</v-btn
              >
              <v-btn
                color="success"
                variant="text"
                @click="handleAddInventory(item.productoId)"
                >Guardar</v-btn
              >
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog Ver Detalles Producto -->
    <v-dialog v-model="dialogDetalles" width="800">
      <v-card>
        <v-card-title> Detalles del Producto </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <h3 class="text-h5 mb-2">Información del Producto</h3>
              <v-divider class="mb-4"></v-divider>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="detallesData.nombre"
                label="Nombre"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="detallesData.codigoProducto"
                label="Código"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="detallesData.descripcion"
                label="Descripción"
                readonly
                variant="outlined"
                density="comfortable"
                rows="2"
              ></v-textarea>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="detallesData.precioFormateado"
                label="Precio"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="detallesData.proveedor"
                label="Proveedor"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="detallesData.categoria"
                label="Categoría"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="detallesData.unidad"
                label="Unidad"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-chip
                :color="resolveStatusVariant(detallesData.estado).color"
                class="font-weight-medium"
              >
                {{ resolveStatusVariant(detallesData.estado).text }}
              </v-chip>
            </v-col>

            <v-col cols="12">
              <h3 class="text-h5 mt-4 mb-2">Información de Inventario</h3>
              <v-divider class="mb-4"></v-divider>

              <div v-if="detallesData.inventario">
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      :model-value="detallesData.inventario.stockActual"
                      label="Stock Actual"
                      readonly
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      :model-value="detallesData.inventario.stockMinimo"
                      label="Stock Mínimo"
                      readonly
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      :model-value="detallesData.inventario.stockMaximo"
                      label="Stock Máximo"
                      readonly
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </div>
              <div v-else class="text-center py-4">
                <p class="text-medium-emphasis">
                  No hay información de inventario disponible para este
                  producto.
                </p>
                <v-btn
                  color="primary"
                  class="mt-2"
                  @click="editProduct(detallesData.id)"
                >
                  Agregar información de inventario
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="editProduct(detallesData.id)"
          >
            Editar
          </v-btn>
          <v-btn color="error" variant="text" @click="closeDialog">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmar eliminación -->
    <v-dialog v-model="isConfirmDialogVisible" persistent width="500">
      <v-card title="Confirmar eliminación">
        <v-card-text>
          ¿Está seguro que desea eliminar este producto? Esta acción no se puede
          deshacer.
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
          Eliminando producto...
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
const productos = ref([]);
const categorias = ref([]);
const proveedores = ref([]);
const unidades = ref([]);
const error = ref();
const isSnackbarVisible = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");
const formProducto = ref(null);
const formInventario = ref(null);

// Variables para los dialogs
const isConfirmDialogVisible = ref(false);
const editingItemId = ref(null);
const deleteItemId = ref(null);
const dialogCrearProducto = ref(false);
const dialogEditarProducto = ref(false);
const dialogEliminar = ref(false);
const dialogDetalles = ref(false);
const dialogAddInventory = ref(false);

// Datos para el formulario de productos
const formDataProducto = ref({
  nombre: "",
  descripcion: "",
  precio: "",
  codigoProducto: "",
  proveedorId: null,
  empresaId: 0,
  unidadId: null,
  categoriaId: null,
  estado: true,
  stockActual: null,
  stockMinimo: null,
  stockMaximo: null,
});

// Datos para el formulario de inventario
const formDataInventario = ref({
  id: null,
  stockActual: null,
  empresaId: 0,
  estado: true,
});

// Datos para los items de inventario
const inventarioItems = ref([
  {
    productoId: null,
    empresaId: 0,
    stockActual: null,
    estado: true,
  },
]);

// Datos para el modal de detalles
const detallesData = ref({
  id: null,
  nombre: "",
  descripcion: "",
  precio: 0,
  precioFormateado: "",
  codigoProducto: "",
  proveedor: "",
  categoria: "",
  unidad: "",
  estado: true,
  inventario: null,
});

const itemsBread = ref([
  {
    title: "Inicio",
    disabled: false,
  },
  {
    title: "Productos e Inventario",
    disabled: false,
    href: "/producto",
  },
]);

const headers = [
  {
    title: "N°",
    key: "nro",
    sortable: true,
  },
  {
    title: "Código",
    key: "codigoProducto",
  },
  {
    title: "Nombre",
    key: "nombre",
  },
  {
    title: "Precio",
    key: "precio_venta",
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
    /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s.,&-]{3,100}$/.test(v) ||
    "Ingrese un nombre válido (letras, números, espacios y algunos caracteres especiales)",
  descripcion: (v) =>
    /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s.,&\-_()]{5,500}$/.test(v) ||
    "Ingrese una descripción válida",
  codigo: (v) =>
    /^[a-zA-Z0-9\-_]{2,20}$/.test(v) ||
    "Ingrese un código válido (letras, números y guiones)",
  precio: (v) => v > 0 || "El precio debe ser mayor que cero",
  stock: (v) => v >= 0 || "El stock no puede ser negativo",
  estadoRequired: (v) => v !== undefined || "Este campo es requerido",
};

const resolveStatusVariant = (estado) => {
  if (estado === 1) return { color: "success", text: "Activo" };
  return { color: "error", text: "Inactivo" };
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
  }).format(value);
};

// Cargar datos iniciales
const getProductos = async () => {
  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/producto", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    productos.value = response.map((item, index) => ({
      ...item,
      nro: index + 1,
    }));
  } catch (e) {
    error.value = e;
    snackbarColor.value = "error";
    snackbarMessage.value = e.data?.message || "Error al cargar los productos";
    isSnackbarVisible.value = true;
  }
};

const getCategorias = async () => {
  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/categoria", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    categorias.value = response;
  } catch (e) {
    error.value = e;
    snackbarColor.value = "error";
    snackbarMessage.value = e.data?.message || "Error al cargar las categorías";
    isSnackbarVisible.value = true;
  }
};

const getProveedores = async () => {
  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/proveedor", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    proveedores.value = response;
  } catch (e) {
    error.value = e;
    snackbarColor.value = "error";
    snackbarMessage.value =
      e.data?.message || "Error al cargar los proveedores";
    isSnackbarVisible.value = true;
  }
};

const getUnidades = async () => {
  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/unidad", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    unidades.value = response;
  } catch (e) {
    error.value = e;
    snackbarColor.value = "error";
    snackbarMessage.value = e.data?.message || "Error al cargar las unidades";
    isSnackbarVisible.value = true;
  }
};

const loadData = async () => {
  await Promise.all([
    getProductos(),
    getCategorias(),
    getProveedores(),
    getUnidades(),
  ]);
};

onMounted(() => {
  loadData();
});

// Funciones de gestión para productos
const validateStockLimits = () => {
  const stockActual = Number(formDataInventario.value.stockActual);
  const stockMinimo = Number(formDataInventario.value.stockMinimo);
  const stockMaximo = Number(formDataInventario.value.stockMaximo);

  if (
    stockActual !== null &&
    stockMinimo !== null &&
    stockActual < stockMinimo
  ) {
    snackbarColor.value = "warning";
    snackbarMessage.value =
      "¡Advertencia! El stock actual es menor que el stock mínimo";
    isSnackbarVisible.value = true;
  }

  if (
    stockActual !== null &&
    stockMaximo !== null &&
    stockActual > stockMaximo
  ) {
    snackbarColor.value = "warning";
    snackbarMessage.value =
      "¡Advertencia! El stock actual es mayor que el stock máximo";
    isSnackbarVisible.value = true;
  }
};

const handleCreateProduct = async () => {
  const { valid } = await formProducto.value?.validate();

  if (!valid) {
    snackbarColor.value = "error";
    snackbarMessage.value =
      "Por favor, complete correctamente todos los campos";
    isSnackbarVisible.value = true;
    return;
  }

  try {
    // Verificar límites de stock
    validateStockLimits();

    // Crear el producto
    const productoResponse = await $fetch(
      runtimeConfig.public.apiBase + "/producto/productoInventario",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: formDataProducto.value,
      }
    );

    if (productoResponse) {
      snackbarColor.value = "success";
      snackbarMessage.value = "Producto e inventario creados exitosamente";
      isSnackbarVisible.value = true;
      closeDialog();
      getProductos();
    } else {
      throw new Error(productoResponse.message);
    }
  } catch (e) {
    snackbarColor.value = "error";
    snackbarMessage.value =
      e.data?.message || "Error al crear el producto o inventario";
    isSnackbarVisible.value = true;
  }
};

const handleUpdateProduct = async () => {
  const { valid } = await formProducto.value?.validate();

  if (!valid) {
    snackbarColor.value = "error";
    snackbarMessage.value =
      "Por favor, complete correctamente todos los campos";
    isSnackbarVisible.value = true;
    return;
  }

  try {
    // Actualizar el producto
    const response = await $fetch(
      `${runtimeConfig.public.apiBase}/producto/${editingItemId.value}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          ...formDataProducto.value,
          precio: Number(formDataProducto.value.precio),
        },
      }
    );

    // Verificar límites de stock
    validateStockLimits();

    // Si hay datos de inventario existentes, actualizarlos
    if (formDataInventario.value.id) {
      await $fetch(
        `${runtimeConfig.public.apiBase}/inventario/${formDataInventario.value.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            productoId: editingItemId.value,
            empresaId: 0,
            stockActual: Number(formDataInventario.value.stockActual),
            stockMinimo: Number(formDataInventario.value.stockMinimo),
            stockMaximo: Number(formDataInventario.value.stockMaximo),
            estado: true,
          },
        }
      );
    } else {
      // Si no hay inventario existente, crear uno nuevo
      await $fetch(runtimeConfig.public.apiBase + "/inventario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          productoId: editingItemId.value,
          empresaId: 0,
          stockActual: Number(formDataInventario.value.stockActual) || 0,
          stockMinimo: Number(formDataInventario.value.stockMinimo) || 10,
          stockMaximo: Number(formDataInventario.value.stockMaximo) || 1000,
          estado: true,
        },
      });
    }

    snackbarColor.value = "success";
    snackbarMessage.value = "Producto actualizado exitosamente";
    isSnackbarVisible.value = true;
    closeDialog();
    getProductos();
  } catch (e) {
    snackbarColor.value = "error";
    snackbarMessage.value =
      e.data?.message || "Error al actualizar el producto";
    isSnackbarVisible.value = true;
  }
};

const handleDelete = async () => {
  isConfirmDialogVisible.value = false;
  dialogEliminar.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await $fetch(
      `${runtimeConfig.public.apiBase}/producto/${deleteItemId.value}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    await new Promise((resolve) => setTimeout(resolve, 500));
    dialogEliminar.value = false;
    snackbarColor.value = "success";
    snackbarMessage.value = "Producto eliminado exitosamente";
    isSnackbarVisible.value = true;

    await getProductos();
    closeDialog();
  } catch (error) {
    snackbarColor.value = "error";
    snackbarMessage.value =
      error.data?.message || "Error al eliminar el producto";
    isSnackbarVisible.value = true;
  } finally {
    closeDialog();
  }
};

const editProduct = async (id) => {
  editingItemId.value = id;
  dialogDetalles.value = false;

  try {
    // Obtener datos del producto
    const response = await $fetch(
      `${runtimeConfig.public.apiBase}/producto/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    formDataProducto.value = {
      nombre: response.nombre,
      descripcion: response.descripcion,
      precio: response.precio,
      codigoProducto: response.codigoProducto,
      proveedorId: response.proveedorId,
      empresaId: 0,
      unidadId: response.unidadId,
      categoriaId: response.categoriaId,
      estado: response.estado,
    };

    // Intentar obtener datos de inventario
    try {
      const inventarioResponse = await $fetch(
        `${runtimeConfig.public.apiBase}/inventario/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (inventarioResponse) {
        formDataInventario.value = {
          id: inventarioResponse.id,
          stockActual: inventarioResponse.stockActual,
          stockMinimo: inventarioResponse.stockMinimo,
          stockMaximo: inventarioResponse.stockMaximo,
          empresaId: 0,
          estado: inventarioResponse.estado,
        };
      }
    } catch (e) {
      console.log("No se encontró inventario para este producto");
    }

    dialogEditarProducto.value = true;
  } catch (e) {
    snackbarColor.value = "error";
    snackbarMessage.value =
      e.data?.message || "Error al cargar los datos del producto";
    isSnackbarVisible.value = true;
  }
};

const viewDetails = async (id) => {
  try {
    // Obtener datos del producto
    const productResponse = await $fetch(
      `${runtimeConfig.public.apiBase}/producto/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Buscar información relacionada
    const proveedor = proveedores.value.find(
      (p) => p.id === productResponse.proveedorId
    );
    const categoria = categorias.value.find(
      (c) => c.id === productResponse.categoriaId
    );
    const unidad = unidades.value.find(
      (u) => u.id === productResponse.unidadId
    );

    // Intentar obtener datos de inventario
    let inventarioData = null;
    try {
      const inventarioResponse = await $fetch(
        `${runtimeConfig.public.apiBase}/inventario/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (inventarioResponse) {
        inventarioData = inventarioResponse;
        console.log("Inventario encontrado:", inventarioData);
      }
    } catch (e) {
      console.log("No se encontró inventario para este producto");
    }

    detallesData.value = {
      id: productResponse.id,
      nombre: productResponse.nombre,
      descripcion: productResponse.descripcion,
      precio: productResponse.precio,
      precioFormateado: formatCurrency(productResponse.precio),
      codigoProducto: productResponse.codigoProducto,
      proveedor: proveedor ? proveedor.nombre : "No especificado",
      categoria: categoria ? categoria.descripcion : "No especificada",
      unidad: unidad ? unidad.descripcion : "No especificada",
      estado: productResponse.estado,
      inventario: inventarioData,
    };

    dialogDetalles.value = true;
  } catch (e) {
    snackbarColor.value = "error";
    snackbarMessage.value =
      e.data?.message || "Error al cargar los detalles del producto";
    isSnackbarVisible.value = true;
  }
};

const deleteItem = (id) => {
  deleteItemId.value = id;
  isConfirmDialogVisible.value = true;
};

// Funciones para el manejo de inventario
const openAddInventoryDialog = () => {
  inventarioItems.value = [
    {
      stockActual: null,
    },
  ];
  dialogAddInventory.value = true;
};

const addInventoryItem = () => {
  inventarioItems.value.push({
    productoId: null,
    empresaId: 0,
    stockActual: null,
    stockMinimo: null,
    stockMaximo: null,
    estado: true,
  });
};

const removeInventoryItem = (index) => {
  inventarioItems.value.splice(index, 1);
};

const handleAddInventory = async (id) => {
  const { valid } = await formInventario.value?.validate();

  if (!valid) {
    snackbarColor.value = "error";
    snackbarMessage.value =
      "Por favor, complete correctamente todos los campos";
    isSnackbarVisible.value = true;
    return;
  }

  try {
    // Convertir valores de string a número
    const itemsToSave = inventarioItems.value.map((item) => ({
      ...item,
      stockActual: Number(item.stockActual),
    }));

    // Guardar cada item de inventario
    for (const item of itemsToSave) {
      await $fetch(`${runtimeConfig.public.apiBase}/inventario/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: item,
      });
    }

    snackbarColor.value = "success";
    snackbarMessage.value = "Inventario actualizado exitosamente";
    isSnackbarVisible.value = true;
    closeDialog();
  } catch (e) {
    snackbarColor.value = "error";
    snackbarMessage.value =
      e.data?.message || "Error al actualizar el inventario";
    isSnackbarVisible.value = true;
  }
};

// Función para listar todos los productos
const loadAllProducts = async () => {
  try {
    snackbarColor.value = "info";
    snackbarMessage.value = "Actualizando lista de productos...";
    isSnackbarVisible.value = true;

    // Forzar recarga de datos
    await getProductos();

    snackbarColor.value = "success";
    snackbarMessage.value = "Lista de productos actualizada";
    isSnackbarVisible.value = true;
  } catch (error) {
    snackbarColor.value = "error";
    snackbarMessage.value = "Error al actualizar la lista de productos";
    isSnackbarVisible.value = true;
  }
};

const closeDialog = () => {
  dialogCrearProducto.value = false;
  dialogEditarProducto.value = false;
  dialogDetalles.value = false;
  dialogAddInventory.value = false;
  isConfirmDialogVisible.value = false;
  dialogEliminar.value = false;
  editingItemId.value = null;
  deleteItemId.value = null;

  // Resetear formulario de producto
  formDataProducto.value = {
    nombre: "",
    descripcion: "",
    precio: "",
    codigoProducto: "",
    proveedorId: null,
    empresaId: 0,
    unidadId: null,
    categoriaId: null,
    estado: true,
  };

  // Resetear formulario de inventario
  formDataInventario.value = {
    stockActual: null,
    stockMinimo: null,
    stockMaximo: null,
    empresaId: 0,
    estado: true,
  };

  // Resetear items de inventario
  inventarioItems.value = [
    {
      productoId: null,
      empresaId: 0,
      stockActual: null,
      stockMinimo: null,
      stockMaximo: null,
      estado: true,
    },
  ];
};
</script>
