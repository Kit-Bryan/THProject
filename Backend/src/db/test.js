// Original data
const data = [
    { deviceId: 'device1', timestamp: '2023-05-01T12:30:00Z', value: 10 },
    { deviceId: 'device2', timestamp: '2023-05-01T12:30:00Z', value: 20 },
    { deviceId: 'device3', timestamp: '2023-05-01T12:30:00Z', value: 30 },
    { deviceId: 'device1', timestamp: '2023-05-01T12:45:00Z', value: 15 },
    { deviceId: 'device2', timestamp: '2023-05-01T12:45:00Z', value: 25 },
    { deviceId: 'device3', timestamp: '2023-05-01T12:45:00Z', value: 35 },
];
const fn = (acc, curr) => {
    const timestamp = curr.timestamp;
    if (!acc[timestamp]) {
        acc[timestamp] = {};
        acc[timestamp]['_time'] = timestamp;
        acc[timestamp]['results'] = {};
    }
    acc[timestamp]['results'][curr.deviceId] = curr.value;
    return acc;
};

// { [timestamp: string]: { _time: string; results: { [deviceId: string]: number } } }

const k = data.reduce((acc, cur) => {
    acc[cur.timestamp] ??= {};
    acc[cur.timestamp][cur.deviceId] = cur.value;
    return acc;
}, {});

console.log(
    'adsadas',
    Object.entries(k).map(([_time, results]) => ({ _time, results }))
);

// { [timestamp: string]: { [deviceId: string]: number } }

// Group data by timestamp
const groupedData = data.reduce(fn, {});

console.log(groupedData);

// Convert grouped data to an array of objects
const result = Object.keys(groupedData).map((key) => {
    return groupedData[key];
});

console.log('rrrrrrrrrrrrr', result);

console.log(data);

const r = {};

data.forEach((data) => {
    console.log(data.timestamp);
    r[data.timestamp] ??= [];
    // if (!r[data.timestamp]) r[data.timestamp] = [];
    // r[data.timestamp] = [];
    r[data.timestamp].push(data);
});

console.log(r);

const f = data.reduce((acc, cur) => {
    acc[cur.timestamp] ??= [];
    acc[cur.timestamp].push(cur);
    return acc;
}, {});

console.log(f);

const fil = [...new Set(data.map((d) => d.timestamp)).keys()].map((f) => data.filter((d) => d.timestamp === f));

// data
// [{t: '1}, {t: '2}, {t: '1}, {t: '3}]

// data map => d => d.timestamp
// [1, 2, 1, 3]

// new Set
// {1: true, 2: trur, 3}

// set.keys() => array
// [1, 2, 3]

// [1, 2, 3] map x =>  data.timestamp is equals to x
// [[1, 1], [2], [3]]

// [{t: '1}, {t: '2}, {t: '1}, {t: '3}] => x.t = 1 == 1, x.t = 2 != 1, x.t = 1 == 1, x.t = 3 != 1
// [[{t: '1}, {t: '1},], [{t: '2},], [{t: '3},]]

console.log(fil);

const o = Object.fromEntries(
    [...new Set(data.map((d) => d.timestamp)).keys()].map((f) => [f, data.filter((d) => d.timestamp === f)])
);

console.log(o);

const xzczc = { 1: true, dsadasd: false, asds: 'asdsad' };

console.log(Object.keys(xzczc));
console.log(Object.values(xzczc));
console.log(Object.entries(xzczc));