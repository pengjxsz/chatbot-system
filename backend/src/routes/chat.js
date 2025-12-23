const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

/**
 * 聊天路由配置
 */

// POST /api/chat - 发送聊天消息（三层降级：规则→千问→Discord）
router.post('/', chatController.handleMessage.bind(chatController));

// GET /api/chat/status - 获取系统状态（包含所有层级状态）
router.get('/status', chatController.getStatus.bind(chatController));

// GET /api/chat/rules - 获取所有规则
router.get('/rules', chatController.getRules.bind(chatController));

// POST /api/chat/rules - 添加新规则
router.post('/rules', chatController.addRule.bind(chatController));

// GET /api/chat/test-ai - 测试千问AI连接
router.get('/test-ai', chatController.testAI.bind(chatController));

// GET /api/chat/test-discord - 测试Discord连接
router.get('/test-discord', chatController.testDiscord.bind(chatController));

module.exports = router;
