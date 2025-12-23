const db = require('../config/database');

/**
 * 测试数据库连接和表结构
 */
async function testDatabaseConnection() {
  console.log('='.repeat(60));
  console.log('PostgreSQL数据库连接测试');
  console.log('='.repeat(60));
  console.log();

  try {
    // 1. 测试基本连接
    console.log('[1/4] 测试数据库连接...');
    const connected = await db.testConnection();
    
    if (!connected) {
      throw new Error('数据库连接失败');
    }
    console.log('✓ 数据库连接成功');
    console.log();

    // 2. 检查表是否存在
    console.log('[2/4] 检查rulelibtable表...');
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'rulelibtable'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('✗ rulelibtable表不存在');
      console.log('请先运行: node src/database/importData.js');
      process.exit(1);
    }
    console.log('✓ rulelibtable表存在');
    console.log();

    // 3. 查询表结构
    console.log('[3/4] 查询表结构...');
    const columns = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'rulelibtable'
      ORDER BY ordinal_position;
    `);

    console.log('表字段:');
    columns.rows.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    console.log();

    // 4. 查询规则统计
    console.log('[4/4] 查询规则统计...');
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_rules,
        COUNT(CASE WHEN enabled = true THEN 1 END) as enabled_rules,
        COUNT(CASE WHEN enabled = false THEN 1 END) as disabled_rules,
        COUNT(DISTINCT category) as categories
      FROM rulelibtable;
    `);

    const stat = stats.rows[0];
    console.log('规则统计:');
    console.log(`  - 总规则数: ${stat.total_rules}`);
    console.log(`  - 启用规则: ${stat.enabled_rules}`);
    console.log(`  - 禁用规则: ${stat.disabled_rules}`);
    console.log(`  - 分类数: ${stat.categories}`);
    console.log();

    // 5. 显示规则列表
    if (parseInt(stat.total_rules) > 0) {
      console.log('规则列表:');
      const rules = await db.query(`
        SELECT rule_id, rule_name, priority, enabled, category
        FROM rulelibtable
        ORDER BY priority DESC, rule_id
        LIMIT 10;
      `);

      rules.rows.forEach((rule, index) => {
        const status = rule.enabled ? '✓' : '✗';
        console.log(`  ${index + 1}. ${status} [${rule.rule_id}] ${rule.rule_name} (优先级: ${rule.priority}, 分类: ${rule.category || 'N/A'})`);
      });

      if (parseInt(stat.total_rules) > 10) {
        console.log(`  ... 还有 ${parseInt(stat.total_rules) - 10} 条规则`);
      }
    }

    console.log();
    console.log('='.repeat(60));
    console.log('✓ 所有测试通过！数据库配置正确');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error();
    console.error('✗ 测试失败:', error.message);
    console.error();
    console.error('可能的原因:');
    console.error('  1. PostgreSQL服务未启动');
    console.error('  2. 数据库连接信息错误（检查.env文件）');
    console.error('  3. admission_db数据库不存在');
    console.error('  4. rulelibtable表未创建');
    console.error();
    console.error('解决方法:');
    console.error('  1. 启动PostgreSQL服务');
    console.error('  2. 检查.env中的数据库配置');
    console.error('  3. 运行: node src/database/importData.js');
    console.error();
    
    process.exit(1);
  }
}

// 运行测试
testDatabaseConnection();
