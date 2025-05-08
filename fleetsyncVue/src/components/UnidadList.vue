<template>
  <aside class="unidad-list">
    <!-- Filters -->
    <div class="unidad-filters">
  <!-- Estatus Filter -->
  <div class="dropdown">
    <button class="filter-button" @click="toggleDropdown('status')">
      Estatus: {{ filterStatus || 'Todos' }}
    </button>
    <ul v-if="showStatusDropdown" class="dropdown-list">
      <li @click="selectFilter('filterStatus', '')">Todos</li>
      <li @click="selectFilter('filterStatus', 'Disponible')">Disponible</li>
      <li @click="selectFilter('filterStatus', 'Ocupada')">Ocupada</li>
    </ul>
  </div>

  <!-- Tipo Filter -->
  <div class="dropdown">
    <button class="filter-button" @click="toggleDropdown('tipo')">
      Tipo: {{ filterTipo || 'Todos' }}
    </button>
    <ul v-if="showTipoDropdown" class="dropdown-list">
      <li @click="selectFilter('filterTipo', '')">Todos</li>
      <li v-for="tipo in uniqueTipos" :key="tipo" @click="selectFilter('filterTipo', tipo)">
        {{ tipo }}
      </li>
    </ul>
  </div>

  <!-- Base Filter -->
  <div class="dropdown">
    <button class="filter-button" @click="toggleDropdown('base')">
      Base: {{ filterBase || 'Todos' }}
    </button>
    <ul v-if="showBaseDropdown" class="dropdown-list">
      <li @click="selectFilter('filterBase', '')">Todos</li>
      <li v-for="base in uniqueBases" :key="base" @click="selectFilter('filterBase', base)">
        {{ base }}
      </li>
    </ul>
  </div>
  </div>

<!-- Overview Section -->
<div class="unidad-overview">
  <div class="overview-item">
    <span class="label">Unidades totales</span>
    <span class="count">{{ totalUnits }}</span>
  </div>
  <div class="overview-item">
    <span class="label">Disponibles</span>
    <span class="count">{{ availableUnits }}</span>
  </div>
  <div class="overview-item">
    <span class="label">Ocupadas</span>
    <span class="count">{{ occupiedUnits }}</span>
  </div>
</div>

    <ul>
      <li
        v-for="(unidad, index) in filteredData"
        :key="index"
        @click="selectUnidad(index)"
        :class="{ active: index === selectedIndex }"
      >
        {{ unidad.UNIDAD }} - {{  unidad.TIPO  }}
        <span
          class="status-icon"
          :class="{ green: unidad.ESTATUS === 'Disponible', red: unidad.ESTATUS === 'Ocupada' }"
        ></span>
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  props: {
    data: Array,
    selectedIndex: Number,
  },
  emits: ['select-unidad'],
  data() {
    return {
      filterStatus: '',
      filterTipo: '',
      filterBase: '',
      showStatusDropdown: false,
      showTipoDropdown: false,
      showBaseDropdown: false,
    };
  },
  computed: {
    filteredData() {
      return this.data.filter(unidad => {
        const statusMatch = this.filterStatus === '' || unidad.ESTATUS === this.filterStatus;
        const tipoMatch = this.filterTipo === '' || unidad.TIPO === this.filterTipo;
        const baseMatch = this.filterBase === '' || unidad.BASE === this.filterBase;
        return statusMatch && tipoMatch && baseMatch;
      });
    },
    totalUnits() {
      return this.filteredData.length;
    },
    availableUnits() {
      return this.filteredData.filter(unidad => unidad.ESTATUS === 'Disponible').length;
    },
    occupiedUnits() {
      return this.filteredData.filter(unidad => unidad.ESTATUS === 'Ocupada').length;
    },
    uniqueTipos() {
      return [...new Set(this.data.map(u => u.TIPO))].filter(Boolean);
    },
    uniqueBases() {
      return [...new Set(this.data.map(u => u.BASE))].filter(Boolean);
    }
  },
  methods: {
    selectUnidad(index) {
      this.$emit('select-unidad', index);
    },
    toggleDropdown(type) {
    this.showStatusDropdown = type === 'status' ? !this.showStatusDropdown : false;
    this.showTipoDropdown = type === 'tipo' ? !this.showTipoDropdown : false;
    this.showBaseDropdown = type === 'base' ? !this.showBaseDropdown : false;
    },
    selectFilter(filterName, value) {
    this[filterName] = value;
    this.showStatusDropdown = false;
    this.showTipoDropdown = false;
    this.showBaseDropdown = false;
    }
  },
};
</script>

<style>
.unidad-list {
  width: 33%;
  background-color: #f4f4f4;
  border-right: 1px solid #ccc;
  padding: 10px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.unidad-list li {
  padding: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  margin-bottom: 8px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background 0.3s;
}

.unidad-list li:hover {
  background: #f9f9f9;
}

.unidad-overview {
  display: flex;
  justify-content: space-around;
  text-align: center;
  background-color: #fff;
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 10px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
}

.overview-item {
  flex: 1;
}

.overview-item .label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #555;
  margin-bottom: 5px;
}

.overview-item .count {
  font-size: 38px; /* Big number */
  font-weight: bold;
  color: #222;
}

.unidad-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.unidad-list li {
  padding: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unidad-list li.active {
  background-color: #007bff;
  color: #fff;
}

.status-icon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-icon.green {
  background-color: green;
}

.status-icon.red {
  background-color: red;
}

.unidad-filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 10px;
  flex-wrap: wrap;
}

.unidad-filters label {
  display: flex;
  flex-direction: column;
  font-weight: bold;
}

.filter-button {
  width: 100%;
  background-color: white;
  border: none; /* No solid border */
  border-radius: 20px;
  padding: 10px;
  font-weight: bold;
  cursor: pointer;
  text-align: left;

  /* Thin, faded black outline */
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.2s ease;
}

.filter-button:hover {
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
  background-color: #f9f9f9;
}

.dropdown {
  position: relative;
  flex: 1; /* Each takes equal space */
  min-width: 100px; /* Optional: set a minimum width */
}

.dropdown-list {
  position: absolute;
  top: 110%;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  list-style: none;
  padding: 5px 0;
  margin: 0;
  z-index: 10;
  width: 100%; /* Match the button width */
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
}

.dropdown-list li {
  padding: 8px 16px;
  cursor: pointer;
}

.dropdown-list li:hover {
  background-color: #f0f0f0;
}
</style>