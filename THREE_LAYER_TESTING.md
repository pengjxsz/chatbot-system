# 三层降级机制 - 完整测试指南

本指南帮助您测试聊天机器人的三层回答机制：**规则库 → 千问AI → Discord**

---

## 📋 测试准备

### 1. 确认系统状态

```powershell
# 启动后端
cd backend
npm start

# 在新终端检查状态
curl http://localhost:3001/api/chat/status
```

**预期返回：**
```json
{
  "success": true,
  "status": "running",
  "layers": {
    "rule": {
      "enabled": true,
      "total_rules": 6,
      "enabled_rules": 6
    },
    "ai": {
      "enabled": true,
      "configured": true
    },
    "discord": {
      "enabled": true,
      "configured": true,
      "hasWebhook": true
    }
  }
}
```

### 2. 验证PostgreSQL

```powershell
# 运行验证脚本
.\verify-postgresql.ps1

# 或测试数据库
npm run test-db
```

### 3. 验证Discord配置

```powershell
# 测试Discord连接
curl http://localhost:3001/api/chat/test-discord
```

---

## 🎯 三层降级测试

### 第一层测试：规则库匹配

#### 测试1.1：问候规则（优先级10）

**发送：** "你好"

**预期结果：**
```json
{
  "success": true,
  "reply": "您好！我是智能助手，很高兴为您服务。有什么可以帮到您吗？",
  "source": "rule",
  "ruleId": "R001",
  "ruleName": "问候规则",
  "priority": 10
}
```

**后端日志：**
```
==========================================================
收到消息: 你好
==========================================================

[第一层] 尝试规则库匹配...
✓ 规则库匹配成功！
  规则ID: R001
  规则名称: 问候规则
  优先级: 10
```

#### 测试1.2：功能查询（优先级8）

**发送：** "功能" 或 "能做什么"

**预期：** 触发R002功能查询规则

#### 测试1.3：动态内容（优先级5）

**发送：** "时间" 或 "几点"

**预期：** 触发R005日期时间规则，显示当前时间

**返回示例：**
```
当前时间: 14:30:15
当前日期: 2025/12/23
今天是: 星期二
```

#### 测试1.4：精确匹配（优先级9）

**发送：** "who are you" （必须精确匹配）

**预期：** 触发R006精确匹配测试规则

---

### 第二层测试：千问AI

#### 测试2.1：AI回答（规则库未命中）

**发送：** "什么是React？"

**预期结果：**
```json
{
  "success": true,
  "reply": "React是一个用于构建用户界面的JavaScript库...",
  "source": "ai",
  "model": "qwen"
}
```

**后端日志：**
```
[第一层] 尝试规则库匹配...
✗ 规则库未找到匹配

[第二层] 调用千问AI大模型...
✓ 千问AI回复成功
  回复长度: 150 字符
```

#### 测试2.2：技术问题

**发送：** "如何使用PostgreSQL？"

**预期：** AI提供详细回答

#### 测试2.3：一般知识

**发送：** "中国的首都是哪里？"

**预期：** AI回答：北京

---

### 第三层测试：Discord降级

#### 测试3.1：Webhook发送

**发送：** "这是一个非常特殊的问题xyz123"

**预期结果：**
```json
{
  "success": true,
  "reply": "您的问题已发送到Discord社区，我们的团队会尽快回复您...",
  "source": "discord"
}
```

**Discord验证：**
- 检查Discord频道
- 应该看到新消息：`❓ 用户提问：这是一个非常特殊的问题xyz123`

**后端日志：**
```
[第一层] 尝试规则库匹配...
✗ 规则库未找到匹配

[第二层] 调用千问AI大模型...
✗ 千问AI回复质量不佳或未配置

[第三层] 降级到Discord社区...
✓ Discord回复成功
```

#### 测试3.2：Bot API交互

**前提：** 配置了Bot Token和Channel ID

**发送：** "专家问题xyz456"

**预期：** 消息发送到Discord，返回消息ID

---

## 🔧 详细测试步骤

### 使用浏览器测试

1. 打开前端：http://localhost:5173
2. 点击聊天机器人图标
3. 依次发送测试消息
4. 观察回复来源标识

### 使用curl测试

```powershell
# 测试规则库
curl -X POST http://localhost:3001/api/chat `
  -H "Content-Type: application/json" `
  -d '{"message": "你好"}'

# 测试AI
curl -X POST http://localhost:3001/api/chat `
  -H "Content-Type: application/json" `
  -d '{"message": "什么是React"}'

# 测试Discord
curl -X POST http://localhost:3001/api/chat `
  -H "Content-Type: application/json" `
  -d '{"message": "这是一个测试xyz123"}'
```

### 使用Postman测试

1. 创建POST请求：http://localhost:3001/api/chat
2. 设置Headers：`Content-Type: application/json`
3. 设置Body (raw JSON)：
   ```json
   {
     "message": "你好"
   }
   ```
4. 发送并检查响应

---

## 📊 预期行为对照表

| 输入类型 | 预期层级 | 响应来源 | 验证方法 |
|---------|---------|---------|---------|
| "你好" | 第一层 | rule | 检查`source: "rule"` |
| "功能" | 第一层 | rule | 检查`ruleId: "R002"` |
| "时间" | 第一层 | rule (动态) | 检查是否有实时时间 |
| "什么是React" | 第二层 | ai | 检查`source: "ai"` |
| "中国首都" | 第二层 | ai | AI回答"北京" |
| "xyz123特殊问题" | 第三层 | discord | 检查Discord频道 |

---

## 🔍 日志分析

### 成功的三层测试日志

```
==========================================================
收到消息: 你好
==========================================================

[第一层] 尝试规则库匹配...
从数据库加载了 6 条启用的规则
✓ 规则库匹配成功！
  规则ID: R001
  规则名称: 问候规则
  优先级: 10
  分类: greeting

==========================================================
收到消息: 什么是React
==========================================================

[第一层] 尝试规则库匹配...
从数据库加载了 6 条启用的规则
✗ 规则库未找到匹配

[第二层] 调用千问AI大模型...
✓ 千问AI回复成功
  回复长度: 150 字符

==========================================================
收到消息: 特殊问题xyz123
==========================================================

[第一层] 尝试规则库匹配...
✗ 规则库未找到匹配

[第二层] 调用千问AI大模型...
✗ 千问AI回复质量不佳或未配置

[第三层] 降级到Discord社区...
使用Discord Webhook发送问题...
✓ Discord回复成功
  回复长度: 80 字符
```

---

## ⚙️ 配置验证

### 检查.env配置

```env
# 必需配置
PORT=3001

# 数据库（必需）
DB_HOST=localhost
DB_NAME=admission_db
DB_USER=postgres
DB_PASSWORD=20250820

# 千问API（第二层）
QWEN_API_KEY=sk-xxxxx
ENABLE_QWEN_AI=true

# Discord（第三层）
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx
ENABLE_DISCORD_FALLBACK=true
```

### 验证各层启用状态

```powershell
# 查看系统状态
curl http://localhost:3001/api/chat/status

# 检查返回的 layers 对象
# rule.enabled 应该是 true
# ai.enabled 应该是 true
# discord.enabled 应该是 true
```

---

## 🐛 故障排除

### 问题1：所有问题都走AI

**原因：** 规则库未加载

**解决：**
```powershell
npm run test-db  # 检查数据库
npm run setup-db # 重新导入规则
```

### 问题2：AI总是失败

**原因：** 千问API未配置或密钥错误

**解决：**
```powershell
# 测试AI连接
curl http://localhost:3001/api/chat/test-ai

# 检查.env中的QWEN_API_KEY
```

### 问题3：Discord不工作

**原因：** Discord未配置或配置错误

**解决：**
```powershell
# 测试Discord
curl http://localhost:3001/api/chat/test-discord

# 检查.env中的DISCORD配置
# 检查Discord频道是否收到测试消息
```

### 问题4：规则库命中但内容错误

**原因：** 数据库数据问题

**解决：**
```sql
-- 查看规则内容
SELECT rule_id, rule_name, trigger_content, response_content 
FROM rulelibtable 
WHERE enabled = true
ORDER BY priority DESC;

-- 更新规则
UPDATE rulelibtable 
SET response_content = '新的回复内容'
WHERE rule_id = 'R001';
```

---

## 📈 性能测试

### 响应时间基准

- **规则库匹配：** < 50ms
- **AI调用：** 1-3秒
- **Discord发送：** < 500ms

### 压力测试

```powershell
# 使用Apache Bench测试
ab -n 100 -c 10 -p test.json -T application/json http://localhost:3001/api/chat

# test.json内容:
# {"message": "你好"}
```

---

## ✅ 测试清单

完整测试所有场景：

- [ ] 规则库 - 问候规则
- [ ] 规则库 - 功能查询
- [ ] 规则库 - 产品功能  
- [ ] 规则库 - 联系方式
- [ ] 规则库 - 日期时间（动态）
- [ ] 规则库 - 精确匹配
- [ ] AI - 技术问题
- [ ] AI - 一般知识
- [ ] AI - 复杂问题
- [ ] Discord - Webhook发送
- [ ] Discord - 消息通知
- [ ] 系统状态API
- [ ] 规则列表API
- [ ] 错误处理
- [ ] 超长消息拒绝

---

## 🎯 生产环境检查

上线前确认：

1. ✅ PostgreSQL连接稳定
2. ✅ 规则库完整且正确
3. ✅ 千问API密钥有效
4. ✅ Discord配置正确
5. ✅ 所有三层测试通过
6. ✅ 日志记录完善
7. ✅ 错误处理健壮

---

## 📚 相关文档

- [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) - 数据库设置
- [DISCORD_SETUP.md](./DISCORD_SETUP.md) - Discord配置
- [README.md](./README.md) - 项目总览

---

祝测试顺利！🎉

如有问题，请检查后端日志或各层的测试端点。
