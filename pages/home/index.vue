<template>
  <v-container fluid class="pa-6">
    <!-- Header de Bienvenida -->
    <div class="text-center mb-8">
      <v-img
        src="@/assets/logonombre.png"
        contain
        max-height="200"
        class="mb-4 mx-auto"
      ></v-img>
      <h1 class="text-h3 font-weight-light text-primary mb-2">
        Bienvenidos a Facturalize!
      </h1>
      <p class="text-h6 text--secondary">
        {{ new Date().toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) }}
      </p>
    </div>

    <!-- Tarjetas de KPIs -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="primary" dark>
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-cash</v-icon>
            <div class="text-h4 font-weight-bold">{{ formatCurrency(totalVentas) }}</div>
            <div class="text-subtitle-1">Ventas del Mes</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="success" dark>
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-receipt</v-icon>
            <div class="text-h4 font-weight-bold">{{ totalFacturas }}</div>
            <div class="text-subtitle-1">Facturas Emitidas</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="warning" dark>
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-package-variant</v-icon>
            <div class="text-h4 font-weight-bold">{{ totalProductos }}</div>
            <div class="text-subtitle-1">Productos Activos</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="info" dark>
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-account-group</v-icon>
            <div class="text-h4 font-weight-bold">{{ totalClientes }}</div>
            <div class="text-subtitle-1">Clientes Registrados</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    
  </v-container>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'

definePageMeta({
  middleware: 'auth'
})

// Referencias para los gráficos
const ventasChart = ref(null)
const categoriasChart = ref(null)
const topProductosChart = ref(null)
const estadoFacturasChart = ref(null)

// Datos reactivos
const totalVentas = ref(0)
const totalFacturas = ref(0)
const totalProductos = ref(0)
const totalClientes = ref(0)

// Instancias de gráficos
let ventasChartInstance = null
let categoriasChartInstance = null
let topProductosChartInstance = null
let estadoFacturasChartInstance = null

// Función para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL'
  }).format(amount)
}

// Cargar datos del dashboard
const loadDashboardData = async () => {
  try {
    // Aquí harás las llamadas a tu API
    const response = await $fetch('/api/dashboard/stats')
    
    totalVentas.value = response.totalVentas || 0
    totalFacturas.value = response.totalFacturas || 0
    totalProductos.value = response.totalProductos || 0
    totalClientes.value = response.totalClientes || 0

    // Cargar gráficos después de obtener los datos
    await nextTick()
    initCharts()
    
  } catch (error) {
    console.error('Error cargando datos del dashboard:', error)
    // Usar datos de ejemplo si falla la API
    loadExampleData()
  }
}

/*const loadDashboardData = async () => {
  try {
    const response = await $fetch('/api/dashboard/stats')
    
    if (response.success) {
      totalVentas.value = response.totalVentas
      totalFacturas.value = response.totalFacturas
      totalProductos.value = response.totalProductos
      totalClientes.value = response.totalClientes
    }
    
  } catch (error) {
    console.error('Error cargando datos del dashboard:', error)
    // Datos de ejemplo como fallback
    totalVentas.value = 0
    totalFacturas.value = 0
    totalProductos.value = 0
    totalClientes.value = 0
  }
}*/

// Datos de ejemplo para desarrollo
const loadExampleData = () => {
  totalVentas.value = 125750.50
  totalFacturas.value = 47
  totalProductos.value = 156
  totalClientes.value = 89
  
  nextTick(() => {
    initCharts()
  })
}

// Inicializar gráficos
const initCharts = () => {
  // Gráfico de Ventas Mensuales
  if (ventasChart.value) {
    ventasChartInstance = new Chart(ventasChart.value, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Ventas (HNL)',
          data: [65000, 75000, 55000, 85000, 95000, 125750],
          borderColor: 'rgb(33, 150, 243)',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
  }

  // Gráfico de Productos por Categoría
  if (categoriasChart.value) {
    categoriasChartInstance = new Chart(categoriasChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Otros'],
        datasets: [{
          data: [45, 25, 30, 20, 36],
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    })
  }

  // Gráfico Top Productos
  if (topProductosChart.value) {
    topProductosChartInstance = new Chart(topProductosChart.value, {
      type: 'bar',
      data: {
        labels: ['Producto A', 'Producto B', 'Producto C', 'Producto D', 'Producto E'],
        datasets: [{
          label: 'Ventas',
          data: [25, 19, 15, 12, 8],
          backgroundColor: 'rgba(76, 175, 80, 0.8)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
  }

  // Gráfico Estado de Facturas
  if (estadoFacturasChart.value) {
    estadoFacturasChartInstance = new Chart(estadoFacturasChart.value, {
      type: 'pie',
      data: {
        labels: ['Pagadas', 'Pendientes', 'Vencidas'],
        datasets: [{
          data: [35, 10, 2],
          backgroundColor: [
            '#4CAF50',
            '#FF9800',
            '#F44336'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    })
  }
}

// Limpiar gráficos al desmontar
onUnmounted(() => {
  if (ventasChartInstance) ventasChartInstance.destroy()
  if (categoriasChartInstance) categoriasChartInstance.destroy()
  if (topProductosChartInstance) topProductosChartInstance.destroy()
  if (estadoFacturasChartInstance) estadoFacturasChartInstance.destroy()
})

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.chart-card {
  height: 400px;
}

.chart-card .v-card-text {
  height: 320px;
  position: relative;
}

.action-btn {
  height: 60px !important;
  font-weight: 600;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

canvas {
  max-height: 300px !important;
}
</style>