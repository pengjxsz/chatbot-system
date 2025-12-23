# 🔧 故障排除指南

## 问题：启动时出现 "throw err" 错误

### 原因分析
这个错误通常是因为：
1. ❌ 依赖包未安装
2. ❌ Node.js 版本过低
3. ❌ 文件路径问题

### ✅ 解决方案（按顺序尝试）

---

## 方案1：重新安装依赖（最常见）

```powershell
# 1. 删除旧的依赖（如果存在）
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# 2. 清理npm缓存
npm cache clean --force

# 3. 重新安装依赖
npm install

# 4. 启动服务
npm start
```

---

## 方案2：检查Node.js版本

```powershell
# 检查Node.js版本
node --version

# 应该显示 v16.0.0 或更高版本
# 如果版本低于 v16，请升级Node.js
```

**升级Node.js：**
1. 访问：https://nodejs.org/
2. 下载并安装 LTS 版本（推荐）
3. 重启命令行窗口
4. 重新执行安装步骤

---

## 方案3：手动安装依赖

有时候自动安装可能失败，手动安装每个依赖：

```powershell
# 在 backend 目录下执行
npm install express
npm install cors
npm install axios
npm install dotenv
npm install body-parser

# 开发依赖（可选）
npm install --save-dev nodemon

# 再次启动
npm start
```

---

## 方案4：检查文件完整性

确保以下文件存在：

```
backend/
├── package.json          ✓ 必须存在
├── .env.example          ✓ 必须存在
└── src/
    ├── server.js         ✓ 必须存在
    ├── config/
    │   └── rules.json    ✓ 必须存在
    ├── controllers/
    │   └── chatController.js
    ├── services/
    │   ├── ruleEngine.js
    │   └── aiService.js
    └── routes/
        └── chat.js
```

---

## 方案5：创建 .env 文件

```powershell
# 在 backend 目录下
Copy-Item .env.example .env

# 或手动创建 .env 文件，内容如下：
```

创建 `backend/.env` 文件，内容：
```env
PORT=3001
QWEN_API_KEY=your_qwen_api_key_here
QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

---

## 方案6：使用备用启动方式

如果 npm start 失败，直接运行：

```powershell
# 直接运行服务器文件
node src/server.js
```

---

## 常见错误信息对照表

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `Cannot find module 'express'` | 依赖未安装 | 运行 `npm install` |
| `SyntaxError: Unexpected token` | Node.js版本过低 | 升级到 v16+ |
| `ENOENT: no such file` | 文件缺失 | 检查文件完整性 |
| `EADDRINUSE` | 端口被占用 | 修改 .env 的 PORT |

---

## 完整的重新安装步骤

```powershell
# 1. 进入后端目录
cd E:\chatbot-1223\chatbot-system\backend

# 2. 清理旧文件
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# 3. 检查Node版本
node --version
npm --version

# 4. 安装依赖
npm install

# 5. 创建环境变量文件
Copy-Item .env.example .env

# 6. 启动服务
npm start
```

---

## 如果仍然失败

请提供以下信息以便进一步诊断：

1. **Node.js 版本**
   ```powershell
   node --version
   npm --version
   ```

2. **完整的错误信息**
   截图或复制完整的错误堆栈

3. **npm install 的输出**
   看看安装过程是否有错误

4. **文件列表**
   ```powershell
   Get-ChildItem -Recurse -Name
   ```

---

## 快速诊断命令

```powershell
# 运行这个诊断脚本
echo "=== Node.js 环境检查 ==="
node --version
npm --version

echo "`n=== 检查文件 ==="
Test-Path package.json
Test-Path src/server.js
Test-Path src/config/rules.json

echo "`n=== 检查依赖 ==="
Test-Path node_modules

echo "`n=== 尝试安装 ==="
npm install
```

---

## 推荐的启动流程（Windows PowerShell）

```powershell
# 完整的启动流程
cd E:\chatbot-1223\chatbot-system\backend
npm install
Copy-Item .env.example .env -Force
npm start
```

如果以上方案都不行，可能需要：
1. 重新下载项目文件
2. 重新安装 Node.js
3. 检查系统环境变量
