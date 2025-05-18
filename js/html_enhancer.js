// html_enhancer.js
// 为HTML页面添加返回按钮

document.addEventListener('DOMContentLoaded', function() {
  // 创建返回按钮
  const backButton = document.createElement('div');
  backButton.className = 'back-to-extension';
  backButton.innerHTML = `
    <a href="javascript:history.back()" class="back-btn">
      <span class="arrow">←</span> 返回卦象查询
    </a>
  `;
  
  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    .back-to-extension {
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 1000;
    }
    
    .back-btn {
      display: inline-block;
      padding: 8px 15px;
      background-color: #4CAF50;
      color: white;
      border-radius: 4px;
      text-decoration: none;
      font-weight: bold;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      transition: background-color 0.3s;
    }
    
    .back-btn:hover {
      background-color: #45a049;
    }
    
    .arrow {
      font-weight: bold;
      margin-right: 5px;
    }
  `;
  
  // 添加到页面
  document.head.appendChild(style);
  document.body.insertBefore(backButton, document.body.firstChild);
}); 