<template>
    <div class="chart-app">
        <h1 @click="displayHello">{{ msg }}</h1>
        <div class="panel-container">
            <div class="dummy-1 dummy-panel">
                <h2>dummy-1</h2>
                <p>{{ dt1 }}</p>
                <p>{{ dh1 }}</p>
            </div>
            <div class="dummy-2 dummy-panel">
                <h2>dummy-2</h2>
                <p>{{ dt2 }}</p>
                <p>{{ dh2 }}</p>
            </div>
            <div class="dummy-3 dummy-panel">
                <h2>dummy-3</h2>
                <p>{{ dt3 }}</p>
                <p>{{ dh3 }}</p>
            </div>
        </div>
        <select v-model="time">
            <option value="5m">5 minutes</option>
            <option value="15m">15 minutes</option>
            <option value="30m">30 minutes</option>
            <option value="1hr">1 hour</option>
            <option value="5hr">5 hours</option>
            <option value="24hr">24 hours</option>
        </select>
        <h3>Temperature</h3>
        <canvas id="temperatureChart" width="2500" height="1200"></canvas>
        <h3>Humidity</h3>
        <canvas id="humidityChart" width="2500" height="1200"></canvas>
    </div>
</template>

<script>
// Import chartJS
import Chart from "chart.js/auto";
// Import axios
import axios from "axios";
import { io } from "socket.io-client";

// Create a new socket connection to the server running at `localhost:3000`
const socket = io("localhost:3000");
// Retrieve selected time range if exist in local storage
let selectedTime = localStorage["selectedTime"] ? localStorage["selectedTime"] : "30m";
// Tell backend selected time range from local storage
socket.emit("my-message", selectedTime);

export default {
    data() {
        return {
            msg: "Chart",
            parsedData: null,
            tempParsedData: null,
            humidityParsedData: null,
            time: selectedTime,
            dt1: "celcius",
            dh1: "humidity",
            dt2: "celcius",
            dh2: "humidity",
            dt3: "celcius",
            dh3: "humidity",
        };
    },
    watch: {
        async time(newTime, oldTime) {
            // Retrieve chart instance
            let temperatureChartInstance = Chart.getChart("temperatureChart");
            let humidityChartInstance = Chart.getChart("humidityChart");
            // Update the 'time' data property to the new value passed in
            this.time = newTime;
            // Store the selected time in local storage
            localStorage.setItem("selectedTime", this.time);

            console.log(`Time changed from ${oldTime} to ${newTime}`);

            // Make an HTTP GET request to the backend API, passing in the new time value as a parameter
            let { data } = await axios.get(`http://localhost:3000/api?time=${newTime}`);

            // Parse and assign data to data properties
            await this.getData(data);

            // Manually update chart dataset
            this.updateChart(temperatureChartInstance);
            this.updateChart(humidityChartInstance);

            // Tell backend the new time range
            socket.emit("my-message", newTime);

            console.log(temperatureChartInstance.data.datasets, "Temperature from watch");
            console.log(humidityChartInstance.data.datasets, "Humidity from watch");
        },
    },
    methods: {
        updateChart(chartInstance) {
            // Manually update chart dataset
            chartInstance.data.datasets.forEach((ds) => {
                let ambientType = ds.label.split("-")[3];
                if (ambientType === "temperature") {
                    ds.data = this.tempParsedData;
                } else if (ambientType === "humidity") {
                    ds.data = this.humidityParsedData;
                }
            });
            chartInstance.update();
        },
        async getData(realTimeData, selectedTime) {
            try {
                let dataset;
                // Use real time data
                if (realTimeData) {
                    dataset = realTimeData;
                } else {
                    if (selectedTime) {
                        // Call API with selected time
                        let { data } = await axios.get(`http://localhost:3000/api?time=${selectedTime}`);
                        dataset = data;
                        console.log("Getting data of time:", selectedTime);
                    } else {
                        let { data } = await axios.get("http://localhost:3000/api");
                        dataset = data;
                    }
                }
                // Create data stores for population
                const temperatureResult = {};
                const humidityResult = {};
                dataset.forEach((d) => {
                    // Combine field and deviceId into a string
                    const deviceIdAndField = d.deviceId + "-" + d._field;
                    let ambientType = deviceIdAndField.split("-")[3];
                    if (ambientType === "temperature") {
                        // Assign timestamp as key if it doesnt exist yet, pairing with an empty object
                        temperatureResult[d._time] ??= {};
                        // Pair field(temp) and deviceId with value
                        temperatureResult[d._time][deviceIdAndField] = d._value;
                        this.tempParsedData = Object.entries(temperatureResult).map(([k, data]) => {
                            return {
                                time: new Date(k).toLocaleString(),
                                data, // Shorthand property assignment
                            };
                        });
                    } else if (ambientType === "humidity") {
                        // Assign timestamp as key if it doesnt exist yet, pairing with an empty object
                        humidityResult[d._time] ??= {};
                        // Pair field(humidity) and deviceId with value
                        humidityResult[d._time][deviceIdAndField] = d._value;
                        this.humidityParsedData = Object.entries(humidityResult).map(([k, data]) => {
                            return {
                                time: new Date(k).toLocaleString(),
                                data, // Shorthand property assignment
                            };
                        });
                    }
                    // this.parsedData = Object.entries(r).map(([k, data]) => ({ time: new Date(k).toLocaleString(), data }))
                });
            } catch (error) {
                console.error(error);
            }
        },
        displayHello() {
            this.dt1 = "HELLO";
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
        const temperatureChartInstance = document.getElementById("temperatureChart");
        const humidityChartInstance = document.getElementById("humidityChart");

        await this.getData(null, localStorage["selectedTime"]);

        let temperatureChartData = {
            datasets: [
                {
                    label: "dummy-temp-1-temperature",
                    data: this.tempParsedData,
                    backgroundColor: "rgba(255, 92, 119, 0.2)",
                    borderColor: "rgba(255, 92, 119, 1)",
                    tension: 0,
                    parsing: {
                        xAxisKey: "time",
                        yAxisKey: "data.dummy-temp-1-temperature",
                    },
                },
                {
                    label: "dummy-temp-2-temperature",
                    data: this.tempParsedData,
                    backgroundColor: "rgba(207, 249, 0, 0.2)",
                    borderColor: "rgba(207, 249, 0, 1)",
                    tension: 0,
                    parsing: {
                        xAxisKey: "time",
                        yAxisKey: "data.dummy-temp-2-temperature",
                    },
                },
                {
                    label: "dummy-temp-3-temperature",
                    data: this.tempParsedData,
                    backgroundColor: "rgba(0, 173, 255, 0.2)",
                    borderColor: "rgba(0, 173, 255, 1)",
                    tension: 0,
                    parsing: {
                        xAxisKey: "time",
                        yAxisKey: "data.dummy-temp-3-temperature",
                    },
                },
            ],
        };
        let humidityChartData = {
            datasets: [
                {
                    label: "dummy-temp-1-humidity",
                    data: this.humidityParsedData,
                    backgroundColor: "rgba(255, 92, 119, 0.2)",
                    borderColor: "rgba(255, 92, 119, 1)",
                    tension: 0,
                    parsing: {
                        xAxisKey: "time",
                        yAxisKey: "data.dummy-temp-1-humidity",
                    },
                },
                {
                    label: "dummy-temp-2-humidity",
                    data: this.humidityParsedData,
                    backgroundColor: "rgba(207, 249, 0, 0.2)",
                    borderColor: "rgba(207, 249, 0, 1)",
                    tension: 0,
                    parsing: {
                        xAxisKey: "time",
                        yAxisKey: "data.dummy-temp-2-humidity",
                    },
                },
                {
                    label: "dummy-temp-3-humidity",
                    data: this.humidityParsedData,
                    backgroundColor: "rgba(0, 173, 255, 0.2)",
                    borderColor: "rgba(0, 173, 255, 1)",
                    tension: 0,
                    parsing: {
                        xAxisKey: "time",
                        yAxisKey: "data.dummy-temp-3-humidity",
                    },
                },
            ],
        };

        let temperatureChart = new Chart(temperatureChartInstance, {
            type: "line",
            data: temperatureChartData,
            options: {
                scales: {
                    y: {
                        type: "linear",
                        position: "left",
                        grid: {
                            display: false,
                        },
                        ticks: {
                            callback(value, index, values) {
                                return `${value}°C`;
                            },
                        },
                    },
                },
            },
        });

        let humidityChart = new Chart(humidityChartInstance, {
            type: "line",
            data: humidityChartData,
            options: {
                scales: {
                    y: {
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
        });

        console.log(temperatureChartData, "TEMP first change(onMounted)", `Time is ${this.time}`);
        console.log(humidityChartData, "HUMID first change(onMounted)", `Time is ${this.time}`);

        // Listen for "mqtt-message" events from the server, trigger cb func everytime
        socket.on("mqtt-triggered-message", async () => {
            // Update your UI with the new data
            await this.getData();

            this.updateChart(temperatureChart)
            this.updateChart(humidityChart)
            // Log latest data
            console.log(temperatureChartData.datasets, "TEMP second change (socket)", `Time is ${this.time}`);
            console.log(temperatureChartData.datasets, "HUMID second change (socket)", `Time is ${this.time}`);
        });
    },
};
</script>
