// hexagram_controller.js
// 卦象控制器，处理卦象数据的加载和显示

class HexagramController {
  constructor() {
    this.dataProcessor = new HexagramDataProcessor();
    this.imageLoader = new HexagramImageLoader();
    this.hexagramsData = [];
    this.currentHexagram = null;
    this._retried = false;
  }
  
  // 初始化控制器
  async initialize() {
    try {
      // 从存储中加载数据
      await this.loadHexagramsData();
      return true;
    } catch (error) {
      console.error('初始化卦象控制器失败:', error);
      return false;
    }
  }
  
  // 加载卦象数据
  async loadHexagramsData() {
    try {
      console.log('开始加载卦象数据...');
      
      // 尝试从Chrome存储中获取数据
      const storageData = await this.getStorageData('hexagramsData');
      console.log('从存储中读取的数据:', storageData);
      
      if (storageData && storageData.hexagramsData && storageData.hexagramsData.length > 0) {
        this.hexagramsData = storageData.hexagramsData;
        console.log(`从存储中加载了 ${this.hexagramsData.length} 个卦象数据`);
        
        // 额外检查数据完整性
        const missingIds = [];
        for (let i = 1; i <= 64; i++) {
          if (!this.hexagramsData.some(h => h.id === i)) {
            missingIds.push(i);
          }
        }
        
        if (missingIds.length > 0) {
          console.warn('从存储加载的数据不完整，缺少以下卦象ID:', missingIds);
          
          // 如果缺失的卦象太多，强制重新加载
          if (missingIds.length > 5) {
            console.warn('缺失的卦象过多，将重新从HTML文件加载...');
            // 清除存储的缓存数据
            await this.setStorageData({ hexagramsData: [] });
            // 重新加载数据
            this.hexagramsData = await this.dataProcessor.initialize();
            
            if (this.hexagramsData.length === 0) {
              throw new Error('从HTML文件重新加载数据失败');
            }
            
            // 保存到存储
            await this.setStorageData({ hexagramsData: this.hexagramsData });
            console.log(`重新加载并保存了 ${this.hexagramsData.length} 个卦象数据`);
          }
        }
      } else {
        // 如果存储中没有数据，则从HTML文件中加载
        console.log('存储中无数据，从HTML文件加载卦象数据...');
        this.hexagramsData = await this.dataProcessor.initialize();
        console.log(`从HTML文件加载了 ${this.hexagramsData.length} 个卦象数据`);
        
        if (this.hexagramsData.length === 0) {
          console.error('从HTML文件加载的卦象数据为空，请检查HTML文件是否正确复制');
          throw new Error('卦象数据加载失败：数据为空');
        }
        
        // 检查卦象数据完整性
        const missingIds = [];
        for (let i = 1; i <= 64; i++) {
          if (!this.hexagramsData.some(h => h.id === i)) {
            missingIds.push(i);
          }
        }
        
        if (missingIds.length > 0) {
          console.warn(`以下卦象ID缺失: ${missingIds.join(', ')}`);
        } else {
          console.log('所有64个卦象数据已完整加载');
        }
        
        // 将数据保存到存储中
        try {
          await this.setStorageData({ hexagramsData: this.hexagramsData });
          console.log('卦象数据已保存到存储中');
        } catch (error) {
          console.error('保存数据到存储失败:', error);
        }
      }
      
      // 输出已加载的卦象ID
      const loadedIds = this.hexagramsData.map(h => h.id).sort((a, b) => a - b);
      console.log('已加载的卦象ID:', loadedIds.join(', '));
      
      return this.hexagramsData;
    } catch (error) {
      console.error('加载卦象数据失败:', error);
      
      // 如果是第一次尝试失败，再尝试一次
      if (!this._retried) {
        console.log('尝试重新加载数据...');
        this._retried = true;
        // 清除存储
        await this.setStorageData({ hexagramsData: [] });
        // 重新加载
        return await this.loadHexagramsData();
      }
      
      // 如果重试也失败，返回空数组
      return [];
    }
  }
  
  // 通过上卦、下卦和动爻获取卦象
  getHexagram(upperNum, lowerNum, changeLine) {
    console.log(`开始获取卦象: 上卦=${upperNum}(${TRIGRAMS[upperNum].name}), 下卦=${lowerNum}(${TRIGRAMS[lowerNum].name}), 动爻=${changeLine}`);
    
    // 输入验证
    if (upperNum < 1 || upperNum > 8 || lowerNum < 1 || lowerNum > 8 || changeLine < 1 || changeLine > 6) {
      console.error('输入参数无效');
      return null;
    }
    
    // 获取六十四卦索引
    const hexagramIndex = getHexagramIndex(upperNum, lowerNum);
    console.log(`根据映射表, 卦象索引是: ${hexagramIndex}`);
    
    // 检查hexagramsData是否已正确加载
    console.log(`当前已加载 ${this.hexagramsData.length} 个卦象数据`);
    
    // 首先检查是否已经有这个卦象的数据
    const existingHexagram = this.hexagramsData.find(h => h.id === hexagramIndex);
    if (existingHexagram) {
      console.log(`卦象 ${hexagramIndex} 已存在于数据中，直接返回`);
      this.currentHexagram = {
        data: existingHexagram,
        upperGua: upperNum,
        lowerGua: lowerNum,
        changeLine: changeLine,
        hexagramIndex: hexagramIndex
      };
      return this.currentHexagram;
    }
    
    // 若没有数据，则创建临时卦象数据
    const tempHexagram = {
      id: hexagramIndex,
      title: `卦象 ${hexagramIndex}`,
      upperGua: upperNum,
      lowerGua: lowerNum,
      changeLine: changeLine,
      guaCi: '加载中...',
      xiangCi: '加载中...',
      plainTextExplanation: '数据正在加载，请稍候...',
      traditionalExplanation: '请等待数据加载完成',
      yaoExplanations: Array(6).fill(null).map((_, i) => ({
        position: i + 1,
        content: `爻位 ${i + 1} 数据加载中...`
      })),
      book: {
        overview: '数据加载中...',
        career: '数据加载中...',
        wealth: '数据加载中...',
        love: '数据加载中...',
        health: '数据加载中...',
        yaoContent: Array(6).fill(null).map((_, i) => ({
          position: i + 1,
          content: `动爻位置 ${i + 1} 数据加载中...`
        }))
      }
    };
    
    // 设置当前卦象
    this.currentHexagram = {
      data: tempHexagram,
      upperGua: upperNum,
      lowerGua: lowerNum,
      changeLine: changeLine,
      hexagramIndex: hexagramIndex
    };
    
    // 立即强制加载该卦象文件
    const paddedNumber = hexagramIndex.toString().padStart(2, '0');
    const filename = `hexagram_${paddedNumber}_combined.html`;
    
    // 异步加载，但不阻塞返回
    this.dataProcessor.loadHexagramFile(filename, hexagramIndex)
      .then(data => {
        if (data) {
          console.log(`成功加载卦象 ${hexagramIndex} 数据`);
          
          // 检查是否已存在该卦象数据，避免重复添加
          const existingIndex = this.hexagramsData.findIndex(h => h.id === hexagramIndex);
          if (existingIndex >= 0) {
            // 更新现有数据
            this.hexagramsData[existingIndex] = data;
          } else {
            // 添加新数据
            this.hexagramsData.push(data);
          }
          
          // 更新当前卦象数据（如果当前卦象ID匹配）
          if (this.currentHexagram && this.currentHexagram.hexagramIndex === hexagramIndex) {
            this.currentHexagram.data = data;
          }
          
          // 保存到存储
          this.setStorageData({ hexagramsData: this.hexagramsData })
            .then(() => console.log('数据已保存到存储'))
            .catch(err => console.error('保存数据失败:', err));
          
          // 如果有DOM元素需要更新，触发事件
          const event = new CustomEvent('hexagramDataUpdated', { 
            detail: { hexagramId: hexagramIndex, data } 
          });
          document.dispatchEvent(event);
        }
      })
      .catch(error => console.error(`加载卦象 ${hexagramIndex} 失败:`, error));
      
    // 返回临时卦象数据
    return this.currentHexagram;
  }
  
  // 获取卦象HTML文件路径
  getHexagramHtmlPath(hexagramId) {
    const paddedNumber = hexagramId.toString().padStart(2, '0');
    const filename = `hexagram_${paddedNumber}_combined.html`;
    return `../assets/html_combined/${filename}`;
  }
  
  // 安全获取URL
  safeGetURL(path) {
    try {
      // 如果是相对路径，转换为chrome-extension://形式
      if (path.startsWith('../') || path.startsWith('./') || !path.includes('://')) {
        const baseUrl = `chrome-extension://${chrome.runtime.id}`;
        // 移除路径开头的../或./
        const cleanPath = path.replace(/^\.\.\/|^\.\//g, '');
        return `${baseUrl}/${cleanPath}`;
      }
      
      // 如果已经是完整URL，直接返回
      return path;
    } catch (error) {
      console.error('转换URL失败:', error);
      return path;
    }
  }
  
  // 显示卦象解释
  async displayHexagramInterpretation(element, gender) {
    try {
      console.log('显示卦象解释:', this.currentHexagram);
      
      // 添加加载中样式标记
      const resultContainer = document.getElementById('result-container');
      if (resultContainer) {
        resultContainer.classList.add('loading');
      }
      
      // 获取当前卦象数据
      const hexagram = this.currentHexagram;
      if (!hexagram || !hexagram.data) {
        throw new Error('卦象数据不存在');
      }
      
      const hexagramData = hexagram.data;
      const changeLine = hexagram.changeLine;
      
      // 更新标题和基本信息（使用一次性操作减少重绘）
      if (element.title) {
        element.title.innerHTML = `
          <h2>${hexagramData.id}. ${window.HEXAGRAM_DATA.getHexagramName(hexagramData.id) || '未知卦象'}</h2>
          <p>${window.HEXAGRAM_DATA.trigrams[hexagram.upperGua].name}${window.HEXAGRAM_DATA.trigrams[hexagram.lowerGua].name}卦 · ${window.HEXAGRAM_DATA.getYaoName(changeLine)}动</p>
        `;
      }
      
      // 预先隐藏内容元素，减少渲染闪烁
      const contentElements = [
        element.guaCi, element.xiangCi, element.plainText, 
        element.traditional, element.yao, element.bookOverview,
        element.bookCareer, element.bookWealth, 
        element.bookLove, element.bookHealth, element.bookYao
      ];
      
      contentElements.forEach(el => {
        if (el) el.classList.add('no-transition');
      });
      
      // 使用单一批量更新减少渲染
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 更新基本信息内容
      if (element.guaCi) element.guaCi.innerHTML = `<p>${hexagramData.guaCi || '暂无卦辞'}</p>`;
      if (element.xiangCi) element.xiangCi.innerHTML = `<p>${hexagramData.xiangCi || '暂无象辞'}</p>`;
      if (element.plainText) element.plainText.innerHTML = `<p>${hexagramData.plainTextExplanation || '暂无解释'}</p>`;
      if (element.traditional) element.traditional.innerHTML = `<p>${hexagramData.traditionalExplanation || '暂无传统解释'}</p>`;
      
      // 更新爻辞解释（动爻特殊处理）
      if (element.yao) {
        const yaoContent = this.getYaoExplanation(hexagramData, changeLine);
        element.yao.innerHTML = yaoContent || '<p>暂无爻辞解释</p>';
      }
      
      // 更新现代解读内容
      if (element.bookOverview) element.bookOverview.innerHTML = `<p>${hexagramData.book?.overview || '暂无概述'}</p>`;
      if (element.bookCareer) element.bookCareer.innerHTML = `<p>${hexagramData.book?.career || '暂无事业解释'}</p>`;
      if (element.bookWealth) element.bookWealth.innerHTML = `<p>${hexagramData.book?.wealth || '暂无财富解释'}</p>`;
      if (element.bookLove) element.bookLove.innerHTML = `<p>${hexagramData.book?.love || '暂无爱情解释'}</p>`;
      if (element.bookHealth) element.bookHealth.innerHTML = `<p>${hexagramData.book?.health || '暂无健康解释'}</p>`;
      
      // 更新动爻解释
      if (element.bookYao) {
        const bookYaoContent = this.getBookYaoExplanation(hexagramData, changeLine);
        element.bookYao.innerHTML = bookYaoContent || '<p>暂无动爻解释</p>';
      }
      
      // 恢复过渡效果
      await new Promise(resolve => setTimeout(resolve, 50));
      contentElements.forEach(el => {
        if (el) el.classList.remove('no-transition');
      });
      
      // 移除加载中样式标记
      if (resultContainer) {
        resultContainer.classList.remove('loading');
      }
      
      console.log('卦象解释显示完成');
      return true;
    } catch (error) {
      console.error('显示卦象解释失败:', error);
      
      // 错误处理 - 显示错误信息
      if (element.title) {
        element.title.innerHTML = `<h2>加载失败</h2><p>无法加载卦象详细信息</p>`;
      }
      
      const errorMessage = `
        <div class="error-message">
          <p>抱歉，加载卦象详细信息失败。</p>
          <p>错误信息: ${error.message}</p>
          <p>请返回重试或刷新页面。</p>
        </div>
      `;
      
      // 在所有内容区域显示错误信息
      [
        element.guaCi, element.xiangCi, element.plainText, 
        element.traditional, element.yao, element.bookOverview
      ].forEach(el => {
        if (el) el.innerHTML = errorMessage;
      });
      
      // 移除加载中样式标记
      const resultContainer = document.getElementById('result-container');
      if (resultContainer) {
        resultContainer.classList.remove('loading');
      }
      
      return false;
    }
  }
  
  // 获取动爻解释
  getYaoExplanation(hexagramData, changeLine) {
    if (!hexagramData || !hexagramData.yaoExplanations || hexagramData.yaoExplanations.length === 0) {
      return '无动爻解释';
    }
    
    // 查找对应爻位的解释
    const yaoExplanation = hexagramData.yaoExplanations.find(y => y.position === changeLine);
    
    if (!yaoExplanation) {
      return `无第${changeLine}爻的解释`;
    }
    
    return yaoExplanation.content || `无第${changeLine}爻的解释`;
  }
  
  // 获取高岛易断解释
  getBookExplanation(element) {
    if (!this.currentHexagram) {
      element.innerHTML = '<p>请先选择一个卦象</p>';
      return false;
    }
    
    const { data, changeLine } = this.currentHexagram;
    
    if (!data.book) {
      element.innerHTML = '<p>无高岛易断解释</p>';
      return false;
    }
    
    // 构建书籍解释内容
    const html = `
      <div class="book-explanation">
        <div class="section">
          <h3>卦象总论</h3>
          <div class="content-text">${data.book.overview || '无总论'}</div>
        </div>
        
        <div class="section">
          <h3>事业运势</h3>
          <div class="content-text">${data.book.career || '无事业解释'}</div>
        </div>
        
        <div class="section">
          <h3>财富机遇</h3>
          <div class="content-text">${data.book.wealth || '无财富解释'}</div>
        </div>
        
        <div class="section">
          <h3>情感家庭</h3>
          <div class="content-text">${data.book.love || '无情感解释'}</div>
        </div>
        
        <div class="section">
          <h3>健康状况</h3>
          <div class="content-text">${data.book.health || '无健康解释'}</div>
        </div>
        
        <div class="section">
          <h3>动爻详解</h3>
          <div class="content-text">${this.getBookYaoExplanation(data, changeLine)}</div>
        </div>
      </div>
    `;
    
    // 设置内容
    element.innerHTML = html;
    return true;
  }
  
  // 获取高岛易断动爻解释
  getBookYaoExplanation(hexagramData, changeLine) {
    if (!hexagramData || !hexagramData.book || !hexagramData.book.yaoContent || hexagramData.book.yaoContent.length === 0) {
      return '无动爻解释';
    }
    
    // 查找对应爻位的解释
    const yaoExplanation = hexagramData.book.yaoContent.find(y => y.position === changeLine);
    
    if (!yaoExplanation) {
      return `无第${changeLine}爻的解释`;
    }
    
    return yaoExplanation.content || `无第${changeLine}爻的解释`;
  }
  
  // 从Chrome存储中获取数据
  getStorageData(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        resolve(result);
      });
    });
  }
  
  // 将数据保存到Chrome存储
  setStorageData(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve(true);
      });
    });
  }
}

// 导出控制器
window.HexagramController = HexagramController; 