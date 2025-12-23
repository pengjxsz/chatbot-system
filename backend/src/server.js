const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const chatRoutes = require('./routes/chat');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API路由
app.use('/api/chat', chatRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    path: req.path
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 聊天机器人后端服务已启动');
  console.log(`📡 服务运行在: http://localhost:${PORT}`);
  console.log(`🕐 启动时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log('=================================');
  console.log('\n可用的API端点:');
  console.log(`  GET  /health              - 健康检查`);
  console.log(`  POST /api/chat            - 发送消息`);
  console.log(`  GET  /api/chat/status     - 获取状态`);
  console.log(`  GET  /api/chat/rules      - 获取规则`);
  console.log(`  POST /api/chat/rules      - 添加规则`);
  console.log(`  GET  /api/chat/test       - 测试AI`);
  console.log('\n提示: 按 Ctrl+C 停止服务\n');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n\n收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

module.exports = app;
