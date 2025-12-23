const ruleEngine = require('../services/ruleEngine');
const aiService = require('../services/aiService');
const discordService = require('../services/discordService');

/**
 * 聊天控制器
 * 处理聊天相关的API请求
 * 实现三层回答机制：规则库 → 千问AI → Discord
 */
class ChatController {
  /**
   * 处理聊天消息
   * 三层降级策略：
   * 1. 规则库匹配（PostgreSQL）
   * 2. 千问AI大模型
   * 3. Discord社区/专家
   * 
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async handleMessage(req, res) {
    try {
      const { message } = req.body;

      // 验证输入
      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: '消息不能为空'
        });
      }

      // 检查消息长度
      if (message.length > 2000) {
        return res.status(400).json({
          success: false,
          error: '消息长度不能超过2000字符'
        });
      }

      console.log('\n' + '='.repeat(60));
      console.log(`收到消息: ${message}`);
      console.log('='.repeat(60));

      // ============================================
      // 第一层：规则库匹配（优先级最高）
      // ============================================
      console.log('\n[第一层] 尝试规则库匹配...');
      
      try {
        const ruleMatch = await ruleEngine.matchRule(message);

        if (ruleMatch) {
          console.log(`✓ 规则库匹配成功！`);
          console.log(`  规则ID: ${ruleMatch.ruleId}`);
          console.log(`  规则名称: ${ruleMatch.ruleName}`);
          console.log(`  优先级: ${ruleMatch.priority}`);
          console.log(`  分类: ${ruleMatch.category || 'N/A'}`);
          
          return res.json({
            success: true,
            reply: ruleMatch.response,
            source: 'rule',
            ruleId: ruleMatch.ruleId,
            ruleName: ruleMatch.ruleName,
            category: ruleMatch.category,
            priority: ruleMatch.priority,
            timestamp: new Date().toISOString()
          });
        }

        console.log('✗ 规则库未找到匹配');
      } catch (error) {
        console.error('✗ 规则库查询出错:', error.message);
        // 继续尝试下一层
      }

      // ============================================
      // 第二层：千问AI大模型
      // ============================================
      console.log('\n[第二层] 调用千问AI大模型...');
      
      try {
        const aiReply = await aiService.getQwenResponse(message);

        // 检查AI回复质量
        const isValidAIResponse = this.validateAIResponse(aiReply);

        if (isValidAIResponse) {
          console.log('✓ 千问AI回复成功');
          console.log(`  回复长度: ${aiReply.length} 字符`);
          
          return res.json({
            success: true,
            reply: aiReply,
            source: 'ai',
            model: 'qwen',
            timestamp: new Date().toISOString()
          });
        }

        console.log('✗ 千问AI回复质量不佳或未配置');
      } catch (error) {
        console.error('✗ 千问AI调用失败:', error.message);
        // 继续尝试下一层
      }

      // ============================================
      // 第三层：Discord社区/专家（最后降级）
      // ============================================
      console.log('\n[第三层] 降级到Discord社区...');
      
      try {
        const discordReply = await discordService.getDiscordResponse(message);

        console.log('✓ Discord回复成功');
        console.log(`  回复长度: ${discordReply.length} 字符`);

        return res.json({
          success: true,
          reply: discordReply,
          source: 'discord',
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('✗ Discord调用失败:', error.message);
      }

      // ============================================
      // 所有方法都失败，返回默认回复
      // ============================================
      console.log('\n✗ 所有回答方式都失败，返回默认回复');
      console.log('='.repeat(60) + '\n');

      return res.json({
        success: true,
        reply: this.getDefaultResponse(message),
        source: 'default',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('\n❌ 处理消息时发生严重错误:', error);
      console.log('='.repeat(60) + '\n');
      
      return res.status(500).json({
        success: false,
        error: '处理消息时发生错误',
        message: error.message
      });
    }
  }

  /**
   * 验证AI回复质量
   * @param {string} reply - AI回复
   * @returns {boolean} - 是否是有效回复
   */
  validateAIResponse(reply) {
    if (!reply || typeof reply !== 'string') {
      return false;
    }

    // 检查回复长度
    if (reply.length < 10) {
      return false;
    }

    // 检查是否包含错误提示
    const errorPatterns = [
      '抱歉',
      '无法',
      '错误',
      'API',
      '未配置',
      '模拟',
      'ERROR'
    ];

    const hasError = errorPatterns.some(pattern => 
      reply.includes(pattern) && reply.length < 100
    );

    return !hasError;
  }

  /**
   * 获取默认回复
   * @param {string} message - 用户消息
   * @returns {string} - 默认回复
   */
  getDefaultResponse(message) {
    return `抱歉，我暂时无法回答您的问题。\n\n您的问题："${message}"\n\n💡 建议：\n• 尝试换一种方式提问\n• 提供更多详细信息\n• 联系人工客服获取帮助\n\n📞 客服热线：400-XXX-XXXX\n📧 客服邮箱：support@example.com\n⏰ 服务时间：周一至周五 9:00-18:00`;
  }

  /**
   * 获取系统状态
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getStatus(req, res) {
    try {
      const ruleStats = await ruleEngine.getStats();
      const aiConfig = aiService.checkConfig();
      const discordConfig = discordService.checkConfig();

      res.json({
        success: true,
        status: 'running',
        layers: {
          rule: {
            enabled: true,
            ...ruleStats
          },
          ai: {
            enabled: process.env.ENABLE_QWEN_AI !== 'false',
            configured: aiConfig.configured
          },
          discord: {
            enabled: process.env.ENABLE_DISCORD_FALLBACK === 'true',
            configured: discordConfig.configured,
            hasWebhook: discordConfig.hasWebhook,
            hasBot: discordConfig.hasBot
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('获取状态时出错:', error);
      res.status(500).json({
        success: false,
        error: '获取状态失败'
      });
    }
  }

  /**
   * 获取所有规则
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getRules(req, res) {
    try {
      const rules = await ruleEngine.getAllRules();
      res.json({
        success: true,
        rules: rules,
        total: rules.length
      });
    } catch (error) {
      console.error('获取规则时出错:', error);
      res.status(500).json({
        success: false,
        error: '获取规则失败'
      });
    }
  }

  /**
   * 添加新规则
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async addRule(req, res) {
    try {
      const { rule_id, rule_name, trigger_type, trigger_content, response_type, response_content, priority, category } = req.body;

      if (!rule_name || !trigger_content || !response_content) {
        return res.status(400).json({
          success: false,
          error: '规则名称、触发内容和回复内容不能为空'
        });
      }

      const newRule = await ruleEngine.addRule({
        rule_id: rule_id || `R${Date.now()}`,
        rule_name,
        trigger_type: trigger_type || 'keyword',
        trigger_content,
        response_type: response_type || 'text',
        response_content,
        priority: priority || 5,
        category: category || null
      });

      res.json({
        success: true,
        rule: newRule,
        message: '规则添加成功'
      });
    } catch (error) {
      console.error('添加规则时出错:', error);
      res.status(500).json({
        success: false,
        error: '添加规则失败',
        message: error.message
      });
    }
  }

  /**
   * 测试AI连接
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async testAI(req, res) {
    try {
      const result = await aiService.testConnection();
      res.json(result);
    } catch (error) {
      console.error('测试AI连接时出错:', error);
      res.status(500).json({
        success: false,
        error: '测试失败',
        message: error.message
      });
    }
  }

  /**
   * 测试Discord连接
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async testDiscord(req, res) {
    try {
      const result = await discordService.testConnection();
      res.json(result);
    } catch (error) {
      console.error('测试Discord连接时出错:', error);
      res.status(500).json({
        success: false,
        error: '测试失败',
        message: error.message
      });
    }
  }
}

module.exports = new ChatController();
