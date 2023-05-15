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
exports.queryInfluxData = exports.writeMqttSubscribedData = void 0;
// Import InfluxDB functions
var influxdb_client_1 = require("@influxdata/influxdb-client"); //Point class is used to create new data points that can be written to an InfluxDB database.
// API Token from influx ("Grafana")
var token = "lk5Mga3pc_PE_yjwU86vUsfmP-HXE7iQhsHrqA2DOpaKVKcVsV6Mq3gWCW9foRwFacJqx4Rr0X5nsT8EQ49Kkw==";
// URL
var url = "http://localhost:8086";
// Instantiate a client using InfluxDB class by establishing a connection
var client = new influxdb_client_1.InfluxDB({ url: url, token: token });
// Organization
var org = "KitBryan";
var bucket = "RealTimeProject";
var writeClient = client.getWriteApi(org, bucket, "s"); // Seconds because timestamp written into DB is in seconds "s"
var readApi = client.getQueryApi(org);
// Write MQTT data into influxDB
function writeMqttSubscribedData(data) {
    writeClient.writePoint(new influxdb_client_1.Point(data.measurement)
        .tag("deviceId", data.deviceId)
        .floatField("temperature", data.temperature)
        .floatField("humidity", data.humidity)
        .timestamp(data.timestamp));
}
exports.writeMqttSubscribedData = writeMqttSubscribedData;
function queryInfluxData(rangeReceived) {
    return __awaiter(this, void 0, void 0, function () {
        var range, aggregateWindow, query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (rangeReceived === "30m" || !rangeReceived) { // Default value
                        range = "30m";
                        aggregateWindow = "2m";
                        console.log("From influx.ts range received is:", rangeReceived);
                    }
                    else if (rangeReceived === "5m") {
                        range = "5m";
                        aggregateWindow = "19s";
                    }
                    else if (rangeReceived === "15m") {
                        range = "15m";
                        aggregateWindow = "56s";
                    }
                    else if (rangeReceived === "1hr") {
                        range = "1h";
                        aggregateWindow = "4m";
                    }
                    else if (rangeReceived === "5hr") {
                        range = "5h";
                        aggregateWindow = "19m";
                    }
                    else if (rangeReceived === "24hr") {
                        range = "24h";
                        aggregateWindow = "90m";
                    }
                    query = "\n        from(bucket: \"RealTimeProject\")\n        |> range(start: -".concat(range, ")\n        |> filter(fn: (r) => r[\"_measurement\"] == \"ambient\")\n        |> aggregateWindow(every: ").concat(aggregateWindow, ", fn: mean, createEmpty: false)\n        |> keep(columns: [\"deviceId\", \"_value\", \"_time\", \"_field\"])\n        ");
                    console.log("From influx.ts", range, aggregateWindow);
                    return [4 /*yield*/, readApi.collectRows(query)];
                case 1: 
                // Queried data in the form of array of objects [{}]
                return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.queryInfluxData = queryInfluxData;
