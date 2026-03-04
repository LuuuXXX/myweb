# 部署指南

本文档介绍如何将**文档管理系统**快速部署到生产环境。

---

## 目录

- [方式一：Docker 快速部署（推荐）](#方式一docker-快速部署推荐)
- [方式二：手动部署](#方式二手动部署)
- [环境变量说明](#环境变量说明)
- [反向代理配置（Nginx）](#反向代理配置nginx)
- [常见问题](#常见问题)

---

## 方式一：Docker 快速部署（推荐）

### 前置要求

- [Docker](https://docs.docker.com/get-docker/) ≥ 20.10
- [Docker Compose](https://docs.docker.com/compose/install/) ≥ 2.0

### 步骤

**1. 克隆代码**

```bash
git clone https://github.com/LuuuXXX/myweb.git
cd myweb
```

**2. 配置环境变量**

```bash
# 复制示例配置文件
cp .env.example .env

# 编辑 .env，将 SESSION_SECRET 替换为随机字符串
# 可以用以下命令生成：
openssl rand -base64 32
```

编辑 `.env` 文件内容示例：

```env
SESSION_SECRET=your-random-secret-string-here
PORT=3000
```

**3. 一键启动**

```bash
docker compose up -d
```

启动后访问：**http://localhost:3000**

**4. 查看运行日志**

```bash
docker compose logs -f
```

**5. 停止服务**

```bash
docker compose down
```

> **数据持久化说明**：数据库和上传文件存储在 Docker 命名卷（`myweb_data` 和 `myweb_uploads`）中，执行 `docker compose down` 不会删除数据。若要同时清除数据，请使用 `docker compose down -v`。

---

## 方式二：手动部署

### 前置要求

- [Node.js](https://nodejs.org/) ≥ 18.0
- npm ≥ 9.0

### 步骤

**1. 克隆代码并安装依赖**

```bash
git clone https://github.com/LuuuXXX/myweb.git
cd myweb
npm install --omit=dev
```

**2. 配置环境变量**

```bash
cp .env.example .env
# 编辑 .env，设置 SESSION_SECRET
```

**3. 创建必要目录**

```bash
mkdir -p data public/uploads
```

**4. 启动应用**

```bash
# 直接启动
node app.js

# 或使用 npm 脚本
npm start
```

**5. 使用 PM2 实现进程守护（推荐生产环境）**

```bash
# 安装 PM2
npm install -g pm2

# 启动应用并命名为 myweb
pm2 start app.js --name myweb

# 设置开机自启
pm2 startup
pm2 save

# 查看运行状态
pm2 status

# 查看日志
pm2 logs myweb
```

---

## 环境变量说明

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `SESSION_SECRET` | **生产环境必填** | — | 会话加密密钥，**生产环境必须**设置为随机字符串（使用 `openssl rand -base64 32` 生成） |
| `PORT` | 否 | `3000` | 应用监听端口 |
| `NODE_ENV` | 否 | — | 设为 `production` 可启用生产模式优化 |

> ⚠️ **安全警告**：`SESSION_SECRET` 在生产环境中必须设置，否则 Docker 容器将拒绝启动。请勿使用弱密钥或可预测字符串。

---

## 反向代理配置（Nginx）

如果需要通过域名访问，推荐使用 Nginx 作为反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 上传文件大小限制（与 multer 配置保持一致）
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

配置 HTTPS（使用 [Certbot](https://certbot.eff.org/)）：

```bash
sudo certbot --nginx -d your-domain.com
```

---

## 常见问题

**Q：启动时报错 `EADDRINUSE: address already in use :::3000`**

端口 3000 已被占用，修改 `.env` 中的 `PORT` 为其他端口，或停止占用该端口的进程：

```bash
# 查找占用 3000 端口的进程
lsof -i :3000
# 或
kill $(lsof -t -i:3000)
```

**Q：上传图片/视频失败**

确认 `public/uploads` 目录存在且有写入权限：

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

**Q：Docker 容器启动后无法访问**

检查容器是否正常运行：

```bash
docker compose ps
docker compose logs web
```

**Q：如何备份数据？**

数据库文件位于 `data/` 目录下（手动部署）或 Docker 卷中。

```bash
# 手动部署备份
cp -r data/ backup/

# Docker 部署备份
docker run --rm -v myweb_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/myweb-data-backup.tar.gz /data
```
