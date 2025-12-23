import React from 'react';

/**
 * 聊天消息组件 - 完全优化版
 * 支持：标题、列表、代码块、加粗、链接、段落分隔
 */
const ChatMessage = ({ message }) => {
  const { text, sender, timestamp, source, metadata, isError, isWelcome } = message;
  
  /**
   * 格式化时间
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  /**
   * 获取来源标签
   */
  const getSourceBadge = () => {
    if (!source || sender === 'user') return null;

    const badges = {
      'rule': { text: '规则库', icon: '📚', color: '#10b981' },
      'ai': { text: 'AI助手', icon: '🤖', color: '#3b82f6' },
      'discord': { text: 'Discord', icon: '💬', color: '#5865f2' },
      'system': { text: '系统', icon: '⚙️', color: '#8b5cf6' },
      'error': { text: '错误', icon: '⚠️', color: '#ef4444' }
    };

    const badge = badges[source] || { text: '助手', icon: '💡', color: '#6366f1' };

    return (
      <span className="message-source-badge" style={{ backgroundColor: badge.color }}>
        <span className="badge-icon">{badge.icon}</span>
        <span className="badge-text">{badge.text}</span>
      </span>
    );
  };

  /**
   * 处理文本格式化 - 核心功能
   */
  const formatText = (text) => {
    if (!text) return null;

    // 按双换行符分割段落
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

    return paragraphs.map((paragraph, pIndex) => {
      const trimmed = paragraph.trim();
      
      // 1. 检查是否是标题（以 ## 开头）
      if (trimmed.startsWith('## ')) {
        const title = trimmed.replace(/^##\s*/, '');
        return (
          <div key={pIndex} className="message-section">
            <h4 className="message-heading">{title}</h4>
          </div>
        );
      }

      // 2. 检查是否是三级标题（以 ### 开头）
      if (trimmed.startsWith('### ')) {
        const title = trimmed.replace(/^###\s*/, '');
        return (
          <div key={pIndex} className="message-section">
            <h5 className="message-subheading">{title}</h5>
          </div>
        );
      }

      // 3. 检查是否是代码块（用```包围）
      if (trimmed.includes('```')) {
        const parts = trimmed.split('```');
        return (
          <div key={pIndex} className="message-section">
            {parts.map((part, cIndex) => {
              if (cIndex % 2 === 1) {
                // 代码部分
                const lines = part.trim().split('\n');
                const lang = lines[0] && /^[a-z]+$/.test(lines[0]) ? lines.shift() : '';
                return (
                  <div key={cIndex} className="message-code-block">
                    {lang && <div className="code-lang">{lang}</div>}
                    <pre><code>{lines.join('\n')}</code></pre>
                  </div>
                );
              } else if (part.trim()) {
                // 文本部分
                return <div key={cIndex} className="message-text">{formatInlineText(part)}</div>;
              }
              return null;
            })}
          </div>
        );
      }

      // 4. 检查是否是列表
      const lines = trimmed.split('\n').filter(l => l.trim());
      
      // 无序列表检查
      const isUnorderedList = lines.length > 1 && lines.every(line => 
        /^[•\-*]\s/.test(line.trim())
      );

      if (isUnorderedList) {
        return (
          <div key={pIndex} className="message-section">
            <ul className="message-list">
              {lines.map((line, lIndex) => {
                const cleanLine = line.trim().replace(/^[•\-*]\s*/, '');
                if (!cleanLine) return null;
                return <li key={lIndex}>{formatInlineText(cleanLine)}</li>;
              })}
            </ul>
          </div>
        );
      }

      // 有序列表检查
      const isOrderedList = lines.length > 1 && lines.every(line => 
        /^\d+\.\s/.test(line.trim())
      );

      if (isOrderedList) {
        return (
          <div key={pIndex} className="message-section">
            <ol className="message-list message-list-ordered">
              {lines.map((line, lIndex) => {
                const cleanLine = line.trim().replace(/^\d+\.\s*/, '');
                if (!cleanLine) return null;
                return <li key={lIndex}>{formatInlineText(cleanLine)}</li>;
              })}
            </ol>
          </div>
        );
      }

      // 5. 普通段落（可能包含多行）
      return (
        <div key={pIndex} className="message-section">
          <p className="message-paragraph">
            {lines.map((line, lIndex) => (
              <React.Fragment key={lIndex}>
                {formatInlineText(line)}
                {lIndex < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        </div>
      );
    });
  };

  /**
   * 格式化行内文本
   * 支持：加粗、链接、代码
   */
  const formatInlineText = (text) => {
    if (!text) return '';

    let parts = [text];

    // 1. 处理加粗 **text**
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      
      const boldRegex = /\*\*(.+?)\*\*/g;
      const splits = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          splits.push(part.substring(lastIndex, match.index));
        }
        splits.push(<strong key={`bold-${match.index}`}>{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < part.length) {
        splits.push(part.substring(lastIndex));
      }

      return splits.length > 0 ? splits : [part];
    });

    // 2. 处理行内代码 `code`
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      
      const codeRegex = /`([^`]+)`/g;
      const splits = [];
      let lastIndex = 0;
      let match;

      while ((match = codeRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          splits.push(part.substring(lastIndex, match.index));
        }
        splits.push(<code key={`code-${match.index}`} className="inline-code">{match[1]}</code>);
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < part.length) {
        splits.push(part.substring(lastIndex));
      }

      return splits.length > 0 ? splits : [part];
    });

    // 3. 处理链接 [text](url)
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const splits = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          splits.push(part.substring(lastIndex, match.index));
        }
        splits.push(
          <a 
            key={`link-${match.index}`} 
            href={match[2]} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="message-link"
          >
            {match[1]}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < part.length) {
        splits.push(part.substring(lastIndex));
      }

      return splits.length > 0 ? splits : [part];
    });

    return parts;
  };

  /**
   * 渲染元数据
   */
  const renderMetadata = () => {
    if (!metadata || sender === 'user') return null;

    const items = [];

    if (metadata.ruleName) {
      items.push(
        <span key="rule" className="metadata-item" title="匹配的规则">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {metadata.ruleName}
        </span>
      );
    }

    if (metadata.priority) {
      items.push(
        <span key="priority" className="metadata-item" title="优先级">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          优先级 {metadata.priority}
        </span>
      );
    }

    if (metadata.category) {
      items.push(
        <span key="category" className="metadata-item" title="分类">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          </svg>
          {metadata.category}
        </span>
      );
    }

    if (items.length === 0) return null;

    return <div className="message-metadata">{items}</div>;
  };

  return (
    <div className={`message message-${sender} ${isError ? 'message-error' : ''} ${isWelcome ? 'message-welcome' : ''}`}>
      {/* 机器人头像 */}
      {sender === 'bot' && (
        <div className="message-avatar message-avatar-bot">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="url(#msg-bot-gradient)" />
            <circle cx="24" cy="20" r="7" fill="white" opacity="0.9" />
            <path d="M14 34c0-5.5 4.5-8 10-8s10 2.5 10 8" fill="white" opacity="0.9" />
            <defs>
              <linearGradient id="msg-bot-gradient" x1="4" y1="4" x2="44" y2="44">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
      
      {/* 消息内容 */}
      <div className="message-content">
        {/* 消息头部 */}
        <div className="message-header">
          {sender === 'bot' && getSourceBadge()}
          <span className="message-time">{formatTime(timestamp)}</span>
        </div>
        
        {/* 消息气泡 */}
        <div className={`message-bubble ${isError ? 'bubble-error' : ''}`}>
          <div className="message-body">
            {formatText(text)}
          </div>
          {renderMetadata()}
        </div>
      </div>

      {/* 用户头像 */}
      {sender === 'user' && (
        <div className="message-avatar message-avatar-user">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="url(#msg-user-gradient)" />
            <circle cx="24" cy="20" r="7" fill="white" opacity="0.9" />
            <path d="M14 34c0-5.5 4.5-8 10-8s10 2.5 10 8" fill="white" opacity="0.9" />
            <defs>
              <linearGradient id="msg-user-gradient" x1="4" y1="4" x2="44" y2="44">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
