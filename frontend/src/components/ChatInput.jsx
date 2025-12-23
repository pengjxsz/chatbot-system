import React, { useState, useRef, useEffect } from 'react';

/**
 * 聊天输入组件 - 优化版
 * 特点：更大的输入框、自动聚焦、更好的体验
 */
const ChatInput = ({ onSend, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef(null);

  /**
   * 自动聚焦 - 组件加载和发送后自动聚焦
   */
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      // 延迟聚焦，确保DOM已渲染
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [disabled]);

  /**
   * 自动调整输入框高度
   */
  useEffect(() => {
    if (textareaRef.current) {
      // 重置高度以正确计算scrollHeight
      textareaRef.current.style.height = 'auto';
      // 设置新高度，最大180px
      const newHeight = Math.min(textareaRef.current.scrollHeight, 180);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  /**
   * 处理输入变化
   */
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  /**
   * 处理发送消息
   */
  const handleSend = () => {
    const trimmedValue = inputValue.trim();
    
    if (trimmedValue && !disabled) {
      onSend(trimmedValue);
      setInputValue('');
      
      // 重置输入框高度并重新聚焦
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        // 发送后重新聚焦
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 50);
      }
    }
  };

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e) => {
    // Enter发送，Shift+Enter换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入您的问题... (Enter发送，Shift+Enter换行)"
          disabled={disabled}
          rows={2}
          autoFocus
        />
        
        <button
          className="chat-send-button"
          onClick={handleSend}
          disabled={disabled || !inputValue.trim()}
          title="发送消息 (Enter)"
        >
          <svg 
            width="22" 
            height="22" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </div>
      
      <div className="chat-input-hint">
        💡 <strong>提示：</strong>描述越详细，回答越准确
      </div>
    </div>
  );
};

export default ChatInput;
