# 使用官方 Node.js LTS 镜像作为基础镜像
FROM node:20-alpine

# 安装 better-sqlite3 编译所需的原生依赖，以及健康检查用的 wget
RUN apk add --no-cache python3 make g++ wget

# 设置工作目录
WORKDIR /app

# 先复制依赖文件，充分利用 Docker 层缓存
COPY package*.json ./

# 安装生产依赖
RUN npm ci --omit=dev

# 复制应用源码
COPY . .

# 创建必要的目录
RUN mkdir -p data public/uploads

# 以非 root 用户运行，提高安全性
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app
USER appuser

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "app.js"]
