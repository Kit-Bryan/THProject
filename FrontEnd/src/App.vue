<script setup>
import ChartComponent from "./components/ChartComponent.vue";
import SingleChart from "./components/SingleChart.vue";
</script>

<template>
    <button @click="toggleIsDoubleChart" title="Toggle chart format" class="toggle-chart-format-btn">
        <i class="fa-solid fa-arrows-rotate"></i>
    </button>
    <h1>Temperature/Humidity Chart</h1>
    <div>
        <ChartComponent v-if="isDoubleChart" />
        <SingleChart v-else />
    </div>
</template>

<script>
export default {
    name: "App",
    components: {
        ChartComponent,
        SingleChart,
    },
    data() {
        return {
            // Convert "true" to true if "true" exists in local storage
            isDoubleChart: localStorage["isDoubleChart"] === "true",
        };
    },
    methods: {
        toggleIsDoubleChart() {
            this.isDoubleChart = !this.isDoubleChart;
        },
    },
    watch: {
        isDoubleChart(newBool, oldBool) {
            localStorage.setItem("isDoubleChart", newBool);
        },
    },
    mounted(){
    },
};
</script>

<style scoped>
</style>
