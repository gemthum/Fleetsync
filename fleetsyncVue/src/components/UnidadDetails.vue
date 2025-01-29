<template>
  <section class="unidad-details" v-if="unidad">
    <h2>{{ unidad.UNIDAD }}
    </h2>
    <p><strong>Estatus:</strong> {{ unidad.ESTATUS }}</p>
    <p><strong>Localización:</strong> {{ unidad.LOCALIZACION }}</p>
    <p><strong>OT:</strong> {{ unidad.OT }}</p>
    <p><strong>Horas:</strong> {{ unidad.HORAS }}</p>
    <p><strong>Cliente:</strong> {{ unidad.CLIENTE }}</p>
    <p><strong>Asunto OT:</strong> {{ unidad.ASUNTO }}</p>
    <p><strong>Etapa OT:</strong> {{ unidad.ETAPA }}</p>
  </section>
</template>

<script>
export default {
  props: {
    unidad: Object,
  },
   
};
</script>

<style>
.unidad-details {
  padding: 90px;
}
</style>
