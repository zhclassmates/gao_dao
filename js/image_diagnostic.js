// image_diagnostic.js
// 图片加载诊断工具

class ImageDiagnostic {
  constructor() {
    this.extensionId = chrome.runtime.id;
    this.basePath = chrome.runtime.getURL('');
    this.results = [];
  }
  
  // 初始化诊断界面
  createDiagnosticUI() {
    const container = document.createElement('div');
    container.className = 'diagnostic-container';
    container.innerHTML = `
      <h2>图片加载诊断工具</h2>
      <div class="info-box">
        <p><strong>扩展ID:</strong> ${this.extensionId}</p>
        <p><strong>扩展基础路径:</strong> ${this.basePath}</p>
      </div>
      <div class="actions">
        <button id="test-image-btn" class="diag-btn">检查图片加载</button>
        <button id="fix-images-btn" class="diag-btn">修复所有HTML文件</button>
      </div>
      <div id="diagnostic-results" class="results-container"></div>
    `;
    
    this.addStyles();
    document.body.appendChild(container);
    
    // 绑定事件
    document.getElementById('test-image-btn').addEventListener('click', () => this.testImages());
    document.getElementById('fix-images-btn').addEventListener('click', () => this.fixAllImages());
  }
  
  // 添加诊断工具样式
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .diagnostic-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 10000;
        padding: 20px;
        box-sizing: border-box;
        overflow: auto;
        font-family: Arial, sans-serif;
      }
      
      .info-box {
        background: #f0f0f0;
        padding: 10px;
        margin-bottom: 15px;
        border-radius: 4px;
      }
      
      .actions {
        margin-bottom: 20px;
      }
      
      .diag-btn {
        padding: 8px 15px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 10px;
      }
      
      .results-container {
        background: #f9f9f9;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        max-height: 500px;
        overflow: auto;
      }
      
      .result-item {
        margin-bottom: 10px;
        padding: 8px;
        border-radius: 4px;
      }
      
      .success {
        background: #d4edda;
        border-left: 4px solid #28a745;
      }
      
      .error {
        background: #f8d7da;
        border-left: 4px solid #dc3545;
      }
      
      .warning {
        background: #fff3cd;
        border-left: 4px solid #ffc107;
      }
    `;
    document.head.appendChild(style);
  }
  
  // 测试图片加载
  async testImages() {
    const resultsContainer = document.getElementById('diagnostic-results');
    resultsContainer.innerHTML = '<p>正在检查图片加载情况...</p>';
    
    this.results = [];
    
    // 测试不同路径的图片加载
    const testPaths = [
      'images/icon128.png',
      'hexagram_book/hexagram_images/hexagram_01.jpg',
      'html_combined/some_image.jpg'
    ];
    
    for (const path of testPaths) {
      const result = await this.testImagePath(path);
      this.results.push(result);
    }
    
    // 显示结果
    this.displayResults();
  }
  
  // 测试单个图片路径
  async testImagePath(path) {
    const urls = [
      // 相对路径
      path,
      // 使用../路径
      '../' + path,
      // 使用chrome-extension://扩展ID路径
      `chrome-extension://${this.extensionId}/${path}`,
      // 使用chrome.runtime.getURL
      chrome.runtime.getURL(path)
    ];
    
    const result = {
      path: path,
      tests: []
    };
    
    for (const url of urls) {
      try {
        const imgTest = await this.loadImage(url);
        result.tests.push({
          url: url,
          success: imgTest.success,
          error: imgTest.error
        });
      } catch (error) {
        result.tests.push({
          url: url,
          success: false,
          error: error.message
        });
      }
    }
    
    return result;
  }
  
  // 加载图片测试
  loadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ success: true, error: null });
      img.onerror = (e) => resolve({ success: false, error: 'Failed to load image' });
      img.src = url;
      
      // 设置超时
      setTimeout(() => {
        if (!img.complete) {
          resolve({ success: false, error: 'Timeout loading image' });
        }
      }, 3000);
    });
  }
  
  // 显示测试结果
  displayResults() {
    const resultsContainer = document.getElementById('diagnostic-results');
    resultsContainer.innerHTML = '';
    
    if (this.results.length === 0) {
      resultsContainer.innerHTML = '<p>无测试结果</p>';
      return;
    }
    
    for (const result of this.results) {
      const resultElement = document.createElement('div');
      resultElement.className = 'result-item';
      
      let html = `<h3>路径: ${result.path}</h3><ul>`;
      
      let anySuccess = false;
      for (const test of result.tests) {
        const className = test.success ? 'success' : 'error';
        html += `<li class="${className}">
          <strong>URL:</strong> ${test.url}<br>
          <strong>结果:</strong> ${test.success ? '成功' : '失败'}
          ${test.error ? `<br><strong>错误:</strong> ${test.error}` : ''}
        </li>`;
        
        if (test.success) anySuccess = true;
      }
      
      html += '</ul>';
      
      resultElement.innerHTML = html;
      resultElement.classList.add(anySuccess ? 'success' : 'error');
      
      resultsContainer.appendChild(resultElement);
    }
  }
  
  // 修复所有HTML文件中的图片
  fixAllImages() {
    const resultsContainer = document.getElementById('diagnostic-results');
    resultsContainer.innerHTML = '<p>这个功能需要在独立的工具页面中执行，请使用test_html_links.html页面中的图片修复功能。</p>';
  }
}

// 导出类
window.ImageDiagnostic = ImageDiagnostic; 