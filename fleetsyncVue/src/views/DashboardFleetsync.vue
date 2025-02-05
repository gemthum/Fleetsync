<template>
  <div class="app">
    <FleetHeader :logo="require('../assets/sussa.png')" />
    <main class="content">
      <UnidadList
        :data="data"
        :selectedIndex="selectedIndex"
        @select-unidad="handleUnidadSelect"
      />
      <UnidadDetails :unidad="selectedUnidad" />
    </main>
    <footer class="footer">Ultima actualización: {{ lastUpdated }}</footer>
  </div>
</template>

<script>
import FleetHeader from '../components/FleetHeader.vue';
import UnidadList from '../components/UnidadList.vue';
import UnidadDetails from '../components/UnidadDetails.vue';

export default {
  components: {
    FleetHeader,
    UnidadList,
    UnidadDetails,
  },
  data() {
    return {
      data: [],
      lastUpdated: '',
      selectedIndex: 0,
      logo: '../assets/sussa.png',
    };
  },
  computed: {
    selectedUnidad() {
      return this.data[this.selectedIndex] || null;
    },
  },
  methods: {
    async fetchData() {
      try {
        const response = await fetch('http://ssusa.zapto.org:3001/availability');
        const token = localStorage.getItem('token');
        console.log(token);
        console.log('dashboardfleetsync');
        const json = await response.json();
        this.data = json.data;
        this.lastUpdated = new Date(json.lastUpdated).toLocaleString();
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    },
    handleUnidadSelect(index) {
      this.selectedIndex = index;
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>
 
<style>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.content {
  display: flex;
  flex: 1; /* Take remaining space between header and footer */
  overflow: auto; /* Allow scrolling for content if needed */
}

.footer {
  text-align: center;
  padding: 10px;
  background-color: #333;
  color: #fff;
  flex-shrink: 0; /* Prevent shrinking of the footer */
  z-index: 10; /* Ensure it appears on top of other elements */
}
</style>