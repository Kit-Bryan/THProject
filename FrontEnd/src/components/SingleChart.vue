<template>
    <div class="chart-app">
        <RealTimePanels :dt1="dt1" :dt2="dt2" :dt3="dt3" :dh1="dh1" :dh2="dh2" :dh3="dh3" />
        <select v-model="time" class="dropdown-time">
            <option value="5m">5 minutes</option>
            <option value="15m">15 minutes</option>
            <option value="30m">30 minutes</option>
            <option value="1hr">1 hour</option>
            <option value="5hr">5 hours</option>
            <option value="24hr">24 hours</option>
        </select>
        <div class="chart-container">
            <h2>Temperature/Humidity</h2>
            <canvas class="single-chart" id="myChart" width="2500" height="1200"></canvas>
        </div>
    </div>
</template>

<script>
// Import RealTimePanels component from RealTimePanels.vue file
import RealTimePanels from "./RealTimePanels.vue";
// Import ChartJS library
import Chart from "chart.js/auto";
// Import axios library
import axios from "axios";
// Import socket.io-client library
import { io } from "socket.io-client";
// Create a new socket connection to the server running at `localhost:3000`
const socket = io("localhost:3000");

// Retrieve selected time range if exist in local storage
let selectedTime = localStorage["selectedTime"] ? localStorage["selectedTime"] : "30m";
// Tell backend selected time range from local storage
socket.emit("my-message", selectedTime);

export default {
    components: { RealTimePanels },
    data() {
        return {
            parsedData: null,
            time: selectedTime,
            dt1: "-",
            dh1: "-",
            dt2: "-",
            dh2: "-",
            dt3: "-",
            dh3: "-",
        };
    },
    watch: {
        async time(newTime, oldTime) {
            // Tell backend the new time range
            socket.emit("my-message", newTime);

            // Store the selected time in local storage
            localStorage.setItem("selectedTime", this.time);

            // Retrieve chart instance
            let chartInstance = Chart.getChart("myChart");

            // Update the 'time' data property to the new value passed in
            this.time = newTime;

            console.log(`Time changed from ${oldTime} to ${newTime}`);

            // Parse and assign data to data properties
            await this.getData(newTime);

            // Manually update chart dataset
            this.updateChart(chartInstance);

            console.log(chartInstance.data.datasets, "Temp/Humid from watch");
        },
    },
    methods: {
        updateChart(chartInstance) {
            // Manually update chart dataset
            chartInstance.data.datasets.forEach((ds) => {
                ds.data = this.parsedData;
            });
            chartInstance.update();
        },
        async getData(selectedTime) {
            try {
                let dataset;
                if (selectedTime) {
                    // Make an HTTP GET request to the backend API, passing in the new time value as a parameter
                    let { data } = await axios.get(`http://localhost:3000/api?time=${selectedTime}`);
                    dataset = data;
                    console.log("Getting data of time:", selectedTime);
                } else {
                    let { data } = await axios.get("http://localhost:3000/api");
                    dataset = data;
                }
                // Create data store for population
                const results = {};
                dataset.forEach((d) => {
                    // Assign timestamp as key if it doesnt exist yet, pairing with an empty object
                    results[d._time] ??= {};
                    // Combine field and deviceId into a string
                    const deviceIdAndField = d.deviceId + "-" + d._field;
                    // Pair field(humidity/temp) and deviceId with value
                    results[d._time][deviceIdAndField] = d._value;
                });
                // this.parsedData = Object.entries(r).map(([k, data]) => ({ time: new Date(k).toLocaleString(), data }))
                this.parsedData = Object.entries(results).map(([k, data]) => {
                    return {
                        time: new Date(k).toLocaleString(),
                        data, // Shorthand property assignment
                    };
                });
            } catch (error) {
                console.error(error);
            }
        },
    },
    // Execute this code when component is mounted/ when page is loaded
    async mounted() {
        // If local storage has selected time range
        if (localStorage.getItem("selectedTime")) {
            console.log("Local storage is currently:", localStorage["selectedTime"]);
            // Assign value from local storage to data property
            this.time = localStorage["selectedTime"];
        }
        const myChart = document.getElementById("myChart");
        // Get first render set of data
        await this.getData(localStorage["selectedTime"]);

        let chartData = {
            datasets: [
                {
                    label: "dummy-temp-1-temperature",
                    data: this.parsedData,
                    backgroundColor: "rgba(255, 92, 119, 0.2)",
                    borderColor: "rgba(255, 92, 119, 1)",
                    tension: 0,
                    parsing: {
                        xAxisKey: "time",
                        yAxisKey: "data.dummy-temp-1-temperature",
                    },
                    yAxisID: "y",
                },
                {
                    label: "dummy-temp-1-humidity",
                    data: this.parsedData,
                    backgroundColor: "rgba(255, 92, 119, 0.2)",
                    borderColor: "rgba(255, 92, 119, 1)",
                    tension: 0,
                    parsing: {
                        xAxisKey: "time",
                        yAxisKey: "data.dummy-temp-1-humidity",
                    },
                    yAxisID: "y1",
                },
                {
                    label: "dummy-temp-2-temperature",
                    data: this.parsedData,
                    backgroundColor: "rgba(207, 249, 0, 0.2)",
                    borderColor: "rgba(207, 249, 0, 1)",
                    tension: 0,
                    parsing: {
                        xAxisKey: "time",
                        yAxisKey: "data.dummy-temp-2-temperature",
                    },
                    yAxisID: "y",
                },
                {
                    label: "dummy-temp-2-humidity",
                    data: this.parsedData,
                    backgroundColor: "rgba(207, 249, 0, 0.2)",
                    borderColor: "rgba(207, 249, 0, 1)",
                    tension: 0,
                    parsing: {
                        xAxisKey: "time",
                        yAxisKey: "data.dummy-temp-2-humidity",
                    },
                    yAxisID: "y1",
                },
                {
                    label: "dummy-temp-3-temperature",
                    data: this.parsedData,
                    backgroundColor: "rgba(0, 173, 255, 0.2)",
                    borderColor: "rgba(0, 173, 255, 1)",
                    tension: 0,
                    parsing: {
                        xAxisKey: "time",
                        yAxisKey: "data.dummy-temp-3-temperature",
                    },
                    yAxisID: "y",
                },
                {
                    label: "dummy-temp-3-humidity",
                    data: this.parsedData,
                    backgroundColor: "rgba(0, 173, 255, 0.2)",
                    borderColor: "rgba(0, 173, 255, 1)",
                    tension: 0,
                    parsing: {
                        xAxisKey: "time",
                        yAxisKey: "data.dummy-temp-3-humidity",
                    },
                    yAxisID: "y1",
                },
            ],
        };

        let chartInstance = new Chart(myChart, {
            type: "line",
            data: chartData,
            options: {
                scales: {
                    y: {
                        type: "linear",
                        position: "right",
                        grid: {
                            display: false,
                        },
                        ticks: {
                            callback(value, index, values) {
                                return `${value}°C`;
                            },
                        },
                    },
                    y1: {
                        type: "linear",
                        position: "left",
                        grid: {
                            display: false,
                        },
                        ticks: {
                            callback(value, index, values) {
                                return `${value}%`;
                            },
                        },
                    },
                },
            },
            plugins: [
                {
                    beforeInit(chart) {
                        // Get a reference to the original fit function
                        const originalFit = chart.legend.fit;
                        // Override the fit function
                        chart.legend.fit = function fit() {
                            // Call the original function and bind scope in order to use `this` correctly inside it
                            originalFit.bind(chart.legend)();
                            // Change the height as suggested in other answers
                            this.height += 25;
                        };
                    },
                },
            ],
        });

        console.log(chartData, "first change(onMounted)", `Time is ${this.time}`);

        // Listen for "mqtt-message" events from the server, trigger cb func everytime
        socket.on("mqtt-triggered-message", async (data) => {
            // Update your UI with the new data
            await this.getData(data);

            // Update chart with the latest values
            this.updateChart(chartInstance);

            // Update panels with realtime  data
            this.dh1 = chartInstance.data.datasets[0].data.slice(-1)[0].data["dummy-temp-1-humidity"].toFixed(2);
            this.dh2 = chartInstance.data.datasets[0].data.slice(-1)[0].data["dummy-temp-2-humidity"].toFixed(2);
            this.dh3 = chartInstance.data.datasets[0].data.slice(-1)[0].data["dummy-temp-3-humidity"].toFixed(2);
            this.dt1 = chartInstance.data.datasets[0].data.slice(-1)[0].data["dummy-temp-1-temperature"].toFixed(2);
            this.dt2 = chartInstance.data.datasets[0].data.slice(-1)[0].data["dummy-temp-2-temperature"].toFixed(2);
            this.dt3 = chartInstance.data.datasets[0].data.slice(-1)[0].data["dummy-temp-3-temperature"].toFixed(2);

            // Log latest data
            console.log(chartData.datasets, "second change (socket)", `Time is ${this.time}`);
        });
    },
    // Clean up side effects
    unmounted() {
        socket.removeAllListeners("mqtt-triggered-message");
        console.log("Closing connection to socket Server");
    },
};
</script>
