const express = require("express");
const cors = require("cors");
const { BlobServiceClient } = require("@azure/storage-blob");
const { TableClient, TableServiceClient } = require("@azure/data-tables");

const app = express();
app.use(cors()); // Enable CORS for all origins
app.use(express.json());

// Azure Storage details
const accountName = "tracepointanalyticsdev01";
const tableName = "Devices";
const containerName = "telemetry";
const sasToken =
  "?sv=2023-01-03&ss=btqf&srt=sco&st=2025-05-16T15%3A53%3A11Z&se=2026-05-17T15%3A53%3A00Z&sp=rwdlacu&sig=78qL6pwu0aFN6218C%2FQw2spRJmKAzEyoSMIEYw2fAJo%3D";

// Construct the full URL with SAS token for TableClient
const blobServiceUrl = `https://${accountName}.blob.core.windows.net${sasToken}`;
const blobServiceClient = new BlobServiceClient(blobServiceUrl);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Construct the full URL with SAS token for TableClient
const tableServiceUrl =
  "https://tracepointanalyticsdev01.table.core.windows.net";
const serviceUrlWithSas = `${tableServiceUrl}${sasToken}`;
const serviceClient = new TableServiceClient(serviceUrlWithSas);
const tableClient = new TableClient(serviceUrlWithSas, tableName);

// --- Helper: List top-level virtual directories in container ---
async function listDirectories() {
  const directories = [];
  // listBlobsByHierarchy with delimiter = "/" lists virtual folders
  for await (const item of containerClient.listBlobsByHierarchy("/")) {
    if (item.kind === "prefix") {
      directories.push(item.name);
    }
  }
  return directories;
}

// --- Helper: List files under given prefix (directory) ---
async function listFiles(prefix) {
  const files = [];
  for await (const blob of containerClient.listBlobsFlat({ prefix })) {
    if (!blob.name.endsWith("/")) {
      files.push({
        name: blob.name,
        size: blob.properties.contentLength,
        lastModified: blob.properties.lastModified,
      });
    }
  }
  return files;
}

// --- Helper: Get JSON content from a file in given path ---
async function getJsonFileContent(filePath) {
  const blobClient = containerClient.getBlobClient(filePath);
  const downloadBlockBlobResponse = await blobClient.download();
  const downloaded = await streamToString(
    downloadBlockBlobResponse.readableStreamBody
  );
  return JSON.parse(downloaded);
}

// --- Utility to convert stream to string ---
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => chunks.push(data.toString()));
    readableStream.on("end", () => resolve(chunks.join("")));
    readableStream.on("error", reject);
  });
}

// --- API 1: List directories in telemetry container ---
app.get("/api/directories", async (req, res) => {
  try {
    const dirs = await listDirectories();
    res.json({ directories: dirs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- API 2: List files in a directory ---
app.get("/api/files", async (req, res) => {
  const dir = req.query.dir;
  if (!dir)
    return res.status(400).json({ error: "Missing 'dir' query parameter" });

  try {
    const files = await listFiles(dir);
    res.json({ files });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- API 3: Return JSON file content ---
app.get("/api/jsonfile", async (req, res) => {
  const filePath = req.query.file;
  if (!filePath)
    return res.status(400).json({ error: "Missing 'file' query parameter" });

  try {
    const jsonData = await getJsonFileContent(filePath);
    res.json(jsonData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

async function getJsonFilesBetweenDates(
  fromDate,
  toDate,
  deviceId,
  computerName,
  loggedUser
) {
  const data = {};

  // Normalize date objects
  const from = new Date(fromDate);
  const to = new Date(toDate);

  for await (const blob of containerClient.listBlobsFlat()) {
    if (!blob.name.endsWith(".json")) continue;

    // Extract date from blob name or path — adjust this based on your naming scheme
    // Example: assume blob.name like "2025-05-12/somefile.json"
    const datePart = blob.name.split("/")[0]; // get the first part as date string
    const blobDate = new Date(datePart);

    if (blobDate >= from && blobDate <= to) {
      if (deviceId && !blob.name.includes(deviceId)) continue;

      const blobClient = containerClient.getBlobClient(blob.name);
      const downloadBlockBlobResponse = await blobClient.download();
      const downloaded = await streamToString(
        downloadBlockBlobResponse.readableStreamBody
      );

      const jsonContent = JSON.parse(downloaded);
      if (computerName && !jsonContent.computerName.includes(computerName))
        continue;
      if (loggedUser && !jsonContent.loggedOnUser.includes(loggedUser))
        continue;
      try {
        data[jsonContent.deviceId] = jsonContent;
      } catch (err) {
        console.warn(`Skipping invalid JSON blob: ${blob.name}`);
      }
    }
  }

  const entries = Object.entries(data);

  // Step 2: Sort by the nested `timestamp`
  entries.sort((a, b) => new Date(a[1].timestamp) - new Date(b[1].timestamp));

  // Step 3 (optional): Convert back to object
  const sortedData = Object.fromEntries(entries);
  const _sortedData = [];

  for (const key in sortedData) {
    const json = sortedData[key];
    _sortedData.push(json);
  }

  return _sortedData;
}

// Helper to read stream to string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

// --- API 4: List files in a directory All data ---
app.get("/api/devices", async (req, res) => {
  const { deviceId, computerName, loggedUser, dateFrom, dateTo } = req.query;
  try {
    const data = [];
    // Build filter string
    const filters = [];

    if (deviceId)
      filters.push(`RowKey ge '${deviceId}' and RowKey lt '${deviceId}~'`);
    if (computerName)
      filters.push(
        `computerName ge '${computerName}' and computerName lt '${computerName}~'`
      );
    if (loggedUser)
      filters.push(
        `loggedOnUser ge '${loggedUser}' and loggedOnUser lt '${loggedUser}~'`
      );

    // Date range filtering — assuming there's a "timestamp" or "createdDate" column
    if (dateFrom)
      filters.push(
        `timestamp ge datetime'${new Date(dateFrom).toISOString()}'`
      );
    if (dateTo)
      filters.push(`timestamp le datetime'${new Date(dateTo).toISOString()}'`);

    const filterQuery = filters.join(" and ");

    const entitiesIter = tableClient.listEntities({
      queryOptions: { filter: filterQuery },
    });

    for await (const entity of entitiesIter) {
      console.log(
        `PartitionKey: ${entity.partitionKey}, RowKey: ${entity.rowKey}, computerName: ${entity.computerName}`
      );
      data.push({
        partitionKey: entity.partitionKey,
        rowKey: entity.rowKey,
        timestamp: entity.timestamp,
        blobCnt: entity.blobCnt,
        computerName: entity.computerName,
        cpu: entity.cpu,
        cpuCores: entity.cpuCores,
        crashesCnt: entity.crashesCnt,
        date: entity.date,
        loggedOnUser: entity.loggedOnUser,
        osVersion: entity.osVersion,
        osVersionFull: entity.osVersionFull,
        ram: entity.ram,
        ramSizeGB: entity.ramSizeGB,
        diskUseSpace: entity.diskUseSpace,
        diskUsing: entity.diskUsing,
        payloadUrl: entity.payloadUrl,
      });
    }
    res.json({ devices: data });
  } catch (err) {
    console.error("Error fetching table data:", err);
    res.status(500).json({ error: err.message });
  }
});

// for Devices page
// --- API 4: List files in a directory All data ---
app.get("/api/devices_laststatus", async (req, res) => {
  try {
    const { deviceId, computerName, loggedUser, dateFrom, dateTo } = req.query;
    const filters = [];

    if (dateFrom) filters.push(`date ge '${dateFrom}'`);
    if (dateTo) filters.push(`date le '${dateTo}'`);

    const filterQuery = filters.join(" and ");
    const entitiesIter = tableClient.listEntities({
      queryOptions: { filter: filterQuery },
    });

    const resultMap = new Map();

    for await (const entity of entitiesIter) {
      const rowKey = entity.rowKey; // lowercase
      const partitionKey = entity.partitionKey;

      // Store max PartitionKey per RowKey (assuming lex order is relevant)
      const currentEntity = resultMap.get(rowKey);
      const currentMax = currentEntity ? currentEntity.partitionKey : null;
      if (!currentMax || partitionKey > currentMax) {
        resultMap.set(rowKey, entity);
      }
    }

    const devices = [];
    for (const entity of resultMap.entries()) {
      devices.push({
        partitionKey: entity[1].partitionKey,
        rowKey: entity[1].rowKey,
        deviceId: entity[1].deviceId,
        timestamp: entity[1].timestamp,
        blobCnt: entity[1].blobCnt,
        computerName: entity[1].computerName,
        cpu: entity[1].cpu,
        cpuCores: entity[1].cpuCores,
        crashesCnt: entity[1].crashesCnt,
        date: entity[1].date,
        disk: entity[1].disk.toString(),
        loggedOnUser: entity[1].loggedOnUser,
        osVersion: entity[1].osVersion,
        osVersionFull: entity[1].osVersionFull,
        ram: entity[1].ram,
        ramSizeGB: entity[1].ramSizeGB,
        diskUseSpace: entity[1].diskUseSpace,
        diskUsing: entity[1].diskUsing,
        payloadUrl: entity[1].payloadUrl,
      });
    }

    res.json({ devices });
  } catch (err) {
    console.error("Error fetching table data:", err);
    res.status(500).json({ error: err.message });
  }
});

// for Devices page detail of a device
// API: Get detail of a device
app.get("/api/device/log", async (req, res) => {
  const { deviceId } = req.query;
  const targetRowKey = deviceId.toLowerCase();

  try {
    const data = [];
    // Build filter string
    const filters = [];

    if (targetRowKey) filters.push(`RowKey eq '${targetRowKey}'`);
    const filterQuery = filters.join(" and ");
    const entitiesIter = tableClient.listEntities({
      queryOptions: { filter: filterQuery },
    });

    
    for await (const entity of entitiesIter) {
      data.push({
        partitionKey: entity.partitionKey,
        rowKey: entity.rowKey,
        deviceId: entity.deviceId,
        timestamp: entity.timestamp,
        blobCnt: entity.blobCnt,
        computerName: entity.computerName,
        cpu: entity.cpu,
        cpuCores: entity.cpuCores,
        crashesCnt: entity.crashesCnt,
        date: entity.date,
        disk: entity.disk.toString(),
        loggedOnUser: entity.loggedOnUser,
        osVersion: entity.osVersion,
        osVersionFull: entity.osVersionFull,
        ram: entity.ram,
        ramSizeGB: entity.ramSizeGB,
        diskUseSpace: entity.diskUseSpace,
        diskUsing: entity.diskUsing,
        payloadUrl: entity.payloadUrl,
      });
    }
    console.log(data)
    res.json({ devicelogs: data });
  } catch (err) {
    console.error("Error fetching device:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});