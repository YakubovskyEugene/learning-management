import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dynamoose from "dynamoose";
import serverless from "serverless-http";
import seed from "./seed/seedDynamodb";
import { clerkMiddleware, createClerkClient, requireAuth } from "@clerk/express";
import multer from "multer";

/* ИМПОРТЫ МАРШРУТОВ */
import courseRoutes from "./routes/courseRoutes";
import userClerkRoutes from "./routes/userClerkRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import userCourseProgressRoutes from "./routes/userCourseProgressRoutes";

/* КОНФИГУРАЦИЯ */
dotenv.config();
const isProduction = process.env.NODE_ENV === "production";
if (!isProduction) {
  dynamoose.aws.ddb.local();
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const app = express();

// Настройка multer для обработки FormData
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(cors());

// Применяем bodyParser только к маршрутам, не использующим multipart
app.use((req, res, next) => {
  if (req.path.startsWith('/courses') && req.method === 'PUT') {
    return next(); // Пропускаем bodyParser для PUT /courses
  }
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  next();
});

// Применяем clerkMiddleware до маршрутов
app.use(clerkMiddleware());

// Настраиваем маршрут /courses с multer
app.use("/courses", requireAuth(), upload.any(), courseRoutes); // upload.any() для всех полей FormData

/* МАРШРУТЫ */
app.get("/", (req, res) => {
  res.send("Привет! Сервер работает.");
});

app.use("/users/clerk", requireAuth(), userClerkRoutes);
app.use("/transactions", requireAuth(), transactionRoutes);
app.use("/users/course-progress", requireAuth(), userCourseProgressRoutes);

/* СЕРВЕР */
const port = process.env.PORT || 3000;
if (!isProduction) {
  app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
  });
}

// AWS production environment
const serverlessApp = serverless(app);
export const handler = async (event: any, context: any) => {
  if (event.action === "seed") {
    await seed();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Данные успешно загружены" }),
    };
  } else {
    return serverlessApp(event, context);
  }
};