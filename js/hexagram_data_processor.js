// hexagram_data_processor.js
// 处理HTML文件中的卦象数据并转换为JSON格式

class HexagramDataProcessor {
  constructor() {
    this.hexagramsData = [];
    this.basePath = 'assets/';
    this.jsonDataPath = 'assets/json/';
    this.htmlPath = 'assets/html_combined/';
  }

  // 初始化数据处理
  async initialize() {
    try {
      // 先尝试从JSON加载数据
      const jsonLoaded = await this.loadFromJson();
      
      // 如果JSON加载失败，则从HTML加载
      if (!jsonLoaded) {
        console.log('从JSON加载失败，尝试从HTML加载...');
        await this.loadAllHexagrams();
        
        // 将加载的数据保存为JSON以便未来使用
        await this.saveToJsonFiles();
      }
      
      return this.hexagramsData;
    } catch (error) {
      console.error('加载卦象数据失败:', error);
      return [];
    }
  }
  
  // 从JSON文件加载数据
  async loadFromJson() {
    try {
      console.log('尝试从JSON加载数据...');
      
      // 获取JSON索引文件
      const indexUrl = this.safeGetURL(`${this.jsonDataPath}hexagrams_index.json`);
      const indexResponse = await fetch(indexUrl);
      
      // 如果索引文件不存在，返回false
      if (!indexResponse.ok) {
        console.log('JSON索引文件不存在，需要从HTML加载');
        return false;
      }
      
      // 解析索引数据
      const indexData = await indexResponse.json();
      
      if (!indexData || !indexData.hexagrams || !Array.isArray(indexData.hexagrams)) {
        console.error('JSON索引文件格式错误');
        return false;
      }
      
      // 并发加载所有卦象数据
      const loadPromises = indexData.hexagrams.map(async (hexId) => {
        const jsonUrl = this.safeGetURL(`${this.jsonDataPath}hexagram_${String(hexId).padStart(2, '0')}.json`);
        try {
          const response = await fetch(jsonUrl);
          if (!response.ok) {
            throw new Error(`加载卦象JSON失败: ${response.status}`);
          }
          return await response.json();
        } catch (error) {
          console.error(`加载卦象JSON ${hexId} 失败:`, error);
          return null;
        }
      });
      
      // 等待所有加载完成
      const results = await Promise.all(loadPromises);
      
      // 过滤掉失败的加载并保存结果
      this.hexagramsData = results.filter(data => data !== null);
      
      console.log(`从JSON成功加载了 ${this.hexagramsData.length} 个卦象数据`);
      
      // 检查是否所有64个卦象都加载成功
      if (this.hexagramsData.length === 64) {
        return true;
      } else {
        console.warn(`从JSON只加载了 ${this.hexagramsData.length} 个卦象，需要从HTML补充缺失的卦象`);
        
        // 找出缺失的卦象ID
        const loadedIds = this.hexagramsData.map(hex => hex.id);
        const missingIds = Array.from({length: 64}, (_, i) => i + 1)
          .filter(id => !loadedIds.includes(id));
        
        console.log('缺失的卦象ID:', missingIds);
        
        // 补充加载缺失的卦象
        for (const id of missingIds) {
          const paddedNumber = id.toString().padStart(2, '0');
          const filename = `hexagram_${paddedNumber}_combined.html`;
          
          try {
            const hexagramData = await this.loadHexagramFile(filename, id);
            if (hexagramData) {
              this.hexagramsData.push(hexagramData);
              console.log(`成功从HTML补充加载卦象 ${id}`);
            } else {
              console.error(`补充加载卦象 ${id} 失败`);
              const fallbackData = this.createFallbackHexagram(id);
              this.hexagramsData.push(fallbackData);
            }
          } catch (error) {
            console.error(`补充加载卦象 ${id} 出错:`, error);
            const fallbackData = this.createFallbackHexagram(id);
            this.hexagramsData.push(fallbackData);
          }
        }
        
        // 排序
        this.hexagramsData.sort((a, b) => a.id - b.id);
        
        // 保存补充的数据到JSON
        await this.saveToJsonFiles();
        
        return this.hexagramsData.length === 64;
      }
    } catch (error) {
      console.error('从JSON加载数据失败:', error);
      return false;
    }
  }
  
  // 将数据保存为JSON文件
  async saveToJsonFiles() {
    console.log('将卦象数据保存为JSON格式...');
    
    // 由于浏览器扩展无法直接写入文件系统
    // 这里我们只生成数据并提供下载功能
    
    // 创建索引数据
    const indexData = {
      totalHexagrams: this.hexagramsData.length,
      lastUpdated: new Date().toISOString(),
      hexagrams: this.hexagramsData.map(hex => hex.id)
    };
    
    // 输出索引数据到控制台，便于开发者手动保存
    console.log('索引数据 (hexagrams_index.json):', JSON.stringify(indexData, null, 2));
    
    // 输出每个卦象的数据
    this.hexagramsData.forEach(hexagram => {
      const filename = `hexagram_${String(hexagram.id).padStart(2, '0')}.json`;
      console.log(`卦象数据 (${filename}):`, JSON.stringify(hexagram, null, 2));
    });
    
    // 注意：在实际实现中，可以使用chrome.runtime.sendMessage与后台脚本通信
    // 后台脚本可以使用chrome.downloads.download API来保存文件
    console.log('提示: 如需实际保存这些JSON文件，请将输出复制到相应的文件中');
  }

  // 加载所有六十四卦数据
  async loadAllHexagrams() {
    const totalHexagrams = 64;
    console.log(`开始加载所有六十四卦数据...`);
    
    let successCount = 0;
    let failedIds = [];
    let concurrentLimit = 5; // 限制并发请求数量
    
    // 分批加载卦象以避免过多并发请求
    for (let batch = 0; batch < Math.ceil(totalHexagrams / concurrentLimit); batch++) {
      const startIdx = batch * concurrentLimit + 1;
      const endIdx = Math.min((batch + 1) * concurrentLimit, totalHexagrams);
      
      console.log(`加载第${batch+1}批卦象，ID范围: ${startIdx}-${endIdx}`);
      
      const batchPromises = [];
      
      for (let i = startIdx; i <= endIdx; i++) {
        // 构建文件名
        const paddedNumber = i.toString().padStart(2, '0');
        const filename = `hexagram_${paddedNumber}_combined.html`;
        
        // 创建加载Promise，但捕获错误以避免一个失败导致整批失败
        const loadPromise = this.loadHexagramFile(filename, i)
          .then(hexagramData => {
            if (hexagramData) {
              this.hexagramsData.push(hexagramData);
              successCount++;
              console.log(`成功加载卦象 ${i}，ID: ${hexagramData.id}`);
              return { success: true, id: i };
            } else {
              failedIds.push(i);
              console.error(`加载卦象 ${i} 失败: 未返回数据`);
              return { success: false, id: i };
            }
          })
          .catch(error => {
            failedIds.push(i);
            console.error(`加载卦象 ${i} 失败:`, error);
            return { success: false, id: i, error: error.message };
          });
        
        batchPromises.push(loadPromise);
      }
      
      // 等待当前批次完成
      const batchResults = await Promise.all(batchPromises);
      console.log(`批次 ${batch+1} 完成，成功: ${batchResults.filter(r => r.success).length}/${batchResults.length}`);
    }
    
    // 如果部分加载失败，再尝试重新加载失败的卦象（最多3次尝试）
    if (failedIds.length > 0 && failedIds.length < totalHexagrams) {
      console.log(`尝试重新加载失败的 ${failedIds.length} 个卦象...`);
      
      const retryAttempts = 3;
      let currentAttempt = 1;
      
      while (failedIds.length > 0 && currentAttempt <= retryAttempts) {
        console.log(`重试尝试 ${currentAttempt}/${retryAttempts}...`);
        
        const idsToRetry = [...failedIds];
        failedIds = [];
        
        for (const id of idsToRetry) {
          const paddedNumber = id.toString().padStart(2, '0');
          const filename = `hexagram_${paddedNumber}_combined.html`;
          
          console.log(`尝试重新加载卦象 ${id}...`);
          try {
            const hexagramData = await this.loadHexagramFile(filename, id);
            if (hexagramData) {
              this.hexagramsData.push(hexagramData);
              successCount++;
              console.log(`成功重新加载卦象 ${id}`);
            } else {
              failedIds.push(id);
              console.error(`重新加载卦象 ${id} 仍然失败`);
              
              // 创建一个基本的卦象对象作为替代
              const fallbackData = this.createFallbackHexagram(id);
              this.hexagramsData.push(fallbackData);
              console.log(`已为卦象 ${id} 创建替代数据`);
            }
          } catch (error) {
            failedIds.push(id);
            console.error(`重新加载卦象 ${id} 出错:`, error);
            
            // 创建一个基本的卦象对象作为替代
            const fallbackData = this.createFallbackHexagram(id);
            this.hexagramsData.push(fallbackData);
            console.log(`已为卦象 ${id} 创建替代数据`);
          }
        }
        
        currentAttempt++;
      }
    }
    
    // 如果仍有失败，创建占位数据确保所有64个卦象都有数据
    const allIds = this.hexagramsData.map(h => h.id);
    for (let i = 1; i <= totalHexagrams; i++) {
      if (!allIds.includes(i)) {
        console.log(`创建卦象 ${i} 的占位数据`);
        const fallbackData = this.createFallbackHexagram(i);
        this.hexagramsData.push(fallbackData);
      }
    }
    
    console.log(`加载完成。成功: ${successCount}/${totalHexagrams}, 失败: ${failedIds.length}`);
    
    // 安全起见，按照ID排序
    this.hexagramsData.sort((a, b) => a.id - b.id);
    
    return successCount > 0;
  }

  // 创建替代卦象数据
  createFallbackHexagram(id) {
    // 尝试从索引反推上卦和下卦
    let upperName = "未知";
    let lowerName = "未知";
    
    // 遍历映射表尝试查找匹配的索引
    for (let upper = 1; upper <= 8; upper++) {
      for (let lower = 1; lower <= 8; lower++) {
        try {
          const index = getHexagramIndex(upper, lower);
          if (index === id) {
            upperName = TRIGRAMS[upper].name;
            lowerName = TRIGRAMS[lower].name;
            break;
          }
        } catch (e) {
          // 忽略错误继续检查
        }
      }
      if (upperName !== "未知") break;
    }
    
    return {
      id: id,
      title: `卦象 ${id} (${upperName}${lowerName})`,
      mainImage: "",
      guaCi: "数据暂缺",
      xiangCi: "数据暂缺",
      plainTextExplanation: "该卦象数据加载失败，请重新启动扩展或联系开发者",
      traditionalExplanation: "该卦象数据未能正确加载",
      yaoExplanations: Array(6).fill(null).map((_, i) => ({
        position: i + 1,
        content: `爻位 ${i + 1} 数据未加载`
      })),
      book: {
        overview: "数据未加载",
        career: "数据未加载",
        wealth: "数据未加载",
        love: "数据未加载",
        health: "数据未加载",
        yaoContent: Array(6).fill(null).map((_, i) => ({
          position: i + 1,
          content: `动爻位置 ${i + 1} 数据未加载`
        }))
      }
    };
  }

  // 加载卦象HTML文件
  async loadHexagramFile(filename, hexagramId) {
    try {
      // 使用安全的URL获取函数
      const fileUrl = this.safeGetURL(`assets/html_combined/${filename}`);
      console.log(`加载卦象文件: ${fileUrl}`);
      
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        console.error(`加载卦象文件失败 (${filename}): ${response.status} ${response.statusText}`);
        return null;
      }
      
      const html = await response.text();
      return this.parseHexagramHtml(html, hexagramId);
    } catch (error) {
      console.error(`加载卦象文件出错 (${filename}):`, error);
      return null;
    }
  }

  // 安全获取URL的函数
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

  // 从HTML内容中解析卦象数据
  parseHexagramHtml(htmlContent, hexagramNumber) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // 基本卦信息
      const title = doc.querySelector('h1')?.textContent || `卦象 ${hexagramNumber}`;
      let mainImage = '';
      const imgElement = doc.querySelector('.hexagram-main-image img');
      if (imgElement) {
        // 获取图片相对路径
        const src = imgElement.getAttribute('src');
        if (src) {
          mainImage = src;
        }
      }
      
      // 卦辞
      const guaCiElement = doc.querySelector('.gua-ci');
      const guaCi = guaCiElement?.textContent || '';
      
      // 象辞
      const xiangCiElement = doc.querySelector('.xiang-ci');
      const xiangCi = xiangCiElement?.textContent || '';
      
      // 白话解释
      const plainTextElement = doc.querySelector('.plain-text-explanation');
      const plainText = plainTextElement?.textContent || '';
      
      // 传统解释
      const traditionalElement = doc.querySelector('.traditional-explanation');
      const traditional = traditionalElement?.textContent || '';
      
      // 爻辞解释
      const yaoExplanations = [];
      const yaoElements = doc.querySelectorAll('.yao-explanation');
      yaoElements.forEach((element, index) => {
        yaoExplanations.push({
          position: index + 1,
          content: element.textContent || `爻位 ${index + 1} 无解释`
        });
      });
      
      // 如果没有足够的爻辞解释，添加空的解释
      while (yaoExplanations.length < 6) {
        yaoExplanations.push({
          position: yaoExplanations.length + 1,
          content: `爻位 ${yaoExplanations.length + 1} 无解释`
        });
      }
      
      // 高岛易断部分
      const bookOverview = doc.querySelector('.book-overview')?.textContent || '';
      const bookCareer = doc.querySelector('.book-career')?.textContent || '';
      const bookWealth = doc.querySelector('.book-wealth')?.textContent || '';
      const bookLove = doc.querySelector('.book-love')?.textContent || '';
      const bookHealth = doc.querySelector('.book-health')?.textContent || '';
      
      // 动爻解释
      const bookYaoContent = [];
      const bookYaoElements = doc.querySelectorAll('.book-yao-explanation');
      bookYaoElements.forEach((element, index) => {
        bookYaoContent.push({
          position: index + 1,
          content: element.textContent || `动爻位置 ${index + 1} 无解释`
        });
      });
      
      // 如果没有足够的动爻解释，添加空的解释
      while (bookYaoContent.length < 6) {
        bookYaoContent.push({
          position: bookYaoContent.length + 1,
          content: `动爻位置 ${bookYaoContent.length + 1} 无解释`
        });
      }
      
      // 关键修改：直接使用传入的hexagramNumber作为ID
      // 这解决了HTML文件中没有明确ID标识的问题
      return {
        id: hexagramNumber,
        title: title,
        mainImage: mainImage,
        guaCi: guaCi,
        xiangCi: xiangCi,
        plainTextExplanation: plainText,
        traditionalExplanation: traditional,
        yaoExplanations: yaoExplanations,
        book: {
          overview: bookOverview,
          career: bookCareer,
          wealth: bookWealth,
          love: bookLove,
          health: bookHealth,
          yaoContent: bookYaoContent
        }
      };
    } catch (error) {
      console.error(`解析HTML内容失败:`, error);
      
      // 即使解析失败，仍然使用传入的hexagramNumber作为ID，确保ID一定存在
      return {
        id: hexagramNumber,
        title: `卦象 ${hexagramNumber}`,
        mainImage: '',
        guaCi: '暂无卦辞',
        xiangCi: '暂无象辞',
        plainTextExplanation: '暂无解释',
        traditionalExplanation: '暂无传统解释',
        yaoExplanations: Array.from({ length: 6 }, (_, i) => ({
          position: i + 1,
          content: `爻位 ${i + 1} 暂无解释`
        })),
        book: {
          overview: '暂无总论',
          career: '暂无事业解释',
          wealth: '暂无财富解释',
          love: '暂无情感解释',
          health: '暂无健康解释',
          yaoContent: Array.from({ length: 6 }, (_, i) => ({
            position: i + 1,
            content: `动爻位置 ${i + 1} 暂无解释`
          }))
        }
      };
    }
  }
}

// 导出数据处理器
window.HexagramDataProcessor = HexagramDataProcessor; 