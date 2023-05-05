<template>
    <div class="chart-app">
        <h1 @click="displayHello">{{ msg }}</h1>
        <!-- <div class="panel-container">
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
        </div> -->
        <select v-model="time">
            <option value="5m">5 minutes</option>
            <option value="15m">15 minutes</option>
            <option value="30m">30 minutes</option>
            <option value="1hr">1 hour</option>
            <option value="5hr">5 hours</option>
            <option value="24hr">24 hours</option>
        </select>
        <canvas id="myChart" width="2500" height="1200"></canvas>
    </div>
</template>

<script>
// Import chartJS
import Chart from "chart.js/auto";
// Import axios
import axios from "axios";
import { io } from "socket.io-client";

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
            let chart = Chart.getChart("myChart");
            // Update the 'time' data property to the new value passed in
            this.time = newTime;
            // Store the selected time in local storage
            localStorage.setItem("selectedTime", this.time);

            console.log(`Time changed from ${oldTime} to ${newTime}`);

            // Make an HTTP GET request to the backend API, passing in the new time value as a parameter
            let { data } = await axios.get(`http://localhost:3000/api?time=${newTime}`);

            await this.getData(data);

            // Manually update chart dataset
            chart.data.datasets.forEach((ds) => {
                ds.data = this.parsedData;
            });
            chart.update();

            socket.emit("my-message", newTime);

            console.log(chart.data.datasets, "WATCH IS TRIGGERED");
        },
    },
    methods: {
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
                // Create data store for population
                const r = {};
                dataset.forEach((d) => {
                    // Assign timestamp as key if it doesnt exist yet, pairing with an empty object
                    r[d._time] ??= {};
                    // Combine field and deviceId into a string
                    const deviceIdAndField = d.deviceId + "-" + d._field;
                    // Pair field(humidity/temp) and deviceId with value
                    r[d._time][deviceIdAndField] = d._value;
                });
                // this.parsedData = Object.entries(r).map(([k, data]) => ({ time: new Date(k).toLocaleString(), data }))
                this.parsedData = Object.entries(r).map(([k, data]) => {
                    return {
                        time: new Date(k).toLocaleString(),
                        data, // Shorthand property assignment
                    };
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
        if (localStorage.getItem("selectedTime")) {
            console.log("Local storage is currently:", localStorage["selectedTime"]);
            this.time = localStorage["selectedTime"];
        }
        const ctx = document.getElementById("myChart");
        await this.getData(null, localStorage["selectedTime"]);

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

        let chart = new Chart(ctx, {
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
            chart.data.datasets.forEach((ds) => {
                ds.data = this.parsedData;
            });
            chart.update();
            // Log latest data
            console.log(chartData.datasets[0].data[0].data, "second change (socket)", `Time is ${this.time}`);
        });
    },
};
</script>
