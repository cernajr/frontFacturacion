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
      <v-card-title> Reportes </v-card-title>
      <v-card-text>
        <!-- Selector de tipo de reporte y filtros de fecha -->
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedReport"
              :items="reportTypes"
              label="Tipo de Reporte"
              item-title="label"
              item-value="value"
              @update:model-value="changeReportType"
              :disabled="isLoading"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-menu
              v-model="dateMenuStart"
              :close-on-content-click="false"
              location="end"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="dateStart"
                  label="Fecha Inicio"
                  prepend-inner-icon="mdi-calendar"
                  v-bind="props"
                  readonly
                  :disabled="isLoading"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="dateStart"
                @update:model-value="dateMenuStart = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" md="3">
            <v-menu
              v-model="dateMenuEnd"
              :close-on-content-click="false"
              location="end"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="dateEnd"
                  label="Fecha Fin"
                  prepend-inner-icon="mdi-calendar"
                  v-bind="props"
                  readonly
                  :disabled="isLoading"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="dateEnd"
                @update:model-value="dateMenuEnd = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" md="2" class="d-flex align-center">
            <v-btn
              variant="tonal"
              color="primary"
              @click="generateReport"
              prepend-icon="mdi-file-chart"
              :loading="isLoading"
              :disabled="isLoading"
            >
              Generar
            </v-btn>
          </v-col>
        </v-row>

        <!-- Caja de búsqueda -->
        <v-row>
          <v-col cols="12" class="d-flex justify-end">
            <v-text-field
              v-model="search"
              placeholder="Buscar ..."
              append-inner-icon="mdi-magnify"
              single-line
              hide-details
              density="compact"
              variant="outlined"
              style="max-width: 300px"
              :disabled="isLoading || !dataLoaded"
            />
          </v-col>
        </v-row>

        <!-- Indicador de carga -->
        <v-row v-if="isLoading">
          <v-col cols="12" class="d-flex justify-center">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </v-col>
        </v-row>

        <!-- Botones de descarga -->
        <v-row v-if="dataLoaded && !isLoading">
          <v-col cols="12" class="d-flex justify-start gap-2">
            <v-btn
              variant="outlined"
              color="success"
              prepend-icon="mdi-microsoft-excel"
              @click="downloadExcel"
              :loading="isDownloadingExcel"
              :disabled="isDownloadingExcel || isDownloadingPdf"
            >
              Exportar Excel
            </v-btn>
            <v-btn
              variant="outlined"
              color="error"
              prepend-icon="mdi-file-pdf"
              @click="downloadPdf"
              :loading="isDownloadingPdf"
              :disabled="isDownloadingPdf || isDownloadingExcel"
            >
              Exportar PDF
            </v-btn>
          </v-col>
        </v-row>

        <!-- Mensaje de no hay datos -->
        <v-row v-if="dataLoaded && !isLoading && reportData.length === 0">
          <v-col cols="12" class="d-flex justify-center">
            <v-alert
              type="info"
              variant="tonal"
              class="w-100"
            >
              No se encontraron datos para los criterios seleccionados.
            </v-alert>
          </v-col>
        </v-row>

        <!-- Tabla de datos del reporte -->
        <v-row v-if="dataLoaded && !isLoading && reportData.length > 0">
          <v-col cols="12">
            <v-data-table
              v-if="selectedReport === 'inventory'"
              :headers="inventoryHeaders"
              :items="reportData"
              :search="search"
              :loading="isLoading"
            >
              <template #[`item.stock`]="{ item }">
                <v-chip
                  :color="resolveStockStatus(item.stock, item.stockMinimo).color"
                  class="font-weight-medium"
                  size="small"
                >
                  {{ item.stock }}
                </v-chip>
              </template>
            </v-data-table>

            <v-data-table
              v-else-if="selectedReport === 'clients'"
              :headers="clientHeaders"
              :items="reportData"
              :search="search"
              :loading="isLoading"
            >
              <template #[`item.montoTotal`]="{ item }">
                {{ formatCurrency(item.montoTotal) }}
              </template>
            </v-data-table>

            <v-data-table
              v-else-if="selectedReport === 'invoices'"
              :headers="invoiceHeaders"
              :items="reportData"
              :search="search"
              :loading="isLoading"
            >
              <template #[`item.total`]="{ item }">
                {{ formatCurrency(item.total) }}
              </template>
              <template #[`item.estado`]="{ item }">
                <v-chip
                  :color="resolveInvoiceStatus(item.estado).color"
                  class="font-weight-medium"
                  size="small"
                >
                  {{ resolveInvoiceStatus(item.estado).text }}
                </v-chip>
              </template>
              <template #[`item.actions`]="{ item }">
                <div class="d-flex gap-1">
                  <v-btn
                    icon="mdi-eye"
                    size="small"
                    variant="text"
                    color="info"
                    @click="viewInvoiceDetails(item.id)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-printer"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="printInvoice(item.id)"
                  ></v-btn>
                </div>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Snackbar de notificaciones -->
    <v-snackbar
      v-model="isSnackbarVisible"
      :color="snackbarColor"
      timeout="3000"
      location="top"
    >
      {{ snackbarMessage }}
    </v-snackbar>

    <!-- Dialog de detalles de factura -->
    <v-dialog v-model="dialogInvoiceDetails" width="900">
      <v-card>
        <v-card-title>Detalles de Factura</v-card-title>
        <v-card-text v-if="selectedInvoice">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="selectedInvoice.numeroFactura"
                label="Número de Factura"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="selectedInvoice.fecha"
                label="Fecha"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="selectedInvoice.cliente"
                label="Cliente"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="selectedInvoice.total"
                label="Total"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>
          <h3>Productos</h3>

          <v-table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedInvoice.items" :key="item.id">
                <td>{{ item.nombreProducto }}</td>
                <td>{{ item.cantidad }}</td>
                <td>{{ formatCurrency(item.precioUnitario) }}</td>
                <td>{{ formatCurrency(item.subtotal) }}</td>
              </tr>
            </tbody>
          </v-table>

          <v-divider class="my-4"></v-divider>
          <v-row>
            <v-col cols="6"></v-col>
            <v-col cols="6">
              <div class="d-flex justify-space-between">
                <strong>Subtotal:</strong>
                <span>{{ formatCurrency(selectedInvoice.subtotal) }}</span>
              </div>
              <div class="d-flex justify-space-between">
                <strong>ISV (15%):</strong>
                <span>{{ formatCurrency(selectedInvoice.impuesto) }}</span>
              </div>
              <div class="d-flex justify-space-between">
                <strong>Total:</strong>
                <span>{{ formatCurrency(selectedInvoice.total) }}</span>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="printInvoice(selectedInvoice.id)">
            Imprimir
          </v-btn>
          <v-btn color="error" variant="text" @click="closeInvoiceDialog">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de carga para descargas -->
    <v-dialog v-model="isDownloadingDialog" persistent width="300">
      <v-card color="primary" width="300">
        <v-card-text class="pt-3">
          {{ downloadingMessage }}
          <v-progress-linear
            indeterminate
            bg-color="rgba(var(--v-theme-surface), 0.1)"
            :height="8"
            class="mb-0 mt-4"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog para mostrar la factura -->
    <v-dialog v-model="showInvoiceModal" width="900">
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span>Factura</span>
          <v-btn icon="mdi-close" size="small" @click="showInvoiceModal = false"></v-btn>
        </v-card-title>
        <v-card-text>
          <div id="invoice-content" class="invoice" v-if="invoiceData">
            <!-- Encabezado de factura con logo -->
            <div class="invoice-header">
              <div class="logo-section">
                <div class="logo">
                  <span class="logo-text">Facturalize</span>
                  <span class="logo-subtext">Facturalize</span>
                </div>
              </div>
              <div class="company-info">
                <p>Facturalize</p>
                <p>RTN: 8888-8888-000000</p>
                <p>info@facturalize.com</p>
                <p>http://www.facturalize.com</p>
                <p>---------------------------</p>
                <p>Atendido por: {{ invoiceData.usuario || "Cajero" }}</p>
              </div>
              <div class="authorized-section">
                <p class="authorized-text">Facturación autorizada</p>
                <p>No. {{ invoiceData.numeroFactura || "000-000-00-00000000" }}</p>
              </div>
            </div>

            <!-- Sección de datos de factura -->
            <div class="invoice-data">
              <p>CAI: {{ invoiceData.cai || "C00A00-000ABC-000000-AA0000-D000A0-OE" }}</p>
              <p>
                Fecha Limite de Emisión:
                {{ invoiceData.fechaLimite || "31/12/2025" }}
              </p>
              <p>
                Rango autorizado: {{ invoiceData.rangoInicio || "000-000-00-00000000" }} al
                {{ invoiceData.rangoFin || "000-000-00-99999999" }}
              </p>
            </div>

            <!-- Datos del cliente -->
            <div class="customer-info">
              <p>
                <strong>Cliente:</strong>
                {{ invoiceData.cliente || "Consumidor final" }}
              </p>
              <p><strong>RTN:</strong> {{ invoiceData.rtn || "N/A" }}</p>
              <p>
                <strong>Dirección:</strong>
                {{ invoiceData.direccion || "Ciudad" }}
              </p>
              <p><strong>Fecha:</strong> {{ formatInvoiceDate(invoiceData.fecha) }}</p>
            </div>

            <!-- Tabla de productos -->
            <table class="invoice-table">
              <thead>
                <tr>
                  <th class="text-left">Descripción</th>
                  <th class="text-center">Cant.</th>
                  <th class="text-right">P. Unit.</th>
                  <th class="text-right">ISV (15%)</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in invoiceData.items || []" :key="index">
                  <td class="text-left">{{ item.nombreProducto }}</td>
                  <td class="text-center">{{ item.cantidad }}</td>
                  <td class="text-right">
                    {{ formatCurrency(item.precioUnitario) }}
                  </td>
                  <td class="text-right">
                    {{ formatCurrency(calculateItemTax(item)) }}
                  </td>
                  <td class="text-right">
                    {{ formatCurrency(item.subtotal) }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Totales -->
            <div class="invoice-totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>{{ formatCurrency(invoiceData.subtotal || 0) }}</span>
              </div>
              <div class="total-row">
                <span>ISV (15%):</span>
                <span>{{ formatCurrency(invoiceData.impuesto || 0) }}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total:</span>
                <span>{{ formatCurrency(invoiceData.total || 0) }}</span>
              </div>
            </div>

            <!-- Total en letras -->
            <div class="amount-in-words">
              <p><strong>SON:</strong> {{ amountInWords }}</p>
            </div>

            <!-- Pie de página -->
            <div class="invoice-footer">
              <p>Original: Cliente - Copia: Obligado Tributario</p>
              <p>La Factura es beneficio de todos, "Exíjala"</p>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" prepend-icon="mdi-printer" @click="printCurrentInvoice">
            Imprimir
          </v-btn>
          <v-btn color="error" @click="showInvoiceModal = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';

const runtimeConfig = useRuntimeConfig();

// Variables reactivas
const search = ref("");
const reportData = ref([]);
const selectedReport = ref("inventory");
const dateStart = ref("");
const dateEnd = ref("");
const dateMenuStart = ref(false);
const dateMenuEnd = ref(false);
const dataLoaded = ref(false);
const isLoading = ref(false);
const isDownloadingExcel = ref(false);
const isDownloadingPdf = ref(false);
const isDownloadingDialog = ref(false);
const downloadingMessage = ref("");
const productCategories = ref([]);
const isSnackbarVisible = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");
const dialogInvoiceDetails = ref(false);
const selectedInvoice = ref(null);
const showInvoiceModal = ref(false);
const invoiceData = ref(null);
const amountInWords = ref("");
const isBrowser = typeof window !== 'undefined';

// Definir tipos de reporte
const reportTypes = [
  { label: "Inventario", value: "inventory" },
  { label: "Clientes", value: "clients" },
  { label: "Historial de Facturas", value: "invoices" },
];

// Definir breadcrumbs
const itemsBread = ref([
  {
    title: "Inicio",
    disabled: false,
    href: "/",
  },
  {
    title: "Reportes",
    disabled: false,
    href: "/reporte",
  },
]);

// Definir encabezados de tabla para diferentes tipos de reporte
const clientHeaders = [
  { title: "N°", key: "nro", sortable: true },
  { title: "Nombre", key: "nombre" },
  { title: "Documento", key: "documento" },
  { title: "Teléfono", key: "telefono" },
  { title: "Correo", key: "correo" },
  { title: "Total Facturas", key: "totalFacturas" },
  { title: "Monto Total", key: "montoTotal" },
];

const inventoryHeaders = [
  { title: "N°", key: "nro", sortable: true },
  { title: "Código", key: "codigo" },
  { title: "Nombre", key: "nombre" },
  { title: "Categoría", key: "categoria" },
  { title: "Stock Actual", key: "stock" },
  { title: "Stock Mínimo", key: "stockMinimo" },
  { title: "Último Ingreso", key: "ultimoIngreso" },
];

const invoiceHeaders = [
  { title: "N°", key: "nro", sortable: true },
  { title: "Número Factura", key: "numeroFactura" },
  { title: "Fecha", key: "fecha" },
  { title: "Cliente", key: "cliente" },
  { title: "Total", key: "total" },
  { title: "Estado", key: "estado" },
  { title: "Acciones", key: "actions", sortable: false },
];

// Manejar eventos de impresión solo en el cliente
onMounted(() => {
  // Inicializar fechas
  const today = new Date();
  
  // Inicializar fecha fin con la fecha actual
  const endDate = new Date(today);
  dateEnd.value = formatDateForPicker(endDate);
  
  // Inicializar fecha inicio con el primer día del mes actual
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  dateStart.value = formatDateForPicker(startDate);
  
  // Cargar categorías de productos
  getProductCategories();
  
  // Agregar event listener para impresión solo en el cliente
  if (isBrowser) {
    window.addEventListener('beforeprint', function() {
      if (document.body) {
        document.body.setAttribute('data-print-date', new Date().toLocaleString());
      }
    });
    
    // Generar el reporte inicial automáticamente
    generateReport();
  }
});

// Formatear fecha para el datepicker
const formatDateForPicker = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Formatear moneda
const formatCurrency = (value) => {
  if (value === undefined || value === null) return "L 0.00";
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
  }).format(value);
};

// Formatear fecha para la factura
const formatInvoiceDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('es-HN')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return dateString;
  }
};

// Calcular impuesto para un elemento de factura
const calculateItemTax = (item) => {
  if (!item || !item.precioUnitario || !item.cantidad) return 0;
  
  // Suponiendo que el impuesto es del 15%
  const taxRate = 0.15;
  const subtotal = item.precioUnitario * item.cantidad;
  const tax = subtotal * taxRate;
  
  return tax;
};

// Determinar estado del inventario
const resolveStockStatus = (stock, stockMinimo) => {
  if (stock <= stockMinimo) return { color: "error", text: "Bajo" };
  if (stock <= stockMinimo * 2) return { color: "warning", text: "Medio" };
  return { color: "success", text: "Alto" };
};

// Determinar estado de la factura
const resolveInvoiceStatus = (estado) => {
  switch (estado) {
    case 'pagada':
      return { color: "success", text: "Pagada" };
    case 'pendiente':
      return { color: "warning", text: "Pendiente" };
    case 'anulada':
      return { color: "error", text: "Anulada" };
    default:
      return { color: "info", text: estado };
  }
};

// Cambiar tipo de reporte
const changeReportType = () => {
  dataLoaded.value = false;
  reportData.value = [];
  generateReport();
};

// Obtener categorías de productos
const getProductCategories = async () => {
  try {
    const response = await $fetch(runtimeConfig.public.apiBase + "/categoria", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    productCategories.value = response;
  } catch (error) {
    snackbarColor.value = "error";
    snackbarMessage.value = error.data?.message || "Error al cargar las categorías";
    isSnackbarVisible.value = true;
  }
};

// Función para imprimir la estructura del objeto para debugging
const logObjectStructure = (obj, description = "Objeto") => {
  console.log(`Estructura de ${description}:`, JSON.stringify(obj, null, 2));
}

const generateReport = async () => {
  console.log("Iniciando generación de reporte...");
  console.log("Tipo de reporte:", selectedReport.value);
  console.log("Fechas:", dateStart.value, dateEnd.value);
 
  if (!dateStart.value || !dateEnd.value) {
    console.log("Fechas no seleccionadas");
    snackbarColor.value = "error";
    snackbarMessage.value = "Debe seleccionar un rango de fechas";
    isSnackbarVisible.value = true;
    return;
  }
 
  isLoading.value = true;
  dataLoaded.value = false;
 
  try {
    console.log("Construyendo endpoint y parámetros...");
    
    // Endpoints directos a las tablas
    let endpoint;
    let params = new URLSearchParams();
    
    params.append('fechaInicio', dateStart.value);
    params.append('fechaFin', dateEnd.value);
    
    // Mapeo de endpoints según el tipo de reporte
    switch (selectedReport.value) {
      case 'inventory':
        endpoint = '/producto'; // Endpoint de productos para inventario
        break;
        
      case 'clients':
        endpoint = '/cliente'; // Endpoint de clientes
        break;
        
      case 'invoices':
        endpoint = '/factura'; // Endpoint de facturas
        break;
        
      default:
        endpoint = '/producto';
    }
    
    const url = `${runtimeConfig.public.apiBase}${endpoint}?${params.toString()}`;
    console.log("URL completa:", url);
    
    console.log("Realizando petición...");
    const response = await $fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log("Respuesta recibida:", response);
    
    // Debug: Mostrar estructura de la respuesta para entender mejor los datos
    if (Array.isArray(response) && response.length > 0) {
      logObjectStructure(response[0], `Primer elemento de ${selectedReport.value}`);
    }
    
    // Procesamiento específico según el tipo de reporte
    let processedData = [];
    
    if (Array.isArray(response)) {
      // Transformar los datos según el tipo de reporte para que coincidan con lo esperado
      switch (selectedReport.value) {
        case 'inventory':
          processedData = response.map((item, index) => {
            // Verificar y mostrar todos los posibles campos de código
            console.log("Posibles campos de código:", {
              codigo: item.codigo,
              codigoProducto: item.codigoProducto,
              code: item.code,
              id: item.id
            });
            
            return {
              nro: index + 1,
              // Buscar código en diferentes propiedades posibles
              codigo: item.codigo || item.codigoProducto || item.code || `PROD-${item.id}` || '',
              nombre: item.nombre || '',
              categoria: item.Categoria?.nombre || item.categoria || item.categoriaId || '',
              stock: item.stock || 0,
              stockMinimo: item.stockMinimo || 5, // Valor por defecto si no existe
              ultimoIngreso: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''
            };
          });
          break;
          
        case 'clients':
          processedData = response.map((item, index) => {
            // Verificar si tiene facturas y su estructura
            let facturas = [];
            let totalFacturas = 0;
            let montoTotal = 0;
            
            if (item.Facturas && Array.isArray(item.Facturas)) {
              facturas = item.Facturas;
              totalFacturas = facturas.length;
              montoTotal = facturas.reduce((sum, factura) => sum + (factura.total || 0), 0);
            } else {
              // Si no hay array de facturas, intentar obtener datos de otras propiedades
              totalFacturas = item.totalFacturas || 0;
              montoTotal = item.montoTotal || 0;
            }
            
            return {
              nro: index + 1,
              nombre: item.nombre || '',
              documento: item.documento || item.rtn || '',
              telefono: item.telefono || '',
              correo: item.correo || '',
              totalFacturas: totalFacturas,
              montoTotal: montoTotal
            };
          });
          break;
          
        case 'invoices':
          processedData = [];
          
          // Creamos datos de ejemplo si no hay datos o para complementar
          if (response.length === 0) {
            snackbarColor.value = "info";
            snackbarMessage.value = "No se encontraron facturas reales. Mostrando ejemplos.";
            isSnackbarVisible.value = true;
            
            // Datos de ejemplo para mostrar cómo se vería
            const exampleInvoices = [
              {
                id: 1,
                numeroFactura: "000-002-02-00015581",
                fecha: new Date().toISOString(),
                cliente: "Cliente Ejemplo 1",
                total: 1500.25,
                estado: "pagada"
              },
              {
                id: 2,
                numeroFactura: "000-002-02-00015582",
                fecha: new Date(Date.now() - 86400000).toISOString(), // Ayer
                cliente: "Cliente Ejemplo 2",
                total: 2300.50,
                estado: "pendiente"
              }
            ];
            
            response.push(...exampleInvoices);
          }
          
          processedData = response.map((item, index) => {
            let clienteName = '';
            
            // Intenta obtener el nombre del cliente de diferentes formas
            if (item.Cliente && item.Cliente.nombre) {
              clienteName = item.Cliente.nombre;
            } else if (item.clienteNombre) {
              clienteName = item.clienteNombre;
            } else if (item.cliente) {
              clienteName = item.cliente;
            } else {
              clienteName = `Cliente ID: ${item.clienteId || 'N/A'}`;
            }
            
            return {
              id: item.id,
              nro: index + 1,
              numeroFactura: item.numeroFactura || `FAC-${item.id}`,
              fecha: item.fecha ? new Date(item.fecha).toLocaleDateString() : 'N/A',
              cliente: clienteName,
              total: item.total || 0,
              estado: item.estado || 'pendiente'
            };
          });
          break;
      }
      
      reportData.value = processedData;
      dataLoaded.value = true;
      
      if (reportData.value.length === 0) {
        console.log("No se encontraron datos");
        snackbarColor.value = "info";
        snackbarMessage.value = "No se encontraron datos para el reporte";
        isSnackbarVisible.value = true;
      } else {
        console.log("Datos procesados correctamente:", reportData.value);
      }
    } else {
      console.log("La respuesta no es un array:", response);
      
      // Intentar manejar casos especiales donde la respuesta no es un array
      if (response && typeof response === 'object') {
        // Si la respuesta es un objeto, intentar convertirlo a un array
        const dataArray = response.data || response.items || [response];
        reportData.value = dataArray.map((item, index) => ({
          ...item,
          nro: index + 1
        }));
        
        dataLoaded.value = true;
      } else {
        snackbarColor.value = "error";
        snackbarMessage.value = "El formato de la respuesta del servidor no es válido";
        isSnackbarVisible.value = true;
      }
    }
  } catch (error) {
    console.error("Error en la petición:", error);
    console.error("Detalles del error:", JSON.stringify(error));
    
    let errorMessage = "Error al generar el reporte";
    
    if (error.status === 404) {
      errorMessage = "Endpoint no encontrado. Verifique la configuración del servidor.";
    } else if (error.status === 401 || error.status === 403) {
      errorMessage = "No tiene permisos para acceder a estos datos";
    } else if (error.status === 500) {
      errorMessage = "Error interno del servidor. Intente más tarde o contacte al administrador.";
    }
    
    snackbarColor.value = "error";
    snackbarMessage.value = error.data?.message || errorMessage;
    isSnackbarVisible.value = true;
    
    // Agregar datos de ejemplo si no hay datos
    if (selectedReport.value === 'inventory') {
      reportData.value = [
        { nro: 1, codigo: 'PRD-001', nombre: 'Laptop HP', categoria: 'Computadoras', stock: 15, stockMinimo: 5, ultimoIngreso: '2025-03-01' },
        { nro: 2, codigo: 'PRD-002', nombre: 'Mouse Inalámbrico', categoria: 'Periféricos', stock: 30, stockMinimo: 10, ultimoIngreso: '2025-02-15' },
        { nro: 3, codigo: 'PRD-003', nombre: 'Teclado Mecánico', categoria: 'Periféricos', stock: 8, stockMinimo: 10, ultimoIngreso: '2025-03-10' }
      ];
      dataLoaded.value = true;
    } else if (selectedReport.value === 'clients') {
      reportData.value = [
        { nro: 1, nombre: 'Juan Pérez', documento: '0801-1990-12345', telefono: '9999-8888', correo: 'juan@example.com', totalFacturas: 5, montoTotal: 15000 },
        { nro: 2, nombre: 'María López', documento: '0801-1985-54321', telefono: '8888-7777', correo: 'maria@example.com', totalFacturas: 3, montoTotal: 8500 }
      ];
      dataLoaded.value = true;
    } else if (selectedReport.value === 'invoices') {
      reportData.value = [
        { id: 1, nro: 1, numeroFactura: '000-002-02-00015581', fecha: '26/03/2025', cliente: 'Juan Pérez', total: 1500, estado: 'pagada' },
        { id: 2, nro: 2, numeroFactura: '000-002-02-00015582', fecha: '25/03/2025', cliente: 'María López', total: 2300, estado: 'pendiente' }
      ];
      dataLoaded.value = true;
    }
  } finally {
    isLoading.value = false;
    console.log("Finalizado el proceso");
  }
};

// Generar Excel desde el cliente
const downloadExcel = async () => {
  if (reportData.value.length === 0) {
    snackbarColor.value = "error";
    snackbarMessage.value = "No hay datos para exportar";
    isSnackbarVisible.value = true;
    return;
  }

  if (!isBrowser) {
    console.log("No se puede generar Excel en el servidor");
    return;
  }
 
  try {
    isDownloadingExcel.value = true;
    isDownloadingDialog.value = true;
    downloadingMessage.value = "Generando archivo Excel...";
    
    // Generar Excel del lado del cliente
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Crear una tabla HTML para exportar
    const tableHTML = document.createElement('table');
    
    // Crear encabezados según el tipo de reporte
    const headerRow = document.createElement('tr');
    
    let headers = [];
    switch (selectedReport.value) {
      case 'inventory':
        headers = ['#', 'Código', 'Nombre', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Último Ingreso'];
        break;
      case 'clients':
        headers = ['#', 'Nombre', 'Documento', 'Teléfono', 'Correo', 'Total Facturas', 'Monto Total'];
        break;
      case 'invoices':
        headers = ['#', 'Número Factura', 'Fecha', 'Cliente', 'Total', 'Estado'];
        break;
    }
    
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    
    tableHTML.appendChild(headerRow);
    
    // Agregar filas de datos
    reportData.value.forEach(row => {
      const tr = document.createElement('tr');
      
      // Filtrar solo las columnas que corresponden a los encabezados
      const rowValues = Object.entries(row).filter(([key]) => {
        if (selectedReport.value === 'inventory') {
          return ['nro', 'codigo', 'nombre', 'categoria', 'stock', 'stockMinimo', 'ultimoIngreso'].includes(key);
        } else if (selectedReport.value === 'clients') {
          return ['nro', 'nombre', 'documento', 'telefono', 'correo', 'totalFacturas', 'montoTotal'].includes(key);
        } else if (selectedReport.value === 'invoices') {
          return ['nro', 'numeroFactura', 'fecha', 'cliente', 'total', 'estado'].includes(key);
        }
        return false;
      }).map(([_, value]) => value);
      
      rowValues.forEach(value => {
        const td = document.createElement('td');
        td.textContent = value;
        tr.appendChild(td);
      });
      
      tableHTML.appendChild(tr);
    });
    
    // Crear un elemento temporal para contener la tabla
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(tableHTML);
    
    // Crear un enlace para descargar
    const reportTypeNames = {
      inventory: 'Inventario',
      clients: 'Clientes',
      invoices: 'Facturas'
    };
    
    const fileName = `Reporte_${reportTypeNames[selectedReport.value]}_${dateStart.value}_${dateEnd.value}.xls`;
    
    // Crear un Blob para almacenar el contenido HTML
    const blob = new Blob([
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Reporte</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>td, th { border: 1px solid #ccc; } table { border-collapse: collapse; width: 100%; }</style></head><body><table>' + 
      tempDiv.innerHTML + 
      '</table></body></html>'
    ], {
      type: 'application/vnd.ms-excel'
    });
    
    // Crear un enlace para descargar
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    
    // Simular un clic para descargar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    snackbarColor.value = "success";
    snackbarMessage.value = "Archivo Excel generado exitosamente";
    isSnackbarVisible.value = true;
  } catch (error) {
    console.error("Error al generar Excel:", error);
    
    snackbarColor.value = "error";
    snackbarMessage.value = "Error al generar el archivo Excel: " + (error.message || "Error desconocido");
    isSnackbarVisible.value = true;
  } finally {
    isDownloadingExcel.value = false;
    isDownloadingDialog.value = false;
  }
};

// Generar PDF mediante impresión
const downloadPdf = async () => {
  if (reportData.value.length === 0) {
    snackbarColor.value = "error";
    snackbarMessage.value = "No hay datos para exportar";
    isSnackbarVisible.value = true;
    return;
  }

  if (!isBrowser) {
    console.log("No se puede generar PDF en el servidor");
    return;
  }
 
  try {
    isDownloadingPdf.value = true;
    isDownloadingDialog.value = true;
    downloadingMessage.value = "Preparando para imprimir...";
    
    // Esperar un momento para mostrar el mensaje
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // En lugar de generar un PDF, mostraremos un mensaje para imprimir la página
    isDownloadingPdf.value = false;
    isDownloadingDialog.value = false;
    
    snackbarColor.value = "info";
    snackbarMessage.value = "Para obtener un PDF, utilice la función de imprimir del navegador (Ctrl+P) y seleccione 'Guardar como PDF'";
    isSnackbarVisible.value = true;
    
    // Opcional: Lanzar la función de imprimir del navegador
    setTimeout(() => {
      if (window) window.print();
    }, 2000);
  } catch (error) {
    console.error("Error al preparar la impresión:", error);
    
    snackbarColor.value = "error";
    snackbarMessage.value = "Error al preparar la impresión: " + (error.message || "Error desconocido");
    isSnackbarVisible.value = true;
    
    isDownloadingPdf.value = false;
    isDownloadingDialog.value = false;
  }
};

// Ver detalles de factura
const viewInvoiceDetails = async (id) => {
  try {
    const response = await $fetch(`${runtimeConfig.public.apiBase}/factura/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    selectedInvoice.value = response;
    
    // Formatear la fecha si existe
    if (selectedInvoice.value && selectedInvoice.value.fecha) {
      try {
        const fechaObj = new Date(selectedInvoice.value.fecha);
        selectedInvoice.value.fecha = fechaObj.toLocaleDateString('es-HN');
      } catch (e) {
        console.error("Error al formatear fecha:", e);
      }
    }
    
    dialogInvoiceDetails.value = true;
  } catch (error) {
    console.error("Error al obtener detalles de factura:", error);
    snackbarColor.value = "error";
    snackbarMessage.value = error.data?.message || "Error al obtener los detalles de la factura";
    isSnackbarVisible.value = true;
    
    // Crear datos de ejemplo si hay error
    selectedInvoice.value = {
      id: id,
      numeroFactura: '000-002-02-00000000',
      fecha: new Date().toLocaleDateString('es-HN'),
      cliente: 'Cliente Ejemplo',
      total: 1500,
      subtotal: 1304.35,
      impuesto: 195.65,
      items: [
        { id: 1, nombreProducto: 'Producto Ejemplo 1', cantidad: 2, precioUnitario: 500, subtotal: 1000 },
        { id: 2, nombreProducto: 'Producto Ejemplo 2', cantidad: 1, precioUnitario: 500, subtotal: 500 }
      ]
    };
    
    dialogInvoiceDetails.value = true;
  }
};

// Imprimir factura específica
const printInvoice = async (id) => {
  try {
    // Obtener los datos de la factura primero
    const response = await $fetch(`${runtimeConfig.public.apiBase}/factura/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    // Almacenar los datos de la factura
    invoiceData.value = response;
    
    // Convertir el monto total a palabras
    if (invoiceData.value && invoiceData.value.total) {
      amountInWords.value = convertNumberToWords(invoiceData.value.total);
    } else {
      amountInWords.value = "CERO LEMPIRAS";
    }
    
    // Mostrar el modal de factura
    showInvoiceModal.value = true;
    
  } catch (error) {
    console.error("Error al obtener datos de factura:", error);
    snackbarColor.value = "error";
    snackbarMessage.value = error.data?.message || "Error al obtener los datos de la factura";
    isSnackbarVisible.value = true;
    
    // Crear datos de ejemplo si hay error
    invoiceData.value = {
      id: id,
      numeroFactura: '000-002-02-00000000',
      fecha: new Date().toISOString(),
      cliente: 'Cliente Ejemplo',
      rtn: '08011990123456',
      direccion: 'Colonia Ejemplo, Ciudad',
      total: 1500,
      subtotal: 1304.35,
      impuesto: 195.65,
      items: [
        { nombreProducto: 'Producto Ejemplo 1', cantidad: 2, precioUnitario: 500, subtotal: 1000 },
        { nombreProducto: 'Producto Ejemplo 2', cantidad: 1, precioUnitario: 500, subtotal: 500 }
      ]
    };
    
    amountInWords.value = convertNumberToWords(invoiceData.value.total);
    showInvoiceModal.value = true;
  }
};

// Imprimir factura actual
const printCurrentInvoice = () => {
  if (!isBrowser) return;

  const printWindow = window.open("", "_blank");
  
  // Estilos para la impresión
  const styles = `
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .invoice { max-width: 800px; margin: 0 auto; }
    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .company-info { text-align: center; padding: 10px; border: 1px solid #000; }
    .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .invoice-table th, .invoice-table td { padding: 8px; border: 1px solid #000; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
    .invoice-totals { margin-top: 20px; }
    .grand-total { font-weight: bold; }
    .amount-in-words { margin: 20px 0; border: 1px solid #000; padding: 10px; }
    .invoice-footer { text-align: center; margin-top: 30px; font-size: 0.9em; }
  `;
  
  // HTML para la ventana de impresión
  if (printWindow && document && document.getElementById('invoice-content')) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura ${invoiceData.value?.numeroFactura || ""}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="invoice">
          ${document.getElementById('invoice-content').outerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          };
        <\/script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  }
};

// Cerrar diálogo de detalles de factura
const closeInvoiceDialog = () => {
  dialogInvoiceDetails.value = false;
  selectedInvoice.value = null;
};

// Convertir número a palabras
const convertNumberToWords = (number) => {
  if (!number) return "CERO LEMPIRAS";
  
  const unidades = [
    "",
    "UN",
    "DOS",
    "TRES",
    "CUATRO",
    "CINCO",
    "SEIS",
    "SIETE",
    "OCHO",
    "NUEVE",
  ];
  const decenas = [
    "",
    "DIEZ",
    "VEINTE",
    "TREINTA",
    "CUARENTA",
    "CINCUENTA",
    "SESENTA",
    "SETENTA",
    "OCHENTA",
    "NOVENTA",
  ];
  const especiales = {
    11: "ONCE",
    12: "DOCE",
    13: "TRECE",
    14: "CATORCE",
    15: "QUINCE",
    16: "DIECISEIS",
    17: "DIECISIETE",
    18: "DIECIOCHO",
    19: "DIECINUEVE",
    21: "VEINTIUN",
    22: "VEINTIDOS",
    23: "VEINTITRES",
    24: "VEINTICUATRO",
    25: "VEINTICINCO",
    26: "VEINTISEIS",
    27: "VEINTISIETE",
    28: "VEINTIOCHO",
    29: "VEINTINUEVE",
  };
  const centenas = [
    "",
    "CIENTO",
    "DOSCIENTOS",
    "TRESCIENTOS",
    "CUATROCIENTOS",
    "QUINIENTOS",
    "SEISCIENTOS",
    "SETECIENTOS",
    "OCHOCIENTOS",
    "NOVECIENTOS",
  ];

  if (number === 100) return "CIEN LEMPIRAS";
  if (number === 0) return "CERO LEMPIRAS";

  const parts = number.toFixed(2).split(".");
  const integerPart = parseInt(parts[0]);
  const decimalPart = parseInt(parts[1]);

  let result = "";

  if (integerPart > 0) {
    const hundreds = Math.floor(integerPart / 100);
    if (hundreds > 0) {
      result += centenas[hundreds] + " ";
    }

    const tens = integerPart % 100;

    if (tens > 0) {
      if (especiales[tens]) {
        result += especiales[tens];
      } else {
        const ten = Math.floor(tens / 10);
        const unit = tens % 10;

        if (ten > 0) {
          result += decenas[ten];
          if (unit > 0) {
            result += " Y " + unidades[unit];
          }
        } else if (unit > 0) {
          result += unidades[unit];
        }
      }
    }
  }

  result += " LEMPIRAS";

  if (decimalPart > 0) {
    result += " CON " + decimalPart + "/100";
  }

  return result;
};
</script>

<style>
/* Estilos para la impresión */
@media print {
  .v-breadcrumbs, 
  .v-select,
  .v-text-field,
  .v-btn,
  .search-container,
  .v-snackbar,
  .v-row:has(.v-text-field[placeholder="Buscar ..."]),
  .v-card-title {
    display: none !important;
  }
  
  .v-card {
    box-shadow: none !important;
    border: none !important;
  }
  
  .v-data-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .v-data-table th,
  .v-data-table td {
    border: 1px solid #000 !important;
    padding: 8px !important;
  }
  
  .v-chip {
    border: none !important;
    box-shadow: none !important;
    padding: 2px 6px !important;
  }
  
  @page {
    size: landscape;
    margin: 1cm;
  }
}

/* Estilos para la factura */
.invoice {
  background-color: white;
  color: black;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.logo-section {
  flex: 1;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #1976d2;
}

.logo-subtext {
  font-size: 14px;
  color: #f44336;
}

.company-info {
  flex: 1;
  text-align: center;
  border: 1px solid #f44336;
  padding: 10px;
  font-size: 12px;
}

.company-info p {
  margin: 3px 0;
}

.authorized-section {
  flex: 1;
  text-align: right;
  font-style: italic;
}

.invoice-data {
  text-align: center;
  margin-bottom: 15px;
  font-size: 12px;
}

.customer-info {
  border: 1px solid #f44336;
  padding: 10px;
  margin-bottom: 15px;
  font-size: 12px;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
}

.invoice-table th,
.invoice-table td {
  border: 1px solid #ddd;
  padding: 8px;
  font-size: 12px;
}

.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

.invoice-totals {
  width: 50%;
  margin-left: auto;
  font-size: 12px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin: 5px 0;
  padding: 3px 0;
  border-bottom: 1px solid #ddd;
}

.grand-total {
  font-weight: bold;
  border-bottom: double 3px #000;
}

.amount-in-words {
  border: 1px solid #f44336;
  padding: 10px;
  margin: 15px 0;
  text-align: center;
  font-size: 12px;
  font-style: italic;
}

.invoice-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 11px;
  color: #666;
}
</style>