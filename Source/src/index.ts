import * as mqtt from "mqtt";
import * as influx from "./db/influx";
import express = require("express"); // Import express framework
const cors = require("cors"); // Import CORS library
import { createServer } from "http";
import { Server } from "socket.io";

// Instantiate the express app
const app = express();
// Set the port
const port = 3000;
// Define host
const MQTT_HOST = "localhost";
// Instantiate a MQTT client and connect to a broker (mosquitto)
const client = mqtt.connect(`mqtt://${MQTT_HOST}`);
// Create a HTTP server and register the Express application with the HTTP server
const httpServer = createServer(app);
// Create websocket server instance, bind with http server
const io = new Server(httpServer, { cors: { origin: "*" } });

// Start the HTTP server and listen on port 3000 for http request
httpServer.listen(port, () => {
    console.log(`http server listening on port: ${port}`);
});

// Default query time range
let queryTimeRange = "30m";

// When a client connects to the WebSocket server, trigger a callback function
io.on("connection", (socket) => {
    console.log("A user connected");
    // Listen for new range
    socket.on("my-message", async (newRange) => {
        console.log(`(Socket trigger) Time range is set to: ${newRange}`);
        queryTimeRange = newRange;
    });
});

// Enable CORS requests for the Express app
app.use(cors());

// Define a new route for HTTP GET method to retrieve data from database
// Everytime a GET request is sent to /api, this callback function is triggered
app.get("/api", async (req: any, res: any) => {
    try {
        // Query data from influxdb
        let data = await influx.queryInfluxData(req.query.time ? req.query.time : queryTimeRange);
        console.log("Api time parameter:", req.query.time, )
        // Send queried data to the client as a response
        res.send(data);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: "Error" });
    }
    // Client access "/api" endpoint -> callback function triggered -> data is retrieved -> data send as response to client
});

// Declare alias for MqttData
type MqttData = {
    measurement: string;
    deviceId: string;
    temperature: number;
    humidity: number;
    timestamp: number;
};

// Upon establishing connection with broker trigger cb func
client.on("connect", () => {
    console.log("Connected to MQTT broker");
    // Subscribe to the topic
    client.subscribe("#");
    // Success message
    console.log("Subscribed to topic");
});

let counter: number = 0;

// Listen for incoming messages from broker. Trigger callback function when message is received.
client.on("message", async (topic, message) => {
    // Format data
    let topicArray = topic.split("/");
    let messageObj = JSON.parse(message.toString());
    // Assign each values to individual variables
    let measurement = topicArray[3];
    let {timestamp, deviceId, temperature, humidity} = messageObj;

    let MqttData: MqttData = {
        measurement: measurement,
        deviceId: deviceId,
        temperature: temperature,
        humidity: humidity,
        timestamp: timestamp,
    };

    counter++;
    console.log(`COUNTER : ${counter}`);

    // Write data into DB
    influx.writeMqttSubscribedData(MqttData);

    // Only execute on every third mqtt message
    if (counter % 3 === 0) {
        // const data = await influx.queryInfluxData(queryTimeRange);
        // console.log("From index.ts", queryTimeRange)
        // Send data to all connected clients
        io.emit("mqtt-triggered-message");
    }

    
});
