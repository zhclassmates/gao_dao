// image_loader.js - 统一的图片加载器

class HexagramImageLoader {
  constructor() {
    this.imageBasePath = 'assets/hexagram_images/';
    this.imageTypes = {
      BENGUA: 'bengua',  // 本卦图
      BIANGUA: 'biangua', // 变卦图
      SYMBOL: 'symbol'   // 符号图
    };
    this.defaultImagePath = 'images/placeholder.png';
    this.cachedImages = new Map();
  }

  /**
   * 获取卦象图片路径
   * @param {number} hexagramId - 卦象ID (1-64)
   * @param {string} imageType - 图片类型 (bengua|biangua|symbol)
   * @param {number} [size=128] - 图片尺寸 (64|128|256)
   * @returns {string} 图片路径
   */
  getImagePath(hexagramId, imageType = this.imageTypes.BENGUA, size = 128) {
    if (!hexagramId || hexagramId < 1 || hexagramId > 64) {
      console.error('无效的卦象ID:', hexagramId);
      return this.defaultImagePath;
    }
    
    // 构建图片路径
    const paddedId = String(hexagramId).padStart(2, '0');
    let folderName = '';
    
    try {
      // 通过HEXAGRAM_DATA全局映射获取卦名
      const hexName = window.HEXAGRAM_DATA && window.HEXAGRAM_DATA[hexagramId] ? 
        window.HEXAGRAM_DATA[hexagramId].name : 
        `${paddedId}号卦`;
      
      folderName = `${paddedId}_${hexName}卦`;
    } catch (error) {
      console.warn('无法获取卦名，使用ID作为文件夹名', error);
      folderName = `${paddedId}_卦`;
    }
    
    // 构建最终图片路径
    let imagePath = `${this.imageBasePath}${folderName}/${imageType}_${size}.png`;
    return imagePath;
  }
  
  /**
   * 预加载指定卦象的所有图片
   * @param {number} hexagramId - 卦象ID
   * @returns {Promise<Object>} 加载结果对象，包含各类型图片的状态
   */
  async preloadHexagramImages(hexagramId) {
    if (!hexagramId || hexagramId < 1 || hexagramId > 64) {
      return { success: false, error: '无效的卦象ID' };
    }
    
    const results = {};
    const types = Object.values(this.imageTypes);
    const sizes = [64, 128, 256];
    
    // 创建所有加载任务
    const loadTasks = [];
    
    for (const type of types) {
      results[type] = {};
      
      for (const size of sizes) {
        const imagePath = this.getImagePath(hexagramId, type, size);
        const key = `${hexagramId}_${type}_${size}`;
        
        // 如果已经缓存，直接使用缓存结果
        if (this.cachedImages.has(key)) {
          results[type][size] = { 
            loaded: true, 
            src: this.cachedImages.get(key),
            fromCache: true 
          };
          continue;
        }
        
        // 创建加载任务
        const loadTask = new Promise((resolve) => {
          const img = new Image();
          
          img.onload = () => {
            this.cachedImages.set(key, imagePath);
            resolve({ 
              type, 
              size, 
              loaded: true, 
              src: imagePath 
            });
          };
          
          img.onerror = () => {
            // 尝试备用路径
            const altPath = imagePath.replace(`/${type}_`, '/');
            const altImg = new Image();
            
            altImg.onload = () => {
              this.cachedImages.set(key, altPath);
              resolve({ 
                type, 
                size, 
                loaded: true, 
                src: altPath,
                usedAlt: true 
              });
            };
            
            altImg.onerror = () => {
              resolve({ 
                type, 
                size, 
                loaded: false, 
                src: this.defaultImagePath,
                error: '图片加载失败' 
              });
            };
            
            altImg.src = altPath;
          };
          
          img.src = imagePath;
        });
        
        loadTasks.push(loadTask.then(result => {
          results[result.type][result.size] = {
            loaded: result.loaded,
            src: result.src,
            usedAlt: result.usedAlt
          };
        }));
      }
    }
    
    // 等待所有任务完成
    await Promise.all(loadTasks);
    return {
      success: true,
      hexagramId,
      results
    };
  }
  
  /**
   * 创建图片元素
   * @param {string} src - 图片路径
   * @param {string} alt - 图片描述
   * @param {Object} [options={}] - 附加选项 (width, height, className)
   * @returns {HTMLImageElement} 图片元素
   */
  createImageElement(src, alt, options = {}) {
    const img = document.createElement('img');
    img.src = src || this.defaultImagePath;
    img.alt = alt || '卦象图片';
    
    if (options.width) {
      img.width = options.width;
    }
    
    if (options.height) {
      img.height = options.height;
    }
    
    if (options.className) {
      img.className = options.className;
    }
    
    // 添加错误处理
    img.onerror = () => {
      console.warn(`图片加载失败: ${src}，使用默认图片`);
      img.src = this.defaultImagePath;
      
      // 防止默认图片也加载失败导致无限循环
      img.onerror = null;
    };
    
    return img;
  }
  
  /**
   * 将图片附加到指定元素
   * @param {HTMLElement} container - 容器元素
   * @param {number} hexagramId - 卦象ID
   * @param {string} [imageType=this.imageTypes.BENGUA] - 图片类型
   * @param {number} [size=128] - 图片尺寸
   * @param {string} [altText=''] - 图片描述
   * @returns {HTMLImageElement} 添加的图片元素
   */
  appendImageToElement(container, hexagramId, imageType = this.imageTypes.BENGUA, size = 128, altText = '') {
    if (!container || !(container instanceof HTMLElement)) {
      console.error('无效的容器元素');
      return null;
    }
    
    const imagePath = this.getImagePath(hexagramId, imageType, size);
    const imgAlt = altText || `卦象 ${hexagramId} ${imageType} 图`;
    
    const img = this.createImageElement(imagePath, imgAlt, {
      width: size,
      height: size,
      className: `hexagram-image ${imageType}-image`
    });
    
    // 清空容器并添加新图片
    container.innerHTML = '';
    container.appendChild(img);
    
    return img;
  }
}

// 导出给全局使用
window.HexagramImageLoader = HexagramImageLoader; 