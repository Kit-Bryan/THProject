<script setup>
import Chart from "./components/ChartComponent.vue";
import SingleChart from "./components/SingleChart.vue";
</script>

<template>
    <h2 @click="age++" class="counter">{{ age }}</h2>
    <h3></h3>
    <Chart />
</template>

<script>
export default {
    name: "App",
    components: { Chart },
    data() {
      return {
        age : 0,
        
      }
    },
};
</script>

<style scoped></style>
