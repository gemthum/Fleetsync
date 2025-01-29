<template>
  <aside class="unidad-list">
    <ul>
      <li
        v-for="(unidad, index) in data"
        :key="index"
        @click="selectUnidad(index)"
        :class="{ active: index === selectedIndex }"
      >
        {{ unidad.UNIDAD }}
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
  height: calc(100vh - 60px); /* Subtract header/footer height */
  overflow-y: auto; /* Enable vertical scrolling */
}

.unidad-list ul {
  list-style: none;
  padding: 0;
  margin: 0; /* Remove margin for clean scrolling */
}

.unidad-list li {
  padding: 10px;
  cursor: pointer;
  display: flex; /* Align items horizontally */
  justify-content: space-between; /* Space out text and icon */
  align-items: center; /* Vertically align items */
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
</style>