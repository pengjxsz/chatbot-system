# 项目结构说明

```
chatbot-system/
│
├── README.md                     # 项目说明文档
├── QUICK_START.md               # 快速启动指南
│
├── backend/                      # 后端服务
│   ├── package.json             # 后端依赖配置
│   ├── .env.example             # 环境变量示例
│   ├── .gitignore               # Git忽略文件
│   │
│   └── src/                     # 源代码目录
│       ├── server.js            # 服务器入口文件
│       │
│       ├── config/              # 配置文件
│       │   └── rules.json       # 规则库配置
│       │
│       ├── controllers/         # 控制器
│       │   └── chatController.js # 聊天控制器
│       │
│       ├── services/            # 服务层
│       │   ├── ruleEngine.js    # 规则引擎服务
│       │   └── aiService.js     # AI服务（千问集成）
│       │
│       └── routes/              # 路由配置
│           └── chat.js          # 聊天路由
│
└── frontend/                    # 前端应用
    ├── package.json             # 前端依赖配置
    ├── vite.config.js           # Vite配置
    ├── index.html               # HTML入口
    ├── .gitignore               # Git忽略文件
    │
    ├── public/                  # 公共资源
    │
    └── src/                     # 源代码目录
        ├── main.jsx             # React入口文件
        ├── App.jsx              # 主应用组件
        ├── App.css              # 应用样式
        │
        ├── components/          # React组件
        │   ├── ChatBot.jsx      # 聊天机器人主组件
        │   ├── ChatMessage.jsx  # 消息组件
        │   └── ChatInput.jsx    # 输入组件
        │
        ├── services/            # 服务层
        │   └── api.js           # API接口服务
        │
        └── styles/              # 样式文件
            └── ChatBot.css      # 聊天机器人样式
```

## 文件说明

### 后端文件

#### server.js
- Express服务器主文件
- 配置中间件、路由和错误处理
- 启动HTTP服务器

#### config/rules.json
- 预设问答规则库
- 包含关键词匹配和对应回复
- 支持优先级设置

#### controllers/chatController.js
- 处理聊天相关的HTTP请求
- 协调规则引擎和AI服务
- 返回格式化的响应

#### services/ruleEngine.js
- 规则匹配引擎
- 关键词搜索和优先级排序
- 规则管理（增删改查）

#### services/aiService.js
- 千问AI服务集成
- API调用和错误处理
- 响应格式化

#### routes/chat.js
- 定义聊天相关API路由
- 映射URL到控制器方法

### 前端文件

#### main.jsx
- React应用入口
- 挂载根组件到DOM

#### App.jsx
- 主应用组件
- 页面布局和演示内容
- 集成ChatBot组件

#### App.css
- 主应用样式
- 页面布局样式
- 响应式设计

#### components/ChatBot.jsx
- 聊天机器人主组件
- 拖拽功能实现
- 消息管理和API调用
- 状态管理

#### components/ChatMessage.jsx
- 消息显示组件
- 消息格式化处理
- 支持列表、段落等格式

#### components/ChatInput.jsx
- 输入框组件
- 自动高度调整
- 键盘事件处理

#### services/api.js
- API接口封装
- Axios实例配置
- 请求/响应拦截器

#### styles/ChatBot.css
- 聊天机器人样式
- 动画效果
- 响应式布局
- 深色模式支持

## 核心功能流程

### 1. 消息发送流程
```
用户输入 → ChatInput → ChatBot → api.js → 
后端路由 → 控制器 → 规则引擎（优先）→ 
AI服务（降级）→ 响应格式化 → 前端显示
```

### 2. 拖拽功能流程
```
鼠标按下 → 记录偏移 → 鼠标移动 → 
计算新位置 → 限制范围 → 更新位置 → 
鼠标释放 → 结束拖拽
```

### 3. 规则匹配流程
```
接收消息 → 标准化处理 → 遍历规则 → 
关键词匹配 → 优先级排序 → 返回结果
```

### 4. AI调用流程
```
规则未命中 → 构建请求 → 调用千问API → 
接收响应 → 格式化文本 → 返回结果 → 
错误降级处理
```

## 技术特点

### 前端技术
- React 18 - 组件化开发
- Vite - 快速构建工具
- CSS3 - 现代化样式
- Axios - HTTP客户端

### 后端技术
- Node.js - 运行时环境
- Express - Web框架
- 千问API - AI大模型
- RESTful API - 接口设计

### 核心特性
- 前后端分离架构
- 浮动可拖拽窗口
- 规则库优先匹配
- AI大模型降级
- 消息格式优化
- 响应式设计
- 深色模式支持

## 扩展建议

### 功能扩展
1. 添加用户认证系统
2. 支持多轮对话上下文
3. 集成语音输入/输出
4. 添加文件上传功能
5. 支持多语言
6. 添加聊天历史记录
7. 实现WebSocket实时通信

### 性能优化
1. 实现消息虚拟滚动
2. 添加Redis缓存
3. 使用CDN加速静态资源
4. 实现请求防抖/节流
5. 优化打包体积

### 用户体验
1. 添加更多动画效果
2. 支持自定义主题
3. 添加表情包支持
4. 优化移动端体验
5. 添加快捷回复功能
