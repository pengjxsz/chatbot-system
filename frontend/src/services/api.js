import axios from 'axios';

// API基础URL
const API_BASE_URL = 'http://localhost:3001/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.url);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('响应错误:', error);
    if (error.response) {
      // 服务器返回错误状态码
      return Promise.reject({
        message: error.response.data.error || '服务器错误',
        status: error.response.status
      });
    } else if (error.request) {
      // 请求已发送但没有收到响应
      return Promise.reject({
        message: '无法连接到服务器，请检查后端服务是否已启动',
        status: 0
      });
    } else {
      // 其他错误
      return Promise.reject({
        message: error.message || '发生未知错误',
        status: -1
      });
    }
  }
);

/**
 * API服务
 */
const apiService = {
  /**
   * 发送聊天消息
   * @param {string} message - 用户消息
   * @returns {Promise} - 返回机器人回复
   */
  async sendMessage(message) {
    try {
      const response = await apiClient.post('/chat', { message });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 获取系统状态
   * @returns {Promise} - 返回系统状态
   */
  async getStatus() {
    try {
      const response = await apiClient.get('/chat/status');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 获取所有规则
   * @returns {Promise} - 返回规则列表
   */
  async getRules() {
    try {
      const response = await apiClient.get('/chat/rules');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 测试AI连接
   * @returns {Promise} - 返回测试结果
   */
  async testAI() {
    try {
      const response = await apiClient.get('/chat/test');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default apiService;
