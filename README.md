# 智能聊天机器人系统

一个功能完整的前后端分离聊天机器人系统，支持浮动窗口、拖拽移动、规则库匹配和AI大模型集成。

## 功能特点

- ✨ 浮动聊天窗口，可在任意页面显示
- 🎯 鼠标拖拽移动聊天框
- 🗄️ **PostgreSQL数据库存储规则库**
- 🎚️ **三层智能降级回答机制**
  - 第一层：PostgreSQL规则库匹配（最快）
  - 第二层：千问AI大模型（智能）
  - 第三层：Discord社区/专家（兜底）
- 💬 优化的消息显示格式
- 🎨 简洁美观的现代化UI设计
- 🔄 支持动态内容、关键词/精确/正则匹配

## 技术栈

### 前端
- React 18
- Vite
- Axios
- CSS3 动画

### 后端
- Node.js
- Express
- **PostgreSQL** (规则库存储)
- node-postgres (pg)
- xlsx (Excel数据导入)
- Axios (调用AI API)
- CORS

## 项目结构

```
chatbot-system/
├── frontend/          # React前端
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/           # Node.js后端
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── config/
│   │   └── server.js
│   ├── package.json
│   └── .env
└── README.md
```

## 安装和运行

### 前置要求

- Node.js 16.0 或更高版本
- **PostgreSQL 12 或更高版本**
- npm 或 yarn

### 🗄️ PostgreSQL数据库设置

#### 方式一：一键设置（推荐）⭐

```powershell
cd backend
.\setup-postgresql.ps1
```

这将自动：
1. 检查PostgreSQL
2. 创建数据库
3. 安装依赖
4. 创建表
5. 导入Excel规则数据

#### 方式二：手动设置

**1. 安装PostgreSQL（如未安装）**
- 下载: https://www.postgresql.org/download/
- 安装时记住密码：`20250820`

**2. 创建数据库**
```sql
psql -U postgres
CREATE DATABASE admission_db;
\q
```

**3. 配置.env文件**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=admission_db
DB_USER=postgres
DB_PASSWORD=20250820
```

**4. 初始化数据库**
```powershell
cd backend
npm install
npm run setup-db  # 创建表并导入Excel数据
npm run test-db   # 测试连接
```

**详细文档：** 查看 [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)

---

### 自动安装（推荐）⭐

**Windows 用户：**
```bash
# 一键安装全部
双击运行 install-all.bat

# 或分别安装
cd backend
双击运行 install-backend.bat
```

### 手动安装

#### 1. 安装依赖

#### 后端
```bash
cd backend
npm install
```

**如果遇到 "throw err" 错误：**
```bash
# 删除旧依赖重新安装
Remove-Item -Recurse -Force node_modules
npm install
```

#### 前端
```bash
cd frontend
npm install
```

### 2. 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```env
PORT=3001
QWEN_API_KEY=your_qwen_api_key_here
QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

### 3. 启动服务

#### 启动后端服务
```bash
cd backend
npm start
```
后端服务运行在: http://localhost:3001

#### 启动前端服务
```bash
cd frontend
npm run dev
```
前端服务运行在: http://localhost:5173

## 使用说明

1. 打开浏览器访问 http://localhost:5173
2. 点击右下角的聊天机器人图标
3. 输入问题并发送
4. 可以拖拽聊天窗口到任意位置

## 规则库配置

在 `backend/src/config/rules.json` 中配置预设问答规则：

```json
{
  "rules": [
    {
      "keywords": ["你好", "您好", "hi", "hello"],
      "response": "您好！我是智能助手，很高兴为您服务。有什么可以帮助您的吗？"
    }
  ]
}
```

## API接口

### POST /api/chat
发送聊天消息

**请求体:**
```json
{
  "message": "用户的问题"
}
```

**响应:**
```json
{
  "reply": "机器人的回答",
  "source": "rule" | "ai"
}
```

## 自定义配置

### 修改聊天框位置
在 `frontend/src/components/ChatBot.jsx` 中修改初始位置：
```javascript
const [position, setPosition] = useState({ x: 20, y: 20 });
```

### 修改主题颜色
在 `frontend/src/styles/ChatBot.css` 中修改CSS变量：
```css
:root {
  --primary-color: #your-color;
}
```

## 许可证

MIT License
