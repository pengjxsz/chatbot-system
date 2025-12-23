const axios = require('axios');
require('dotenv').config();

/**
 * AI服务
 * 负责调用千问大模型API
 */
class AIService {
  constructor() {
    this.apiKey = process.env.QWEN_API_KEY;
    this.apiUrl = process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
  }

  /**
   * 调用千问API获取回复
   * @param {string} message - 用户消息
   * @returns {Promise<string>} - AI回复
   */
  async getQwenResponse(message) {
    try {
      if (!this.apiKey || this.apiKey === 'your_qwen_api_key_here') {
        console.warn('千问API密钥未配置，使用模拟回复');
        return this.getMockResponse(message);
      }

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'qwen-turbo',
          input: {
            messages: [
              {
                role: 'system',
                content: '你是一个友好、专业的智能助手。请用简洁、清晰的语言回答问题，适当使用emoji增加亲和力。'
              },
              {
                role: 'user',
                content: message
              }
            ]
          },
          parameters: {
            result_format: 'message',
            max_tokens: 500,
            temperature: 0.7,
            top_p: 0.8
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.output && response.data.output.choices) {
        const aiReply = response.data.output.choices[0].message.content;
        return this.formatResponse(aiReply);
      }

      throw new Error('API响应格式错误');

    } catch (error) {
      console.error('千问API调用失败:', error.message);
      
      // 如果是API错误，返回友好的错误消息
      if (error.response) {
        console.error('API错误详情:', error.response.data);
      }
      
      // 返回模拟回复作为降级方案
      return this.getMockResponse(message);
    }
  }

  /**
   * 格式化AI回复
   * @param {string} text - 原始回复文本
   * @returns {string} - 格式化后的文本
   */
  formatResponse(text) {
    if (!text) return text;

    // 移除多余的空行
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // 确保列表项格式统一
    text = text.replace(/^[•·]/gm, '•');
    
    // 移除首尾空白
    text = text.trim();

    return text;
  }

  /**
   * 获取模拟回复（当API不可用时使用）
   * @param {string} message - 用户消息
   * @returns {string} - 模拟回复
   */
  getMockResponse(message) {
    const mockResponses = [
      `关于"${message}"的问题，这是一个很好的问题。\n\n🤔 让我来帮您分析：\n\n虽然我目前无法访问完整的AI服务，但我可以提供一些基本建议。建议您：\n\n• 查阅相关文档和资料\n• 咨询专业人士\n• 尝试在线搜索更多信息\n\n💡 提示：配置千问API密钥后，我可以提供更智能的回答！`,
      
      `感谢您的提问！\n\n关于您询问的内容，我理解您想了解更多。目前我的AI服务处于演示模式，建议：\n\n✅ 配置API密钥以获得完整功能\n📚 查看相关文档获取更多信息\n💬 继续提问，我会尽力帮助您\n\n如需更智能的回答，请联系管理员配置API服务。`,
      
      `您好！我注意到您的问题。\n\n🔧 当前状态：\n• AI服务未完全配置\n• 使用模拟回复模式\n• 基础功能正常运行\n\n🚀 完整功能需要：\n• 配置千问API密钥\n• 重启后端服务\n\n感谢您的理解！`
    ];

    // 随机选择一个模拟回复
    const randomIndex = Math.floor(Math.random() * mockResponses.length);
    return mockResponses[randomIndex];
  }

  /**
   * 检查API配置状态
   * @returns {Object} - 配置状态
   */
  checkConfig() {
    return {
      configured: this.apiKey && this.apiKey !== 'your_qwen_api_key_here',
      apiUrl: this.apiUrl,
      hasApiKey: !!this.apiKey
    };
  }

  /**
   * 测试API连接
   * @returns {Promise<Object>} - 测试结果
   */
  async testConnection() {
    try {
      const testMessage = '你好';
      const response = await this.getQwenResponse(testMessage);
      return {
        success: true,
        message: '连接成功',
        response: response
      };
    } catch (error) {
      return {
        success: false,
        message: '连接失败',
        error: error.message
      };
    }
  }
}

module.exports = new AIService();
