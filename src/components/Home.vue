<template>
  <div>
    <h1>Home</h1>
    <app-maze-generator></app-maze-generator>
  </div>
</template>

<script>
import MazeGenerator from './MazeGenerator.vue';

export default {
  components: {
    appMazeGenerator: MazeGenerator,
  },
};
</script>

<style scoped>

</style>
