<script setup>
import Chart from "./components/ChartComponent.vue";
import SingleChart from "./components/SingleChart.vue";
</script>

<template>
    <button @click="isDoubleChart = !isDoubleChart" title="Toggle chart format">
        <i class="fa-solid fa-arrows-rotate"></i>
    </button>
    <div>
        <Chart v-if="isDoubleChart" />
        <SingleChart v-else />
    </div>
</template>

<script>
export default {
    name: "App",
    components: {
        Chart,
        SingleChart,
    },
    data() {
        return {
            isDoubleChart: true,
        };
    },
};
</script>

<style scoped></style>
