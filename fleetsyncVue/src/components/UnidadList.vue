<template>
  <aside class="unidad-list">
    <!-- Filters -->
    <div class="unidad-filters">
      <label>
        Estatus:
        <select v-model="filterStatus">
          <option value="">Todos</option>
          <option value="Disponible">Disponible</option>
          <option value="Ocupada">Ocupada</option>
        </select>
      </label>
      <label>
        Tipo:
        <select v-model="filterTipo">
          <option value="">Todos</option>
          <option v-for="tipo in uniqueTipos" :key="tipo" :value="tipo">{{ tipo }}</option>
        </select>
      </label>
      <label>
        Base:
        <select v-model="filterBase">
          <option value="">Todos</option>
          <option v-for="base in uniqueBases" :key="base" :value="base">{{ base }}</option>
        </select>
      </label>
    </div>

    <!-- Overview Section -->
    <div class="unidad-overview">
      <p>Unidades totales: {{ totalUnits }}</p>
      <p>Disponibles: {{ availableUnits }}</p>
      <p>Ocupadas: {{ occupiedUnits }}</p>
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

.unidad-overview {
  background-color: #ddd;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  font-weight: bold;
  text-align: center;
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
</style>