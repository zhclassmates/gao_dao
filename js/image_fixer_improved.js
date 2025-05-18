// 改进版图片修复脚本 - 处理多种图片路径格式
// 此脚本解决Chrome扩展环境下图片路径的问题

// 图片路径修复函数
function fixImagePaths() {
  const images = document.querySelectorAll('img');
  let fixedCount = 0;
  
  console.log(`准备修复 ${images.length} 个图片路径`);
  
  images.forEach(img => {
    const src = img.getAttribute('src');
    
    // 跳过已经正确的图片
    if (!src || src.startsWith('chrome-extension://') || src.startsWith('http')) {
      return;
    }
    
    // 保存原始路径用于调试
    img.setAttribute('data-original-src', src);
    
    // 构建新路径
    let newSrc = '';
    
    // 路径修复逻辑
    try {
      // 尝试使用标准API获取URL
      newSrc = chrome.runtime.getURL(src);
    } catch (error) {
      try {
        // 尝试使用扩展ID
        const extensionId = chrome.runtime.id || '__MSG_@@extension_id__';
        newSrc = `chrome-extension://${extensionId}/${src}`;
      } catch (innerError) {
        // 最后的降级方案，使用通配符
        newSrc = `chrome-extension://__MSG_@@extension_id__/${src}`;
      }
    }
    
    // 处理hexagram_book前缀(如果有)，因为实际路径直接在hexagram_images下
    if (newSrc.includes('hexagram_book/hexagram_images')) {
      // 移除hexagram_book前缀
      newSrc = newSrc.replace('/hexagram_book/hexagram_images/', '/hexagram_images/');
    }
    
    // 设置新的图片路径
    console.log(`修复图片路径: ${src} -> ${newSrc}`);
    img.setAttribute('src', newSrc);
    fixedCount++;
  });
  
  console.log(`成功修复了 ${fixedCount}/${images.length} 个图片路径`);
  return fixedCount;
}

// 添加图片加载错误处理函数
function addImageErrorHandlers() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // 只对已经修复过的图片添加错误处理
    if (img.hasAttribute('data-original-src')) {
      img.onerror = function() {
        const originalSrc = img.getAttribute('data-original-src');
        const currentSrc = img.getAttribute('src');
        
        console.error(`图片加载失败: ${currentSrc}`);
        
        // 尝试替代路径
        let alternativeSrc = '';
        
        if (currentSrc.includes('hexagram_book/hexagram_images')) {
          // 移除hexagram_book前缀
          alternativeSrc = currentSrc.replace('/hexagram_book/hexagram_images/', '/hexagram_images/');
        } else if (currentSrc.includes('hexagram_images') && !currentSrc.includes('/hexagram_images/')) {
          // 确保路径格式正确
          const parts = currentSrc.split('hexagram_images');
          alternativeSrc = `${parts[0]}hexagram_images/${parts[1]}`;
        }
        
        if (alternativeSrc && alternativeSrc !== currentSrc) {
          console.log(`尝试替代路径: ${alternativeSrc}`);
          img.setAttribute('src', alternativeSrc);
        }
      };
    }
  });
}

// 在DOM加载后执行
function initialize() {
  console.log('开始修复图片路径');
  const fixedCount = fixImagePaths();
  
  // 添加图片错误处理
  addImageErrorHandlers();
  
  // 添加诊断信息
  if (fixedCount > 0) {
    console.log('完成图片路径修复，已修复 ' + fixedCount + ' 个图片');
  } else {
    console.log('没有发现需要修复的图片路径');
  }
}

// 检测DOM加载状态并执行初始化
if (document.readyState === 'loading') {
  console.log('DOM正在加载，等待DOMContentLoaded事件');
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  console.log('DOM已加载，立即执行修复');
  initialize();
} 