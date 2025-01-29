<template>
  <header class="header">
    <h1>FleetSync</h1>
    <img :src="logo" alt="Logo" class="logo" />
  </header>
</template>

<script>
export default {
  props: {
    logo: String,
  },
};
</script>

<style>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #333;
  color: #fff;
}

.logo {
  height: 50px;
}
</style>
