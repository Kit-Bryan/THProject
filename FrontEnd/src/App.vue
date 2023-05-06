<script setup>
import Chart from "./components/ChartComponent.vue";
import SingleChart from "./components/SingleChart.vue";
</script>

<template>
    <button @click="toggleThis = !toggleThis">Toggle chart format</button>
    <div >
      <Chart v-if="toggleThis"/>
      <SingleChart v-else/>
    </div>
</template>

<script>
export default {
    name: "App",
    components: { Chart },
    data() {
      return {
        toggleThis: true,

      }
    },
};
</script>

<style scoped></style>
