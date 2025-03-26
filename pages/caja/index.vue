<template>
  <div class="caja-container">
    <!-- Breadcrumb navigation -->
    <div class="breadcrumb">
      <span @click="navigateTo('Inicio')" class="breadcrumb-item">Inicio</span>
      <span class="separator">></span>
      <span class="breadcrumb-item active">Caja</span>
    </div>

    <div class="content-header">
      <h1>Caja</h1>
      <div class="search-container">
        <input
          type="text"
          placeholder="Buscar..."
          v-model="searchQuery"
          @input="searchProducts"
        />
        <button class="search-btn"><i class="fas fa-search"></i></button>
      </div>
    </div>

    <div class="caja-grid">
      <!-- Panel de productos -->
      <div class="panel producto-panel">
        <div class="panel-header">
          <h2>Productos</h2>
        </div>
        <div class="search-product">
          <input
            type="text"
            placeholder="Buscar producto..."
            v-model="productSearch"
            @input="searchProducts"
          />
        </div>
        <div class="product-list">
          <div
            v-for="product in searchResults"
            :key="product.id"
            class="product-item"
            @click="addToCart(product)"
          >
            <div class="product-info">
              <span class="product-name">{{ product.nombre }}</span>
              <span class="product-code"
                >Código: {{ product.codigoProducto }}</span
              >
              <span class="product-stock">Stock: {{ product.stock }}</span>
            </div>
            <div class="product-price">
              L {{ product.precio_venta.toFixed(2) }}
            </div>
          </div>
          <div v-if="products.length === 0" class="no-results">
            No se encontraron productos
          </div>
        </div>
      </div>

      <!-- Panel de carrito -->
      <div class="panel cart-panel">
        <div class="panel-header">
          <h2>Productos Seleccionados</h2>
        </div>
        <div class="cart-list">
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>ISV</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in cartItems" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.nombre }}</td>
                <td>L {{ item.precio_venta.toFixed(2) }}</td>
                <td class="quantity-cell">
                  <button @click="decreaseQuantity(index)" class="qty-btn">
                    -
                  </button>
                  <input
                    type="number"
                    v-model.number="item.cantidad"
                    min="1"
                    @change="updateSubtotal(index)"
                  />
                  <button @click="increaseQuantity(index)" class="qty-btn">
                    +
                  </button>
                </td>
                <td>L {{ calculateTax(item).toFixed(2) }}</td>
                <td>L {{ (item.precio_venta * item.cantidad).toFixed(2) }}</td>
                <td>
                  <button @click="removeItem(index)" class="action-btn delete-btn">
  <i class="fas fa-trash"></i>
  <span class="delete-text">✕</span>
</button>
</td>
              </tr>
              <tr v-if="cartItems.length === 0">
                <td colspan="7" class="no-data">
                  No hay productos en el carrito
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="cart-footer">
          <div class="total-section">
            <div class="subtotal-row">
              <span class="subtotal-label">Subtotal:</span>
              <span class="subtotal-amount">L {{ calculateSubtotal() }}</span>
            </div>
            <div class="tax-row">
              <span class="tax-label">ISV (15%):</span>
              <span class="tax-amount">L {{ calculateTotalTax() }}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Total:</span>
              <span class="total-amount">L {{ calculateTotal() }}</span>
            </div>
          </div>
        </div>

        <!-- Botón de procesar pago -->
        <div class="checkout-btn-container">
          <button
            @click="processPayment"
            class="btn process-btn"
            :disabled="cartItems.length === 0"
          >
            Procesar Pago
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de selección de cliente -->
    <div v-if="showCustomerModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Seleccionar Cliente</h2>
          <button @click="showCustomerModal = false" class="modal-close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="customer-options">
            <div class="existing-customer">
              <h3>Clientes existentes</h3>
              <div class="customer-search">
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  v-model="customerSearch"
                  @input="filterCustomers"
                />
                <div class="customer-list">
                  <div
                    v-for="customer in filteredCustomers"
                    :key="customer.id"
                    class="customer-item"
                    :class="{
                      selected:
                        selectedCustomer && selectedCustomer.id === customer.id,
                    }"
                    @click="selectCustomer(customer)"
                  >
                    <div class="customer-name">{{ customer.nombre }}</div>
                    <div class="customer-details">
                      <span v-if="customer.rtn">RTN: {{ customer.rtn }}</span>
                      <span v-else>Consumidor final</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="or-divider">
              <span>O</span>
            </div>

            <div class="new-customer">
              <h3>Registrar nuevo cliente</h3>
              <button
                @click="showNewCustomerModal = true"
                class="btn new-customer-btn"
              >
                <i class="fas fa-plus"></i> Nuevo Cliente
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showCustomerModal = false" class="btn cancel-btn">
            Cancelar
          </button>
          <button
            @click="confirmCustomer"
            class="btn confirm-btn"
            :disabled="!selectedCustomer"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para nuevo cliente -->
    <!-- Modal para nuevo cliente -->
    <div v-if="showNewCustomerModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Registrar Nuevo Cliente</h2>
          <button @click="cancelNewCustomer" class="modal-close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre completo*:</label>
            <input
              v-model="newCustomer.nombre"
              type="text"
              placeholder="Nombre del cliente"
              required
            />
          </div>
          <div class="form-group">
            <label>RTN:</label>
            <input
              v-model="newCustomer.rtn"
              type="text"
              placeholder="RTN (opcional)"
            />
          </div>
          <div class="form-group">
            <label>Teléfono*:</label>
            <input
              v-model="newCustomer.telefono"
              type="text"
              placeholder="Teléfono"
              required
            />
          </div>
          <div class="form-group">
            <label>Correo:</label>
            <input
              v-model="newCustomer.correo"
              type="email"
              placeholder="Correo electrónico"
            />
          </div>
          <div class="form-group">
            <label>Dirección:</label>
            <input
              v-model="newCustomer.direccion"
              type="text"
              placeholder="Dirección"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cancelNewCustomer" class="btn cancel-btn">
            Cancelar
          </button>
          <button @click="saveNewCustomer" class="btn confirm-btn">
            Guardar Cliente
          </button>
        </div>
      </div>
    </div>
    <!--<div v-if="showNewCustomerModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Registrar Nuevo Cliente</h2>
          <button @click="cancelNewCustomer" class="modal-close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre completo*:</label>
            <input
              v-model="newCustomer.nombre"
              type="text"
              placeholder="Nombre del cliente"
              required
            />
          </div>
          <div class="form-group">
            <label>RTN:</label>
            <input
              v-model="newCustomer.rtn"
              type="text"
              placeholder="RTN (opcional)"
            />
          </div>
          <div class="form-group">
            <label>Teléfono*:</label>
            <input
              v-model="newCustomer.telefono"
              type="text"
              placeholder="Teléfono"
              required
            />
          </div>
          <div class="form-group">
            <label>Dirección:</label>
            <input
              v-model="newCustomer.direccion"
              type="text"
              placeholder="Dirección"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cancelNewCustomer" class="btn cancel-btn">
            Cancelar
          </button>
          <button @click="saveNewCustomer" class="btn confirm-btn">
            Guardar Cliente
          </button>
        </div>
      </div>
    </div>-->

    <!-- Modal de método de pago -->
    <div v-if="showPaymentMethodModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Método de Pago</h2>
          <button @click="showPaymentMethodModal = false" class="modal-close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="payment-methods">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="payment-method"
              :class="{ selected: selectedPaymentMethod === method.id }"
              @click="selectPaymentMethod(method.id)"
            >
              <div class="method-icon">
                <i :class="method.icon"></i>
              </div>
              <div class="method-name">{{ method.nombre }}</div>
            </div>
          </div>

          <!-- Efectivo -->
          <div v-if="selectedPaymentMethod === 1" class="cash-payment-details">
            <div class="form-group">
              <label>Efectivo recibido:</label>
              <input
                type="number"
                v-model.number="cashReceived"
                min="0"
                step="0.01"
                class="cash-input"
                placeholder="0.00"
              />
            </div>
            <div class="form-group">
              <label>Cambio:</label>
              <span class="change-amount">L {{ calculateChangeAmount() }}</span>
            </div>
          </div>

          <!-- Transferencia Bancaria -->
          <div
            v-if="selectedPaymentMethod === 3"
            class="transfer-payment-details"
          >
            <div class="form-group">
              <label>Banco:</label>
              <select v-model="transferDetails.banco" class="bank-select">
                <option value="">Seleccione un banco</option>
                <option value="Banco Atlántida">
                  Banco Atlántida - 123-456789-0
                </option>
                <option value="Banpais">Banpais - 987-654321-0</option>
                <option value="BAC">BAC - 456-123789-0</option>
              </select>
            </div>
            <div class="form-group">
              <label>Número de referencia:</label>
              <input
                type="text"
                v-model="transferDetails.numeroReferencia"
                placeholder="Número de transferencia"
              />
            </div>
            <div class="form-group">
              <label>Monto transferido:</label>
              <input
                type="number"
                v-model.number="transferDetails.monto"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            @click="showPaymentMethodModal = false"
            class="btn cancel-btn"
          >
            Cancelar
          </button>
          <button
            @click="confirmPaymentMethod"
            class="btn confirm-btn"
            :disabled="!canProceedToSummary"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de resumen -->
    <div v-if="showSummaryModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Resumen de Venta</h2>
          <button @click="showSummaryModal = false" class="modal-close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="summary-details">
            <div class="detail-row">
              <span class="detail-label">Cliente:</span>
              <span class="detail-value">{{ selectedCustomer.nombre }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">RTN:</span>
              <span class="detail-value">{{
                selectedCustomer.rtn || "Consumidor final"
              }}</span>
            </div>

            <div class="products-summary">
              <h3>Productos</h3>
              <table class="summary-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in cartItems" :key="index">
                    <td>{{ item.nombre }}</td>
                    <td>{{ item.cantidad }}</td>
                    <td>L {{ item.precio_venta.toFixed(2) }}</td>
                    <td>
                      L {{ (item.precio_venta * item.cantidad).toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="payment-summary">
              <h3>Pago</h3>
              <div class="detail-row">
                <span class="detail-label">Método:</span>
                <span class="detail-value">{{ getPaymentMethodName() }}</span>
              </div>

              <div v-if="selectedPaymentMethod === 1" class="cash-summary">
                <div class="detail-row">
                  <span class="detail-label">Efectivo recibido:</span>
                  <span class="detail-value"
                    >L {{ cashReceived.toFixed(2) }}</span
                  >
                </div>
                <div class="detail-row">
                  <span class="detail-label">Cambio:</span>
                  <span class="detail-value"
                    >L {{ calculateChangeAmount() }}</span
                  >
                </div>
              </div>

              <div v-if="selectedPaymentMethod === 3" class="transfer-summary">
                <div class="detail-row">
                  <span class="detail-label">Banco:</span>
                  <span class="detail-value">{{ transferDetails.banco }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Referencia:</span>
                  <span class="detail-value">{{
                    transferDetails.numeroReferencia
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Monto transferido:</span>
                  <span class="detail-value"
                    >L {{ transferDetails.monto.toFixed(2) }}</span
                  >
                </div>
              </div>
            </div>

            <div class="totals-summary">
              <div class="detail-row">
                <span class="detail-label">Subtotal:</span>
                <span class="detail-value">L {{ calculateSubtotal() }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ISV (15%):</span>
                <span class="detail-value">L {{ calculateTotalTax() }}</span>
              </div>
              <div class="detail-row total-row">
                <span class="detail-label">Total:</span>
                <span class="detail-value">L {{ calculateTotal() }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showSummaryModal = false" class="btn cancel-btn">
            Cancelar
          </button>
          <button @click="generateInvoice" class="btn confirm-btn">
            Generar Factura
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de factura -->
    <div v-if="showInvoiceModal" class="modal-overlay">
      <div class="modal-content invoice-modal">
        <div class="modal-header">
          <h2>Factura Generada</h2>
          <button @click="closeInvoice" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="invoice">
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
                <p>Atendido por: {{ currentUser.name || "Cajero" }}</p>
              </div>
              <div class="authorized-section">
                <p class="authorized-text">Facturación autorizada</p>
                <p>No. {{ invoice.numero }}</p>
              </div>
            </div>

            <!-- Sección de datos de factura -->
            <div class="invoice-data">
              <p>CAI: {{ invoice.cai }}</p>
              <p>Fecha Limite de Emisión: {{ invoice.fechaLimite || "31/12/2025"}}</p>
              <p>
                Rango autorizado: {{ invoice.rangoInicio }} al
                {{ invoice.rangoFin }}
              </p>
            </div>

            <!-- Datos del cliente -->
            <div class="customer-info">
              <p>
                <strong>Cliente:</strong>
                {{ selectedCustomer.nombre || "Consumidor final" }}
              </p>
              <p><strong>RTN:</strong> {{ selectedCustomer.rtn || "N/A" }}</p>
              <p>
                <strong>Dirección:</strong>
                {{ selectedCustomer.direccion || "Ciudad" }}
              </p>
              <p><strong>Fecha:</strong> {{ formatDateTime(invoice.fecha) }}</p>
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
                <tr v-for="(item, index) in cartItems" :key="index">
                  <td class="text-left">{{ item.nombre }}</td>
                  <td class="text-center">{{ item.cantidad }}</td>
                  <td class="text-right">
                    L {{ item.precio_venta.toFixed(2) }}
                  </td>
                  <td class="text-right">
                    L {{ calculateTax(item).toFixed(2) }}
                  </td>
                  <td class="text-right">
                    L {{ (item.precio_venta * item.cantidad).toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Totales -->
            <div class="invoice-totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>L {{ calculateSubtotal() }}</span>
              </div>
              <div class="total-row">
                <span>ISV (15%):</span>
                <span>L {{ calculateTotalTax() }}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total:</span>
                <span>L {{ calculateTotal() }}</span>
              </div>

              <!-- Detalles de pago -->
              <div v-if="selectedPaymentMethod === 1" class="payment-details">
                <div class="total-row">
                  <span>Efectivo recibido:</span>
                  <span>L {{ cashReceived.toFixed(2) }}</span>
                </div>
                <div class="total-row">
                  <span>Cambio:</span>
                  <span>L {{ calculateChangeAmount() }}</span>
                </div>
              </div>

              <div v-if="selectedPaymentMethod === 3" class="payment-details">
                <div class="total-row">
                  <span>Banco:</span>
                  <span>{{ transferDetails.banco }}</span>
                </div>
                <div class="total-row">
                  <span>Referencia:</span>
                  <span>{{ transferDetails.numeroReferencia }}</span>
                </div>
                <div class="total-row">
                  <span>Monto transferido:</span>
                  <span>L {{ transferDetails.monto.toFixed(2) }}</span>
                </div>
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
        </div>
        <div class="modal-footer">
          <button @click="printInvoice" class="btn print-btn">
            <i class="fas fa-print"></i> Imprimir
          </button>
          <button @click="closeInvoice" class="btn close-btn">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // Datos de búsqueda
      searchQuery: "",
      productSearch: "",

      // Productos
      products: [],
      searchResults: [],
      cartItems: [],

      // Clientes
      customers: [],
      customerSearch: "",
      filteredCustomers: [],
      selectedCustomer: null,
      showCustomerModal: false,

      // Nuevo cliente
      showNewCustomerModal: false,
      newCustomer: {
        nombre: "",
        rtn: "",
        telefono: "",
        direccion: "",
        correo: "",
      },

      // Métodos de pago
      paymentMethods: [
        { id: 1, nombre: "Efectivo", icon: "fas fa-money-bill-wave" },
        { id: 2, nombre: "Tarjeta de Crédito", icon: "fas fa-credit-card" },
        { id: 3, nombre: "Transferencia Bancaria", icon: "fas fa-university" },
      ],
      selectedPaymentMethod: null,
      showPaymentMethodModal: false,

      // Efectivo
      cashReceived: null,

      // Transferencia
      transferDetails: {
        banco: "",
        numeroReferencia: "",
        monto: null,
      },

      // Resumen
      showSummaryModal: false,

      // Factura
      showInvoiceModal: false,
      invoice: {
        numero: "000-002-02-00015581",
        cai: "C00A00-000ABC-000000-AA0000-D000A0-OE",
        fechaLimite: "25/12/2024",
        rangoInicio: "000-002-02-00015500",
        rangoFin: "000-001-01-00015700",
        fecha: new Date().toISOString(),
      },
      amountInWords: "",

      // Usuario actual (simulado)
      currentUser: {
        name: "Empleado",
      },

      // Info de la empresa (simulado)
      companyInfo: {
        nombre: "Tu negocio S. de R. L",
        rtn: "8888-8888-000000",
        correo: "info@ERPfactura.com",
        website: "http://www.ERPfactura.com",
      },
    };
  },
  computed: {
    canProceedToSummary() {
      if (!this.selectedPaymentMethod) return false;

      if (this.selectedPaymentMethod === 1) {
        return this.cashReceived !== null;
      }

      if (this.selectedPaymentMethod === 3) {
        return (
          this.transferDetails.banco &&
          this.transferDetails.numeroReferencia &&
          this.transferDetails.monto !== null
        );
      }

      return true;
    },
  },
  async mounted() {
    await this.fetchProducts();
    await this.fetchCustomers();

    // Seleccionar "Consumidor final" por defecto
    const defaultCustomer = this.customers.find(
      (c) => c.nombre === "Consumidor final"
    );
    if (defaultCustomer) {
      this.selectedCustomer = defaultCustomer;
    } else {
      this.selectedCustomer = {
        id: 0,
        nombre: "Consumidor final",
        rtn: "",
        telefono: "",
        direccion: "Ciudad",
      };
    }
  },
  methods: {
    // Navegación
    navigateTo(route) {
      console.log(`Navigating to ${route}`);
    },

    async fetchProducts() {
      try {
        console.log(
          "Intentando cargar productos desde:",
          "http://localhost:3005/api/v1/producto"
        );
        const response = await fetch("http://localhost:3005/api/v1/producto");

        if (!response.ok) {
          throw new Error(
            `Error HTTP: ${response.status} - ${response.statusText}`
          );
        }

        const data = await response.json();

        // Diagnóstico extenso - inspeccionar la estructura de los datos
        console.log("Respuesta completa:", data);

        if (data && Array.isArray(data) && data.length > 0) {
          console.log("Primer producto (muestra):", data[0]);

          // Mapear los datos para adaptarlos al formato esperado
          this.products = data.map((item) => this.mapProductData(item));

          this.searchResults = [...this.products];
          console.log("Productos procesados y listos:", this.products.length);
        } else {
          console.error("Formato de respuesta inesperado o vacío:", data);
          throw new Error("Formato de respuesta inesperado o vacío");
        }
      } catch (error) {
        //console.error('Error detallado al cargar productos:', error);

        // Datos de prueba solo si falla la carga
        this.products = [
          {
            id: 1,
            nombre: "Laptop HP",
            codigo: "LHP001",
            stock: 10,
            precio_venta: 15000.0,
          },
          {
            id: 2,
            nombre: 'Monitor Dell 24"',
            codigo: "MD001",
            stock: 15,
            precio_venta: 3500.0,
          },
          {
            id: 3,
            nombre: "Teclado Mecánico",
            codigo: "TM001",
            stock: 20,
            precio_venta: 1200.0,
          },
          {
            id: 4,
            nombre: "Mouse Inalámbrico",
            codigo: "MI001",
            stock: 25,
            precio_venta: 450.0,
          },
          {
            id: 5,
            nombre: "Audífonos Bluetooth",
            codigo: "AB001",
            stock: 18,
            precio_venta: 850.0,
          },
          {
            id: 6,
            nombre: "Impresora Multifuncional",
            codigo: "IM001",
            stock: 8,
            precio_venta: 4200.0,
          },
        ];
        this.searchResults = [...this.products];

        console.log(
          "Usando datos de prueba provisionales:",
          this.products.length
        );
        //alert('Error al cargar productos de la base de datos. Se están usando datos de prueba temporales.');
      }
    },

    // Método para mapear productos a la estructura esperada
    mapProductData(item) {
      // Copia base del producto
      const product = { ...item };

      // Mapear campos si tienen nombres diferentes en la API
      // Por ejemplo, si en la API viene como 'name' pero necesitamos 'nombre'
      if (product.name !== undefined && product.nombre === undefined) {
        product.nombre = product.name;
      }

      if (product.code !== undefined && product.codigoProducto === undefined) {
        product.codigoProducto = product.code;
      }

      if (product.inventory !== undefined && product.stock === undefined) {
        product.stock = product.inventory;
      }

      if (product.price !== undefined && product.precio_venta === undefined) {
        product.precio_venta = product.price;
      }

      // Asegurarse de que los valores requeridos estén presentes
      product.nombre = product.nombre || "Producto sin nombre";
      product.codigoProducto = product.codigoProducto || "SIN-CODIGO";
      product.stock = product.stock || 0;
      product.precio_venta = Number(product.precio_venta) || 0;

      return product;
    },

    /*async fetchProducts() {
  try {
    console.log('Intentando cargar productos desde:', 'http://localhost:3005/api/vi/producto');
    const response = await fetch('http://localhost:3005/api/vi/producto');
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Productos recibidos:', data);
    
    if (data && Array.isArray(data)) {
      this.products = data.filter(product => product.stock > 0);
      this.searchResults = [...this.products];
      console.log('Productos cargados:', this.products.length);
    } else {
      console.error('Formato de respuesta inesperado:', data);
      throw new Error('Formato de respuesta inesperado');
    }
  } catch (error) {
    console.error('Error detallado al cargar productos:', error);
    
    // Datos de prueba solo si falla la carga
    this.products = [
      { id: 1, nombre: 'Laptop HP', codigo: 'LHP001', stock: 10, precio_venta: 15000.00 },
      { id: 2, nombre: 'Monitor Dell 24"', codigo: 'MD001', stock: 15, precio_venta: 3500.00 },
      { id: 3, nombre: 'Teclado Mecánico', codigo: 'TM001', stock: 20, precio_venta: 1200.00 },
      { id: 4, nombre: 'Mouse Inalámbrico', codigo: 'MI001', stock: 25, precio_venta: 450.00 },
      { id: 5, nombre: 'Audífonos Bluetooth', codigo: 'AB001', stock: 18, precio_venta: 850.00 },
      { id: 6, nombre: 'Impresora Multifuncional', codigo: 'IM001', stock: 8, precio_venta: 4200.00 }
    ];
    this.searchResults = [...this.products];
    
    console.log('Usando datos de prueba provisionales:', this.products.length);
    alert('Error al cargar productos de la base de datos. Se están usando datos de prueba temporales.');
  }
},
    // Productos
    async fetchProducts() {
      try {
        console.log(
          "Intentando cargar productos desde:",
          "http://localhost:3005/api/v1/producto"
        );
        const response = await fetch("http://localhost:3005/api/v1/producto");

        if (!response.ok) {
          throw new Error(
            `Error HTTP: ${response.status} - ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Respuesta recibida:", data);

        if (data && Array.isArray(data)) {
          this.products = data.filter((product) => product.stock > 0);
          this.searchResults = [...this.products];
          console.log("Productos cargados:", this.  .length);
        } else {
          console.error("Formato de respuesta inesperado:", data);
          this.products = [];
          this.searchResults = [];
          alert("Error en el formato de datos recibidos del servidor");
        }
      } catch (error) {
        console.error("Error detallado al cargar productos:", error);

        let errorMessage = "Error al cargar los productos: " + error.message;
        console.error(errorMessage);
        this.products = [];
        this.searchResults = [];
        alert(errorMessage);
      }
    },*/

    searchProducts() {
      if (!this.productSearch.trim()) {
        this.fetchProducts();
        return;
      }

      const searchTerm = this.productSearch.toLowerCase();
      this.searchResults = this.products.filter(
        (product) =>
          product.nombre.toLowerCase().includes(searchTerm) ||
          (product.codigoProducto &&
            product.codigoProducto
              .toString()
              .toLowerCase()
              .includes(searchTerm))
      );
      this.products = [...this.searchResults];
    },

    addToCart(product) {
      const existingIndex = this.cartItems.findIndex(
        (item) => item.id === product.id
      );

      if (existingIndex >= 0) {
        if (this.cartItems[existingIndex].cantidad < product.stock) {
          this.cartItems[existingIndex].cantidad += 1;
        } else {
          alert("No hay suficiente stock disponible");
        }
      } else {
        if (product.stock > 0) {
          this.cartItems.push({
            ...product,
            cantidad: 1,
          });
        } else {
          alert("Producto sin stock disponible");
        }
      }
    },

    updateSubtotal(index) {
      if (this.cartItems[index].cantidad < 1) {
        this.cartItems[index].cantidad = 1;
      }

      const product = this.products.find(
        (p) => p.id === this.cartItems[index].id
      );
      if (product && this.cartItems[index].cantidad > product.stock) {
        alert(`No hay suficiente stock. Máximo disponible: ${product.stock}`);
        this.cartItems[index].cantidad = product.stock;
      }
    },

    increaseQuantity(index) {
      const product = this.products.find(
        (p) => p.id === this.cartItems[index].id
      );
      if (product && this.cartItems[index].cantidad < product.stock) {
        this.cartItems[index].cantidad += 1;
      } else {
        alert("No hay suficiente stock disponible");
      }
    },

    decreaseQuantity(index) {
      if (this.cartItems[index].cantidad > 1) {
        this.cartItems[index].cantidad -= 1;
      }
    },

    removeItem(index) {
      this.cartItems.splice(index, 1);
    },

    // Cálculos
    // Método para calcular el ISV (impuesto) de un ítem
    // Considerando que el precio ya incluye el impuesto
    calculateTax(item) {
      // Factor de ISV (15%)
      const taxFactor = 0.15;

      // Si el precio incluye el impuesto, tenemos que calcularlo así:
      // precio con impuesto = precio sin impuesto * (1 + taxFactor)
      // por lo tanto: precio sin impuesto = precio con impuesto / (1 + taxFactor)
      // y el impuesto = precio con impuesto - precio sin impuesto

      const priceWithTax = item.precio_venta * item.cantidad;
      const priceWithoutTax = priceWithTax / (1 + taxFactor);
      const tax = priceWithTax - priceWithoutTax;

      return tax;
    },

    // Método para calcular el subtotal (sin impuesto)
    calculateSubtotal() {
      const taxFactor = 0.15;

      return this.cartItems
        .reduce((sum, item) => {
          // Precio total con impuesto
          const totalWithTax = item.precio_venta * item.cantidad;

          // Precio sin impuesto
          const totalWithoutTax = totalWithTax / (1 + taxFactor);

          return sum + totalWithoutTax;
        }, 0)
        .toFixed(2);
    },

    // Método para calcular el total de impuestos
    calculateTotalTax() {
      return this.cartItems
        .reduce((sum, item) => sum + this.calculateTax(item), 0)
        .toFixed(2);
    },

    // Método para calcular el total (con impuesto)
    calculateTotal() {
      // Simplemente sumamos el precio total de cada ítem
      return this.cartItems
        .reduce((sum, item) => sum + item.precio_venta * item.cantidad, 0)
        .toFixed(2);
    },

    // Método para calcular el cambio
    calculateChangeAmount() {
      if (this.cashReceived === null) return "0.00";
      const total = parseFloat(this.calculateTotal());
      return (this.cashReceived - total).toFixed(2);
    },

    // Clientes
    async fetchCustomers() {
      try {
        console.log(
          "Intentando cargar clientes desde:",
          "http://localhost:3005/api/v1/cliente"
        );
        const response = await fetch("http://localhost:3005/api/v1/cliente");

        if (!response.ok) {
          throw new Error(
            `Error HTTP: ${response.status} - ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Clientes recibidos:", data);
        this.customers = data;

        if (!this.customers.some((c) => c.nombre === "Consumidor final")) {
          this.customers.unshift({
            id: 0,
            nombre: "Consumidor final",
            rtn: "",
            telefono: "",
            direccion: "Ciudad",
            empresaId: 0,
            estado: 1,
          });
        }

        this.filteredCustomers = [...this.customers].slice(0, 5);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        this.customers = [
          {
            id: 0,
            nombre: "Consumidor final",
            rtn: "",
            telefono: "",
            direccion: "Ciudad",
            empresaId: 0,
            estado: 1,
          },
        ];
        this.filteredCustomers = [...this.customers];
        alert(
          "Error al cargar clientes. Se está usando un cliente por defecto."
        );
      }
    },

    /*async fetchCustomers() {
      try {
        const response = await fetch("http://localhost:3005/api/v1/cliente");

        if (!response.ok) {
          throw new Error(
            `Error HTTP: ${response.status} - ${response.statusText}`
          );
        }

        const data = await response.json();
        this.customers = data;

        if (!this.customers.some((c) => c.nombre === "Consumidor final")) {
          this.customers.unshift({
            id: 0,
            nombre: "Consumidor final",
            rtn: "",
            telefono: "",
            direccion: "Ciudad",
          });
        }

        this.filteredCustomers = [...this.customers].slice(0, 5);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        this.customers = [
          {
            id: 0,
            nombre: "Consumidor final",
            rtn: "",
            telefono: "",
            direccion: "Ciudad",
          },
        ];
        this.filteredCustomers = [...this.customers];
      }
    },*/

    filterCustomers() {
      if (!this.customerSearch.trim()) {
        this.filteredCustomers = [...this.customers].slice(0, 5);
        return;
      }

      const searchTerm = this.customerSearch.toLowerCase();
      this.filteredCustomers = this.customers
        .filter(
          (customer) =>
            customer.nombre.toLowerCase().includes(searchTerm) ||
            (customer.rtn && customer.rtn.includes(searchTerm))
        )
        .slice(0, 5);
    },

    selectCustomer(customer) {
      this.selectedCustomer = customer;
    },

    // Nuevo cliente
    cancelNewCustomer() {
      this.showNewCustomerModal = false;
      this.newCustomer = {
        nombre: "",
        rtn: "",
        telefono: "",
        direccion: "",
        correo: "",
      };
    },
    async saveNewCustomer() {
      if (!this.newCustomer.nombre || !this.newCustomer.telefono) {
        alert("Nombre y teléfono son campos obligatorios");
        return;
      }

      try {
        const response = await fetch("http://localhost:3005/api/v1/cliente", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: this.newCustomer.nombre,
            rtn: this.newCustomer.rtn || null,
            telefono: this.newCustomer.telefono,
            direccion: this.newCustomer.direccion || "Ciudad",
            correo: this.newCustomer.correo || "",
            empresaId: 0,
            estado: 1,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Error HTTP: ${response.status}`
          );
        }

        const data = await response.json();
        this.selectedCustomer = data;
        this.customers.unshift(this.selectedCustomer);
        this.showNewCustomerModal = false;
        this.newCustomer = {
          nombre: "",
          rtn: "",
          telefono: "",
          direccion: "",
          correo: "",
        };

        this.filterCustomers();
      } catch (error) {
        console.error("Error al guardar cliente:", error);
        let errorMsg = "Error al guardar el cliente";
        if (error.message) {
          errorMsg += `: ${error.message}`;
        }
        alert(errorMsg);
      }
    },
    /*async saveNewCustomer() {
      if (!this.newCustomer.nombre || !this.newCustomer.telefono) {
        alert("Nombre y teléfono son campos obligatorios");
        return;
      }

      try {
        const response = await fetch("http://localhost:3005/api/v1/cliente", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: this.newCustomer.nombre,
            rtn: this.newCustomer.rtn || null,
            telefono: this.newCustomer.telefono,
            direccion: this.newCustomer.direccion || "Ciudad",
            estado: "Activo",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Error HTTP: ${response.status}`
          );
        }

        const data = await response.json();
        this.selectedCustomer = data;
        this.customers.unshift(this.selectedCustomer);
        this.showNewCustomerModal = false;
        this.newCustomer = {
          nombre: "",
          rtn: "",
          telefono: "",
          direccion: "",
        };

        this.filterCustomers();
      } catch (error) {
        console.error("Error al guardar cliente:", error);
        let errorMsg = "Error al guardar el cliente";
        if (error.message) {
          errorMsg += `: ${error.message}`;
        }
        alert(errorMsg);
      }
    },*/

    // Proceso de pago
    processPayment() {
      if (this.cartItems.length === 0) {
        alert("No hay productos en el carrito");
        return;
      }

      this.showCustomerModal = true;
    },

    confirmCustomer() {
      if (!this.selectedCustomer) {
        alert("Debe seleccionar un cliente");
        return;
      }

      this.showCustomerModal = false;
      this.showPaymentMethodModal = true;
    },

    selectPaymentMethod(methodId) {
      this.selectedPaymentMethod = methodId;

      if (methodId === 3) {
        this.transferDetails.monto = parseFloat(this.calculateTotal());
      }
    },

    confirmPaymentMethod() {
      if (!this.canProceedToSummary) {
        alert("Complete todos los campos requeridos");
        return;
      }

      this.showPaymentMethodModal = false;
      this.showSummaryModal = true;
    },

    getPaymentMethodName() {
      const method = this.paymentMethods.find(
        (m) => m.id === this.selectedPaymentMethod
      );
      return method ? method.nombre : "";
    },

    // Factura
    generateInvoice() {
      this.amountInWords = this.convertNumberToWords(
        parseFloat(this.calculateTotal())
      );

      // Generar número de factura secuencial (simulado)
      const lastNumber = parseInt(this.invoice.numero.slice(-5));
      this.invoice.numero = `000-002-02-${(lastNumber + 1)
        .toString()
        .padStart(5, "0")}`;
      this.invoice.fecha = new Date().toISOString();

      this.showSummaryModal = false;
      this.showInvoiceModal = true;
    },

    formatDateTime(dateString) {
      const date = new Date(dateString);
      return `${date.toLocaleDateString("es-ES")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
    },

    printInvoice() {
      // Crear ventana de impresión limpia
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Factura ${this.invoice.numero}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #000; }
        .invoice { max-width: 800px; margin: 0 auto; }
        .invoice-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .company-info { border: 2px solid #f44336; padding: 10px; text-align: center; }
        .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .invoice-table th, .invoice-table td { padding: 8px; border-bottom: 1px solid #ddd; }
        .invoice-table th { background-color: #f5f5f5; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .grand-total { font-weight: bold; font-size: 1.1em; margin-top: 10px; }
        .amount-in-words { margin: 20px 0; font-style: italic; }
        .invoice-footer { text-align: center; margin-top: 30px; font-size: 0.9em; }
        @page { size: auto; margin: 5mm; }
      </style>
    </head>
    <body>
      <div class="invoice">
        ${document.querySelector(".invoice").outerHTML}
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 100);
        };
      <\/script>
    <\/body>
    <\/html>
  `);
      printWindow.document.close();
    },

    closeInvoice() {
      this.showInvoiceModal = false;
      this.clearCart();
    },

    clearCart() {
      this.cartItems = [];
      this.selectedPaymentMethod = null;
      this.cashReceived = null;
      this.transferDetails = {
        banco: "",
        numeroReferencia: "",
        monto: null,
      };
    },

    // Conversión de números a palabras
    convertNumberToWords(number) {
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
    },
  },
};
</script>

<style scoped>
/* Estilos generales */
.caja-container {
  background-color: #1e1e1e;
  color: #ffffff;
  min-height: 100vh;
  padding: 20px;
  font-family: "Arial", sans-serif;
}

/* Estilos para centrar perfectamente el ícono dentro del botón */

.simple-delete-btn {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  /* Propiedades para centrar el contenido */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Dimensiones fijas para asegurar forma cuadrada */
  width: 36px;
  height: 36px;
  
  /* Quitar padding para control total de dimensiones */
  padding: 0;
  
  /* Tamaño de fuente para el emoji o ícono */
  font-size: 18px;
  
  /* Eliminar las transformaciones por defecto de texto */
  text-align: center;
  line-height: 1;
}

.simple-delete-btn:hover {
  background-color: #d32f2f;
  transform: scale(1.05);
}

/* En caso de usar Font Awesome */
.action-btn.delete-btn {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  /* Propiedades para centrar el contenido */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Dimensiones fijas */
  width: 36px;
  height: 36px;
  
  /* Quitar padding para control total */
  padding: 0;
}

/* Centrar el ícono de Font Awesome dentro del botón */
.action-btn.delete-btn i {
  /* Centrar el ícono si se mueve */
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

/* Asegurar que la celda esté centrada */
.cart-list table tbody tr td:last-child {
  text-align: center !important;
  vertical-align: middle !important;
  padding: 12px;
}

.cart-list table tbody tr td:last-child {
  text-align: center !important;
  vertical-align: middle !important;
}

/* Centra el botón de eliminar */
.cart-list table .action-btn.delete-btn,
.cart-list table .simple-delete-btn {
  display: inline-block;
  margin: 0 auto;
}

.action-btn.delete-btn {
  background-color: #f44336;
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  min-height: 36px;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.action-btn.delete-btn:hover {
  background-color: #d32f2f;
}

.action-btn.delete-btn i {
  font-size: 16px;
  margin-right: 4px;
}

/* Texto de respaldo visible */
.delete-text {
  font-weight: bold;
  font-size: 16px;
}

/* Estilos de navegación */
.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.breadcrumb-item {
  cursor: pointer;
  color: #aaa;
}

.breadcrumb-item:hover {
  text-decoration: underline;
  color: #fff;
}

.breadcrumb-item.active {
  font-weight: 500;
  color: #fff;
}

.separator {
  margin: 0 10px;
  color: #666;
}

/* Cabecera de contenido */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.search-container {
  display: flex;
  align-items: center;
}

.search-container input {
  background-color: #333;
  border: none;
  border-radius: 4px 0 0 4px;
  padding: 8px 12px;
  color: #fff;
  outline: none;
}

.search-btn {
  background-color: #333;
  border: none;
  border-radius: 0 4px 4px 0;
  padding: 8px 12px;
  color: #fff;
  cursor: pointer;
  height: 36px;
}

.search-btn:hover {
  background-color: #444;
}

/* Diseño de grid */
.caja-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 20px;
}

/* Paneles */
.panel {
  background-color: #2d2d2d;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.panel-header {
  background-color: #353535;
  padding: 12px 16px;
  border-bottom: 1px solid #444;
}

.panel-header h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

/* Estilos de la lista de productos */
.search-product {
  padding: 12px;
  border-bottom: 1px solid #444;
}

.search-product input {
  width: 100%;
  background-color: #333;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  color: #fff;
  outline: none;
}

.product-list {
  max-height: 500px;
  overflow-y: auto;
}

.product-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #444;
  cursor: pointer;
  transition: background-color 0.2s;
}

.product-item:hover {
  background-color: #3a3a3a;
}

.product-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-name {
  font-weight: 500;
}

.product-code,
.product-stock {
  font-size: 12px;
  color: #aaa;
  margin-top: 4px;
}

.product-price {
  font-weight: 600;
  color: #4caf50;
  min-width: 80px;
  text-align: right;
}

.no-results {
  padding: 16px;
  text-align: center;
  color: #999;
}

/* Estilos de tabla */
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #353535;
  text-align: left;
  padding: 12px;
  font-weight: 500;
  border-bottom: 1px solid #444;
}

td {
  padding: 12px;
  border-bottom: 1px solid #444;
}

.quantity-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn {
  background-color: #444;
  border: none;
  color: #fff;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.qty-btn:hover {
  background-color: #555;
}

.quantity-cell input {
  width: 40px;
  text-align: center;
  background-color: #333;
  border: none;
  margin: 0 8px;
  padding: 4px;
  color: #fff;
  border-radius: 4px;
  outline: none;
}

.action-btn {
  background-color: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.delete-btn {
  color: #f44336;
}

.delete-btn:hover {
  background-color: rgba(244, 67, 54, 0.1);
}

.no-data {
  text-align: center;
  color: #999;
  padding: 24px;
}

.cart-footer {
  padding: 16px;
  border-top: 1px solid #444;
}

.total-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.subtotal-row,
.tax-row,
.total-row {
  display: flex;
  justify-content: space-between;
  width: 200px;
  margin: 4px 0;
}

.total-row {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #444;
}

.subtotal-label,
.tax-label,
.total-label {
  font-weight: 500;
}

.total-amount {
  font-size: 18px;
  font-weight: 600;
  color: #4caf50;
}

/* Botón de procesar pago */
.checkout-btn-container {
  padding: 16px;
  border-top: 1px solid #444;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #444;
  color: #fff;
}

.cancel-btn:hover {
  background-color: #555;
}

.process-btn {
  background-color: #4caf50;
  color: #fff;
}

.process-btn:hover {
  background-color: #3e8e41;
}

.process-btn:disabled:hover {
  background-color: #4caf50;
}

/* Estilos de modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #2d2d2d;
  border-radius: 6px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.invoice-modal {
  width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #444;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  color: #aaa;
  font-size: 24px;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #fff;
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #444;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Modal de cliente */
.customer-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.existing-customer,
.new-customer {
  flex: 1;
}

.customer-search {
  margin-top: 12px;
}

.customer-search input {
  width: 100%;
  background-color: #333;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  color: #fff;
  outline: none;
  margin-bottom: 12px;
}

.customer-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #444;
  border-radius: 4px;
}

.customer-item {
  padding: 12px;
  border-bottom: 1px solid #444;
  cursor: pointer;
  transition: background-color 0.2s;
}

.customer-item:hover {
  background-color: #3a3a3a;
}

.customer-item.selected {
  background-color: #4caf50;
}

.customer-name {
  font-weight: 500;
}

.customer-details {
  font-size: 12px;
  color: #aaa;
  margin-top: 4px;
}

.customer-item.selected .customer-details {
  color: #e0e0e0;
}

.or-divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #aaa;
}

.or-divider::before,
.or-divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #444;
}

.or-divider::before {
  margin-right: 16px;
}

.or-divider::after {
  margin-left: 16px;
}

.new-customer-btn {
  width: 100%;
  background-color: #2196f3;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.new-customer-btn:hover {
  background-color: #0d8aee;
}

/* Modal de método de pago */
.payment-methods {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.payment-method {
  flex: 1;
  background-color: #333;
  border-radius: 4px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.payment-method:hover {
  background-color: #3a3a3a;
}

.payment-method.selected {
  border-color: #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
}

.method-icon {
  font-size: 24px;
  margin-bottom: 8px;
  color: #4caf50;
}

.method-name {
  font-weight: 500;
}

.cash-payment-details,
.transfer-payment-details {
  background-color: #333;
  border-radius: 4px;
  padding: 16px;
  margin-top: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  background-color: #2d2d2d;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  color: #fff;
  outline: none;
}

.bank-select {
  height: 36px;
}

.change-amount {
  font-size: 18px;
  font-weight: 600;
  color: #4caf50;
  margin-left: 12px;
}

/* Modal de resumen */
.summary-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #444;
}

.detail-label {
  font-weight: 500;
}

.detail-value {
  text-align: right;
}

.products-summary,
.payment-summary,
.totals-summary {
  background-color: #333;
  border-radius: 4px;
  padding: 16px;
}

.products-summary h3,
.payment-summary h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
}

.summary-table th,
.summary-table td {
  padding: 8px;
  border-bottom: 1px solid #444;
  text-align: left;
}

.summary-table th {
  font-weight: 500;
  background-color: #3a3a3a;
}

.total-row {
  font-weight: bold;
  font-size: 18px;
}

.confirm-btn {
  background-color: #4caf50;
  color: #fff;
}

.confirm-btn:hover {
  background-color: #3e8e41;
}

/* Modal de factura */
.invoice {
  background-color: #fff;
  color: #000;
  border-radius: 6px;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.logo-section {
  flex: 1;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.logo-text {
  font-size: 32px;
  font-weight: bold;
  color: #2196f3;
  line-height: 1;
}

.logo-subtext {
  font-size: 16px;
  color: #f44336;
  margin-top: -5px;
}

.company-info {
  flex: 1;
  text-align: center;
  border: 2px solid #f44336;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.company-info p {
  margin: 5px 0;
}

.authorized-section {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  font-style: italic;
  font-size: 14px;
}

.invoice-data {
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
}

.text-center {
  text-align: center;
}

.customer-info {
  border: 2px solid #f44336;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.customer-info p {
  margin: 5px 0;
}

.invoice-products {
  margin-bottom: 20px;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.invoice-table th,
.invoice-table td {
  padding: 8px;
  border-bottom: 1px solid #ddd;
}

.invoice-table th {
  background-color: #f5f5f5;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.tax-breakdown {
  border: 2px solid #f44336;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.tax-table {
  width: 100%;
}

.tax-table td {
  padding: 6px 0;
  border-bottom: 1px solid #ddd;
}

.total-invoice-row td {
  font-weight: bold;
  border-top: 2px solid #000;
  border-bottom: none;
}

.amount-in-words {
  border: 2px solid #f44336;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
}

.invoice-footer {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-top: 20px;
}

.print-btn {
  background-color: #1976d2;
  color: #fff;
}

.print-btn:hover {
  background-color: #1565c0;
}

.close-btn {
  background-color: #444;
  color: #fff;
}

.close-btn:hover {
  background-color: #555;
}

/* Estilos específicos para impresión */
@media print {
  body * {
    visibility: hidden;
  }

  .modal-overlay,
  .modal-overlay * {
    visibility: visible;
  }

  .modal-overlay {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: auto;
    background-color: white;
  }

  .modal-content {
    box-shadow: none;
    width: 100%;
    max-width: 100%;
    border: none;
  }

  .modal-header,
  .modal-footer {
    display: none;
  }

  .invoice {
    padding: 0;
    box-shadow: none;
  }
}
</style>
