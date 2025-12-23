# Direct Commands - Copy and Paste

## Quick Fix (PowerShell) - RECOMMENDED

Open PowerShell in the backend directory and run these commands:

```powershell
# Step 1: Clean old files
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Step 2: Install dependencies
npm install

# Step 3: Create .env file
Copy-Item .env.example .env

# Step 4: Start server
npm start
```

---

## Alternative: One Line Command

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue; Remove-Item package-lock.json -ErrorAction SilentlyContinue; npm install; Copy-Item .env.example .env -ErrorAction SilentlyContinue; npm start
```

---

## Manual Installation Step by Step

### Step 1: Navigate to backend folder
```powershell
cd E:\chatbot-1223\chatbot-system\backend
```

### Step 2: Clean old files (if any)
```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
```

### Step 3: Clear npm cache
```powershell
npm cache clean --force
```

### Step 4: Install dependencies
```powershell
npm install
```

If npm install fails, try installing packages individually:
```powershell
npm install express
npm install cors
npm install axios
npm install dotenv
npm install body-parser
```

### Step 5: Create environment file
```powershell
Copy-Item .env.example .env
```

Or create manually:
```powershell
@"
PORT=3001
QWEN_API_KEY=your_qwen_api_key_here
QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
"@ | Out-File -FilePath .env -Encoding UTF8
```

### Step 6: Start the server
```powershell
npm start
```

---

## If PowerShell Doesn't Work, Use CMD

Open Command Prompt (cmd) in the backend directory:

```cmd
REM Step 1: Clean old files
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /q package-lock.json

REM Step 2: Install dependencies
npm install

REM Step 3: Create .env file
copy .env.example .env

REM Step 4: Start server
npm start
```

---

## Using the New Install Scripts

I've created simplified scripts without Chinese characters:

### Option 1: PowerShell Script
```powershell
.\install-simple.ps1
```

### Option 2: Batch File
```cmd
install-simple.bat
```

---

## Frontend Installation

After backend is running, install frontend:

```powershell
# Navigate to frontend folder
cd ..\frontend

# Clean and install
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install

# Start development server
npm run dev
```

---

## Verification

After starting backend, you should see:
```
=================================
🚀 聊天机器人后端服务已启动
📡 服务运行在: http://localhost:3001
=================================
```

After starting frontend, you should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## Common Issues

### Issue: "npm not found"
Solution: Make sure Node.js is installed and in PATH

### Issue: "EACCES permission denied"
Solution: Run as administrator or use:
```powershell
npm install --unsafe-perm
```

### Issue: "Port 3001 in use"
Solution: Change PORT in .env file:
```
PORT=3002
```

### Issue: Install hangs or takes very long
Solution: Try using different registry:
```powershell
npm install --registry=https://registry.npmmirror.com
```

---

## Quick Test

Test if backend is working:
```powershell
# In browser or new PowerShell window
curl http://localhost:3001/health
```

Should return:
```json
{"status":"healthy","timestamp":"...","uptime":...}
```

---

## Complete Fresh Start

If nothing works, here's a complete reset:

```powershell
# Go to backend directory
cd E:\chatbot-1223\chatbot-system\backend

# Remove everything
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
Remove-Item .env -ErrorAction SilentlyContinue

# Clear cache
npm cache clean --force

# Reinstall from scratch
npm install

# Setup environment
Copy-Item .env.example .env

# Verify
Get-ChildItem node_modules | Measure-Object

# Start
npm start
```

This should give you a completely fresh installation.
