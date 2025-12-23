# PostgreSQL 数据库设置指南

本指南帮助您配置PostgreSQL数据库以存储聊天机器人规则库。

## 📋 前提条件

- PostgreSQL 已安装（版本 12 或更高）
- 数据库名称：`admission_db`
- 用户名：`postgres`
- 密码：`20250820`

---

## 🚀 快速开始

### 方式一：自动设置（推荐）⭐

**Windows用户：**

1. 确保PostgreSQL已安装并运行
2. 进入backend目录
3. 运行设置脚本：

```powershell
cd E:\chatbot-1223\chatbot-system\backend

# 安装依赖
npm install

# 创建数据库和表，导入数据
npm run setup-db
```

---

### 方式二：手动设置

#### 步骤1：验证PostgreSQL安装

```powershell
# 检查PostgreSQL是否运行
pg_isready

# 查看版本
psql --version
```

#### 步骤2：创建数据库（如果不存在）

打开 **PostgreSQL命令行** (psql) 或 **pgAdmin**：

```sql
-- 连接到postgres数据库
psql -U postgres

-- 创建admission_db数据库（如果不存在）
CREATE DATABASE admission_db;

-- 连接到admission_db
\c admission_db

-- 验证连接
SELECT current_database();
```

#### 步骤3：创建规则库表

在backend目录运行：

```powershell
# 方法1: 使用Node.js脚本
node src/database/importData.js

# 方法2: 直接使用psql
psql -U postgres -d admission_db -f src/database/init-table.sql
```

#### 步骤4：导入Excel数据

```powershell
# 运行导入脚本
node src/database/importData.js data/rulesLib001.xlsx
```

---

## 📝 配置环境变量

确保 `.env` 文件包含以下配置：

```env
# PostgreSQL数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=admission_db
DB_USER=postgres
DB_PASSWORD=20250820
RULE_TABLE_NAME=rulelibtable
```

---

## 🔍 验证安装

### 方法1：使用psql验证

```sql
-- 连接到数据库
psql -U postgres -d admission_db

-- 查看表结构
\d rulelibtable

-- 查看规则数量
SELECT COUNT(*) FROM rulelibtable;

-- 查看所有规则
SELECT rule_id, rule_name, priority, enabled FROM rulelibtable ORDER BY priority DESC;

-- 退出
\q
```

### 方法2：使用测试脚本

```powershell
# 运行测试脚本
node src/database/testConnection.js
```

---

## 📊 数据库表结构

```sql
CREATE TABLE rulelibtable (
    id SERIAL PRIMARY KEY,                  -- 自增主键
    rule_id VARCHAR(50) UNIQUE NOT NULL,    -- 规则ID
    rule_name VARCHAR(200) NOT NULL,        -- 规则名称
    trigger_type VARCHAR(50) NOT NULL,      -- 触发类型
    trigger_content TEXT NOT NULL,          -- 触发内容
    response_type VARCHAR(50) NOT NULL,     -- 响应类型
    response_content TEXT NOT NULL,         -- 响应内容
    priority INTEGER DEFAULT 5,             -- 优先级
    enabled BOOLEAN DEFAULT true,           -- 是否启用
    category VARCHAR(100),                  -- 分类
    tags VARCHAR(500),                      -- 标签
    created_time TIMESTAMP,                 -- 创建时间
    updated_time TIMESTAMP                  -- 更新时间
);
```

---

## 🛠️ 常用SQL命令

### 查询规则

```sql
-- 查看所有启用的规则
SELECT * FROM rulelibtable WHERE enabled = true ORDER BY priority DESC;

-- 搜索包含特定关键词的规则
SELECT * FROM rulelibtable WHERE trigger_content LIKE '%你好%';

-- 按分类查询
SELECT * FROM rulelibtable WHERE category = 'greeting';

-- 查看优先级最高的5条规则
SELECT rule_id, rule_name, priority FROM rulelibtable ORDER BY priority DESC LIMIT 5;
```

### 添加规则

```sql
INSERT INTO rulelibtable (
    rule_id, rule_name, trigger_type, trigger_content,
    response_type, response_content, priority, enabled, category
) VALUES (
    'R007', '测试规则', 'keyword', '测试,test',
    'text', '这是一条测试规则', 8, true, 'test'
);
```

### 更新规则

```sql
-- 更新响应内容
UPDATE rulelibtable 
SET response_content = '更新后的回复内容'
WHERE rule_id = 'R001';

-- 修改优先级
UPDATE rulelibtable 
SET priority = 10
WHERE rule_id = 'R001';

-- 禁用规则
UPDATE rulelibtable 
SET enabled = false
WHERE rule_id = 'R007';
```

### 删除规则

```sql
-- 删除特定规则
DELETE FROM rulelibtable WHERE rule_id = 'R007';

-- 删除所有禁用的规则
DELETE FROM rulelibtable WHERE enabled = false;
```

### 统计信息

```sql
-- 规则统计
SELECT 
    COUNT(*) as total_rules,
    COUNT(CASE WHEN enabled = true THEN 1 END) as enabled_rules,
    COUNT(DISTINCT category) as categories,
    AVG(priority) as avg_priority
FROM rulelibtable;

-- 按分类统计
SELECT category, COUNT(*) as count 
FROM rulelibtable 
GROUP BY category 
ORDER BY count DESC;
```

---

## 🔧 常见问题

### Q1: 连接数据库失败

**错误：** `ECONNREFUSED` 或 `password authentication failed`

**解决：**
1. 确认PostgreSQL服务正在运行
2. 检查用户名和密码是否正确
3. 验证数据库名称是否存在

```powershell
# Windows - 检查服务状态
Get-Service postgresql*

# 启动PostgreSQL服务
Start-Service postgresql-x64-14  # 根据您的版本调整
```

### Q2: 表已存在错误

**错误：** `relation "rulelibtable" already exists`

**解决：**

```sql
-- 删除现有表并重新创建
DROP TABLE IF EXISTS rulelibtable CASCADE;
```

然后重新运行创建脚本。

### Q3: 导入数据失败

**错误：** Excel文件找不到

**解决：**
```powershell
# 确保Excel文件在正确位置
ls data/rulesLib001.xlsx

# 指定完整路径
node src/database/importData.js "E:\chatbot-1223\chatbot-system\backend\data\rulesLib001.xlsx"
```

### Q4: 权限不足

**错误：** `permission denied for table rulelibtable`

**解决：**
```sql
-- 授予权限
GRANT ALL PRIVILEGES ON TABLE rulelibtable TO postgres;
GRANT ALL PRIVILEGES ON SEQUENCE rulelibtable_id_seq TO postgres;
```

---

## 📱 使用pgAdmin管理

如果您安装了pgAdmin：

1. 打开pgAdmin
2. 连接到localhost
3. 展开 `admission_db` 数据库
4. 找到 `rulelibtable` 表
5. 右键 -> View/Edit Data -> All Rows

这样可以可视化地查看和编辑规则。

---

## 🔄 备份和恢复

### 备份数据库

```powershell
# 备份整个数据库
pg_dump -U postgres -d admission_db -f backup.sql

# 仅备份rulelibtable表
pg_dump -U postgres -d admission_db -t rulelibtable -f rulelibtable_backup.sql
```

### 恢复数据库

```powershell
# 恢复数据库
psql -U postgres -d admission_db -f backup.sql
```

---

## 🎯 下一步

数据库设置完成后：

1. 启动后端服务：`npm start`
2. 测试规则匹配：发送 "你好" 应该触发问候规则
3. 查看日志确认从数据库加载规则

成功的日志输出：
```
从数据库加载了 6 条启用的规则
✓ 规则匹配成功: [R001] 问候规则 (优先级: 10)
```

---

## 📚 相关文档

- PostgreSQL官方文档: https://www.postgresql.org/docs/
- pgAdmin下载: https://www.pgadmin.org/download/
- Node.js pg库文档: https://node-postgres.com/

---

如有问题，请检查：
1. PostgreSQL服务是否运行
2. 数据库连接信息是否正确
3. 防火墙是否阻止连接
4. 用户权限是否足够
