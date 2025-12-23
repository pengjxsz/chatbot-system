# 🚀 PostgreSQL版本 - 快速开始

本指南帮助您快速启动使用PostgreSQL数据库的聊天机器人系统。

---

## ⚡ 超快速启动（3步）

### 步骤1：安装依赖

```powershell
cd E:\chatbot-1223\chatbot-system\backend
npm install
```

### 步骤2：配置数据库

确保 `.env` 文件存在并包含：

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=admission_db
DB_USER=postgres
DB_PASSWORD=20250820
```

### 步骤3：初始化数据库并启动

```powershell
# 创建表并导入Excel数据
npm run setup-db

# 测试数据库连接
npm run test-db

# 启动服务
npm start
```

完成！🎉

---

## 📋 详细步骤

### 1. 确认PostgreSQL已安装

```powershell
# 检查PostgreSQL
psql --version

# 检查服务状态
Get-Service postgresql*
```

**如果未安装PostgreSQL：**
- 下载: https://www.postgresql.org/download/windows/
- 安装时记住设置的密码（应该是：20250820）

### 2. 创建数据库（如果不存在）

打开 `cmd` 或 `PowerShell`：

```powershell
# 登录PostgreSQL
psql -U postgres

# 创建数据库（在psql中执行）
CREATE DATABASE admission_db;

# 退出
\q
```

### 3. 安装Node.js依赖

```powershell
cd backend
npm install
```

这将安装：
- `pg` - PostgreSQL客户端
- `xlsx` - Excel文件处理
- 其他依赖...

### 4. 配置环境变量

复制并编辑 `.env` 文件：

```powershell
Copy-Item .env.example .env

# 编辑.env文件，确保包含：
```

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=admission_db
DB_USER=postgres
DB_PASSWORD=20250820  # 您的PostgreSQL密码
```

### 5. 初始化数据库

```powershell
# 自动创建表并导入Excel数据
npm run setup-db
```

这个命令会：
1. ✓ 连接到PostgreSQL
2. ✓ 创建 `rulelibtable` 表
3. ✓ 从 `data/rulesLib001.xlsx` 导入6条规则
4. ✓ 验证导入结果

**预期输出：**
```
============================================================
规则库数据导入工具
============================================================

读取Excel文件: data/rulesLib001.xlsx
成功读取 6 条规则
创建规则库表...
规则库表创建成功!
开始导入 6 条规则...
✓ [1/6] 导入成功: 问候规则
✓ [2/6] 导入成功: 功能查询
✓ [3/6] 导入成功: 产品功能
✓ [4/6] 导入成功: 联系方式
✓ [5/6] 导入成功: 日期时间
✓ [6/6] 导入成功: 精确匹配测试

导入完成:
- 成功: 6 条
- 失败: 0 条
- 总计: 6 条
```

### 6. 测试数据库连接

```powershell
npm run test-db
```

**预期输出：**
```
============================================================
PostgreSQL数据库连接测试
============================================================

[1/4] 测试数据库连接...
✓ 数据库连接成功

[2/4] 检查rulelibtable表...
✓ rulelibtable表存在

[3/4] 查询表结构...
表字段:
  1. id (integer) NOT NULL
  2. rule_id (character varying) NOT NULL
  3. rule_name (character varying) NOT NULL
  ...

[4/4] 查询规则统计...
规则统计:
  - 总规则数: 6
  - 启用规则: 6
  - 禁用规则: 0
  - 分类数: 5

✓ 所有测试通过！数据库配置正确
```

### 7. 启动后端服务

```powershell
npm start
```

**成功启动的标志：**
```
=================================
🚀 聊天机器人后端服务已启动
📡 服务运行在: http://localhost:3001
=================================

从数据库加载了 6 条启用的规则
```

### 8. 启动前端（新终端）

```powershell
cd ..\frontend
npm install
npm run dev
```

### 9. 访问应用

浏览器打开：http://localhost:5173

试试发送：
- "你好" → 触发问候规则
- "功能" → 触发功能查询规则
- "联系" → 触发联系方式规则

---

## 🔍 验证系统工作正常

### 测试规则匹配

1. 打开聊天窗口
2. 输入 "你好"
3. 应该看到：
   ```
   您好！我是智能助手，很高兴为您服务。有什么可以帮到您吗？
   ```
4. 后端日志应显示：
   ```
   收到消息: 你好
   从数据库加载了 6 条启用的规则
   ✓ 规则匹配成功: [R001] 问候规则 (优先级: 10)
   ```

### 测试动态内容

1. 输入 "时间" 或 "几点"
2. 应该看到当前时间和日期
3. 这是 `dynamic` 类型的响应

### 测试AI降级

1. 输入一个不在规则库的问题，如 "什么是React？"
2. 系统找不到匹配规则，会调用千问AI
3. 后端日志显示：
   ```
   规则库未命中，调用AI服务...
   ```

---

## 🛠️ 常用命令

```powershell
# 测试数据库连接
npm run test-db

# 重新导入Excel数据
npm run setup-db

# 导入自定义Excel文件
npm run import-excel path/to/your/rules.xlsx

# 启动开发模式（自动重启）
npm run dev

# 启动生产模式
npm start
```

---

## 📊 管理规则库

### 使用pgAdmin（推荐）

1. 打开pgAdmin
2. 连接到 `localhost`
3. 展开 `admission_db` → `Schemas` → `public` → `Tables`
4. 右键 `rulelibtable` → `View/Edit Data` → `All Rows`

### 使用psql命令行

```sql
-- 连接到数据库
psql -U postgres -d admission_db

-- 查看所有规则
SELECT * FROM rulelibtable ORDER BY priority DESC;

-- 添加新规则
INSERT INTO rulelibtable (rule_id, rule_name, trigger_type, trigger_content, response_type, response_content, priority)
VALUES ('R007', '自定义规则', 'keyword', '测试,test', 'text', '这是测试回复', 7);

-- 修改规则
UPDATE rulelibtable SET response_content = '新的回复' WHERE rule_id = 'R007';

-- 禁用规则
UPDATE rulelibtable SET enabled = false WHERE rule_id = 'R007';

-- 删除规则
DELETE FROM rulelibtable WHERE rule_id = 'R007';

-- 退出
\q
```

---

## ❓ 常见问题

### Q1: `npm run setup-db` 失败

**错误：** `ECONNREFUSED` 或连接被拒绝

**解决：**
1. 确认PostgreSQL正在运行
   ```powershell
   Get-Service postgresql*
   ```
2. 启动服务
   ```powershell
   Start-Service postgresql-x64-14  # 根据版本调整
   ```

### Q2: 密码错误

**错误：** `password authentication failed`

**解决：**
1. 确认 `.env` 中的密码正确
2. 重置PostgreSQL密码（如需要）

### Q3: 数据库不存在

**错误：** `database "admission_db" does not exist`

**解决：**
```powershell
psql -U postgres
CREATE DATABASE admission_db;
\q
```

### Q4: 规则没有加载

**检查：**
```powershell
# 运行测试脚本
npm run test-db

# 查看日志
# 应该显示: 从数据库加载了 X 条启用的规则
```

---

## 🔄 重新开始（完全重置）

如果需要从头开始：

```powershell
# 1. 删除数据库（在psql中）
psql -U postgres
DROP DATABASE IF EXISTS admission_db;
CREATE DATABASE admission_db;
\q

# 2. 重新导入
cd backend
npm run setup-db

# 3. 验证
npm run test-db

# 4. 启动
npm start
```

---

## 🎯 下一步

现在您的系统已经：
- ✅ 连接到PostgreSQL数据库
- ✅ 导入了6条示例规则
- ✅ 可以从数据库匹配规则
- ✅ 支持动态内容和AI降级

您可以：
1. 📝 在Excel中编辑规则，重新导入
2. 🗄️ 使用pgAdmin可视化管理规则
3. 🔧 通过API动态添加/修改规则
4. 📈 扩展规则库，添加更多业务规则

---

## 📚 相关文档

- [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) - 详细数据库设置指南
- [README.md](./README.md) - 项目总览
- [QUICK_START.md](./QUICK_START.md) - 一般快速启动指南

祝使用愉快！🎉
