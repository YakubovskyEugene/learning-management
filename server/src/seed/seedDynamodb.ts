import {
  DynamoDBClient,
  DeleteTableCommand,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import fs from "fs";
import path from "path";
import dynamoose from "dynamoose";
import pluralize from "pluralize";
import Transaction from "../models/transactionModel";
import Course from "../models/courseModel";
import UserCourseProgress from "../models/userCourseProgressModel";
import dotenv from "dotenv";

dotenv.config();
let client: DynamoDBClient;

/* Конфигурация DynamoDB */
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  dynamoose.aws.ddb.local();
  client = new DynamoDBClient({
    endpoint: "http://localhost:8000",
    region: "us-east-2",
    credentials: {
      accessKeyId: "dummyKey123",
      secretAccessKey: "dummyKey123",
    },
  });
} else {
  client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-2",
  });
}

/* Отключение предупреждений о тегах DynamoDB Local */
const originalWarn = console.warn.bind(console);
console.warn = (message, ...args) => {
  if (
    !message.includes("Tagging is not currently supported in DynamoDB Local")
  ) {
    originalWarn(message, ...args);
  }
};

// Создание таблиц
async function createTables() {
  const models = [Transaction, UserCourseProgress, Course];

  for (const model of models) {
    const tableName = model.name;
    const table = new dynamoose.Table(tableName, [model], {
      create: true,
      update: true,
      waitForActive: true,
      throughput: { read: 5, write: 5 },
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await table.initialize();
      console.log(`Таблица создана и инициализирована: ${tableName}`);
    } catch (error: any) {
      console.error(
        `Ошибка при создании таблицы ${tableName}:`,
        error.message,
        error.stack
      );
    }
  }
}

// Засев данных в таблицу
async function seedData(tableName: string, filePath: string) {
  const data: { [key: string]: any }[] = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  );

  const formattedTableName = pluralize.singular(
    tableName.charAt(0).toUpperCase() + tableName.slice(1)
  );

  console.log(`Засев данных в таблицу: ${formattedTableName}`);

  for (const item of data) {
    try {
      await dynamoose.model(formattedTableName).create(item);
    } catch (err) {
      console.error(
        `Не удалось добавить элемент в ${formattedTableName}. Ошибка:`,
        JSON.stringify(err, null, 2)
      );
    }
  }

  console.log(
    "\x1b[32m%s\x1b[0m",
    `Данные успешно засеяны в таблицу: ${formattedTableName}`
  );
}

// Удаление таблицы
async function deleteTable(baseTableName: string) {
  let deleteCommand = new DeleteTableCommand({ TableName: baseTableName });
  try {
    await client.send(deleteCommand);
    console.log(`Таблица удалена: ${baseTableName}`);
  } catch (err: any) {
    if (err.name === "ResourceNotFoundException") {
      console.log(`Таблица не существует: ${baseTableName}`);
    } else {
      console.error(`Ошибка при удалении таблицы ${baseTableName}:`, err);
    }
  }
}

// Удаление всех таблиц
async function deleteAllTables() {
  const listTablesCommand = new ListTablesCommand({});
  const { TableNames } = await client.send(listTablesCommand);

  if (TableNames && TableNames.length > 0) {
    for (const tableName of TableNames) {
      await deleteTable(tableName);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
}

// Основная функция засевки
export default async function seed() {
  await deleteAllTables();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await createTables();

  const seedDataPath = path.join(__dirname, "./data");
  const files = fs
    .readdirSync(seedDataPath)
    .filter((file) => file.endsWith(".json"));

  for (const file of files) {
    const tableName = path.basename(file, ".json");
    const filePath = path.join(seedDataPath, file);
    await seedData(tableName, filePath);
  }
}

// Запуск скрипта напрямую
if (require.main === module) {
  seed().catch((error) => {
    console.error("Не удалось запустить скрипт засевки:", error);
  });
}
