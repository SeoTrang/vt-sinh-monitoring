FROM node:20-alpine

WORKDIR /app

# Sao chép package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Sao chép mã nguồn ứng dụng
COPY . .

# Mở cổng 3000 cho ứng dụng Node.js
EXPOSE 3000

# Khởi chạy server Node.js
CMD ["node", "server.js"]
