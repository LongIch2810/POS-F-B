FROM node:22-alpine

WORKDIR /app

# Cài đặt dependencies dựa trên package-lock.json
COPY package*.json ./
RUN npm ci

# Copy mã nguồn và cấu hình build
COPY tsconfig.json ./
COPY src/ ./src/

# Biên dịch TypeScript sang JavaScript
RUN npm run build

EXPOSE 3000

# Tự động chạy TypeORM migration trước khi khởi động API NestJS
CMD ["sh", "-c", "npm run migration:run && npm run start"]

