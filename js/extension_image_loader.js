/**
 * 周易六十四卦扩展 - 图片加载修复脚本
 * 此脚本用于解决HTML文件中图片无法正确显示的问题
 * 版本: 3.0.0
 */

// 立即执行函数，避免变量污染全局作用域
(function() {
  // 记录执行开始时间，用于性能统计
  const startTime = performance.now();
  
  // 配置选项
  const config = {
    debug: true,          // 是否输出调试信息
    fixOnLoad: true,      // 是否在页面加载时自动修复图片
    observeChanges: true, // 是否监视DOM变化并修复新图片
    showErrors: true,     // 是否显示加载错误提示
    fixAttempts: 3,       // 最大尝试修复次数
    addBackButton: true,  // 是否添加返回按钮
    addPageEnhancement: true, // 是否添加页面增强功能
    // 新增配置项
    forceExtensionId: true, // 是否强制使用从URL获取的扩展ID
    tryAlternativePaths: true // 是否尝试替代路径方案
  };
  
  // 获取当前扩展ID - 多种方式获取确保可靠性
  let extensionId = '';
  
  // 获取扩展ID的多种方式
  function getExtensionId() {
    try {
      // 方法1: 尝试从URL获取扩展ID (这种方式最可靠)
      if (window.location.href.includes('chrome-extension://')) {
        extensionId = window.location.href.split('/')[2];
        debug('从URL获取到扩展ID:', extensionId);
        return extensionId;
      }
      
      // 方法2: 尝试从chrome.runtime获取
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        extensionId = chrome.runtime.id;
        debug('从chrome.runtime获取到扩展ID:', extensionId);
        return extensionId;
      }
      
      // 方法3: 尝试从meta标签获取
      const metaTag = document.querySelector('meta[name="extension-id"]');
      if (metaTag && metaTag.content) {
        extensionId = metaTag.content;
        debug('从meta标签获取到扩展ID:', extensionId);
        return extensionId;
      }
      
      // 方法4: 使用硬编码的ID - 仅作为最后的备选方案
      extensionId = 'egnoijbcekkboakeogconjjopfmbnhkh'; // 这里使用上报错的ID
      debug('使用硬编码的扩展ID:', extensionId);
      return extensionId;
    } catch (e) {
      console.error('获取扩展ID失败:', e);
      extensionId = 'egnoijbcekkboakeogconjjopfmbnhkh'; // 使用已知ID作为备选
      return extensionId;
    }
  }
  
  // 初始化获取扩展ID
  extensionId = getExtensionId();
  
  /**
   * 调试日志输出
   */
  function debug(...args) {
    if (config.debug) {
      console.log('[图片修复]', ...args);
    }
  }
  
  /**
   * 修复单个图片元素的路径
   * @param {HTMLImageElement} img - 图片元素
   * @returns {boolean} - 是否进行了修复
   */
  function fixImageSrc(img) {
    if (!img || !img.src) return false;
    
    // 如果图片已经加载成功，不进行处理
    if (img.complete && img.naturalWidth > 0 && !img.getAttribute('data-fix-attempted')) {
      debug('图片已正确加载，无需修复:', img.src);
      return false;
    }
    
    // 标记此图片已尝试修复，避免重复处理
    img.setAttribute('data-fix-attempted', 'true');
    
    const originalSrc = img.src;
    let newSrc = '';
    
    // 情况1: 处理已有chrome-extension://但使用了占位符的情况
    if (originalSrc.includes('chrome-extension://') && originalSrc.includes('__MSG_@@extension_id__')) {
      newSrc = originalSrc.replace('__MSG_@@extension_id__', extensionId);
      debug('替换占位符', originalSrc, '->', newSrc);
    }
    // 情况2: 处理已有chrome-extension://但ID不正确的情况
    else if (originalSrc.includes('chrome-extension://') && !originalSrc.includes(extensionId)) {
      const urlParts = originalSrc.split('/');
      if (urlParts.length >= 3) {
        urlParts[2] = extensionId;
        newSrc = urlParts.join('/');
        debug('替换错误扩展ID', originalSrc, '->', newSrc);
      }
    }
    // 情况3: 处理相对路径 (无协议头)
    else if (!originalSrc.startsWith('chrome-extension://') && !originalSrc.startsWith('http')) {
      // 去除开头的斜杠
      const cleanPath = originalSrc.replace(/^\/+/, '');
      newSrc = `chrome-extension://${extensionId}/${cleanPath}`;
      debug('修复相对路径', originalSrc, '->', newSrc);
    }
    // 其他情况不处理
    else {
      return false;
    }
    
    // 如果路径未发生变化，尝试使用硬编码ID
    if ((newSrc === originalSrc || newSrc === '') && config.forceExtensionId) {
      debug('强制使用已知扩展ID');
      const hardcodedId = 'egnoijbcekkboakeogconjjopfmbnhkh';
      
      if (originalSrc.includes('chrome-extension://')) {
        const urlParts = originalSrc.split('/');
        if (urlParts.length >= 3) {
          urlParts[2] = hardcodedId;
          newSrc = urlParts.join('/');
        }
      } else {
        const cleanPath = originalSrc.replace(/^\/+/, '');
        newSrc = `chrome-extension://${hardcodedId}/${cleanPath}`;
      }
    }
    
    // 特殊情况处理: 如果路径包含hexagram_book目录，纠正路径
    if (newSrc.includes('/hexagram_book/hexagram_images/')) {
      newSrc = newSrc.replace('/hexagram_book/hexagram_images/', '/hexagram_images/');
      debug('修复特殊目录结构', originalSrc, '->', newSrc);
    }
    
    // 处理01_乾卦的特殊情况
    if (newSrc.includes('hexagram_images') && !newSrc.includes('01_乾卦')) {
      if (window.location.href.includes('hexagram_01_combined.html')) {
        newSrc = newSrc.replace(/hexagram_images\/(.+?)\//, 'hexagram_images/01_乾卦/');
        debug('修复卦象路径', originalSrc, '->', newSrc);
      }
    }
    
    // 修复路径中的转义字符
    if (newSrc.includes('%')) {
      try {
        newSrc = decodeURIComponent(newSrc);
      } catch (e) {
        debug('URL解码错误', e);
      }
    }
    
    // 确保路径中没有多余的斜杠
    newSrc = newSrc.replace(/([^:])\/+/g, '$1/');
    
    // 保存原始路径，用于调试和错误恢复
    img.setAttribute('data-original-src', originalSrc);
    
    // 设置新的图片路径
    img.src = newSrc;
    debug('修复图片路径', originalSrc, '->', newSrc);
    
    // 添加错误处理
    if (!img.hasAttribute('data-error-handler-added')) {
      img.setAttribute('data-error-handler-added', 'true');
      img.addEventListener('error', handleImageError);
    }
    
    return true;
  }
  
  /**
   * 处理图片加载错误
   * @param {Event} event - 错误事件
   */
  function handleImageError(event) {
    const img = event.target;
    if (!img || !img.src) return;
    
    const currentSrc = img.src;
    const originalSrc = img.getAttribute('data-original-src') || '';
    
    debug('图片加载失败', currentSrc);
    
    // 记录尝试过的替代路径
    let attempts = parseInt(img.getAttribute('data-fix-attempts') || '0') + 1;
    img.setAttribute('data-fix-attempts', attempts.toString());
    
    // 最多尝试设定的次数
    if (attempts > config.fixAttempts) {
      if (config.showErrors) {
        showImageError(img);
      }
      return;
    }
    
    // 尝试几种可能的替代路径
    let altSrc = '';
    
    // 替代方案1: 获取当前HTML文件名，确定卦象编号
    if (config.tryAlternativePaths) {
      const pathname = window.location.pathname;
      const htmlFile = pathname.split('/').pop();
      let hexagramNumber = '';
      
      if (htmlFile && htmlFile.startsWith('hexagram_') && htmlFile.includes('_combined')) {
        hexagramNumber = htmlFile.replace('hexagram_', '').replace('_combined.html', '');
        debug('从HTML文件名获取卦象编号:', hexagramNumber);
        
        // 如果是01卦象，直接尝试01_乾卦目录
        if (hexagramNumber === '01') {
          if (currentSrc.includes('/hexagram_images/')) {
            // 提取图片文件名
            const imgName = currentSrc.split('/').pop();
            // 构造新路径 - 本卦图片
            altSrc = `chrome-extension://${extensionId}/hexagram_images/01_乾卦/本卦/01_乾卦_本卦_${imgName.replace(/\D/g, '')}.jpg`;
            debug('尝试替代路径(本卦):', altSrc);
          }
        }
      }
    }
    
    // 替代方案2: 直接使用hexagram_images路径
    if (!altSrc && currentSrc.includes('/hexagram_images/')) {
      const pathParts = currentSrc.split('/hexagram_images/');
      if (pathParts.length > 1) {
        const imgPath = pathParts[1];
        altSrc = `chrome-extension://${extensionId}/hexagram_images/${imgPath}`;
        debug('尝试替代路径2:', altSrc);
      }
    }
    
    // 替代方案3: 尝试相对于扩展根目录的路径
    if (!altSrc && originalSrc) {
      const cleanPath = originalSrc.replace(/^\/+/, '').replace(/^hexagram_book\//, '');
      altSrc = `chrome-extension://${extensionId}/${cleanPath}`;
      debug('尝试替代路径3:', altSrc);
    }
    
    // 替代方案4: 尝试常见目录错误修复
    if (!altSrc && currentSrc.includes('/本卦/')) {
      // 一些常见的目录结构错误修复
      altSrc = currentSrc.replace('/本卦/', '/变卦/');
      debug('尝试替代路径4:', altSrc);
    }
    
    if (altSrc && altSrc !== currentSrc) {
      debug('使用替代路径', altSrc);
      img.src = altSrc;
    } else {
      if (config.showErrors) {
        showImageError(img);
      }
    }
  }
  
  /**
   * 显示图片加载错误提示
   * @param {HTMLImageElement} img - 图片元素
   */
  function showImageError(img) {
    if (!config.showErrors) return;
    
    // 避免重复添加错误提示
    if (img.hasAttribute('data-error-shown')) return;
    img.setAttribute('data-error-shown', 'true');
    
    // 设置替代文本
    img.alt = `[图片加载失败: ${img.getAttribute('data-original-src') || img.src}]`;
    
    // 设置错误样式
    img.style.border = '1px dashed red';
    img.style.padding = '5px';
    img.style.minHeight = '30px';
    img.style.minWidth = '30px';
    img.style.backgroundColor = '#ffeeee';
    
    // 添加错误提示
    const parent = img.parentNode;
    if (parent) {
      const errorDiv = document.createElement('div');
      errorDiv.style.color = 'red';
      errorDiv.style.fontSize = '12px';
      errorDiv.style.textAlign = 'center';
      errorDiv.style.marginTop = '5px';
      errorDiv.textContent = '图片加载失败';
      parent.appendChild(errorDiv);
      
      // 添加重试按钮
      const retryBtn = document.createElement('button');
      retryBtn.textContent = '重试';
      retryBtn.style.marginTop = '5px';
      retryBtn.style.fontSize = '12px';
      retryBtn.style.padding = '2px 8px';
      retryBtn.style.cursor = 'pointer';
      retryBtn.onclick = function() {
        // 重置错误状态
        img.removeAttribute('data-error-shown');
        img.removeAttribute('data-fix-attempts');
        // 清除错误提示
        while (parent.lastChild !== img) {
          parent.removeChild(parent.lastChild);
        }
        // 重新修复
        fixImageSrc(img);
      };
      parent.appendChild(retryBtn);
      
      // 添加诊断按钮
      const diagBtn = document.createElement('button');
      diagBtn.textContent = '诊断';
      diagBtn.style.marginTop = '5px';
      diagBtn.style.marginLeft = '5px';
      diagBtn.style.fontSize = '12px';
      diagBtn.style.padding = '2px 8px';
      diagBtn.style.cursor = 'pointer';
      diagBtn.onclick = function() {
        showDiagnosticInfo(img);
      };
      parent.appendChild(diagBtn);
    }
  }
  
  /**
   * 显示图片诊断信息
   */
  function showDiagnosticInfo(img) {
    const diagPopup = document.createElement('div');
    diagPopup.style.position = 'fixed';
    diagPopup.style.top = '50%';
    diagPopup.style.left = '50%';
    diagPopup.style.transform = 'translate(-50%, -50%)';
    diagPopup.style.backgroundColor = '#fff';
    diagPopup.style.border = '1px solid #ccc';
    diagPopup.style.padding = '15px';
    diagPopup.style.zIndex = '9999';
    diagPopup.style.maxWidth = '80%';
    diagPopup.style.maxHeight = '80%';
    diagPopup.style.overflow = 'auto';
    diagPopup.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    
    const title = document.createElement('h3');
    title.textContent = '图片诊断信息';
    title.style.marginTop = '0';
    diagPopup.appendChild(title);
    
    const originalSrc = document.createElement('p');
    originalSrc.innerHTML = `<strong>原始路径:</strong> ${img.getAttribute('data-original-src') || '未知'}`;
    diagPopup.appendChild(originalSrc);
    
    const currentSrc = document.createElement('p');
    currentSrc.innerHTML = `<strong>当前路径:</strong> ${img.src}`;
    diagPopup.appendChild(currentSrc);
    
    const extensionIdInfo = document.createElement('p');
    extensionIdInfo.innerHTML = `<strong>扩展ID:</strong> ${extensionId}`;
    diagPopup.appendChild(extensionIdInfo);
    
    const pageUrl = document.createElement('p');
    pageUrl.innerHTML = `<strong>页面URL:</strong> ${window.location.href}`;
    diagPopup.appendChild(pageUrl);
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.marginTop = '10px';
    closeBtn.onclick = function() {
      document.body.removeChild(diagPopup);
    };
    diagPopup.appendChild(closeBtn);
    
    document.body.appendChild(diagPopup);
  }
  
  /**
   * 修复页面上所有图片
   * @returns {number} - 修复的图片数量
   */
  function fixAllImages() {
    const images = document.querySelectorAll('img');
    debug(`开始修复 ${images.length} 个图片`);
    
    let fixedCount = 0;
    images.forEach(img => {
      if (fixImageSrc(img)) {
        fixedCount++;
      }
    });
    
    debug(`完成修复 ${fixedCount}/${images.length} 个图片`);
    return fixedCount;
  }
  
  /**
   * 监视DOM变化，修复新添加的图片
   */
  function observeDomChanges() {
    if (!config.observeChanges || typeof MutationObserver !== 'function') {
      return;
    }
    
    const observer = new MutationObserver(mutations => {
      let newImages = false;
      
      mutations.forEach(mutation => {
        // 检查新添加的节点中是否有图片
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            // 如果添加的是图片节点
            if (node.nodeName === 'IMG') {
              newImages = true;
              fixImageSrc(node);
            }
            // 如果添加的是包含图片的节点
            else if (node.nodeType === 1) {
              const images = node.querySelectorAll('img');
              if (images.length > 0) {
                newImages = true;
                images.forEach(img => fixImageSrc(img));
              }
            }
          });
        }
      });
      
      if (newImages) {
        debug('监测到新图片添加，已修复');
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    debug('DOM变化观察器已启动');
  }
  
  /**
   * 设置全局错误处理
   */
  function setupGlobalErrorHandling() {
    // 监听所有图片的加载错误
    window.addEventListener('error', function(event) {
      if (event.target && event.target.tagName === 'IMG') {
        // 处理图片加载错误
        if (!event.target.hasAttribute('data-error-handler-added')) {
          handleImageError(event);
        }
      }
    }, true);
    
    debug('全局错误处理已设置');
  }
  
  /**
   * 添加扩展ID的Meta标签，方便其他脚本获取
   */
  function addExtensionIdMeta() {
    if (!extensionId) return;
    
    let meta = document.querySelector('meta[name="extension-id"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'extension-id';
      meta.content = extensionId;
      document.head.appendChild(meta);
      debug('添加扩展ID Meta标签');
    }
  }
  
  /**
   * 增强HTML页面
   */
  function enhanceHtmlPage() {
    if (!config.addPageEnhancement) return;
    
    // 添加返回按钮
    if (config.addBackButton) {
      const backBtnContainer = document.createElement('div');
      backBtnContainer.style.position = 'fixed';
      backBtnContainer.style.top = '10px';
      backBtnContainer.style.left = '10px';
      backBtnContainer.style.zIndex = '9999';
      
      const backBtn = document.createElement('button');
      backBtn.innerHTML = '← 返回';
      backBtn.style.padding = '5px 10px';
      backBtn.style.fontSize = '14px';
      backBtn.style.backgroundColor = '#f5f5f5';
      backBtn.style.border = '1px solid #ccc';
      backBtn.style.borderRadius = '4px';
      backBtn.style.cursor = 'pointer';
      backBtn.onclick = function() {
        window.history.back();
      };
      
      backBtnContainer.appendChild(backBtn);
      document.body.appendChild(backBtnContainer);
    }
    
    // 修复中文路径编码问题
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        img[src*="chrome-extension"] {
          max-width: 100% !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    debug('页面增强功能已添加');
  }
  
  /**
   * 初始化函数
   */
  function initialize() {
    debug('图片修复脚本开始初始化，扩展ID:', extensionId);
    
    // 添加扩展ID的Meta标签
    addExtensionIdMeta();
    
    // 初始修复所有图片
    if (config.fixOnLoad) {
      // 如果DOM已加载完成
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        fixAllImages();
      } else {
        // 等待DOM加载完成
        document.addEventListener('DOMContentLoaded', fixAllImages);
      }
    }
    
    // 设置全局错误处理
    setupGlobalErrorHandling();
    
    // 监视DOM变化
    if (config.observeChanges) {
      if (document.body) {
        observeDomChanges();
      } else {
        document.addEventListener('DOMContentLoaded', observeDomChanges);
      }
    }
    
    // 增强HTML页面
    if (config.addPageEnhancement) {
      if (document.body) {
        enhanceHtmlPage();
      } else {
        document.addEventListener('DOMContentLoaded', enhanceHtmlPage);
      }
    }
    
    // 记录执行时间
    const endTime = performance.now();
    debug(`初始化完成，耗时: ${(endTime - startTime).toFixed(2)}ms`);
  }
  
  // 执行初始化
  initialize();
})(); 