const XLSX = require('xlsx');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * 从Excel导入规则数据到PostgreSQL
 */
class DataImporter {
  /**
   * 读取Excel文件
   * @param {string} filePath - Excel文件路径
   * @returns {Array} - 规则数据数组
   */
  readExcel(filePath) {
    try {
      console.log('读取Excel文件:', filePath);
      
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // 转换为JSON
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`成功读取 ${data.length} 条规则`);
      return data;
    } catch (error) {
      console.error('读取Excel文件失败:', error);
      throw error;
    }
  }

  /**
   * 创建规则库表
   */
  async createTable() {
    try {
      console.log('创建规则库表...');
      
      const sqlPath = path.join(__dirname, 'init-table.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      await db.query(sql);
      console.log('规则库表创建成功!');
      return true;
    } catch (error) {
      console.error('创建表失败:', error);
      throw error;
    }
  }

  /**
   * 导入单条规则
   * @param {Object} rule - 规则数据
   */
  async importRule(rule) {
    const sql = `
      INSERT INTO rulelibtable (
        rule_id, rule_name, trigger_type, trigger_content,
        response_type, response_content, priority, enabled,
        category, tags, created_time, updated_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (rule_id) 
      DO UPDATE SET
        rule_name = EXCLUDED.rule_name,
        trigger_type = EXCLUDED.trigger_type,
        trigger_content = EXCLUDED.trigger_content,
        response_type = EXCLUDED.response_type,
        response_content = EXCLUDED.response_content,
        priority = EXCLUDED.priority,
        enabled = EXCLUDED.enabled,
        category = EXCLUDED.category,
        tags = EXCLUDED.tags,
        updated_time = CURRENT_TIMESTAMP
    `;

    const params = [
      rule.rule_id,
      rule.rule_name,
      rule.trigger_type || 'keyword',
      rule.trigger_content,
      rule.response_type || 'text',
      rule.response_content,
      rule.priority || 5,
      rule.enabled !== false,
      rule.category || null,
      rule.tags || null,
      rule.created_time || new Date(),
      rule.updated_time || new Date()
    ];

    try {
      await db.query(sql, params);
      return true;
    } catch (error) {
      console.error(`导入规则 ${rule.rule_id} 失败:`, error);
      throw error;
    }
  }

  /**
   * 批量导入规则
   * @param {Array} rules - 规则数据数组
   */
  async importRules(rules) {
    let successCount = 0;
    let failCount = 0;

    console.log(`开始导入 ${rules.length} 条规则...`);

    for (const rule of rules) {
      try {
        await this.importRule(rule);
        successCount++;
        console.log(`✓ [${successCount}/${rules.length}] 导入成功: ${rule.rule_name}`);
      } catch (error) {
        failCount++;
        console.error(`✗ 导入失败: ${rule.rule_name}`, error.message);
      }
    }

    console.log('\n导入完成:');
    console.log(`- 成功: ${successCount} 条`);
    console.log(`- 失败: ${failCount} 条`);
    console.log(`- 总计: ${rules.length} 条`);

    return { success: successCount, failed: failCount, total: rules.length };
  }

  /**
   * 从Excel文件导入数据
   * @param {string} excelPath - Excel文件路径
   */
  async importFromExcel(excelPath) {
    try {
      // 1. 读取Excel
      const rules = this.readExcel(excelPath);
      
      if (rules.length === 0) {
        console.log('Excel文件中没有数据');
        return;
      }

      // 2. 测试数据库连接
      const connected = await db.testConnection();
      if (!connected) {
        throw new Error('数据库连接失败');
      }

      // 3. 创建表（如果不存在）
      try {
        await this.createTable();
      } catch (error) {
        console.log('表可能已存在，继续导入数据...');
      }

      // 4. 导入数据
      const result = await this.importRules(rules);

      return result;
    } catch (error) {
      console.error('导入过程出错:', error);
      throw error;
    }
  }

  /**
   * 验证导入的数据
   */
  async verifyData() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN enabled = true THEN 1 END) as enabled_count,
          COUNT(DISTINCT category) as category_count
        FROM rulelibtable
      `);

      console.log('\n数据验证:');
      console.log(`- 总规则数: ${result.rows[0].total}`);
      console.log(`- 启用规则: ${result.rows[0].enabled_count}`);
      console.log(`- 分类数: ${result.rows[0].category_count}`);

      // 显示所有规则
      const rules = await db.query(`
        SELECT rule_id, rule_name, priority, enabled, category
        FROM rulelibtable
        ORDER BY priority DESC, rule_id
      `);

      console.log('\n已导入的规则:');
      rules.rows.forEach((rule, index) => {
        const status = rule.enabled ? '✓' : '✗';
        console.log(`${index + 1}. ${status} [${rule.rule_id}] ${rule.rule_name} (优先级: ${rule.priority}, 分类: ${rule.category})`);
      });

      return result.rows[0];
    } catch (error) {
      console.error('验证数据失败:', error);
      throw error;
    }
  }
}

// 如果直接运行此文件，则执行导入
if (require.main === module) {
  const importer = new DataImporter();
  
  // Excel文件路径（请根据实际情况修改）
  const excelPath = process.argv[2] || path.join(__dirname, '../../data/rulesLib001.xlsx');

  console.log('='.repeat(60));
  console.log('规则库数据导入工具');
  console.log('='.repeat(60));
  console.log();

  importer.importFromExcel(excelPath)
    .then(() => {
      console.log('\n验证导入的数据...');
      return importer.verifyData();
    })
    .then(() => {
      console.log('\n导入完成!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n导入失败:', error);
      process.exit(1);
    });
}

module.exports = DataImporter;
