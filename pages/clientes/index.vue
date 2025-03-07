<template>
    <div class="clientes-container">
      <v-container fluid class="pa-0">
        <v-card class="w-100">
          <v-card-title class="d-flex justify-space-between align-center">
            Gestión de Clientes
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openModal">
              Agregar Cliente
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="clientes"
              :loading="loading"
              class="elevation-1 full-width-table"
            >
              <template v-slot:item.actions="{ item }">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon color="info" v-bind="attrs" v-on="on" @click="viewCliente(item)">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </template>
                  <span>Ver detalles</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon color="warning" v-bind="attrs" v-on="on" @click="editCliente(item)">
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
  
      <!-- Modal para agregar/editar cliente -->
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
                      v-model="editedItem.nombre"
                      :rules="nombreRules"
                      label="Nombre"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="editedItem.apellido"
                      :rules="apellidoRules"
                      label="Apellido"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field v-model="editedItem.empresa" label="Empresa"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="editedItem.email"
                      :rules="emailRules"
                      label="Email"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="editedItem.telefono"
                      :rules="telefonoRules"
                      label="Teléfono"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea v-model="editedItem.direccion" label="Dirección" rows="2"></v-textarea>
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
              @click="saveCliente"
            >
              Guardar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Modal de confirmación para eliminar -->
      <v-dialog v-model="dialogDelete" max-width="500px" persistent>
        <v-card>
          <v-card-title class="text-h5">¿Está seguro que desea eliminar este cliente?</v-card-title>
          <v-card-text>
            Esta acción no se puede deshacer y podría afectar a facturas y otros registros relacionados.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" variant="text" @click="dialogDelete = false">Cancelar</v-btn>
            <v-btn color="error" :loading="deleteLoading" @click="deleteCliente">Eliminar</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Modal para ver detalles del cliente -->
      <v-dialog v-model="dialogView" max-width="600px" persistent>
        <v-card>
          <v-card-title>
            <span class="text-h5">Detalles del Cliente</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" class="pb-0">
                  <p class="text-subtitle-1 mb-1">Nombre:</p>
                  <p class="font-weight-medium">{{ viewedItem.nombre }} {{ viewedItem.apellido }}</p>
                </v-col>
                <v-col cols="12" sm="6" class="pb-0">
                  <p class="text-subtitle-1 mb-1">Empresa:</p>
                  <p class="font-weight-medium">{{ viewedItem.empresa || 'N/A' }}</p>
                </v-col>
                <v-col cols="12" sm="6" class="py-0">
                  <p class="text-subtitle-1 mb-1">Email:</p>
                  <p class="font-weight-medium">{{ viewedItem.email }}</p>
                </v-col>
                <v-col cols="12" sm="6" class="py-0">
                  <p class="text-subtitle-1 mb-1">Teléfono:</p>
                  <p class="font-weight-medium">{{ viewedItem.telefono }}</p>
                </v-col>
                <v-col cols="12" class="pt-0">
                  <p class="text-subtitle-1 mb-1">Dirección:</p>
                  <p class="font-weight-medium">{{ viewedItem.direccion || 'N/A' }}</p>
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
    name: 'ClientesPage',
    data() {
      return {
        clientes: [],
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
          nombre: '',
          apellido: '',
          empresa: '',
          email: '',
          telefono: '',
          direccion: ''
        },
        defaultItem: {
          id: null,
          nombre: '',
          apellido: '',
          empresa: '',
          email: '',
          telefono: '',
          direccion: ''
        },
        viewedItem: {},
        headers: [
          { title: 'ID', align: 'start', key: 'id' },
          { title: 'Nombre', align: 'start', key: 'nombre' },
          { title: 'Apellido', align: 'start', key: 'apellido' },
          { title: 'Empresa', align: 'start', key: 'empresa' },
          { title: 'Email', align: 'start', key: 'email' },
          { title: 'Teléfono', align: 'start', key: 'telefono' },
          { title: 'Acciones', key: 'actions', sortable: false }
        ],
        nombreRules: [
          v => !!v || 'El nombre es requerido',
          v => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres'
        ],
        apellidoRules: [
          v => !!v || 'El apellido es requerido',
          v => v.length >= 2 || 'El apellido debe tener al menos 2 caracteres'
        ],
        emailRules: [
          v => !!v || 'El email es requerido',
          v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
        ],
        telefonoRules: [
          v => !!v || 'El teléfono es requerido',
          v => v.length >= 8 || 'El teléfono debe tener al menos 8 dígitos'
        ]
      }
    },
    computed: {
      formTitle() {
        return this.editedIndex === -1 ? 'Nuevo Cliente' : 'Editar Cliente'
      }
    },
    created() {
      // Para pruebas mientras se conecta al backend
      this.loadMockData()
      
      // Descomentar cuando se tenga el backend listo
      // this.fetchClientes()
    },
    methods: {
      loadMockData() {
        // Datos de prueba para visualizar mientras se configura el backend
        this.clientes = [
          {
            id: 1,
            nombre: 'Juan',
            apellido: 'Pérez',
            empresa: 'Empresa A',
            email: 'juan.perez@empresa.com',
            telefono: '123456789',
            direccion: 'Calle Principal 123',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            nombre: 'María',
            apellido: 'Gómez',
            empresa: 'Empresa B',
            email: 'maria.gomez@empresa.com',
            telefono: '987654321',
            direccion: 'Avenida Central 456',
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            nombre: 'Carlos',
            apellido: 'Rodríguez',
            empresa: 'Empresa C',
            email: 'carlos.rodriguez@empresa.com',
            telefono: '555666777',
            direccion: 'Plaza Mayor 789',
            created_at: new Date().toISOString()
          }
        ]
      },
      async fetchClientes() {
        this.loading = true
        try {
          // Asegúrate de que la URL base esté configurada correctamente en tu main.js
          const response = await this.$axios.get('/api/clientes')
          this.clientes = response.data.data || response.data
        } catch (error) {
          console.error('Error al obtener clientes:', error)
          // Comprueba si tienes instalado el plugin toast, de lo contrario usa alert
          if (this.$toast) {
            this.$toast.error('No se pudieron cargar los clientes')
          } else {
            alert('No se pudieron cargar los clientes')
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
      editCliente(item) {
        this.editedIndex = this.clientes.indexOf(item)
        this.editedItem = JSON.parse(JSON.stringify(item))
        this.$nextTick(() => {
          if (this.$refs.form) {
            this.$refs.form.resetValidation()
          }
          this.dialog = true
        })
      },
      viewCliente(item) {
        this.viewedItem = JSON.parse(JSON.stringify(item))
        this.dialogView = true
      },
      confirmDelete(item) {
        this.editedIndex = this.clientes.indexOf(item)
        this.editedItem = JSON.parse(JSON.stringify(item))
        this.dialogDelete = true
      },
      async saveCliente() {
        if (this.$refs.form && !this.$refs.form.validate()) return
        
        this.saveLoading = true
        try {
          if (this.editedIndex > -1) {
            // Actualizar cliente existente
            // await this.$axios.put(`/api/clientes/${this.editedItem.id}`, this.editedItem)
            
            // Mock de actualización
            Object.assign(this.clientes[this.editedIndex], this.editedItem)
            
            if (this.$toast) {
              this.$toast.success('Cliente actualizado correctamente')
            } else {
              alert('Cliente actualizado correctamente')
            }
          } else {
            // Crear nuevo cliente
            // const response = await this.$axios.post('/api/clientes', this.editedItem)
            
            // Mock de creación
            const newItem = {
              ...this.editedItem,
              id: this.clientes.length ? Math.max(...this.clientes.map(c => c.id)) + 1 : 1,
              created_at: new Date().toISOString()
            }
            this.clientes.push(newItem)
            
            if (this.$toast) {
              this.$toast.success('Cliente creado correctamente')
            } else {
              alert('Cliente creado correctamente')
            }
          }
          this.closeModal()
        } catch (error) {
          console.error('Error al guardar cliente:', error)
          if (this.$toast) {
            this.$toast.error('No se pudo guardar el cliente')
          } else {
            alert('No se pudo guardar el cliente')
          }
        } finally {
          this.saveLoading = false
        }
      },
      async deleteCliente() {
        this.deleteLoading = true
        try {
          // await this.$axios.delete(`/api/clientes/${this.editedItem.id}`)
          
          // Mock de eliminación
          this.clientes.splice(this.editedIndex, 1)
          
          if (this.$toast) {
            this.$toast.success('Cliente eliminado correctamente')
          } else {
            alert('Cliente eliminado correctamente')
          }
          this.dialogDelete = false
        } catch (error) {
          console.error('Error al eliminar cliente:', error)
          if (this.$toast) {
            this.$toast.error('No se pudo eliminar el cliente')
          } else {
            alert('No se pudo eliminar el cliente')
          }
        } finally {
          this.deleteLoading = false
        }
      },
      formatDate(dateString) {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
      }
    }
  }
  </script>
  
  <style scoped>
  .clientes-container {
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