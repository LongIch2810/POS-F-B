FROM node:22-alpine

WORKDIR /app

# Cài đặt dependencies dựa trên package-lock.json
COPY package*.json ./
RUN npm ci

# Copy toàn bộ mã nguồn giao diện
COPY . .

EXPOSE 5173

# Khởi chạy Vite dev server (host: true trong vite.config.ts đã binding 0.0.0.0)
CMD ["npm", "run", "dev"]

