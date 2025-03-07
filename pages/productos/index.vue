<template>
    <div class="productos-container">
      <v-container fluid class="pa-0">
        <v-card class="w-100">
          <v-card-title class="d-flex justify-space-between align-center">
            Gestión de Productos
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openModal">
              Agregar Producto
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="productos"
              :loading="loading"
              class="elevation-1 full-width-table"
            >
              <template v-slot:item.precio="{ item }">
                {{ formatCurrency(item.precio) }}
              </template>
              <template v-slot:item.stock="{ item }">
                <v-chip
                  :color="getStockColor(item.stock)"
                  text-color="white"
                  small
                >
                  {{ item.stock }}
                </v-chip>
              </template>
              <template v-slot:item.estado="{ item }">
                <v-chip
                  :color="item.estado ? 'success' : 'error'"
                  text-color="white"
                  small
                >
                  {{ item.estado ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon color="info" v-bind="attrs" v-on="on" @click="viewProducto(item)">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </template>
                  <span>Ver detalles</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon color="warning" v-bind="attrs" v-on="on" @click="editProducto(item)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                  <span>Editar</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon color="error" v-bind="attrs" v-on="on" @click="confirmDelete(item)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>Eliminar</span>
                </v-tooltip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-container>
  
      <!-- Modal para agregar/editar producto -->
      <v-dialog v-model="dialog" max-width="600px" persistent>
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ formTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="editedItem.codigo"
                      :rules="codigoRules"
                      label="Código"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="editedItem.nombre"
                      :rules="nombreRules"
                      label="Nombre"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="editedItem.categoria_id"
                      :items="categorias"
                      item-text="nombre"
                      item-value="id"
                      :rules="categoriaRules"
                      label="Categoría"
                      required
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="editedItem.precio"
                      :rules="precioRules"
                      label="Precio"
                      prefix="$"
                      type="number"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="editedItem.stock"
                      :rules="stockRules"
                      label="Stock"
                      type="number"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="editedItem.unidad_medida"
                      :items="unidadesMedida"
                      :rules="unidadRules"
                      label="Unidad de Medida"
                      required
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="editedItem.descripcion"
                      label="Descripción"
                      rows="2"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12">
                    <v-switch
                      v-model="editedItem.estado"
                      color="success"
                      label="Producto activo"
                    ></v-switch>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" variant="text" @click="closeModal">
              Cancelar
            </v-btn>
            <v-btn
              color="primary"
              :loading="saveLoading"
              :disabled="!valid || saveLoading"
              @click="saveProducto"
            >
              Guardar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Modal de confirmación para eliminar -->
      <v-dialog v-model="dialogDelete" max-width="500px" persistent>
        <v-card>
          <v-card-title class="text-h5">¿Está seguro que desea eliminar este producto?</v-card-title>
          <v-card-text>
            Esta acción no se puede deshacer y podría afectar a facturas y otros registros relacionados.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" variant="text" @click="dialogDelete = false">Cancelar</v-btn>
            <v-btn color="error" :loading="deleteLoading" @click="deleteProducto">Eliminar</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Modal para ver detalles del producto -->
      <v-dialog v-model="dialogView" max-width="600px" persistent>
        <v-card>
          <v-card-title>
            <span class="text-h5">Detalles del Producto</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" class="pb-0">
                  <p class="text-subtitle-1 mb-1">Código:</p>
                  <p class="font-weight-medium">{{ viewedItem.codigo }}</p>
                </v-col>
                <v-col cols="12" sm="6" class="pb-0">
                  <p class="text-subtitle-1 mb-1">Nombre:</p>
                  <p class="font-weight-medium">{{ viewedItem.nombre }}</p>
                </v-col>
                <v-col cols="12" sm="6" class="py-0">
                  <p class="text-subtitle-1 mb-1">Categoría:</p>
                  <p class="font-weight-medium">{{ getCategoriaName(viewedItem.categoria_id) }}</p>
                </v-col>
                <v-col cols="12" sm="6" class="py-0">
                  <p class="text-subtitle-1 mb-1">Precio:</p>
                  <p class="font-weight-medium">{{ formatCurrency(viewedItem.precio) }}</p>
                </v-col>
                <v-col cols="12" sm="6" class="py-0">
                  <p class="text-subtitle-1 mb-1">Stock:</p>
                  <p class="font-weight-medium">
                    {{ viewedItem.stock }} {{ viewedItem.unidad_medida }}
                  </p>
                </v-col>
                <v-col cols="12" sm="6" class="py-0">
                  <p class="text-subtitle-1 mb-1">Estado:</p>
                  <v-chip
                    :color="viewedItem.estado ? 'success' : 'error'"
                    text-color="white"
                    small
                  >
                    {{ viewedItem.estado ? 'Activo' : 'Inactivo' }}
                  </v-chip>
                </v-col>
                <v-col cols="12" class="pt-0">
                  <p class="text-subtitle-1 mb-1">Descripción:</p>
                  <p class="font-weight-medium">{{ viewedItem.descripcion || 'N/A' }}</p>
                </v-col>
                <v-col cols="12" sm="6" class="pt-0">
                  <p class="text-subtitle-1 mb-1">Fecha de registro:</p>
                  <p class="font-weight-medium">{{ formatDate(viewedItem.created_at) }}</p>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="text" @click="dialogView = false">Cerrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProductosPage',
    data() {
      return {
        productos: [],
        categorias: [],
        unidadesMedida: ['Unidad', 'Kg', 'Gr', 'Lt', 'Mt', 'Cm', 'Caja', 'Paquete', 'Docena'],
        loading: false,
        dialog: false,
        dialogDelete: false,
        dialogView: false,
        saveLoading: false,
        deleteLoading: false,
        valid: true,
        editedIndex: -1,
        editedItem: {
          id: null,
          codigo: '',
          nombre: '',
          descripcion: '',
          categoria_id: null,
          precio: 0,
          stock: 0,
          unidad_medida: 'Unidad',
          estado: true
        },
        defaultItem: {
          id: null,
          codigo: '',
          nombre: '',
          descripcion: '',
          categoria_id: null,
          precio: 0,
          stock: 0,
          unidad_medida: 'Unidad',
          estado: true
        },
        viewedItem: {},
        headers: [
          { title: 'Código', align: 'start', key: 'codigo' },
          { title: 'Nombre', align: 'start', key: 'nombre' },
          { title: 'Categoría', align: 'start', key: 'categoria_id' },
          { title: 'Precio', align: 'end', key: 'precio' },
          { title: 'Stock', align: 'center', key: 'stock' },
          { title: 'Estado', align: 'center', key: 'estado' },
          { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
        ],
        codigoRules: [
          v => !!v || 'El código es requerido',
          v => v.length >= 2 || 'El código debe tener al menos 2 caracteres'
        ],
        nombreRules: [
          v => !!v || 'El nombre es requerido',
          v => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres'
        ],
        categoriaRules: [
          v => !!v || 'La categoría es requerida'
        ],
        precioRules: [
          v => !!v || 'El precio es requerido',
          v => v >= 0 || 'El precio no puede ser negativo'
        ],
        stockRules: [
          v => !!v || 'El stock es requerido',
          v => v >= 0 || 'El stock no puede ser negativo'
        ],
        unidadRules: [
          v => !!v || 'La unidad de medida es requerida'
        ]
      }
    },
    computed: {
      formTitle() {
        return this.editedIndex === -1 ? 'Nuevo Producto' : 'Editar Producto'
      }
    },
    created() {
      // Cargar categorías y productos
      this.fetchCategorias()
      
      // Para pruebas mientras se conecta al backend
      this.loadMockData()
      
      // Descomentar cuando se tenga el backend listo
      // this.fetchProductos()
    },
    methods: {
      async fetchCategorias() {
        try {
          // const response = await this.$axios.get('/api/categorias')
          // this.categorias = response.data.data || response.data
          
          // Datos de prueba para categorías
          this.categorias = [
            { id: 1, nombre: 'Electrónica' },
            { id: 2, nombre: 'Ropa' },
            { id: 3, nombre: 'Alimentos' },
            { id: 4, nombre: 'Hogar' },
            { id: 5, nombre: 'Juguetes' }
          ]
        } catch (error) {
          console.error('Error al obtener categorías:', error)
          if (this.$toast) {
            this.$toast.error('No se pudieron cargar las categorías')
          } else {
            alert('No se pudieron cargar las categorías')
          }
        }
      },
      
      loadMockData() {
        // Datos de prueba para visualizar mientras se configura el backend
        this.productos = [
          {
            id: 1,
            codigo: 'PROD001',
            nombre: 'Laptop HP 15"',
            descripcion: 'Laptop HP de 15 pulgadas con 8GB RAM y 256GB SSD',
            categoria_id: 1,
            precio: 899.99,
            stock: 25,
            unidad_medida: 'Unidad',
            estado: true,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            codigo: 'PROD002',
            nombre: 'Camiseta Azul',
            descripcion: 'Camiseta de algodón color azul talla M',
            categoria_id: 2,
            precio: 19.99,
            stock: 100,
            unidad_medida: 'Unidad',
            estado: true,
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            codigo: 'PROD003',
            nombre: 'Arroz Integral',
            descripcion: 'Arroz integral de primera calidad',
            categoria_id: 3,
            precio: 4.50,
            stock: 200,
            unidad_medida: 'Kg',
            estado: true,
            created_at: new Date().toISOString()
          },
          {
            id: 4,
            codigo: 'PROD004',
            nombre: 'Lámpara de Mesa',
            descripcion: 'Lámpara de mesa con luz LED ajustable',
            categoria_id: 4,
            precio: 34.99,
            stock: 15,
            unidad_medida: 'Unidad',
            estado: true,
            created_at: new Date().toISOString()
          },
          {
            id: 5,
            codigo: 'PROD005',
            nombre: 'Muñeca Articulada',
            descripcion: 'Muñeca articulada con accesorios',
            categoria_id: 5,
            precio: 24.99,
            stock: 5,
            unidad_medida: 'Unidad',
            estado: false,
            created_at: new Date().toISOString()
          }
        ]
      },
      
      async fetchProductos() {
        this.loading = true
        try {
          const response = await this.$axios.get('/api/productos')
          this.productos = response.data.data || response.data
        } catch (error) {
          console.error('Error al obtener productos:', error)
          if (this.$toast) {
            this.$toast.error('No se pudieron cargar los productos')
          } else {
            alert('No se pudieron cargar los productos')
          }
        } finally {
          this.loading = false
        }
      },
      
      openModal() {
        this.editedIndex = -1
        this.editedItem = JSON.parse(JSON.stringify(this.defaultItem))
        this.$nextTick(() => {
          if (this.$refs.form) {
            this.$refs.form.resetValidation()
          }
          this.dialog = true
        })
      },
      
      closeModal() {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = JSON.parse(JSON.stringify(this.defaultItem))
          this.editedIndex = -1
        })
      },
      
      editProducto(item) {
        this.editedIndex = this.productos.indexOf(item)
        this.editedItem = JSON.parse(JSON.stringify(item))
        this.$nextTick(() => {
          if (this.$refs.form) {
            this.$refs.form.resetValidation()
          }
          this.dialog = true
        })
      },
      
      viewProducto(item) {
        this.viewedItem = JSON.parse(JSON.stringify(item))
        this.dialogView = true
      },
      
      confirmDelete(item) {
        this.editedIndex = this.productos.indexOf(item)
        this.editedItem = JSON.parse(JSON.stringify(item))
        this.dialogDelete = true
      },
      
      async saveProducto() {
        if (this.$refs.form && !this.$refs.form.validate()) return
        
        this.saveLoading = true
        try {
          if (this.editedIndex > -1) {
            // Actualizar producto existente
            // await this.$axios.put(`/api/productos/${this.editedItem.id}`, this.editedItem)
            
            // Mock de actualización
            Object.assign(this.productos[this.editedIndex], this.editedItem)
            
            if (this.$toast) {
              this.$toast.success('Producto actualizado correctamente')
            } else {
              alert('Producto actualizado correctamente')
            }
          } else {
            // Crear nuevo producto
            // const response = await this.$axios.post('/api/productos', this.editedItem)
            
            // Mock de creación
            const newItem = {
              ...this.editedItem,
              id: this.productos.length ? Math.max(...this.productos.map(p => p.id)) + 1 : 1,
              created_at: new Date().toISOString()
            }
            this.productos.push(newItem)
            
            if (this.$toast) {
              this.$toast.success('Producto creado correctamente')
            } else {
              alert('Producto creado correctamente')
            }
          }
          this.closeModal()
        } catch (error) {
          console.error('Error al guardar producto:', error)
          if (this.$toast) {
            this.$toast.error('No se pudo guardar el producto')
          } else {
            alert('No se pudo guardar el producto')
          }
        } finally {
          this.saveLoading = false
        }
      },
      
      async deleteProducto() {
        this.deleteLoading = true
        try {
          // await this.$axios.delete(`/api/productos/${this.editedItem.id}`)
          
          // Mock de eliminación
          this.productos.splice(this.editedIndex, 1)
          
          if (this.$toast) {
            this.$toast.success('Producto eliminado correctamente')
          } else {
            alert('Producto eliminado correctamente')
          }
          this.dialogDelete = false
        } catch (error) {
          console.error('Error al eliminar producto:', error)
          if (this.$toast) {
            this.$toast.error('No se pudo eliminar el producto')
          } else {
            alert('No se pudo eliminar el producto')
          }
        } finally {
          this.deleteLoading = false
        }
      },
      
      formatDate(dateString) {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
      },
      
      formatCurrency(value) {
        if (value === undefined || value === null) return '$0.00'
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(value)
      },
      
      getCategoriaName(categoriaId) {
        const categoria = this.categorias.find(c => c.id === categoriaId)
        return categoria ? categoria.nombre : 'N/A'
      },
      
      getStockColor(stock) {
        if (stock <= 5) return 'error'
        if (stock <= 20) return 'warning'
        return 'success'
      }
    }
  }
  </script>
  
  <style scoped>
  .productos-container {
    padding: 20px;
    width: 100%;
  }
  
  .full-width-table {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
  }
  
  /* Asegura que el container tenga ancho completo */
  .v-container.fluid {
    width: 100%;
    max-width: 100%;
    padding: 0;
  }
  </style>