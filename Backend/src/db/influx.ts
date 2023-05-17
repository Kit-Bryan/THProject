// Import InfluxDB functions
import { InfluxDB, Point } from "@influxdata/influxdb-client"; //Point class is used to create new data points that can be written to an InfluxDB database.

// API Token from influx ("Grafana")
const token =
    "lk5Mga3pc_PE_yjwU86vUsfmP-HXE7iQhsHrqA2DOpaKVKcVsV6Mq3gWCW9foRwFacJqx4Rr0X5nsT8EQ49Kkw==";
// URL
const url = "http://localhost:8086";
// Instantiate a client using InfluxDB class by establishing a connection
const client = new InfluxDB({ url, token });
// Organization
const org = `KitBryan`;
const bucket = `RealTimeProject`;
const writeClient = client.getWriteApi(org, bucket, "s"); // Seconds because timestamp written into DB is in seconds "s"
const readApi = client.getQueryApi(org);

// Declare alias for MqttData
type MqttData = {
    measurement: string;
    deviceId: string;
    temperature: number;
    humidity: number;
    timestamp: number;
};


// Write MQTT data into influxDB
export function writeMqttSubscribedData(data: MqttData): void {
    writeClient.writePoint(
        new Point(data.measurement)
            .tag("deviceId", data.deviceId)
            .floatField("temperature", data.temperature)
            .floatField("humidity", data.humidity)
            .timestamp(data.timestamp)
    );
}

export async function queryInfluxData(rangeReceived: string): Promise<any> {
    let range;
    let aggregateWindow;
    if (rangeReceived === "30m" || !rangeReceived) {  // Default value
        range = "30m"
        aggregateWindow = "2m"
        console.log("From influx.ts range received is:",rangeReceived)
    } else if (rangeReceived === "5m") {
        range = "5m"
        aggregateWindow = "19s"
    } else if (rangeReceived === "15m") {
        range = "15m"
        aggregateWindow = "56s"
    } else if (rangeReceived === "1hr") {
        range = "1h"
        aggregateWindow = "4m"
    } else if (rangeReceived === "5hr") {
        range = "5h"
        aggregateWindow = "19m"
    } else if (rangeReceived === "24hr") {
        range = "24h"
        aggregateWindow = "90m"
    } 


    // Define read query (filter by "ambient" as measurement and 3 device IDs )
    const query = `
        from(bucket: "RealTimeProject")
        |> range(start: -${range})
        |> filter(fn: (r) => r["_measurement"] == "ambient")
        |> aggregateWindow(every: ${aggregateWindow}, fn: mean, createEmpty: false)
        |> keep(columns: ["deviceId", "_value", "_time", "_field"])
        `;
    console.log("From influx.ts",range, aggregateWindow)
    
    // Queried data in the form of array of objects [{}]
    return await readApi.collectRows(query);
}