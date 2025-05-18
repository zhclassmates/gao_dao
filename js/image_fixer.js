// 图片路径修复脚本 - 适用于Chrome扩展环境
// 用于自动修复HTML文件中的图片路径问题

// 图片路径修复器
class ImagePathFixer {
  constructor() {
    this.extensionId = chrome.runtime.id;
    this.baseUrl = `chrome-extension://${this.extensionId}`;
    this.imageExtensions = ['.jpg', '.png', '.gif'];
    this.debugMode = false; // 在控制台输出调试信息
  }

  // 修复图片路径
  fixImagePath(originalPath) {
    if (this.debugMode) {
      console.log(`准备修复路径: ${originalPath}`);
    }

    // 如果已经是chrome-extension://格式，则不处理
    if (originalPath.startsWith('chrome-extension://')) {
      return originalPath;
    }

    // 移除路径开头的../或./
    let path = originalPath.replace(/^\.\.\/|^\.\//g, '');

    // 确保资源使用正确的目录结构
    if (path.includes('hexagram_book/')) {
      path = path.replace('hexagram_book/', 'assets/');
    }

    // 处理卦象图片路径
    if (path.includes('hexagram_images/') || 
        path.match(/\d{2}_.*卦\/本卦\/.*\.jpg/)) {
      // 确保路径包含assets目录
      if (!path.startsWith('assets/')) {
        path = `assets/${path}`;
      }
    }

    // 使用扩展ID构建完整URL
    return `${this.baseUrl}/${path}`;
  }

  // 创建备用路径
  createFallbackPaths(originalPath) {
    const paths = [originalPath];
    
    // 转换不同的路径格式
    if (originalPath.includes('hexagram_book/')) {
      paths.push(originalPath.replace('hexagram_book/', 'assets/'));
    } else if (!originalPath.includes('assets/')) {
      paths.push(`assets/${originalPath}`);
    }

    if (originalPath.includes('hexagram_images/')) {
      // 路径已经包含hexagram_images
    } else if (originalPath.match(/\d{2}_.*卦\//)) {
      // 添加hexagram_images前缀
      paths.push(`assets/hexagram_images/${originalPath.replace('assets/', '')}`);
    }

    // 尝试不同的图片扩展名
    const basePathWithoutExt = originalPath.replace(/\.[^/.]+$/, '');
    this.imageExtensions.forEach(ext => {
      paths.push(`${basePathWithoutExt}${ext}`);
    });

    return paths.map(path => this.fixImagePath(path));
  }

  // 处理图片加载错误
  handleImageError(img) {
    const originalSrc = img.getAttribute('data-original-src') || img.src;
    const fallbackPaths = this.createFallbackPaths(originalSrc);
    
    if (this.debugMode) {
      console.log(`图片加载失败: ${img.src}`);
      console.log(`尝试备用路径:`, fallbackPaths);
    }

    // 尝试下一个备用路径
    const currentIndex = fallbackPaths.indexOf(img.src);
    if (currentIndex < fallbackPaths.length - 1) {
      img.src = fallbackPaths[currentIndex + 1];
      if (this.debugMode) {
        console.log(`尝试新路径: ${img.src}`);
      }
    } else {
      // 所有路径都失败时显示错误提示
      this.showImageError(img);
    }
  }

  // 显示图片错误提示
  showImageError(img) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'image-error';
    errorDiv.innerHTML = `
      <div style="
        padding: 10px;
        border: 1px solid #ff4444;
        background: #ffeeee;
        color: #333;
        text-align: center;
        margin: 5px;
        border-radius: 4px;
      ">
        <p>图片加载失败</p>
        <small>${img.getAttribute('data-original-src') || img.src}</small>
      </div>
    `;
    img.parentNode.replaceChild(errorDiv, img);
  }

  // 修复页面上所有图片
  fixAllImages() {
    const images = document.getElementsByTagName('img');
    Array.from(images).forEach(img => {
      // 保存原始路径
      if (!img.getAttribute('data-original-src')) {
        img.setAttribute('data-original-src', img.src);
      }

      // 修复路径
      img.src = this.fixImagePath(img.src);

      // 添加错误处理
      img.onerror = () => this.handleImageError(img);
    });
  }
}

// 创建并运行修复器
const imageFixer = new ImagePathFixer();

// 在DOM加载完成时修复图片
document.addEventListener('DOMContentLoaded', () => {
  console.log('正在修复页面图片路径...');
  imageFixer.fixAllImages();
});

// 监听动态添加的图片
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeName === 'IMG') {
        imageFixer.fixAllImages();
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
}); 