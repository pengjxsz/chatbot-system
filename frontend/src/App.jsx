import React from 'react';
import ChatBot from './components/ChatBot';
import './App.css';

/**
 * 主应用组件
 * 演示聊天机器人在实际页面中的应用
 */
function App() {
  return (
    <div className="app">
      {/* 页面头部 */}
      <header className="app-header">
        <div className="container">
          <h1>智能聊天机器人演示</h1>
          <p>点击右下角的聊天图标开始对话</p>
        </div>
      </header>

      {/* 页面主体内容 */}
      <main className="app-main">
        <div className="container">
          <section className="demo-section">
            <h2>🤖 功能特点</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>智能问答</h3>
                <p>优先使用规则库快速响应，未匹配时调用AI大模型提供深度回答</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🖱️</div>
                <h3>自由拖拽</h3>
                <p>聊天窗口可以自由拖拽移动，不遮挡页面内容</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>格式优化</h3>
                <p>消息自动格式化，支持段落、列表等，层次分明</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>响应迅速</h3>
                <p>规则匹配毫秒级响应，AI回复快速准确</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🎨</div>
                <h3>界面美观</h3>
                <p>现代化设计，支持深色模式，视觉体验优秀</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>响应式</h3>
                <p>完美适配各种屏幕尺寸，移动端友好</p>
              </div>
            </div>
          </section>

          <section className="demo-section">
            <h2>📝 使用说明</h2>
            <div className="instructions">
              <div className="instruction-item">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h4>打开聊天</h4>
                  <p>点击右下角的浮动按钮打开聊天窗口</p>
                </div>
              </div>
              
              <div className="instruction-item">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h4>输入问题</h4>
                  <p>在输入框中输入您的问题，按Enter发送</p>
                </div>
              </div>
              
              <div className="instruction-item">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h4>拖拽移动</h4>
                  <p>按住窗口顶部可以自由拖拽到任意位置</p>
                </div>
              </div>
              
              <div className="instruction-item">
                <span className="step-number">4</span>
                <div className="step-content">
                  <h4>查看回复</h4>
                  <p>系统会自动选择最佳方式回答您的问题</p>
                </div>
              </div>
            </div>
          </section>

          <section className="demo-section">
            <h2>💡 快速示例</h2>
            <div className="examples">
              <div className="example-card">
                <h4>试试这些问题：</h4>
                <ul>
                  <li>"你好" - 触发欢迎规则</li>
                  <li>"帮助" - 查看使用说明</li>
                  <li>"功能" - 了解系统功能</li>
                  <li>"什么是React？" - AI回答技术问题</li>
                  <li>"推荐一本书" - AI提供建议</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 页面底部 */}
      <footer className="app-footer">
        <div className="container">
          <p>© 2024 智能聊天机器人系统 | 前后端分离架构 | React + Node.js</p>
        </div>
      </footer>

      {/* 聊天机器人组件 */}
      <ChatBot />
    </div>
  );
}

export default App;
