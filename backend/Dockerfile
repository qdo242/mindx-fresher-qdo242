FROM node:20-alpine
WORKDIR /app

# Copy các file quản lý thư viện
COPY package*.json ./

# Cài đặt các thư viện (Dependencies)
RUN npm install

# Copy toàn bộ mã nguồn (bao gồm cả instrumentation.ts và server.ts)
COPY . .

# Biên dịch TypeScript thành JavaScript trong thư mục dist/
RUN npm run build

EXPOSE 3000

# QUAN TRỌNG: Phải dùng npm start để nó chạy kèm cờ --import
CMD ["npm", "start"]