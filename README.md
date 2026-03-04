# 文档管理系统

一个现代化的中文文档管理网站，支持富文本编辑、图片/视频上传，提供完整的用户认证系统。

## 功能特性

- 🔐 **用户认证**：注册、登录、登出，会话持久化
- 📝 **文档管理**：创建、编辑、删除、列表展示
- 🖼️ **富媒体支持**：富文本编辑器（Quill.js），支持图片和视频上传
- 🎨 **现代 UI**：Tailwind CSS，响应式设计，中文界面

## 快速开始

```bash
git clone https://github.com/LuuuXXX/myweb.git
cd myweb
cp .env.example .env   # 配置环境变量
docker compose up -d   # 一键启动
```

访问 **http://localhost:3000** 即可使用。

## 技术栈

| 层级 | 技术 |
|------|------|
| 运行时 | Node.js 20 + Express.js |
| 模板引擎 | EJS |
| 数据库 | SQLite（better-sqlite3）|
| 认证 | bcryptjs + express-session |
| 文件上传 | multer |
| 前端样式 | Tailwind CSS（CDN）|
| 富文本编辑器 | Quill.js（CDN）|

## 部署

详细的部署说明（包括 Docker、手动部署、Nginx 反向代理配置等）请参阅 **[部署指南 DEPLOY.md](./DEPLOY.md)**。
