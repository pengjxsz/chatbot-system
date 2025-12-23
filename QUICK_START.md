# 快速启动指南

## 一、系统要求

- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器
- 千问API密钥（可选，用于AI功能）

## 二、快速安装

### 1. 克隆或下载项目

```bash
# 下载项目后，进入项目目录
cd chatbot-system
```

### 2. 安装后端依赖

```bash
cd backend
npm install
```

### 3. 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下内容：

```env
PORT=3001
QWEN_API_KEY=your_api_key_here
QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

> 💡 提示：如果没有千问API密钥，系统会使用模拟回复模式，基本功能仍可正常使用。

### 4. 安装前端依赖

```bash
cd ../frontend
npm install
```

## 三、启动服务

### 方式一：分别启动（推荐开发时使用）

#### 启动后端
```bash
cd backend
npm start
```

后端服务将在 http://localhost:3001 运行

#### 启动前端
打开新的终端窗口：
```bash
cd frontend
npm run dev
```

前端服务将在 http://localhost:5173 运行

### 方式二：生产环境部署

#### 构建前端
```bash
cd frontend
npm run build
```

#### 启动后端并服务前端静态文件
```bash
cd backend
npm start
```

## 四、访问应用

1. 打开浏览器访问: http://localhost:5173
2. 点击右下角的聊天机器人图标
3. 开始对话！

## 五、获取千问API密钥

### 注册阿里云账号
1. 访问：https://www.aliyun.com/
2. 注册并登录账号

### 开通通义千问服务
1. 访问：https://dashscope.console.aliyun.com/
2. 开通通义千问服务
3. 获取API Key

### 配置密钥
将获取的API Key填入 `backend/.env` 文件的 `QWEN_API_KEY` 字段

## 六、常见问题

### 1. 端口被占用

如果3001端口被占用，修改 `backend/.env` 中的 `PORT` 值：
```env
PORT=3002
```

同时修改 `frontend/src/services/api.js` 中的 `API_BASE_URL`：
```javascript
const API_BASE_URL = 'http://localhost:3002/api';
```

### 2. 无法连接后端

检查：
- 后端服务是否已启动
- 端口配置是否正确
- 防火墙是否阻止连接

### 3. AI回复是模拟内容

说明千问API未配置或配置错误，检查：
- `.env` 文件中的 `QWEN_API_KEY` 是否正确
- API密钥是否有效
- 网络连接是否正常

## 七、开发提示

### 修改规则库
编辑 `backend/src/config/rules.json` 添加自定义规则

### 修改聊天框初始位置
编辑 `frontend/src/components/ChatBot.jsx`：
```javascript
const [position, setPosition] = useState({ x: 20, y: 20 });
```

### 修改主题颜色
编辑 `frontend/src/styles/ChatBot.css`：
```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #8b5cf6;
}
```

## 八、部署到生产环境

### 使用 PM2（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd backend
pm2 start src/server.js --name chatbot-backend

# 查看状态
pm2 status

# 查看日志
pm2 logs chatbot-backend
```

### 使用 Nginx 反向代理

配置示例：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 九、技术支持

如有问题，请检查：
1. Node.js 版本是否符合要求
2. 依赖是否正确安装
3. 端口是否被占用
4. 环境变量是否正确配置

祝使用愉快！🎉
