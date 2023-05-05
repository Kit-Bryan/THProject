"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mqtt = require("mqtt");
var influx = require("./db/influx");
var express = require("express"); // Import express framework
var cors = require("cors"); // Import CORS library
var http_1 = require("http");
var socket_io_1 = require("socket.io");
// Instantiate the express app
var app = express();
// Set the port
var port = 3000;
// Define host
var MQTT_HOST = "localhost";
// Instantiate a MQTT client and connect to a broker (mosquitto)
var client = mqtt.connect("mqtt://".concat(MQTT_HOST));
// Create a HTTP server and register the Express application with the HTTP server
var httpServer = (0, http_1.createServer)(app);
// Create websocket server instance, bind with http server
var io = new socket_io_1.Server(httpServer, { cors: { origin: "*" } });
// Start the HTTP server and listen on port 3000 for http request
httpServer.listen(port, function () {
    console.log("http server listening on port: ".concat(port));
});
// Default query time range
var queryTimeRange = "30m";
// When a client connects to the WebSocket server, trigger a callback function
io.on("connection", function (socket) {
    console.log("A user connected");
    // Listen for new range
    socket.on("my-message", function (newRange) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("Time range is set to: ".concat(newRange));
            queryTimeRange = newRange;
            return [2 /*return*/];
        });
    }); });
});
// Enable CORS requests for the Express app
app.use(cors());
// Define a new route for HTTP GET method to retrieve data from database
// Everytime a GET request is sent to /api, this callback function is triggered
app.get("/api", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, influx.queryInfluxData(req.query.time ? req.query.time : queryTimeRange)];
            case 1:
                data = _a.sent();
                console.log(req.query.time, "time parameter");
                // Send queried data to the client as a response
                res.send(data);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error(error_1);
                res.status(500).json({ message: "Error" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Upon establishing connection with broker trigger cb func
client.on("connect", function () {
    console.log("Connected to MQTT broker");
    // Subscribe to the topic
    client.subscribe("#");
    // Success message
    console.log("Subscribed to topic");
});
var counter = 0;
// Listen for incoming messages from broker. Trigger callback function when message is received.
client.on("message", function (topic, message) { return __awaiter(void 0, void 0, void 0, function () {
    var topicArray, messageObj, measurement, timestamp, deviceId, temperature, humidity, MqttData;
    return __generator(this, function (_a) {
        topicArray = topic.split("/");
        messageObj = JSON.parse(message.toString());
        measurement = topicArray[3];
        timestamp = messageObj.timestamp, deviceId = messageObj.deviceId, temperature = messageObj.temperature, humidity = messageObj.humidity;
        MqttData = {
            measurement: measurement,
            deviceId: deviceId,
            temperature: temperature,
            humidity: humidity,
            timestamp: timestamp,
        };
        counter++;
        console.log("COUNTER : ".concat(counter));
        // Write data into DB
        influx.writeMqttSubscribedData(MqttData);
        // Only execute on every third mqtt message
        if (counter % 3 === 0) {
            // const data = await influx.queryInfluxData(queryTimeRange);
            // console.log("From index.ts", queryTimeRange)
            // Send data to all connected clients
            io.emit("mqtt-triggered-message");
        }
        return [2 /*return*/];
    });
}); });
