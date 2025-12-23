import React, { useState, useEffect } from 'react';

/**
 * 独立的调整大小演示组件
 * 用于验证调整大小功能是否可用
 * 
 * 使用方法：
 * 1. 将此文件保存为 frontend/src/components/ResizeDemo.jsx
 * 2. 在 App.jsx 中导入: import ResizeDemo from './components/ResizeDemo'
 * 3. 在 App.jsx 中使用: <ResizeDemo />
 * 4. 启动服务器，打开浏览器测试
 */

function ResizeDemo() {
  const [size, setSize] = useState({ width: 400, height: 500 });
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // 开始调整大小
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯 开始调整大小', { x: e.clientX, y: e.clientY });
    
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  // 调整大小中
  const handleResizeMove = (e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    const newWidth = Math.max(300, resizeStart.width + deltaX);
    const newHeight = Math.max(400, resizeStart.height + deltaY);

    console.log('📏 调整中', { width: newWidth, height: newHeight });

    setSize({
      width: newWidth,
      height: newHeight
    });
  };

  // 结束调整大小
  const handleResizeEnd = () => {
    if (isResizing) {
      console.log('✅ 调整完成', size);
      setIsResizing(false);
    }
  };

  // 监听全局鼠标事件
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);

      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, resizeStart]);

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 9999,
        userSelect: isResizing ? 'none' : 'auto'
      }}
    >
      {/* 头部 */}
      <div
        style={{
          padding: '20px',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          color: 'white'
        }}
      >
        <h2 style={{ margin: 0, fontSize: '20px' }}>
          🎯 调整大小测试
        </h2>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
          拖拽右下角调整窗口大小
        </p>
      </div>

      {/* 内容区 */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          background: 'white',
          overflowY: 'auto'
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>
            📊 当前尺寸
          </h3>
          <div style={{
            padding: '15px',
            background: '#f0f4ff',
            borderRadius: '10px',
            fontFamily: 'monospace',
            fontSize: '16px',
            lineHeight: '1.8'
          }}>
            <div>宽度: <strong>{size.width}px</strong></div>
            <div>高度: <strong>{size.height}px</strong></div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>
            ✅ 测试步骤
          </h3>
          <ol style={{ 
            padding: '15px 15px 15px 35px',
            background: '#f0f4ff',
            borderRadius: '10px',
            lineHeight: '1.8'
          }}>
            <li>将鼠标移到右下角</li>
            <li>看到红色手柄和箭头图标</li>
            <li>鼠标变成对角箭头 ↘️</li>
            <li>按住鼠标左键拖拽</li>
            <li>窗口大小实时改变</li>
          </ol>
        </div>

        <div>
          <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>
            🔍 状态信息
          </h3>
          <div style={{
            padding: '15px',
            background: isResizing ? '#fff3cd' : '#d1f4dd',
            borderRadius: '10px',
            lineHeight: '1.8'
          }}>
            <div>
              状态: <strong>{isResizing ? '🔄 调整中...' : '✅ 就绪'}</strong>
            </div>
            <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
              打开浏览器Console (F12) 可以看到详细日志
            </div>
          </div>
        </div>

        {isResizing && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#e3f2fd',
            borderRadius: '10px',
            border: '2px solid #2196f3',
            color: '#1565c0',
            fontWeight: 'bold'
          }}>
            🎉 太棒了！调整大小功能正常工作！
          </div>
        )}
      </div>

      {/* 调整大小手柄 - 关键部分！ */}
      <div
        onMouseDown={handleResizeStart}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '50px',
          height: '50px',
          background: 'linear-gradient(135deg, transparent 50%, rgba(255, 0, 0, 0.8) 50%)',
          cursor: 'nwse-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          transition: 'all 0.2s',
          borderBottomRightRadius: '16px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, transparent 50%, rgba(255, 0, 0, 1) 50%)';
          console.log('👆 鼠标移到手柄上');
        }}
        onMouseLeave={(e) => {
          if (!isResizing) {
            e.currentTarget.style.background = 'linear-gradient(135deg, transparent 50%, rgba(255, 0, 0, 0.8) 50%)';
          }
        }}
        title="拖拽调整大小"
      >
        ⚹
      </div>

      {/* 使用说明 */}
      {!isResizing && (
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '10px',
            background: 'rgba(255, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            animation: 'bounce 2s infinite'
          }}
        >
          👆 拖拽这里
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

export default ResizeDemo;
