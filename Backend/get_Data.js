const { TableClient, TableServiceClient } = require("@azure/data-tables");

const sasToken = "sv=2023-01-03&ss=btqf&srt=sco&st=2025-05-16T15%3A53%3A11Z&se=2026-05-17T15%3A53%3A00Z&sp=rwdlacu&sig=78qL6pwu0aFN6218C%2FQw2spRJmKAzEyoSMIEYw2fAJo%3D";
const tableServiceUrl = "https://tracepointanalyticsdev01.table.core.windows.net";
const tableName = "Devices";

const serviceUrlWithSas = `${tableServiceUrl}?${sasToken}`;

const serviceClient = new TableServiceClient(serviceUrlWithSas);

// Correct way to create TableClient
const tableClient = new TableClient(serviceUrlWithSas, tableName);

async function main() {
  try {
    await serviceClient.createTable(tableName);
    console.log(`Table "${tableName}" created`);
  } catch (err) {
    if (err.statusCode === 409) {
      console.log(`Table "${tableName}" already exists.`);
    } else {
      throw err;
    }
  }

  console.log("Entities in table:");
  const entitiesIter = tableClient.listEntities();

  for await (const entity of entitiesIter) {
    console.log(`PartitionKey: ${entity.partitionKey}, RowKey: ${entity.rowKey}, computerName: ${entity.computerName}`);
  }
}

main().catch(console.error);
