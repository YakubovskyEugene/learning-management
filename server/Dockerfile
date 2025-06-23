# Используем базовый образ AWS Lambda Node.js 20
FROM public.ecr.aws/lambda/nodejs:20 AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости (включая dev-зависимости для сборки)
RUN npm install

# Копируем остальной исходный код приложения
COPY . .

# Собираем файлы TypeScript
RUN npm run build

# Удаляем dev-зависимости
RUN npm prune --production

# Второй этап: подготовка production-образа
FROM public.ecr.aws/lambda/nodejs:20

# Устанавливаем рабочую директорию
WORKDIR ${LAMBDA_TASK_ROOT}

# Копируем собранные JavaScript-файлы и node_modules из этапа сборки
COPY --from=build /app/dist ${LAMBDA_TASK_ROOT}
COPY --from=build /app/node_modules ${LAMBDA_TASK_ROOT}/node_modules

# Копируем package.json (опционально)
COPY --from=build /app/package*.json ${LAMBDA_TASK_ROOT}

# Устанавливаем переменные окружения (при необходимости измените)
ENV NODE_ENV=production

# Команда для запуска Lambda-функции
CMD ["index.handler"]
