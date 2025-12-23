const axios = require('axios');
require('dotenv').config();

/**
 * Discord服务
 * 支持Webhook和Bot API两种集成方式
 */
class DiscordService {
  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    this.botToken = process.env.DISCORD_BOT_TOKEN;
    this.channelId = process.env.DISCORD_CHANNEL_ID;
    this.enabled = process.env.ENABLE_DISCORD_FALLBACK === 'true';
  }

  /**
   * 检查Discord配置
   * @returns {Object} - 配置状态
   */
  checkConfig() {
    const hasWebhook = this.webhookUrl && this.webhookUrl !== 'your_discord_webhook_url_here';
    const hasBot = this.botToken && this.botToken !== 'your_discord_bot_token_here';

    return {
      enabled: this.enabled,
      hasWebhook: hasWebhook,
      hasBot: hasBot,
      configured: hasWebhook || hasBot
    };
  }

  /**
   * 使用Webhook发送消息到Discord
   * @param {string} question - 用户问题
   * @returns {Promise<string>} - Discord回复
   */
  async sendViaWebhook(question) {
    try {
      if (!this.webhookUrl || this.webhookUrl === 'your_discord_webhook_url_here') {
        throw new Error('Discord Webhook未配置');
      }

      console.log('使用Discord Webhook发送问题...');

      // 发送问题到Discord
      const response = await axios.post(this.webhookUrl, {
        content: `❓ 用户提问：${question}`,
        username: 'ChatBot Query'
      }, {
        timeout: 10000
      });

      // Webhook只能发送，无法接收回复
      // 返回一个提示消息
      const reply = `您的问题已发送到Discord社区，我们的团队会尽快回复您。\n\n您也可以直接访问我们的Discord服务器获取即时帮助。`;

      return reply;
    } catch (error) {
      console.error('Discord Webhook发送失败:', error.message);
      throw error;
    }
  }

  /**
   * 使用Bot API与Discord交互
   * @param {string} question - 用户问题
   * @returns {Promise<string>} - Discord回复
   */
  async sendViaBotAPI(question) {
    try {
      if (!this.botToken || this.botToken === 'your_discord_bot_token_here') {
        throw new Error('Discord Bot Token未配置');
      }

      if (!this.channelId || this.channelId === 'your_discord_channel_id_here') {
        throw new Error('Discord Channel ID未配置');
      }

      console.log('使用Discord Bot API发送问题...');

      // 1. 发送消息到Discord频道
      const messageResponse = await axios.post(
        `https://discord.com/api/v10/channels/${this.channelId}/messages`,
        {
          content: `🤖 **ChatBot Query**\n❓ ${question}\n\n_等待回复..._`
        },
        {
          headers: {
            'Authorization': `Bot ${this.botToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const messageId = messageResponse.data.id;
      console.log(`消息已发送到Discord，ID: ${messageId}`);

      // 2. 等待回复（轮询或使用模拟回复）
      // 注意：实际应用中应该使用WebSocket监听或webhook接收回复
      // 这里使用模拟回复
      const reply = await this.waitForDiscordReply(messageId);

      return reply;
    } catch (error) {
      console.error('Discord Bot API调用失败:', error.message);
      if (error.response) {
        console.error('Discord API错误详情:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * 等待Discord回复（模拟）
   * @param {string} messageId - 消息ID
   * @returns {Promise<string>} - 回复内容
   */
  async waitForDiscordReply(messageId) {
    // 实际应用中，这里应该：
    // 1. 使用Discord Gateway WebSocket监听回复
    // 2. 或使用webhook接收回复
    // 3. 或轮询检查消息的回复
    
    // 这里返回一个提示消息
    return `您的问题已提交到Discord社区（消息ID: ${messageId}），我们的专家团队会尽快回复。\n\n💡 提示：您可以访问Discord服务器查看实时回复。`;
  }

  /**
   * 获取Discord响应（主方法）
   * @param {string} question - 用户问题
   * @returns {Promise<string>} - Discord回复
   */
  async getDiscordResponse(question) {
    try {
      // 检查是否启用
      if (!this.enabled) {
        console.log('Discord降级功能未启用');
        return this.getDefaultResponse(question);
      }

      const config = this.checkConfig();

      // 优先使用Bot API（功能更完整）
      if (config.hasBot) {
        try {
          return await this.sendViaBotAPI(question);
        } catch (error) {
          console.log('Bot API失败，尝试Webhook...');
          if (config.hasWebhook) {
            return await this.sendViaWebhook(question);
          }
          throw error;
        }
      }

      // 降级使用Webhook
      if (config.hasWebhook) {
        return await this.sendViaWebhook(question);
      }

      // 都未配置，返回默认回复
      console.log('Discord未配置，返回默认回复');
      return this.getDefaultResponse(question);

    } catch (error) {
      console.error('Discord服务调用失败:', error.message);
      return this.getDefaultResponse(question);
    }
  }

  /**
   * 获取默认回复（当Discord不可用时）
   * @param {string} question - 用户问题
   * @returns {string} - 默认回复
   */
  getDefaultResponse(question) {
    return `抱歉，我暂时无法回答您的问题："${question}"。\n\n💡 建议：\n• 请尝试换一种方式提问\n• 访问我们的帮助中心\n• 联系人工客服获取帮助\n\n客服邮箱：support@example.com\n客服热线：400-XXX-XXXX`;
  }

  /**
   * 发送通知到Discord（用于系统通知）
   * @param {string} message - 通知消息
   * @param {string} type - 消息类型 (info/warning/error)
   * @returns {Promise<boolean>} - 是否发送成功
   */
  async sendNotification(message, type = 'info') {
    try {
      const config = this.checkConfig();

      if (!config.hasWebhook) {
        return false;
      }

      const colors = {
        info: '🔵',
        warning: '⚠️',
        error: '🔴'
      };

      const emoji = colors[type] || '💬';

      await axios.post(this.webhookUrl, {
        content: `${emoji} **系统通知**\n${message}`,
        username: 'ChatBot System'
      });

      return true;
    } catch (error) {
      console.error('发送Discord通知失败:', error.message);
      return false;
    }
  }

  /**
   * 测试Discord连接
   * @returns {Promise<Object>} - 测试结果
   */
  async testConnection() {
    try {
      const config = this.checkConfig();

      if (!config.configured) {
        return {
          success: false,
          message: 'Discord未配置',
          details: 'Webhook和Bot Token都未设置'
        };
      }

      // 测试Webhook
      if (config.hasWebhook) {
        try {
          await axios.post(this.webhookUrl, {
            content: '✅ ChatBot连接测试成功！',
            username: 'ChatBot Test'
          });

          return {
            success: true,
            message: 'Discord Webhook连接成功',
            method: 'webhook'
          };
        } catch (error) {
          console.error('Webhook测试失败:', error.message);
        }
      }

      // 测试Bot API
      if (config.hasBot && config.channelId) {
        try {
          const response = await axios.get(
            `https://discord.com/api/v10/channels/${this.channelId}`,
            {
              headers: {
                'Authorization': `Bot ${this.botToken}`
              }
            }
          );

          return {
            success: true,
            message: 'Discord Bot API连接成功',
            method: 'bot',
            channel: response.data.name
          };
        } catch (error) {
          console.error('Bot API测试失败:', error.message);
        }
      }

      return {
        success: false,
        message: 'Discord连接测试失败',
        details: '请检查配置是否正确'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Discord测试失败',
        error: error.message
      };
    }
  }
}

module.exports = new DiscordService();
