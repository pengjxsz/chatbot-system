const { Pool } = require('pg');
require('dotenv').config();

/**
 * PostgreSQL数据库配置和连接池
 */
class Database {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'admission_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '20250820',
      max: 20, // 最大连接数
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // 监听连接错误
    this.pool.on('error', (err) => {
      console.error('数据库连接池错误:', err);
    });
  }

  /**
   * 执行查询
   * @param {string} text - SQL查询语句
   * @param {Array} params - 查询参数
   * @returns {Promise} - 查询结果
   */
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('执行查询:', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('查询错误:', error);
      throw error;
    }
  }

  /**
   * 获取单个客户端连接（用于事务）
   * @returns {Promise} - 客户端连接
   */
  async getClient() {
    const client = await this.pool.connect();
    const query = client.query;
    const release = client.release;

    // 设置超时
    const timeout = setTimeout(() => {
      console.error('客户端连接超过5秒未释放!');
    }, 5000);

    // 重写release方法
    client.release = () => {
      clearTimeout(timeout);
      client.query = query;
      client.release = release;
      return release.apply(client);
    };

    return client;
  }

  /**
   * 测试数据库连接
   * @returns {Promise<boolean>} - 连接是否成功
   */
  async testConnection() {
    try {
      const result = await this.query('SELECT NOW()');
      console.log('数据库连接成功!', result.rows[0]);
      return true;
    } catch (error) {
      console.error('数据库连接失败:', error.message);
      return false;
    }
  }

  /**
   * 关闭连接池
   */
  async close() {
    await this.pool.end();
    console.log('数据库连接池已关闭');
  }
}

// 创建单例
const db = new Database();

module.exports = db;
