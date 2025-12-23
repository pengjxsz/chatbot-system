const db = require('../config/database');

/**
 * 规则引擎服务 - PostgreSQL版本
 * 从数据库读取规则并进行匹配
 */
class RuleEngine {
  constructor() {
    this.cachedRules = null;
    this.cacheTime = null;
    this.cacheTimeout = 5 * 60 * 1000; // 缓存5分钟
  }

  /**
   * 从数据库加载规则
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Array>} - 规则列表
   */
  async loadRules(forceRefresh = false) {
    try {
      // 检查缓存
      const now = Date.now();
      if (!forceRefresh && this.cachedRules && this.cacheTime && (now - this.cacheTime < this.cacheTimeout)) {
        return this.cachedRules;
      }

      // 从数据库加载
      const result = await db.query(`
        SELECT 
          id, rule_id, rule_name, trigger_type, trigger_content,
          response_type, response_content, priority, enabled,
          category, tags, created_time, updated_time
        FROM rulelibtable
        WHERE enabled = true
        ORDER BY priority DESC, id ASC
      `);

      this.cachedRules = result.rows;
      this.cacheTime = now;

      console.log(`从数据库加载了 ${this.cachedRules.length} 条启用的规则`);
      return this.cachedRules;
    } catch (error) {
      console.error('从数据库加载规则失败:', error);
      
      // 如果数据库失败，返回空数组或缓存的旧数据
      if (this.cachedRules) {
        console.log('使用缓存的规则数据');
        return this.cachedRules;
      }
      
      return [];
    }
  }

  /**
   * 处理动态响应内容
   * @param {string} content - 响应内容模板
   * @returns {string} - 处理后的内容
   */
  processDynamicContent(content) {
    const now = new Date();
    
    // 替换时间变量
    const replacements = {
      '{time}': now.toLocaleTimeString('zh-CN'),
      '{date}': now.toLocaleDateString('zh-CN'),
      '{weekday}': ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()],
      '{year}': now.getFullYear(),
      '{month}': now.getMonth() + 1,
      '{day}': now.getDate(),
      '{hour}': now.getHours(),
      '{minute}': now.getMinutes()
    };

    let result = content;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return result;
  }

  /**
   * 检查关键词匹配
   * @param {string} message - 用户消息
   * @param {string} triggerContent - 触发内容（逗号分隔的关键词）
   * @returns {boolean} - 是否匹配
   */
  matchKeywords(message, triggerContent) {
    const normalizedMessage = message.toLowerCase().trim();
    const keywords = triggerContent.split(',').map(k => k.trim().toLowerCase());
    
    return keywords.some(keyword => normalizedMessage.includes(keyword));
  }

  /**
   * 精确匹配
   * @param {string} message - 用户消息
   * @param {string} triggerContent - 触发内容
   * @returns {boolean} - 是否匹配
   */
  matchExact(message, triggerContent) {
    return message.trim().toLowerCase() === triggerContent.trim().toLowerCase();
  }

  /**
   * 正则表达式匹配
   * @param {string} message - 用户消息
   * @param {string} triggerContent - 正则表达式
   * @returns {boolean} - 是否匹配
   */
  matchRegex(message, triggerContent) {
    try {
      const regex = new RegExp(triggerContent, 'i');
      return regex.test(message);
    } catch (error) {
      console.error('正则表达式错误:', error);
      return false;
    }
  }

  /**
   * 匹配规则
   * @param {string} message - 用户输入的消息
   * @returns {Promise<Object|null>} - 匹配到的规则或null
   */
  async matchRule(message) {
    if (!message || typeof message !== 'string') {
      return null;
    }

    try {
      // 加载规则
      const rules = await this.loadRules();

      if (rules.length === 0) {
        console.log('没有可用的规则');
        return null;
      }

      // 遍历规则（已按优先级排序）
      for (const rule of rules) {
        let matched = false;

        // 根据触发类型进行匹配
        switch (rule.trigger_type) {
          case 'keyword':
            matched = this.matchKeywords(message, rule.trigger_content);
            break;
          case 'exact':
            matched = this.matchExact(message, rule.trigger_content);
            break;
          case 'regex':
            matched = this.matchRegex(message, rule.trigger_content);
            break;
          default:
            console.warn(`未知的触发类型: ${rule.trigger_type}`);
            continue;
        }

        if (matched) {
          // 处理响应内容
          let responseContent = rule.response_content;
          
          if (rule.response_type === 'dynamic') {
            responseContent = this.processDynamicContent(responseContent);
          }

          console.log(`✓ 规则匹配成功: [${rule.rule_id}] ${rule.rule_name} (优先级: ${rule.priority})`);

          return {
            id: rule.id,
            ruleId: rule.rule_id,
            ruleName: rule.rule_name,
            response: responseContent,
            matchedRule: true,
            priority: rule.priority,
            category: rule.category
          };
        }
      }

      console.log('未找到匹配的规则');
      return null;
    } catch (error) {
      console.error('匹配规则时出错:', error);
      return null;
    }
  }

  /**
   * 获取所有规则
   * @returns {Promise<Array>} - 规则列表
   */
  async getAllRules() {
    try {
      const result = await db.query(`
        SELECT 
          id, rule_id, rule_name, trigger_type, trigger_content,
          response_type, response_content, priority, enabled,
          category, tags, created_time, updated_time
        FROM rulelibtable
        ORDER BY priority DESC, id ASC
      `);

      return result.rows;
    } catch (error) {
      console.error('获取规则列表失败:', error);
      return [];
    }
  }

  /**
   * 添加新规则
   * @param {Object} rule - 新规则对象
   * @returns {Promise<Object>} - 添加的规则
   */
  async addRule(rule) {
    try {
      const sql = `
        INSERT INTO rulelibtable (
          rule_id, rule_name, trigger_type, trigger_content,
          response_type, response_content, priority, enabled,
          category, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const params = [
        rule.rule_id || `R${Date.now()}`,
        rule.rule_name,
        rule.trigger_type || 'keyword',
        rule.trigger_content,
        rule.response_type || 'text',
        rule.response_content,
        rule.priority || 5,
        rule.enabled !== false,
        rule.category || null,
        rule.tags || null
      ];

      const result = await db.query(sql, params);
      
      // 清除缓存
      this.cachedRules = null;
      
      console.log(`添加规则成功: ${rule.rule_name}`);
      return result.rows[0];
    } catch (error) {
      console.error('添加规则失败:', error);
      throw error;
    }
  }

  /**
   * 更新规则
   * @param {string} ruleId - 规则ID
   * @param {Object} updates - 更新内容
   * @returns {Promise<Object|null>} - 更新后的规则或null
   */
  async updateRule(ruleId, updates) {
    try {
      const fields = [];
      const params = [];
      let paramIndex = 1;

      // 动态构建更新字段
      const allowedFields = [
        'rule_name', 'trigger_type', 'trigger_content',
        'response_type', 'response_content', 'priority',
        'enabled', 'category', 'tags'
      ];

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          fields.push(`${field} = $${paramIndex}`);
          params.push(updates[field]);
          paramIndex++;
        }
      }

      if (fields.length === 0) {
        return null;
      }

      params.push(ruleId);
      const sql = `
        UPDATE rulelibtable
        SET ${fields.join(', ')}
        WHERE rule_id = $${paramIndex}
        RETURNING *
      `;

      const result = await db.query(sql, params);
      
      // 清除缓存
      this.cachedRules = null;

      if (result.rows.length > 0) {
        console.log(`更新规则成功: ${ruleId}`);
        return result.rows[0];
      }

      return null;
    } catch (error) {
      console.error('更新规则失败:', error);
      throw error;
    }
  }

  /**
   * 删除规则
   * @param {string} ruleId - 规则ID
   * @returns {Promise<boolean>} - 是否删除成功
   */
  async deleteRule(ruleId) {
    try {
      const result = await db.query(
        'DELETE FROM rulelibtable WHERE rule_id = $1',
        [ruleId]
      );

      // 清除缓存
      this.cachedRules = null;

      const success = result.rowCount > 0;
      if (success) {
        console.log(`删除规则成功: ${ruleId}`);
      }

      return success;
    } catch (error) {
      console.error('删除规则失败:', error);
      throw error;
    }
  }

  /**
   * 获取规则统计信息
   * @returns {Promise<Object>} - 统计信息
   */
  async getStats() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_rules,
          COUNT(CASE WHEN enabled = true THEN 1 END) as enabled_rules,
          COUNT(CASE WHEN enabled = false THEN 1 END) as disabled_rules,
          COUNT(DISTINCT category) as categories,
          AVG(priority) as avg_priority,
          MAX(priority) as max_priority,
          MIN(priority) as min_priority
        FROM rulelibtable
      `);

      return result.rows[0];
    } catch (error) {
      console.error('获取统计信息失败:', error);
      return {
        total_rules: 0,
        enabled_rules: 0,
        disabled_rules: 0,
        categories: 0
      };
    }
  }

  /**
   * 清除规则缓存
   */
  clearCache() {
    this.cachedRules = null;
    this.cacheTime = null;
    console.log('规则缓存已清除');
  }
}

module.exports = new RuleEngine();
