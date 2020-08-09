<template>
  <div>
    <h1>Home</h1>
    <app-map-generator></app-map-generator>
  </div>
</template>

<script>
import MapGenerator from './MapGenerator.vue';

export default {
  components: {
    appMapGenerator: MapGenerator,
  },
};
</script>

<style scoped>

</style>
