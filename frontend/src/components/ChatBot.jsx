import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import apiService from '../services/api';
import '../styles/ChatBot.css';

/**
 * 聊天机器人主组件 - 完整版
 * 功能：拖拽移动、窗口大小调整、优化输出格式
 */
const ChatBot = () => {
  // 基础状态
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 拖拽状态
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // 调整大小状态
  const [size, setSize] = useState({ width: 420, height: 650 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // 引用
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  /**
   * 自动滚动到底部
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * 初始化欢迎消息
   */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: '您好！👋 我是智能助手，很高兴为您服务。\n\n我可以帮您：\n• 回答各种问题\n• 提供专业建议\n• 进行日常对话',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        source: 'system',
        isWelcome: true
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // ==================== 拖拽功能 ====================
  
  /**
   * 开始拖拽
   */
  const handleDragStart = (e) => {
    // 只允许从标题栏拖拽
    if (!e.target.closest('.chat-header')) {
      return;
    }
    // 如果点击的是按钮，不拖拽
    if (e.target.closest('button')) {
      return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  /**
   * 拖拽中
   */
  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // 限制在视口内
    const maxX = window.innerWidth - size.width;
    const maxY = window.innerHeight - size.height;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  /**
   * 结束拖拽
   */
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // ==================== 调整大小功能 ====================
  
  /**
   * 开始调整大小
   */
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  /**
   * 调整大小中
   */
  const handleResizeMove = (e) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    // 计算新尺寸
    let newWidth = resizeStart.width + deltaX;
    let newHeight = resizeStart.height + deltaY;
    
    // 最小尺寸限制
    const minWidth = 350;
    const minHeight = 450;
    
    // 最大尺寸限制（不超出视口）
    const maxWidth = window.innerWidth - position.x - 20;
    const maxHeight = window.innerHeight - position.y - 20;
    
    newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
    newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
    
    setSize({
      width: newWidth,
      height: newHeight
    });
  };

  /**
   * 结束调整大小
   */
  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // ==================== 全局事件监听 ====================
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, dragStart, size]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, resizeStart, position]);

  // ==================== 消息处理 ====================

  /**
   * 发送消息
   */
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await apiService.sendMessage(text);

      // 添加机器人回复
      const botMessage = {
        id: Date.now() + 1,
        text: response.reply,
        sender: 'bot',
        timestamp: response.timestamp || new Date().toISOString(),
        source: response.source,
        metadata: {
          ruleId: response.ruleId,
          ruleName: response.ruleName,
          category: response.category,
          priority: response.priority
        }
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (err) {
      console.error('发送消息失败:', err);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: `抱歉，发生了错误。\n\n请检查：\n• 后端服务是否已启动\n• 网络连接是否正常`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        source: 'error',
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 清空聊天
   */
  const handleClearChat = () => {
    if (window.confirm('确定要清空所有对话吗？')) {
      setMessages([]);
    }
  };

  /**
   * 切换聊天窗口
   */
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* 聊天窗口 */}
      {isOpen && (
        <div
          ref={chatContainerRef}
          className={`chat-container ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${size.width}px`,
            height: `${size.height}px`
          }}
        >
          {/* 头部 */}
          <div 
            className="chat-header"
            onMouseDown={handleDragStart}
          >
            <div className="chat-header-info">
              <div className="chat-avatar">
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" fill="url(#avatar-gradient)" />
                  <circle cx="24" cy="20" r="7" fill="white" opacity="0.9" />
                  <path d="M14 34c0-5.5 4.5-8 10-8s10 2.5 10 8" fill="white" opacity="0.9" />
                  <defs>
                    <linearGradient id="avatar-gradient" x1="4" y1="4" x2="44" y2="44">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="chat-title">
                <h3>智能助手</h3>
                <span className="chat-status">
                  <span className="status-dot"></span>
                  {isLoading ? '正在输入...' : '在线'}
                </span>
              </div>
            </div>
            
            <div className="chat-header-actions">
              <button
                className="chat-action-button"
                onClick={handleClearChat}
                title="清空聊天记录"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
              <button
                className="chat-close-button"
                onClick={toggleChat}
                title="关闭聊天"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* 消息区域 */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <div className="welcome-icon">👋</div>
                <h4>欢迎使用智能助手</h4>
                <div className="welcome-features">
                  <div className="feature-item">
                    <span className="feature-icon">💡</span>
                    <span>智能问答</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📚</span>
                    <span>知识查询</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🤖</span>
                    <span>AI辅助</span>
                  </div>
                </div>
                <p className="welcome-tip">请输入您的问题开始对话</p>
              </div>
            )}
            
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="message message-bot">
                <div className="message-avatar">
                  <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" fill="url(#bot-gradient)" />
                    <circle cx="24" cy="20" r="7" fill="white" opacity="0.9" />
                    <path d="M14 34c0-5.5 4.5-8 10-8s10 2.5 10 8" fill="white" opacity="0.9" />
                    <defs>
                      <linearGradient id="bot-gradient" x1="4" y1="4" x2="44" y2="44">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#6366F1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <ChatInput 
            onSend={handleSendMessage} 
            disabled={isLoading}
          />

          {/* 调整大小手柄 - 关键功能 */}
          <div 
            className="chat-resize-handle"
            onMouseDown={handleResizeStart}
            title="拖拽调整窗口大小"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15l-6 6" />
              <path d="M21 9l-12 12" />
              <path d="M21 3l-18 18" />
            </svg>
          </div>
        </div>
      )}

      {/* 浮动按钮 - 优化的图标 */}
      <button
        className={`chat-toggle-button ${isOpen ? 'hidden' : ''}`}
        onClick={toggleChat}
        title="打开智能助手"
      >
        <svg className="chat-icon" width="32" height="32" viewBox="0 0 48 48" fill="none">
          {/* 聊天气泡背景 */}
          <path d="M38 28c0 2.2-1.8 4-4 4H16l-6 6V12c0-2.2 1.8-4 4-4h20c2.2 0 4 1.8 4 4v16z" 
                fill="white" 
                opacity="0.95" />
          
          {/* AI标识 - 机器人头 */}
          <circle cx="20" cy="20" r="2" fill="currentColor" />
          <circle cx="28" cy="20" r="2" fill="currentColor" />
          <path d="M20 26h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          
          {/* 在线状态点 */}
          <circle cx="38" cy="10" r="4" fill="#10b981">
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
        
        <span className="chat-badge">AI</span>
      </button>
    </>
  );
};

export default ChatBot;
