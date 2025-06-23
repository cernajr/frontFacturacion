<template>
  <v-container fluid class="caja-container">
    <!-- Breadcrumb navigation -->
    <v-breadcrumbs :items="breadcrumbs" divider=">" class="px-0 mb-4">
      <template v-slot:item="{ item }">
        <v-breadcrumbs-item :disabled="item.disabled" @click="navigateTo(item.href)" class="cursor-pointer">
          {{ item.title }}
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>

    <!-- Header con controles de caja -->
    <v-row class="mb-6" align="center">
      <v-col cols="12" md="6">
        <div class="d-flex align-center ga-4">
          <h1 class="text-h4 font-weight-bold">Sistema de Caja</h1>
          <v-chip :color="isCashRegisterOpen ? 'success' : 'error'"
            :prepend-icon="isCashRegisterOpen ? 'mdi-cash-register' : 'mdi-cash-register-outline'" variant="flat">
            {{ isCashRegisterOpen ? 'Caja Abierta' : 'Caja Cerrada' }}
          </v-chip>
        </div>
      </v-col>
      <v-col cols="12" md="6" class="text-right">
        <div class="d-flex align-center justify-end ga-3">
          <v-btn v-if="!isCashRegisterOpen" color="success" prepend-icon="mdi-cash-register" @click="openCashRegister">
            Abrir Caja
          </v-btn>
          <v-btn v-if="isCashRegisterOpen" color="error" prepend-icon="mdi-cash-register-outline"
            @click="closeCashRegister">
            Cerrar Caja
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Grid principal -->
    <v-row v-if="isCashRegisterOpen" class="ga-4 flex-nowrap" style="overflow-x: auto;">
      <v-col cols="12" sm="6" md="6" lg="6">
        <v-card elevation="2">
          <v-card-title class="bg-primary text-white">
            <v-icon icon="mdi-package-variant" class="me-2" />
            Productos
          </v-card-title>
          <v-card-text class="pa-0">
            <v-text-field v-model="productSearch" prepend-inner-icon="mdi-magnify" placeholder="Buscar producto..."
              variant="outlined" density="compact" hide-details class="ma-4" @input="searchProducts" />
            <v-divider />
            <v-list class="product-list" style="max-height: 500px; overflow-y: auto">
              <v-list-item v-for="product in searchResults" :key="product.id" @click="addToCart(product)"
                class="product-item" :ripple="true">
                <template v-slot:prepend>
                  <v-avatar color="primary" variant="tonal">
                    <v-icon icon="mdi-package-variant" />
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">
                  {{ product.nombre }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Código: {{ product.codigoProducto }} | Stock: {{ product.stock }}
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip color="success" variant="flat" size="small">
                    L {{ product.precio_venta.toFixed(2) }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-list-item v-if="searchResults.length === 0">
                <v-list-item-title class="text-center text-medium-emphasis">
                  No se encontraron productos
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="6" lg="6">
        <v-card elevation="2" >
          <v-card-title class="bg-secondary text-white">
            <v-icon icon="mdi-cart" class="me-2" />
            Productos Seleccionados
          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table :headers="cartHeaders" :items="cartItems" item-value="id"
              no-data-text="No hay productos en el carrito" hide-default-footer class="cart-table">
              <template v-slot:item.numero="{ index }">
                {{ index + 1 }}
              </template>
              <template v-slot:item.precio_venta="{ item }">
                L {{ item.precio_venta.toFixed(2) }}
              </template>
              <template v-slot:item.cantidad="{ item, index }">
                <div class="d-flex align-center ga-2">
                  <v-btn icon="mdi-minus" size="x-small" variant="outlined" @click="decreaseQuantity(index)" />
                  <v-text-field v-model.number="item.cantidad" type="number" min="1" variant="outlined"
                    density="compact" hide-details style="width: 80px" @change="updateSubtotal(index)" />
                  <v-btn icon="mdi-plus" size="x-small" variant="outlined" @click="increaseQuantity(index)" />
                </div>
              </template>
              <template v-slot:item.isv="{ item }">
                L {{ calculateTax(item).toFixed(2) }}
              </template>
              <template v-slot:item.subtotal="{ item }">
                L {{ (item.precio_venta * item.cantidad).toFixed(2) }}
              </template>
              <template v-slot:item.actions="{ index }">
                <v-btn icon="mdi-delete" color="error" variant="tonal" size="small" @click="removeItem(index)" />
              </template>
            </v-data-table>
          </v-card-text>

          <v-divider />
          <v-card-text>
            <v-row class="text-body-1">
              <v-col cols="12" class="d-flex justify-space-between">
                <span>Subtotal:</span>
                <span>L {{ calculateSubtotal() }}</span>
              </v-col>
              <v-col cols="12" class="d-flex justify-space-between">
                <span>ISV (15%):</span>
                <span>L {{ calculateTotalTax() }}</span>
              </v-col>
              <v-divider class="my-2" />
              <v-col cols="12" class="d-flex justify-space-between text-h6 font-weight-bold">
                <span>Total:</span>
                <span class="text-success">L {{ calculateTotal() }}</span>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" size="large" prepend-icon="mdi-credit-card" :disabled="cartItems.length === 0"
              @click="processPayment">
              Procesar Pago
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal de abrir caja -->
    <v-dialog v-model="showOpenCashModal" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-cash-register" class="me-2" />
          Abrir Caja
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-6">
          <v-text-field v-model.number="initialCashAmount" label="Monto inicial en efectivo" type="number" 
            step="0.01" prepend-icon="mdi-cash" variant="outlined" suffix="L" placeholder="Minimo L.500"/>
          <v-textarea v-model="openCashComments" label="Comentarios (opcional)"
            placeholder="Comentarios sobre apertura de caja..." variant="outlined" rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showOpenCashModal = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmOpenCash">Abrir Caja</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de cerrar caja -->
    <v-dialog v-model="showCloseCashModal" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-cash-register-outline" class="me-2" />
          Cerrar Caja
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-6">
          <v-card variant="tonal" class="mb-4">
            <v-card-title class="text-h6">Resumen del día</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="6">Monto inicial:</v-col>
                <v-col cols="6" class="text-right">L {{ initialCashAmount.toFixed(2) }}</v-col>
                <v-col cols="6">Ventas en efectivo:</v-col>
                <v-col cols="6" class="text-right">L {{ calculateCashSales().toFixed(2) }}</v-col>
                <v-divider class="my-2" />
                <v-col cols="6" class="font-weight-bold">Total esperado:</v-col>
                <v-col cols="6" class="text-right font-weight-bold">
                  L {{ (initialCashAmount + calculateCashSales()).toFixed(2) }}
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-text-field v-model.number="actualCashAmount" label="Efectivo actual en caja" type="number" min="0"
            step="0.01" prepend-icon="mdi-cash" variant="outlined" suffix="L" />

          <v-alert :type="cashDifference >= 0 ? 'success' : 'error'"
            :text="'Diferencia: L ' + cashDifference.toFixed(2)" class="mb-4" />

          <v-textarea v-model="closeCashComments" label="Comentarios" placeholder="Comentarios sobre cierre de caja..."
            variant="outlined" rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCloseCashModal = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmCloseCash">Cerrar Caja</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de selección de cliente -->
    <v-dialog v-model="showCustomerModal" max-width="700">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-account" class="me-2" />
          Seleccionar Cliente
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-6">
          <v-row>
            <v-col cols="12" md="6">
              <h3 class="mb-4">Clientes existentes</h3>
              <v-text-field v-model="customerSearch" prepend-inner-icon="mdi-magnify" placeholder="Buscar cliente..."
                variant="outlined" density="compact" @input="filterCustomers" />
              <v-list v-model:selected="selectedCustomerList" select-strategy="single"
                style="max-height: 300px; overflow-y: auto" class="mt-4">
                <v-list-item v-for="customer in filteredCustomers" :key="customer.id" :value="customer"
                  @click="selectCustomer(customer)">
                  <v-list-item-title>{{ customer.nombre }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ customer.rtn ? 'RTN: ' + customer.rtn : 'Consumidor final' }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>

            <v-divider vertical />

            <v-col cols="12" md="6">
              <h3 class="mb-4">Registrar nuevo cliente</h3>
              <v-btn color="primary" prepend-icon="mdi-plus" block @click="showNewCustomerModal = true">
                Nuevo Cliente
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCustomerModal = false">Cancelar</v-btn>
          <v-btn color="primary" :disabled="!selectedCustomer" @click="confirmCustomer">
            Continuar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para nuevo cliente -->
    <v-dialog v-model="showNewCustomerModal" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-account-plus" class="me-2" />
          Registrar Nuevo Cliente
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-6">
          <v-text-field v-model="newCustomer.nombre" label="Nombre completo" variant="outlined" required
            :rules="[v => !!v || 'El nombre es requerido']" />
          <v-text-field v-model="newCustomer.rtn" label="RTN (opcional)" variant="outlined" />
          <v-text-field v-model="newCustomer.telefono" label="Teléfono" variant="outlined" required
            :rules="[v => !!v || 'El teléfono es requerido']" />
          <v-text-field v-model="newCustomer.correo" label="Correo electrónico" type="email" variant="outlined" />
          <v-text-field v-model="newCustomer.direccion" label="Dirección" variant="outlined" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelNewCustomer">Cancelar</v-btn>
          <v-btn color="primary" @click="saveNewCustomer">Guardar Cliente</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de método de pago -->
    <v-dialog v-model="showPaymentMethodModal" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-credit-card" class="me-2" />
          Método de Pago
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-6">
          <v-row>
            <v-col v-for="method in paymentMethods" :key="method.id" cols="12" sm="4">
              <v-card :color="selectedPaymentMethod === method.id ? 'primary' : 'default'"
                :variant="selectedPaymentMethod === method.id ? 'flat' : 'outlined'" class="text-center cursor-pointer"
                @click="selectPaymentMethod(method.id)">
                <v-card-text>
                  <v-icon :icon="method.icon" size="48"
                    :color="selectedPaymentMethod === method.id ? 'white' : 'primary'" class="mb-2" />
                  <div :class="selectedPaymentMethod === method.id ? 'text-white' : ''" class="font-weight-medium">
                    {{ method.nombre }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Detalles de efectivo -->
          <v-expand-transition>
            <v-card v-if="selectedPaymentMethod === 1" variant="tonal" class="mt-4">
              <v-card-text>
                <v-text-field v-model.number="cashReceived" label="Efectivo recibido" type="number" min="0" step="0.01"
                  prepend-icon="mdi-cash" variant="outlined" suffix="L" />
                <v-alert v-if="cashReceived" :type="parseFloat(calculateChangeAmount()) >= 0 ? 'success' : 'error'"
                  :text="'Cambio: L ' + calculateChangeAmount()" />
              </v-card-text>
            </v-card>
          </v-expand-transition>

          <!-- Detalles de transferencia -->
          <v-expand-transition>
            <v-card v-if="selectedPaymentMethod === 3" variant="tonal" class="mt-4">
              <v-card-text>
                <v-select v-model="transferDetails.banco" label="Banco" :items="bankOptions" variant="outlined" />
                <v-text-field v-model="transferDetails.numeroReferencia" label="Número de referencia"
                  variant="outlined" />
                <v-text-field v-model.number="transferDetails.monto" label="Monto transferido" type="number" min="0"
                  step="0.01" variant="outlined" suffix="L" />
              </v-card-text>
            </v-card>
          </v-expand-transition>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showPaymentMethodModal = false">Cancelar</v-btn>
          <v-btn color="primary" :disabled="!canProceedToSummary" @click="confirmPaymentMethod">
            Continuar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de resumen -->
    <v-dialog v-model="showSummaryModal" max-width="800">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-receipt" class="me-2" />
          Resumen de Venta
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-6">
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="tonal" class="mb-4">
                <v-card-title class="text-h6">Cliente</v-card-title>
                <v-card-text>
                  <div><strong>Nombre:</strong> {{ selectedCustomer?.nombre }}</div>
                  <div><strong>RTN:</strong> {{ selectedCustomer?.rtn || "Consumidor final" }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card variant="tonal" class="mb-4">
                <v-card-title class="text-h6">Pago</v-card-title>
                <v-card-text>
                  <div><strong>Método:</strong> {{ getPaymentMethodName() }}</div>
                  <div v-if="selectedPaymentMethod === 1">
                    <strong>Efectivo recibido:</strong> L {{ cashReceived?.toFixed(2) }}<br>
                    <strong>Cambio:</strong> L {{ calculateChangeAmount() }}
                  </div>
                  <div v-if="selectedPaymentMethod === 3">
                    <strong>Banco:</strong> {{ transferDetails.banco }}<br>
                    <strong>Referencia:</strong> {{ transferDetails.numeroReferencia }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-data-table :headers="summaryHeaders" :items="cartItems" hide-default-footer no-data-text="No hay productos"
            class="mb-4">
            <template v-slot:item.precio_venta="{ item }">
              L {{ item.precio_venta.toFixed(2) }}
            </template>
            <template v-slot:item.total="{ item }">
              L {{ (item.precio_venta * item.cantidad).toFixed(2) }}
            </template>
          </v-data-table>

          <v-card variant="tonal">
            <v-card-text>
              <v-row class="text-body-1">
                <v-col cols="6">Subtotal:</v-col>
                <v-col cols="6" class="text-right">L {{ calculateSubtotal() }}</v-col>
                <v-col cols="6">ISV (15%):</v-col>
                <v-col cols="6" class="text-right">L {{ calculateTotalTax() }}</v-col>
                <v-divider class="my-2" />
                <v-col cols="6" class="text-h6 font-weight-bold">Total:</v-col>
                <v-col cols="6" class="text-right text-h6 font-weight-bold text-success">
                  L {{ calculateTotal() }}
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showSummaryModal = false">Cancelar</v-btn>
          <v-btn color="primary" @click="generateInvoice">Generar Factura</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de factura -->
    <v-dialog v-model="showInvoiceModal" max-width="600" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-receipt" class="me-2" />
          Factura Generada
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-6">
          <div class="invoice" id="invoice-content">
            <!-- Encabezado de factura -->
            <div class="text-center mb-4">
              <h3 class="text-h5 font-weight-bold">{{ companyInfo.nombre }}</h3>
              <div>{{ companyInfo.sucursal }}</div>
              <div>Tel: {{ companyInfo.telefono }}</div>
              <div>Email: {{ companyInfo.email }}</div>
              <div>Sucursal: {{ companyInfo.sucursalDetalle }}</div>
              <v-divider class="my-3" />
            </div>

            <!-- Información de factura -->
            <div class="mb-4">
              <div><strong>Factura:</strong> {{ invoice.numero }}</div>
              <div><strong>Fecha Emisión:</strong> {{ formatDateTime(invoice.fecha) }}</div>
              <div><strong>Cajer@:</strong> {{ currentUser.name || "Empleado" }}</div>
              <v-divider class="my-3" />
            </div>

            <!-- Datos del cliente -->
            <div class="mb-4">
              <div><strong>Cliente:</strong> {{ selectedCustomer?.nombre || "Consumidor Final" }}</div>
              <div><strong>R.T.N:</strong> {{ selectedCustomer?.rtn || "00000000000000" }}</div>
              <v-divider class="my-3" />
            </div>

            <!-- Tabla de productos -->
            <v-simple-table class="mb-4">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th>Cant.</th>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>T</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in cartItems" :key="index">
                    <td>{{ item.cantidad }}</td>
                    <td>{{ item.nombre }}</td>
                    <td>{{ item.precio_venta.toFixed(2) }}</td>
                    <td>G</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>

            <!-- Totales -->
            <div class="mb-4">
              <v-row dense>
                <v-col cols="8">IMPORTE EXONERADO:</v-col>
                <v-col cols="4" class="text-right">0.00</v-col>
                <v-col cols="8">IMPORTE GRAVADO 15%:</v-col>
                <v-col cols="4" class="text-right">{{ calculateSubtotal() }}</v-col>
                <v-col cols="8">IMPORTE GRAVADO 18%:</v-col>
                <v-col cols="4" class="text-right">0.00</v-col>
                <v-col cols="8">Rebajas y Descuento:</v-col>
                <v-col cols="4" class="text-right">0.00</v-col>
                <v-col cols="8">ISV 15%:</v-col>
                <v-col cols="4" class="text-right">{{ calculateTotalTax() }}</v-col>
                <v-col cols="8">ISV 18%:</v-col>
                <v-col cols="4" class="text-right">0.00</v-col>
                <v-divider class="my-2" />
                <v-col cols="8" class="font-weight-bold">Total:</v-col>
                <v-col cols="4" class="text-right font-weight-bold">{{ calculateTotal() }}</v-col>
              </v-row>
            </div>

            <!-- Detalles de pago -->
            <div class="mb-4">
              <div>Tipo de Pago: {{ getPaymentMethodName() }}</div>
              <div v-if="selectedPaymentMethod === 1">
                Efectivo: {{ cashReceived?.toFixed(2) }}<br>
                Cambio: {{ calculateChangeAmount() }}
              </div>
            </div>

            <!-- Monto en letras -->
            <div class="text-center font-weight-bold mb-4">
              {{ amountInWords }}
            </div>

            <!-- Información legal -->
            <div class="text-caption mb-4">
              <div>No. de Orden de Compra Exenta:</div>
              <div>No. Constancia de Registro de Exonerados:</div>
              <div>No. Registro de SAG:</div>
              <div><strong>CAI:</strong> {{ invoice.cai }}</div>
              <div><strong>Rango Facturación:</strong> {{ invoice.rangoInicio }} A {{ invoice.rangoFin }}</div>
              <div><strong>Fecha Límite de Emisión:</strong> {{ invoice.fechaLimite }}</div>
            </div>

            <!-- Pie de página -->
            <div class="text-center font-weight-bold text-caption">
              LA FACTURA ES BENEFICIO DE TODOS, EXÍJALA
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" prepend-icon="mdi-printer" @click="printInvoice">
            Imprimir
          </v-btn>
          <v-btn @click="closeInvoice">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Mensaje cuando la caja está cerrada -->
    <v-row v-if="!isCashRegisterOpen" justify="center" class="mt-12">
      <v-col cols="12" md="6">
        <v-card class="text-center pa-8" variant="tonal">
          <v-icon icon="mdi-cash-register-outline" size="80" class="mb-4 text-medium-emphasis" />
          <h2 class="text-h4 mb-4">Caja Cerrada</h2>
          <p class="text-body-1 mb-6">
            Para comenzar a realizar ventas, primero debe abrir la caja registradora.
          </p>
          <v-btn color="success" size="large" prepend-icon="mdi-cash-register" @click="openCashRegister">
            Abrir Caja
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Composables de Nuxt
const router = useRouter()
const { $fetch } = useNuxtApp()
const config = useRuntimeConfig()

// Estado reactivo
const searchQuery = ref("")
const productSearch = ref("")
const products = ref([])
const searchResults = ref([])
const cartItems = ref([])

// Breadcrumbs
const breadcrumbs = ref([
  { title: 'Inicio', href: '/', disabled: false },
  { title: 'Caja', href: '/caja', disabled: true }
])

// Headers para las tablas
const cartHeaders = [
  { title: 'N°', key: 'numero', sortable: false },
  { title: 'Producto', key: 'nombre', sortable: false },
  { title: 'Precio', key: 'precio_venta', sortable: false },
  { title: 'Cantidad', key: 'cantidad', sortable: false },
  { title: 'ISV', key: 'isv', sortable: false },
  { title: 'Subtotal', key: 'subtotal', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false }
]

const summaryHeaders = [
  { title: 'Producto', key: 'nombre' },
  { title: 'Cantidad', key: 'cantidad' },
  { title: 'Precio', key: 'precio_venta' },
  { title: 'Total', key: 'total' }
]

// Estado de la caja
const isCashRegisterOpen = ref(false)
const showOpenCashModal = ref(false)
const showCloseCashModal = ref(false)
const initialCashAmount = ref(0)
const actualCashAmount = ref(0)
const openCashComments = ref("")
const closeCashComments = ref("")
const cashSales = ref([])

// Clientes
const customers = ref([])
const customerSearch = ref("")
const filteredCustomers = ref([])
const selectedCustomer = ref(null)
const selectedCustomerList = ref([])
const showCustomerModal = ref(false)

// Nuevo cliente
const showNewCustomerModal = ref(false)
const newCustomer = ref({
  nombre: "",
  rtn: "",
  telefono: "",
  correo: "",
  direccion: "",
})

// Métodos de pago
const paymentMethods = ref([
  { id: 1, nombre: "Efectivo", icon: "mdi-cash" },
  { id: 2, nombre: "Tarjeta de Crédito", icon: "mdi-credit-card" },
  { id: 3, nombre: "Transferencia Bancaria", icon: "mdi-bank" },
])

const bankOptions = [
  "Banco Atlántida - 123-456789-0",
  "Banpais - 987-654321-0",
  "BAC - 456-123789-0"
]

const selectedPaymentMethod = ref(null)
const showPaymentMethodModal = ref(false)

// Efectivo
const cashReceived = ref(null)

// Transferencia
const transferDetails = ref({
  banco: "",
  numeroReferencia: "",
  monto: null,
})

// Resumen
const showSummaryModal = ref(false)

// Factura
const showInvoiceModal = ref(false)
const invoice = ref({
  numero: "000-002-01-00020007",
  cai: "9383u88hdn38d38",
  fechaLimite: "11-11-2025",
  rangoInicio: "000-002-01-00020001",
  rangoFin: "000-002-01-00030001",
  fecha: new Date().toISOString(),
})
const amountInWords = ref("")

// Usuario actual
const currentUser = ref({
  name: "Empleado",
})

// Info de la empresa
const companyInfo = ref({
  nombre: "Facturalize",
  sucursal: "LA CEIBA",
  telefono: "98765432",
  email: "facturalize@gmail.com",
  sucursalDetalle: "EMPRESA - LA CEIBA",
})

// Computed properties
const canProceedToSummary = computed(() => {
  if (!selectedPaymentMethod.value) return false

  if (selectedPaymentMethod.value === 1) {
    return cashReceived.value !== null && cashReceived.value >= parseFloat(calculateTotal())
  }

  if (selectedPaymentMethod.value === 3) {
    return (
      transferDetails.value.banco &&
      transferDetails.value.numeroReferencia &&
      transferDetails.value.monto !== null
    )
  }

  return true
})

const cashDifference = computed(() => {
  return actualCashAmount.value - (initialCashAmount.value + calculateCashSales())
})

// Methods
const navigateTo = (route) => {
  router.push(route)
}

// Gestión de caja
const openCashRegister = () => {
  showOpenCashModal.value = true
}

const confirmOpenCash = () => {
  // ✅ Agregar estas validaciones
  if (!initialCashAmount.value || initialCashAmount.value < 500) {
    alert("El monto inicial debe ser de al menos L 500.00")
    return
  }

  if (initialCashAmount.value < 0) {
    alert("El monto inicial no puede ser negativo")
    return
  }

  isCashRegisterOpen.value = true
  showOpenCashModal.value = false

  // Guardar estado en localStorage para persistencia
  localStorage.setItem('cajaAbierta', 'true')
  localStorage.setItem('montoInicial', initialCashAmount.value.toString())

  // Registrar apertura de caja
  const openRecord = {
    fecha: new Date().toISOString(),
    montoInicial: initialCashAmount.value,
    comentarios: openCashComments.value,
    usuario: currentUser.value.name
  }

  console.log("Caja abierta:", openRecord)
  openCashComments.value = ""
}

const closeCashRegister = () => {
  actualCashAmount.value = initialCashAmount.value + calculateCashSales()
  showCloseCashModal.value = true
}
const confirmCloseCash = () => {
  isCashRegisterOpen.value = false
  showCloseCashModal.value = false

  // Limpiar localStorage
  localStorage.removeItem('cajaAbierta')
  localStorage.removeItem('montoInicial')

  // Registrar cierre de caja
  const closeRecord = {
    fecha: new Date().toISOString(),
    montoInicial: initialCashAmount.value,
    ventasEfectivo: calculateCashSales(),
    montoEsperado: initialCashAmount.value + calculateCashSales(),
    montoActual: actualCashAmount.value,
    diferencia: cashDifference.value,
    comentarios: closeCashComments.value,
    usuario: currentUser.value.name
  }

  console.log("Caja cerrada:", closeRecord)

  // Reset all values
  initialCashAmount.value = 0
  actualCashAmount.value = 0
  closeCashComments.value = ""
  cashSales.value = []
  clearCart()
}

const calculateCashSales = () => {
  return cashSales.value.reduce((sum, sale) => sum + sale.amount, 0)
}

// Productos
const fetchProducts = async () => {
  try {
    const response = await fetch(`${config.public.apiBase}/producto`)
    const data = await response.json()
    if (data && Array.isArray(data)) {
      products.value = data.map(mapProductData).filter(product => product.stock > 0)
      searchResults.value = [...products.value]
      console.log("Productos cargados desde API:", products.value.length)
    }
  } catch (error) {
    console.error("Error al cargar productos:", error)
    // Mostrar mensaje de error al usuario
    alert("Error al cargar productos de la base de datos: " + error.message)
    products.value = []
    searchResults.value = []
  }
}

const mapProductData = (item) => {
  const product = { ...item }
  product.nombre = product.nombre || product.name || "Producto sin nombre"
  product.codigoProducto = product.codigoProducto || product.code || "SIN-CODIGO"
  product.stock = product.stock || product.inventory || 0
  product.precio_venta = Number(product.precio_venta || product.price) || 0
  return product
}

const searchProducts = () => {
  if (!productSearch.value.trim()) {
    searchResults.value = [...products.value]
    return
  }

  const searchTerm = productSearch.value.toLowerCase()
  searchResults.value = products.value.filter(
    (product) =>
      product.nombre.toLowerCase().includes(searchTerm) ||
      (product.codigoProducto &&
        product.codigoProducto.toString().toLowerCase().includes(searchTerm))
  )
}

const addToCart = (product) => {
  const existingIndex = cartItems.value.findIndex((item) => item.id === product.id)

  if (existingIndex >= 0) {
    if (cartItems.value[existingIndex].cantidad < product.stock) {
      cartItems.value[existingIndex].cantidad += 1
    } else {
      alert("No hay suficiente stock disponible")
    }
  } else {
    if (product.stock > 0) {
      cartItems.value.push({
        ...product,
        cantidad: 1,
      })
    } else {
      alert("Producto sin stock disponible")
    }
  }
}

const updateSubtotal = (index) => {
  if (cartItems.value[index].cantidad < 1) {
    cartItems.value[index].cantidad = 1
  }

  const product = products.value.find((p) => p.id === cartItems.value[index].id)
  if (product && cartItems.value[index].cantidad > product.stock) {
    alert(`No hay suficiente stock. Máximo disponible: ${product.stock}`)
    cartItems.value[index].cantidad = product.stock
  }
}

const increaseQuantity = (index) => {
  const product = products.value.find((p) => p.id === cartItems.value[index].id)
  if (product && cartItems.value[index].cantidad < product.stock) {
    cartItems.value[index].cantidad += 1
  } else {
    alert("No hay suficiente stock disponible")
  }
}

const decreaseQuantity = (index) => {
  if (cartItems.value[index].cantidad > 1) {
    cartItems.value[index].cantidad -= 1
  }
}

const removeItem = (index) => {
  cartItems.value.splice(index, 1)
}

// Cálculos
const calculateSubtotal = () => {
  // El subtotal es el precio SIN ISV (precio base)
  const taxFactor = 0.15
  return cartItems.value
    .reduce((sum, item) => {
      const totalWithTax = item.precio_venta * item.cantidad
      const totalWithoutTax = totalWithTax / (1 + taxFactor)
      return sum + totalWithoutTax
    }, 0)
    .toFixed(2)
}

const calculateTotalTax = () => {
  // El ISV es la diferencia entre el precio total y el subtotal
  const subtotal = parseFloat(calculateSubtotal())
  const total = parseFloat(calculateTotalBeforeTax())
  return (total - subtotal).toFixed(2)
}

const calculateTotalBeforeTax = () => {
  // El total antes de separar el ISV (precio original)
  return cartItems.value
    .reduce((sum, item) => sum + item.precio_venta * item.cantidad, 0)
    .toFixed(2)
}

const calculateTotal = () => {
  // El total es igual al precio original (ya incluye ISV)
  return calculateTotalBeforeTax()
}

const calculateTax = (item) => {
  // ISV de un ítem específico
  const taxFactor = 0.15
  const totalWithTax = item.precio_venta * item.cantidad
  const totalWithoutTax = totalWithTax / (1 + taxFactor)
  return totalWithTax - totalWithoutTax
}

const calculateChangeAmount = () => {
  if (cashReceived.value === null) return "0.00"
  const total = parseFloat(calculateTotal())
  return (cashReceived.value - total).toFixed(2)
}

// Clientes
const fetchCustomers = async () => {
  try {
    const response = await fetch(`${config.public.apiBase}/cliente`)
    const data = await response.json()
    if (data && Array.isArray(data)) {
      customers.value = data

      // Agregar "Consumidor Final" si no existe
      if (!customers.value.some((c) => c.nombre === "Consumidor Final")) {
        customers.value.unshift({
          id: 0,
          nombre: "Consumidor Final",
          rtn: "",
          telefono: "",
          direccion: "Ciudad",
          empresaId: 0,
          estado: 1,
        })
      }

      filteredCustomers.value = [...customers.value].slice(0, 10)
      console.log("Clientes cargados desde API:", customers.value.length)
    }
  } catch (error) {
    console.error("Error al cargar clientes:", error)
    // Mostrar mensaje de error al usuario
    alert("Error al cargar clientes de la base de datos: " + error.message)
    customers.value = [
      {
        id: 0,
        nombre: "Consumidor Final",
        rtn: "",
        telefono: "",
        direccion: "Ciudad",
        empresaId: 0,
        estado: 1,
      },
    ]
    filteredCustomers.value = [...customers.value]
  }
}

const filterCustomers = () => {
  if (!customerSearch.value.trim()) {
    filteredCustomers.value = [...customers.value].slice(0, 5)
    return
  }

  const searchTerm = customerSearch.value.toLowerCase()
  filteredCustomers.value = customers.value
    .filter(
      (customer) =>
        customer.nombre.toLowerCase().includes(searchTerm) ||
        (customer.rtn && customer.rtn.includes(searchTerm))
    )
    .slice(0, 5)
}

const selectCustomer = (customer) => {
  selectedCustomer.value = customer
}

// Nuevo cliente
const cancelNewCustomer = () => {
  showNewCustomerModal.value = false
  newCustomer.value = {
    nombre: "",
    rtn: "",
    telefono: "",
    correo: "",
    direccion: "",
  }
}

const saveNewCustomer = async () => {
  if (!newCustomer.value.nombre || !newCustomer.value.telefono) {
    alert("Nombre y teléfono son campos obligatorios")
    return
  }

  try {
    const response = await fetch(`${config.public.apiBase}/cliente`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: {
        nombre: newCustomer.value.nombre,
        rtn: newCustomer.value.rtn || null,
        telefono: newCustomer.value.telefono,
        direccion: newCustomer.value.direccion || "Ciudad",
        correo: newCustomer.value.correo || "",
        empresaId: 0,
        estado: 1,
      },
    })

    selectedCustomer.value = response
    customers.value.unshift(selectedCustomer.value)
    showNewCustomerModal.value = false
    newCustomer.value = {
      nombre: "",
      rtn: "",
      telefono: "",
      correo: "",
      direccion: "",
    }

    filterCustomers()
  } catch (error) {
    console.error("Error al guardar cliente:", error)
    alert("Error al guardar el cliente: " + error.message)
  }
}

// Proceso de pago
const processPayment = () => {
  if (cartItems.value.length === 0) {
    alert("No hay productos en el carrito")
    return
  }

  showCustomerModal.value = true
}

const confirmCustomer = () => {
  if (!selectedCustomer.value) {
    alert("Debe seleccionar un cliente")
    return
  }

  showCustomerModal.value = false
  showPaymentMethodModal.value = true
}

const selectPaymentMethod = (methodId) => {
  selectedPaymentMethod.value = methodId

  if (methodId === 3) {
    transferDetails.value.monto = parseFloat(calculateTotal())
  }
}

const confirmPaymentMethod = () => {
  if (!canProceedToSummary.value) {
    alert("Complete todos los campos requeridos")
    return
  }

  showPaymentMethodModal.value = false
  showSummaryModal.value = true
}

const getPaymentMethodName = () => {
  const method = paymentMethods.value.find((m) => m.id === selectedPaymentMethod.value)
  return method ? method.nombre : ""
}

// Factura
// ✅ Agregar después de las variables de estado:
const invoiceHistory = ref([])

// ✅ Modificar generateInvoice:
const generateInvoice = () => {
  amountInWords.value = convertNumberToWords(parseFloat(calculateTotal()))

  // Generar número de factura secuencial
  const lastNumber = parseInt(invoice.value.numero.slice(-8))
  invoice.value.numero = `000-002-01-${(lastNumber + 1).toString().padStart(8, "0")}`
  invoice.value.fecha = new Date().toISOString()

  // Crear registro completo de la factura
  const invoiceRecord = {
    numero: invoice.value.numero,
    fecha: invoice.value.fecha,
    cliente: {
      id: selectedCustomer.value?.id,
      nombre: selectedCustomer.value?.nombre,
      rtn: selectedCustomer.value?.rtn
    },
    productos: cartItems.value.map(item => ({
      id: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio_unitario: item.precio_venta,
      subtotal: item.precio_venta * item.cantidad
    })),
    totales: {
      subtotal: calculateSubtotal(),
      isv: calculateTotalTax(),
      total: calculateTotal()
    },
    metodoPago: {
      id: selectedPaymentMethod.value,
      nombre: getPaymentMethodName(),
      efectivo: selectedPaymentMethod.value === 1 ? cashReceived.value : null,
      cambio: selectedPaymentMethod.value === 1 ? calculateChangeAmount() : null,
      transferencia: selectedPaymentMethod.value === 3 ? transferDetails.value : null
    },
    cajero: currentUser.value.name,
    empresa: companyInfo.value,
    cai: invoice.value.cai,
    amountInWords: amountInWords.value
  }

  // Guardar en el historial local
  invoiceHistory.value.push(invoiceRecord)
  
  // Guardar en localStorage para persistencia
  localStorage.setItem('invoiceHistory', JSON.stringify(invoiceHistory.value))

  // TODO: Aquí podrías enviar a tu API
  // await saveInvoiceToAPI(invoiceRecord)

  console.log("Factura guardada:", invoiceRecord)

  // Registrar venta en efectivo para el cuadre de caja
  if (selectedPaymentMethod.value === 1) {
    cashSales.value.push({
      amount: parseFloat(calculateTotal()),
      date: new Date().toISOString(),
      invoice: invoice.value.numero
    })
  }

  showSummaryModal.value = false
  showInvoiceModal.value = true
}

// ✅ Cargar historial al montar:
onMounted(async () => {
  await fetchProducts()
  await fetchCustomers()

  // Cargar historial de facturas
  const savedHistory = localStorage.getItem('invoiceHistory')
  if (savedHistory) {
    invoiceHistory.value = JSON.parse(savedHistory)
  }

  // Verificar si la caja estaba abierta
  const cajaAbierta = localStorage.getItem('cajaAbierta')
  const montoInicial = localStorage.getItem('montoInicial')
  
  if (cajaAbierta === 'true' && montoInicial) {
    isCashRegisterOpen.value = true
    initialCashAmount.value = parseFloat(montoInicial)
  }

  // Seleccionar "Consumidor Final" por defecto
  const defaultCustomer = customers.value.find(c => c.nombre === "Consumidor Final")
  if (defaultCustomer) {
    selectedCustomer.value = defaultCustomer
  }
})

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return `${date.toLocaleDateString("es-ES")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
      .getSeconds()
      .toString()
      .padStart(2, "0")}`
}

const printInvoice = () => {
  const printContent = document.getElementById('invoice-content').innerHTML
  const printWindow = window.open('', '_blank')

  const htmlContent = [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '<title>Factura ' + invoice.value.numero + '</title>',
    '<style>',
    'body { font-family: "Courier New", monospace; margin: 0; padding: 10px; color: #000; font-size: 12px; width: 80mm; }',
    '.invoice { width: 100%; }',
    '.text-center { text-align: center; }',
    '.mb-4 { margin-bottom: 8px; }',
    '.font-weight-bold { font-weight: bold; }',
    'table { width: 100%; border-collapse: collapse; font-size: 10px; }',
    'th, td { text-align: left; padding: 1px 2px; border-bottom: 1px solid #000; }',
    '.text-right { text-align: right; }',
    'div { margin: 2px 0; }',
    '@page { size: 80mm auto; margin: 2mm; }',
    '@media print { body { width: 80mm; } }',
    '</style>',
    '</head>',
    '<body>',
    '<div class="invoice">',
    '<div class="text-center">',
    '<div class="font-weight-bold">' + companyInfo.value.nombre + '</div>',
    '<div>' + companyInfo.value.sucursal + '</div>',
    '<div>Tel: ' + companyInfo.value.telefono + '</div>',
    '<div>Email: ' + companyInfo.value.email + '</div>',
    '<div>Sucursal: ' + companyInfo.value.sucursalDetalle + '</div>',
    '<div>------------------------</div>',
    '</div>',
    '<div class="font-weight-bold">Factura: ' + invoice.value.numero + '</div>',
    '<div>Fecha Emisión: ' + formatDateTime(invoice.value.fecha) + '</div>',
    '<div>Cajer@: ' + (currentUser.value.name || "Empleado") + '</div>',
    '<div>------------------------</div>',
    '<div>Cliente: ' + (selectedCustomer.value?.nombre || "Consumidor Final") + '</div>',
    '<div>R.T.N: ' + (selectedCustomer.value?.rtn || "00000000000000") + '</div>',
    '<div>------------------------</div>',
    '<table>',
    '<tr><th>Cant.</th><th>Nombre</th><th>Precio</th><th>T</th></tr>',
    cartItems.value.map(item =>
      '<tr><td>' + item.cantidad + '</td><td>' + item.nombre + '</td><td>' + item.precio_venta.toFixed(2) + '</td><td>G</td></tr>'
    ).join(''),
    '</table>',
    '<div>------------------------</div>',
    '<div>IMPORTE EXONERADO: 0.00</div>',
    '<div>IMPORTE GRAVADO 15%: ' + calculateSubtotal() + '</div>',
    '<div>IMPORTE GRAVADO 18%: 0.00</div>',
    '<div>Rebajas y Descuento: 0.00</div>',
    '<div>ISV 15%: ' + calculateTotalTax() + '</div>',
    '<div>ISV 18%: 0.00</div>',
    '<div class="font-weight-bold">Total: ' + calculateTotal() + '</div>',
    '<div>------------------------</div>',
    '<div>Tipo de Pago: ' + getPaymentMethodName() + '</div>',
    (selectedPaymentMethod.value === 1 ?
      '<div>Efectivo: ' + (cashReceived.value?.toFixed(2) || '0.00') + '</div>' +
      '<div>Cambio: ' + calculateChangeAmount() + '</div>' : ''),
    '<div class="text-center font-weight-bold">' + amountInWords.value + '</div>',
    '<div>------------------------</div>',
    '<div style="font-size: 10px;">No. de Orden de Compra Exenta:</div>',
    '<div style="font-size: 10px;">No. Constancia de Registro de Exonerados:</div>',
    '<div style="font-size: 10px;">No. Registro de SAG:</div>',
    '<div style="font-size: 10px;">CAI: ' + invoice.value.cai + '</div>',
    '<div style="font-size: 10px;">Rango Facturación: ' + invoice.value.rangoInicio + ' A ' + invoice.value.rangoFin + '</div>',
    '<div style="font-size: 10px;">Fecha Límite de Emisión: ' + invoice.value.fechaLimite + '</div>',
    '<div class="text-center font-weight-bold" style="font-size: 10px;">LA FACTURA ES BENEFICIO DE TODOS, EXÍJALA</div>',
    '</div>',
    '<script>',
    'window.onload = function() {',
    'setTimeout(function() { window.print(); window.close(); }, 500);',
    '};',
    '</scr' + 'ipt>',
    '</body>',
    '</html>'
  ].join('')

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

const closeInvoice = () => {
  showInvoiceModal.value = false
  clearCart()
}

const clearCart = () => {
  cartItems.value = []
  selectedPaymentMethod.value = null
  cashReceived.value = null
  transferDetails.value = {
    banco: "",
    numeroReferencia: "",
    monto: null,
  }
  selectedCustomer.value = customers.value.find(c => c.nombre === "Consumidor Final") || null
}

// Conversión de números a palabras
const convertNumberToWords = (number) => {
  const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"]
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"]
  const especiales = {
    11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
    16: "DIECISEIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
    21: "VEINTIUN", 22: "VEINTIDOS", 23: "VEINTITRES", 24: "VEINTICUATRO",
    25: "VEINTICINCO", 26: "VEINTISEIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE"
  }
  const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"]

  if (number === 100) return "CIEN LEMPIRAS CON 0/100"
  if (number === 0) return "CERO LEMPIRAS CON 0/100"

  const parts = number.toFixed(2).split(".")
  const integerPart = parseInt(parts[0])
  const decimalPart = parseInt(parts[1])

  let result = ""

  if (integerPart > 0) {
    const hundreds = Math.floor(integerPart / 100)
    if (hundreds > 0) {
      result += centenas[hundreds] + " "
    }

    const tens = integerPart % 100

    if (tens > 0) {
      if (especiales[tens]) {
        result += especiales[tens]
      } else {
        const ten = Math.floor(tens / 10)
        const unit = tens % 10

        if (ten > 0) {
          result += decenas[ten]
          if (unit > 0) {
            result += " Y " + unidades[unit]
          }
        } else if (unit > 0) {
          result += unidades[unit]
        }
      }
    }
  }

  result += " LEMPIRAS"
  result += " CON " + decimalPart + "/100"

  return result
}

// Lifecycle
onMounted(async () => {
  await fetchProducts()
  await fetchCustomers()

  // Verificar si la caja estaba abierta
  const cajaAbierta = localStorage.getItem('cajaAbierta')
  const montoInicial = localStorage.getItem('montoInicial')
  
  if (cajaAbierta === 'true' && montoInicial) {
    isCashRegisterOpen.value = true
    initialCashAmount.value = parseFloat(montoInicial)
  }

  // Seleccionar "Consumidor Final" por defecto
  const defaultCustomer = customers.value.find(c => c.nombre === "Consumidor Final")
  if (defaultCustomer) {
    selectedCustomer.value = defaultCustomer
  }
})
</script>

<style scoped>
.caja-container {
  min-height: 100vh;
}

.cursor-pointer {
  cursor: pointer;
}

.product-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.product-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.cart-table :deep(.v-table__wrapper) {
  max-height: 400px;
  overflow-y: auto;
}

.invoice {
  background: white;
  color: black;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}

@media print {
  .v-dialog {
    position: static !important;
  }

  .v-overlay__content {
    position: static !important;
  }
}
</style>