// 全局图片修复脚本 - 适用于Chrome扩展环境
// 用于解决所有HTML文件中的图片显示问题

/**
 * 全局图片路径修复函数
 * 1. 修复所有相对路径为扩展格式
 * 2. 处理特殊情况和目录结构变更
 * 3. 提供错误处理和回退机制
 */
function fixAllHexagramImages() {
  console.log('开始执行全局图片修复...');
  
  // 获取所有图片元素
  const images = document.querySelectorAll('img');
  let fixedCount = 0;
  let existingCount = 0;
  
  console.log(`找到 ${images.length} 个图片元素`);
  
  // 处理每个图片
  images.forEach((img, index) => {
    const originalSrc = img.getAttribute('src');
    
    // 如果已经是chrome-extension协议的路径，检查是否需要优化
    if (originalSrc && originalSrc.startsWith('chrome-extension://')) {
      // 检查是否使用了__MSG_@@extension_id__占位符但图片未显示
      if (originalSrc.includes('__MSG_@@extension_id__')) {
        // 尝试获取实际扩展ID
        try {
          const extensionId = chrome.runtime.id;
          if (extensionId) {
            const newSrc = originalSrc.replace('__MSG_@@extension_id__', extensionId);
            console.log(`替换占位符: ${originalSrc} -> ${newSrc}`);
            img.setAttribute('src', newSrc);
            fixedCount++;
          }
        } catch (e) {
          console.warn('无法获取扩展ID:', e);
        }
      }
      
      existingCount++;
      return;
    }
    
    // 跳过空路径或已处理的http(s)路径
    if (!originalSrc || originalSrc.startsWith('http')) {
      return;
    }
    
    // 保存原始路径用于调试和回退
    img.setAttribute('data-original-src', originalSrc);
    
    // 构建新路径
    let newSrc = '';
    
    // 首先尝试使用chrome.runtime.getURL
    try {
      // 处理路径前缀
      let pathToUse = originalSrc;
      
      // 移除开头的斜杠(如果有)
      if (pathToUse.startsWith('/')) {
        pathToUse = pathToUse.substring(1);
      }
      
      newSrc = chrome.runtime.getURL(pathToUse);
    } catch (error) {
      console.warn(`使用chrome.runtime.getURL失败:`, error);
      
      // 尝试使用扩展ID
      try {
        const extensionId = chrome.runtime.id || '__MSG_@@extension_id__';
        
        // 确保路径格式正确
        let pathToUse = originalSrc;
        if (pathToUse.startsWith('/')) {
          pathToUse = pathToUse.substring(1);
        }
        
        newSrc = `chrome-extension://${extensionId}/${pathToUse}`;
      } catch (innerError) {
        console.warn(`使用扩展ID失败:`, innerError);
        
        // 最后的降级方案
        newSrc = `chrome-extension://__MSG_@@extension_id__/${originalSrc.replace(/^\/+/, '')}`;
      }
    }
    
    // 处理特殊路径问题
    if (newSrc.includes('hexagram_book/hexagram_images')) {
      // 移除hexagram_book前缀
      newSrc = newSrc.replace('/hexagram_book/hexagram_images/', '/hexagram_images/');
    }
    
    // 确保路径中没有多余的斜杠
    newSrc = newSrc.replace(/([^:])\/+/g, '$1/');
    
    // 更新图片路径
    console.log(`[${index + 1}/${images.length}] 修复路径: ${originalSrc} -> ${newSrc}`);
    img.setAttribute('src', newSrc);
    fixedCount++;
    
    // 添加错误处理
    addErrorHandler(img);
  });
  
  console.log(`图片路径修复完成! 统计: 总共${images.length}张, 修复${fixedCount}张, 已正确${existingCount}张`);
  return fixedCount;
}

/**
 * 为图片添加错误处理
 * 当图片加载失败时尝试其他路径
 */
function addErrorHandler(img) {
  img.onerror = function() {
    const currentSrc = img.getAttribute('src');
    const originalSrc = img.getAttribute('data-original-src') || '';
    
    console.error(`图片加载失败: ${currentSrc}`);
    
    // 已经尝试过的替代路径
    const triedAlternatives = img.getAttribute('data-tried-alternatives') || '';
    const triedArray = triedAlternatives ? triedAlternatives.split(',') : [];
    
    // 尝试一些替代路径
    const alternatives = [
      // 替代方案1: 如果包含hexagram_book前缀，则移除
      currentSrc.includes('hexagram_book') ? currentSrc.replace('/hexagram_book/', '/') : null,
      
      // 替代方案2: 尝试使用完整的扩展ID
      chrome.runtime.id ? currentSrc.replace('__MSG_@@extension_id__', chrome.runtime.id) : null,
      
      // 替代方案3: 尝试相对路径
      chrome.runtime.id ? `chrome-extension://${chrome.runtime.id}/${originalSrc.replace(/^\/+/, '')}` : null,
      
      // 替代方案4: 如果以chrome-extension://开头但路径结构不对，尝试修复
      currentSrc.startsWith('chrome-extension://') && !currentSrc.includes('/hexagram_images/') 
        ? currentSrc.replace(/(chrome-extension:\/\/[^\/]+\/)/, '$1hexagram_images/') : null
    ].filter(Boolean); // 移除null值
    
    // 寻找未尝试过的替代路径
    const nextAlternative = alternatives.find(alt => !triedArray.includes(alt));
    
    if (nextAlternative) {
      console.log(`尝试替代路径: ${nextAlternative}`);
      
      // 记录已尝试的路径
      triedArray.push(nextAlternative);
      img.setAttribute('data-tried-alternatives', triedArray.join(','));
      
      // 设置新路径
      img.setAttribute('src', nextAlternative);
    } else {
      console.error(`无法找到有效路径，显示错误占位图`);
      
      // 设置一个错误占位图或显示原路径
      img.setAttribute('alt', `加载失败: ${originalSrc}`);
      
      // 创建错误标志
      const errorDiv = document.createElement('div');
      errorDiv.style.color = 'red';
      errorDiv.style.fontSize = '12px';
      errorDiv.textContent = '图片加载失败';
      img.parentNode.appendChild(errorDiv);
    }
  };
}

/**
 * 设置MutationObserver监视DOM变化
 * 当有新的图片元素添加时自动处理
 */
function setupImageObserver() {
  if (typeof MutationObserver === 'function') {
    const observer = new MutationObserver((mutations) => {
      let needsFixing = false;
      
      mutations.forEach((mutation) => {
        // 检查新添加的节点
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (let node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 如果是图片元素
              if (node.tagName === 'IMG') {
                needsFixing = true;
              }
              // 检查子元素中是否有图片
              else if (node.querySelectorAll) {
                const newImages = node.querySelectorAll('img');
                if (newImages.length > 0) {
                  needsFixing = true;
                }
              }
            }
          }
        }
      });
      
      // 如果有新图片元素，修复路径
      if (needsFixing) {
        console.log('检测到DOM变化，重新修复图片路径');
        fixAllHexagramImages();
      }
    });
    
    // 观察整个文档
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    
    console.log('已设置DOM变化监控');
  }
}

/**
 * 初始化函数
 */
function initialize() {
  console.log('初始化全局图片修复');
  
  // 修复当前页面上的图片
  fixAllHexagramImages();
  
  // 设置监控以处理动态添加的图片
  setupImageObserver();
  
  // 添加全局错误处理器
  window.addEventListener('error', function(event) {
    if (event.target && event.target.tagName === 'IMG') {
      console.warn('捕获到图片加载错误:', event.target.src);
      // 错误已经由各图片的onerror处理器处理
    }
  }, true);
}

// 根据文档加载状态执行初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // 文档已加载，立即执行
  initialize();
} 