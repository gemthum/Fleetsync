<template>
  <section class="unidad-details" v-if="unidad">
    <h2>
      {{ unidad.UNIDAD }}
      <span class="tipo">({{ unidad.TIPO }})</span>
      <img v-if="tipoIcon" :src="tipoIcon" alt="Tipo Icon" class="tipo-icon" />
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
import montacargas from "../assets/montacargas.png";
import rabon from "../assets/rabon.png";
import tracto from "../assets/tracto.png";
import plana from "../assets/plana.png";
import pickup from "../assets/pick up.png";
import ssusa from "../assets/sussa.png";

export default {
  props: {
    unidad: Object,
  },
  computed: {
    tipoIcon() {
      if (!this.unidad?.TIPO) return null;

      const iconMap = {
        "Montacarga": montacargas,
        "Rabon": rabon,
        "Tractocamion": tracto,
        "Low Boy": plana,
        "Pick-Up": pickup,
        "Sedan": pickup,
        "Tracto/Torton": tracto,
      };

      return iconMap[this.unidad.TIPO] || ssusa;
    },
  },
};
</script>

<style>
.unidad-details {
  padding: 90px;
}

h2 {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tipo {
  font-size: inherit;
  font-weight: normal;
  margin-left: 10px;
}

.tipo-icon {
  width: 80px;
  height: 80px;
}
</style>