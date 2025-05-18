// 添加卦象索引映射表
const HEXAGRAM_MAPPING = [
  1, 34, 5, 26, 11, 9, 14, 43,
  25, 51, 3, 27, 24, 42, 21, 17,
  6, 40, 29, 4, 7, 59, 64, 47,
  33, 62, 39, 52, 15, 53, 56, 31,
  12, 16, 8, 23, 2, 20, 35, 45,
  44, 32, 48, 18, 46, 57, 50, 28,
  13, 55, 63, 22, 36, 37, 30, 49,
  10, 54, 60, 41, 19, 61, 38, 58
];

// 八卦基本数据
const TRIGRAMS = {
  1: { name: "乾", nature: "天", symbol: "☰", description: "刚健中正" },
  2: { name: "兑", nature: "泽", symbol: "☱", description: "喜悦和顺" },
  3: { name: "离", nature: "火", symbol: "☲", description: "明丽文明" },
  4: { name: "震", nature: "雷", symbol: "☳", description: "动而生长" },
  5: { name: "巽", nature: "风", symbol: "☴", description: "顺而入" },
  6: { name: "坎", nature: "水", symbol: "☵", description: "陷入险难" },
  7: { name: "艮", nature: "山", symbol: "☶", description: "止而安静" },
  8: { name: "坤", nature: "地", symbol: "☷", description: "柔顺厚德" }
};

// 卦象名称
const HEXAGRAM_NAMES = [
  "乾为天", "坤为地", "水雷屯", "山水蒙", "水天需", "天水讼", "地水师", "水地比",
  "风天小畜", "天泽履", "地天泰", "天地否", "天火同人", "火天大有", "地山谦", "雷地豫",
  "泽雷随", "山风蛊", "地泽临", "风地观", "火雷噬嗑", "山火贲", "山地剥", "地雷复",
  "天雷无妄", "山天大畜", "山雷颐", "泽风大过", "坎为水", "离为火", "泽山咸", "雷风恒",
  "天山遁", "雷天大壮", "火地晋", "地火明夷", "风火家人", "火泽睽", "水山蹇", "雷水解",
  "山泽损", "风雷益", "泽天夬", "天风姤", "泽地萃", "地风升", "泽水困", "水风井",
  "泽火革", "火风鼎", "震为雷", "艮为山", "风山渐", "雷泽归妹", "雷火丰", "火山旅",
  "巽为风", "兑为泽", "风水涣", "水泽节", "风泽中孚", "雷山小过", "水火既济", "火水未济"
];

document.addEventListener('DOMContentLoaded', function() {
  // DOM元素 - 引导界面
  const stepIndicators = document.querySelectorAll('.step');
  const stepContents = document.querySelectorAll('.step-content');
  const welcomeContainer = document.getElementById('welcome-container');
  
  // 步骤1：性别选择
  const maleRadio = document.getElementById('male');
  const femaleRadio = document.getElementById('female');
  const nextStep1Btn = document.getElementById('next-step-1');
  
  // 步骤2：手相输入
  const handInstruction = document.getElementById('hand-instruction');
  const firstHandLabel = document.getElementById('first-hand-label');
  const secondHandLabel = document.getElementById('second-hand-label');
  const thirdHandLabel = document.getElementById('third-hand-label');
  const firstHandInput = document.getElementById('first-hand');
  const secondHandInput = document.getElementById('second-hand');
  const thirdHandInput = document.getElementById('third-hand');
  const prevStep2Btn = document.getElementById('prev-step-2');
  const calculateBtn = document.getElementById('calculate-btn');
  
  // 步骤3：计算结果
  const upperGuaResult = document.getElementById('upper-gua-result');
  const lowerGuaResult = document.getElementById('lower-gua-result');
  const changeLineResult = document.getElementById('change-line-result');
  const hexagramNameResult = document.getElementById('hexagram-name-result');
  const hexagramPreviewContainer = document.getElementById('hexagram-preview-container');
  const prevStep3Btn = document.getElementById('prev-step-3');
  const showInterpretationBtn = document.getElementById('show-interpretation');
  
  // 结果显示容器
  const resultContainer = document.getElementById('result-container');
  const backToInputBtn = document.getElementById('back-to-input');
  
  // 详细内容区域元素
  const hexagramTitle = document.getElementById('hexagram-title');
  const hexagramImages = document.getElementById('hexagram-images');
  const guaCiOriginal = document.getElementById('gua-ci-original');
  const xiangCiText = document.getElementById('xiang-ci-text');
  const plainTextExplanation = document.getElementById('plain-text-explanation');
  const traditionalExplanation = document.getElementById('traditional-explanation');
  const yaoExplanation = document.getElementById('yao-explanation');
  const bookOverview = document.getElementById('book-overview');
  const bookCareer = document.getElementById('book-career');
  const bookWealth = document.getElementById('book-wealth');
  const bookLove = document.getElementById('book-love');
  const bookHealth = document.getElementById('book-health');
  const bookYaoContent = document.getElementById('book-yao-content');
  
  // Tab切换
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // 底部链接
  const manualInputBtn = document.getElementById('manual-input-btn');
  const forgotBtn = document.getElementById('forgot-btn');
  
  // 控制器和图片加载器实例
  let controller = null;
  let imageLoader = null;
  
  // 创建全局数据访问对象，确保所有函数都能访问
  window.HEXAGRAM_DATA = {
    trigrams: TRIGRAMS,
    hexagramNames: HEXAGRAM_NAMES,
    getHexagramName: function(id) {
      if (id < 1 || id > 64) return "未知";
      return HEXAGRAM_NAMES[id - 1] || "未知";
    },
    getYaoName: function(position) {
      if (position < 1 || position > 6) return "未知";
      const yaoNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
      return yaoNames[position - 1] || "未知动爻";
    }
  };
  
  window.HEXAGRAM_MAPPING = HEXAGRAM_MAPPING;
  
  // 存储计算结果
  let calculatedValues = {
    upperTrigram: 0,
    lowerTrigram: 0,
    changeLine: 0,
    gender: 'male',
    hexagramId: 0
  };
  
  /**
   * 初始化应用
   */
  async function initialize() {
    console.log('=====> [GaoDaoYi Debug] 初始化应用...');
    
    // 检查Chrome扩展环境
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      console.log('=====> [GaoDaoYi Debug] Chrome扩展环境正常');
      
      // 测试chrome.storage.local访问
      try {
        chrome.storage.local.get(['testKey'], function(result) {
          console.log('=====> [GaoDaoYi Debug] Chrome storage访问测试:', result);
          if (chrome.runtime.lastError) {
            console.error('=====> [GaoDaoYi Debug] 访问Chrome存储时出错:', chrome.runtime.lastError);
          } else {
            console.log('=====> [GaoDaoYi Debug] Chrome存储访问正常');
            // 写入测试数据
            chrome.storage.local.set({testKey: 'testValue'}, function() {
              console.log('=====> [GaoDaoYi Debug] 测试数据写入成功');
            });
          }
        });
      } catch (error) {
        console.error('=====> [GaoDaoYi Debug] 测试Chrome存储时异常:', error);
      }
    } else {
      console.error('=====> [GaoDaoYi Debug] Chrome扩展环境不可用!');
    }
    
    // 创建控制器和图片加载器实例（仅初始化一次）
    controller = new HexagramController();
    imageLoader = new HexagramImageLoader();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 应用默认性别设置
    updateGenderInstructions();
    
    console.log('应用初始化完成');
    return true;
  }
  
  /**
   * 设置所有事件监听
   */
  function setupEventListeners() {
    // 步骤导航
    nextStep1Btn.addEventListener('click', () => showStep(2));
    prevStep2Btn.addEventListener('click', () => showStep(1));
    prevStep3Btn.addEventListener('click', () => showStep(2));
    
    // 性别选择事件
    maleRadio.addEventListener('change', updateGenderInstructions);
    femaleRadio.addEventListener('change', updateGenderInstructions);
    
    // 计算按钮
    calculateBtn.addEventListener('click', function() {
      console.log('点击计算按钮');
      if (calculateHexagram()) {
        showStep(3);
      }
    });
    
    // 详解按钮
    console.log('=====> [GaoDaoYi Debug] 绑定详解按钮事件');
    if (showInterpretationBtn) {
      console.log('=====> [GaoDaoYi Debug] 找到详解按钮元素:', showInterpretationBtn);
      showInterpretationBtn.addEventListener('click', function() {
        console.log('=====> [GaoDaoYi Debug] 点击了详解按钮，调用showHexagramInterpretation函数');
        showHexagramInterpretation();
      });
    } else {
      console.error('=====> [GaoDaoYi Debug] 无法找到详解按钮元素！');
    }
    
    // 返回按钮
    backToInputBtn.addEventListener('click', () => {
      resultContainer.style.display = 'none';
      welcomeContainer.style.display = 'block';
    });
    
    // Tab切换
    tabBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // 移除所有活动状态
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // 添加当前活动状态
        this.classList.add('active');
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
      });
    });
    
    // 底部链接
    manualInputBtn.addEventListener('click', () => {
      alert('手动输入功能尚未实现，敬请期待！');
    });
    
    forgotBtn.addEventListener('click', () => {
      alert('请用手指在一只手掌心画圈，画几个圈就是几，然后输入这个数字。');
    });
  }
  
  /**
   * 根据性别更新输入说明
   */
  function updateGenderInstructions() {
    const gender = maleRadio.checked ? 'male' : 'female';
    calculatedValues.gender = gender;
    
    if (gender === 'male') {
      handInstruction.textContent = '男性请输入：左手为上卦，右手为下卦';
      firstHandLabel.textContent = '左手数字：';
      secondHandLabel.textContent = '右手数字：';
      thirdHandLabel.textContent = '动爻位置(1-6)：';
    } else {
      handInstruction.textContent = '女性请输入：右手为上卦，左手为下卦';
      firstHandLabel.textContent = '右手数字：';
      secondHandLabel.textContent = '左手数字：';
      thirdHandLabel.textContent = '动爻位置(1-6)：';
    }
  }
  
  /**
   * 显示指定步骤
   * @param {number} stepNumber - 步骤编号(1-3)
   */
  function showStep(stepNumber) {
    // 更新步骤指示器
    stepIndicators.forEach(indicator => {
      const step = parseInt(indicator.getAttribute('data-step'));
      
      if (step === stepNumber) {
        indicator.classList.add('active');
      } else if (step < stepNumber) {
        indicator.classList.add('completed');
        indicator.classList.remove('active');
      } else {
        indicator.classList.remove('active', 'completed');
      }
    });
    
    // 显示当前步骤内容
    stepContents.forEach(content => {
      content.classList.remove('active');
    });
    
    document.getElementById(`step-${stepNumber}`).classList.add('active');
  }
  
  /**
   * 计算卦象
   */
  function calculateHexagram() {
    try {
      console.log('开始计算卦象...');
      
      const gender = maleRadio.checked ? 'male' : 'female';
      const firstHandValue = parseInt(firstHandInput.value);
      const secondHandValue = parseInt(secondHandInput.value);
      const thirdHandValue = parseInt(thirdHandInput.value);
      
      console.log('输入值:', { gender, firstHandValue, secondHandValue, thirdHandValue });
      
      // 数据验证
      if (isNaN(firstHandValue) || isNaN(secondHandValue) || isNaN(thirdHandValue)) {
        alert('请输入有效的数字！');
        return false;
      }
      
      // 输入数字范围检查
      if (firstHandValue < 1 || firstHandValue > 100 || 
          secondHandValue < 1 || secondHandValue > 100) {
        alert('手指数字必须在1-100之间！');
        return false;
      }
      
      if (thirdHandValue < 1 || thirdHandValue > 6) {
        alert('动爻位置必须在1-6之间！');
        return false;
      }
      
      let upperTrigram, lowerTrigram, changeLine;
      
      // 根据性别设置上下卦
      if (gender === 'male') {
        // 男命：左手为上卦，右手为下卦
        upperTrigram = calculateTrigram(firstHandValue);
        lowerTrigram = calculateTrigram(secondHandValue);
      } else {
        // 女命：右手为上卦，左手为下卦
        upperTrigram = calculateTrigram(secondHandValue);
        lowerTrigram = calculateTrigram(firstHandValue);
      }
      
      // 动爻
      changeLine = thirdHandValue;
      
      console.log('计算结果:', { 
        upperTrigram, 
        lowerTrigram, 
        changeLine,
        trigramUpperName: TRIGRAMS[upperTrigram].name,
        trigramLowerName: TRIGRAMS[lowerTrigram].name
      });
      
      // 计算卦象ID
      const position = (upperTrigram - 1) * 8 + lowerTrigram;
      console.log('映射位置:', position);
      
      const hexagramId = HEXAGRAM_MAPPING[position - 1];
      console.log('卦象ID:', hexagramId);
      
      if (!hexagramId || hexagramId < 1 || hexagramId > 64) {
        console.error('卦象ID无效:', hexagramId);
        alert('计算卦象失败，请重试！');
        return false;
      }
      
      // 获取卦象名称
      const hexagramName = HEXAGRAM_NAMES[hexagramId - 1];
      console.log('卦象名称:', hexagramName);
      
      // 存储计算结果，留着后续使用
      calculatedValues = {
        gender,
        firstHandValue,
        secondHandValue, 
        thirdHandValue,
        upperTrigram,
        lowerTrigram,
        changeLine,
        hexagramId
      };
      
      // 更新结果显示
      upperGuaResult.innerHTML = `<strong>上卦:</strong> <span class="info-text">${upperTrigram} (${TRIGRAMS[upperTrigram].name})</span>`;
      lowerGuaResult.innerHTML = `<strong>下卦:</strong> <span class="info-text">${lowerTrigram} (${TRIGRAMS[lowerTrigram].name})</span>`;
      changeLineResult.innerHTML = `<strong>动爻:</strong> <span class="info-text">${changeLine} (第${changeLine}爻)</span>`;
      hexagramNameResult.innerHTML = `<strong>卦象:</strong> <span class="info-text">${hexagramId}. ${hexagramName}</span>`;
      
      // 预加载卦象图片
      const folderName = `${String(hexagramId).padStart(2, '0')}_${hexagramName.replace(/为/g, '').replace(/天|地|水|火|山|风|雷|泽/g, '')}卦`;
      console.log('尝试加载图片文件夹:', folderName);
      hexagramPreviewContainer.innerHTML = '<div style="padding: 10px; text-align: center;">卦象已计算完成</div>';
      
      console.log('卦象计算完成');
      return true;
    } catch (error) {
      console.error('计算卦象出错:', error);
      alert('计算卦象时发生错误，请重试！\n错误: ' + error.message);
      return false;
    }
  }
  
  /**
   * 计算数字对应的八卦
   * @param {number} num - 要计算的数字
   * @returns {number} - 返回1-8之间的八卦数字
   */
  function calculateTrigram(num) {
    // 计算余数，确保结果在1-8之间
    return num % 8 || 8; // 如果余数为0，则使用8
  }
  
  /**
   * 显示卦象详细解释
   */
  function showHexagramInterpretation() {
    console.log('准备显示卦象结果...');
    
    if (!calculatedValues.hexagramId) {
      alert('请先计算卦象！');
      return;
    }
    
    try {
      // 获取基本数据
      const hexagramId = calculatedValues.hexagramId;
      const hexagramName = HEXAGRAM_NAMES[hexagramId - 1];
      
      // 获取动爻位置
      const changeLinePosition = calculatedValues.changeLine;
      
      // 尝试使用爻辞数据获取正确的爻辞名称
      let changeLineName = '';
      if (typeof GaoDaoYi_YaoCiData !== 'undefined') {
        // 如果爻辞数据已加载，使用数据库中的爻辞名
        changeLineName = GaoDaoYi_YaoCiData.getYaoCiName(hexagramName, changeLinePosition.toString());
        console.log(`使用爻辞数据库获取爻辞名称: ${changeLineName}`);
      } else {
        // 回退到基本爻辞名称
        if (changeLinePosition === 1) changeLineName = '初爻';
        else if (changeLinePosition === 2) changeLineName = '二爻';
        else if (changeLinePosition === 3) changeLineName = '三爻';
        else if (changeLinePosition === 4) changeLineName = '四爻';
        else if (changeLinePosition === 5) changeLineName = '五爻';
        else if (changeLinePosition === 6) changeLineName = '上爻';
        console.log(`使用基本爻辞名称: ${changeLineName}`);
      }
      
      // 获取上下卦信息
      const upperTrigramInfo = `${calculatedValues.upperTrigram} (${TRIGRAMS[calculatedValues.upperTrigram].name})`;
      const lowerTrigramInfo = `${calculatedValues.lowerTrigram} (${TRIGRAMS[calculatedValues.lowerTrigram].name})`;
      
      // 简化的悬浮框数据
      const popoverData = {
        guaMing: `${hexagramId}. ${hexagramName}`,
        guaXu: hexagramId,
        shangGua: upperTrigramInfo,
        xiaGua: lowerTrigramInfo,
        dongYaoMing: `${changeLineName} (第${changeLinePosition}爻)`,
        yaoCi: `${changeLineName}: 爻辞将在详情页显示` // 简化爻辞信息
      };
      
      console.log('保存详解数据到localStorage...');
      
      // 保存数据到localStorage供HTML页面使用 - 使用统一前缀便于管理
      localStorage.setItem('gaodaoYi_current_hexagram_id', hexagramId);
      localStorage.setItem('gaodaoYi_current_change_line', calculatedValues.changeLine);
      localStorage.setItem('gaodaoYi_current_upper_trigram', calculatedValues.upperTrigram);
      localStorage.setItem('gaodaoYi_current_lower_trigram', calculatedValues.lowerTrigram);
      localStorage.setItem('gaodaoYi_current_guaMing', `${hexagramId}. ${hexagramName}`);
      localStorage.setItem('gaodaoYi_current_full_yao_ci', `${changeLineName}: ${popoverData.yaoCi}`);
      
      // 在新标签页打开详情页
      const paddedNumber = String(hexagramId).padStart(2, '0');
      
      // 修正文件路径，确保使用扩展的绝对路径
      let htmlFilePath;
      
      // 检查是否在Chrome扩展环境中
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        // 使用chrome.runtime.getURL获取扩展资源的完整URL
        htmlFilePath = chrome.runtime.getURL(`assets/html_combined/hexagram_${paddedNumber}_combined.html`);
        console.log('使用扩展资源URL:', htmlFilePath);
      } else {
        // 回退到相对路径
        htmlFilePath = `assets/html_combined/hexagram_${paddedNumber}_combined.html`;
        console.log('使用相对路径:', htmlFilePath);
      }
      
      console.log('打开详情页:', htmlFilePath);
      
      // 添加错误处理
      try {
        chrome.tabs.create({ url: htmlFilePath }, (tab) => {
          if (chrome.runtime.lastError) {
            console.error('打开详情页出错:', chrome.runtime.lastError);
            alert(`无法打开卦象详情页: ${chrome.runtime.lastError.message}`);
            return;
          }
          console.log('详情页已在新标签页打开，标签ID:', tab ? tab.id : '未知');
        });
      } catch (tabError) {
        console.error('创建标签页时发生错误:', tabError);
        alert(`无法打开卦象详情页，请检查扩展权限并重试。\n错误: ${tabError.message}`);
      }
    } catch (error) {
      console.error('处理卦象时出错:', error);
      alert('显示卦象详解失败，请重试!' + error.message);
    }
  }
  
  // 初始化应用
  initialize();
});

// 页面加载完成后添加样式
window.addEventListener('load', function() {
  // 添加动态加载样式
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    #loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    
    .loading-container {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .loading-spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      margin: 0 auto 10px;
      animation: spin 2s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .error-message {
      color: #e74c3c;
      padding: 10px;
      background-color: #fadbd8;
      border-left: 4px solid #e74c3c;
      margin: 10px 0;
      border-radius: 4px;
    }
    
    .no-content-message {
      color: #7f8c8d;
      padding: 10px;
      background-color: #f5f5f5;
      border-left: 4px solid #95a5a6;
      margin: 10px 0;
      border-radius: 4px;
    }
  `;
  document.head.appendChild(styleSheet);
}); 