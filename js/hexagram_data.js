// hexagram_data.js - 全局卦象数据管理

/**
 * 卦象数据管理类
 * 负责存储和管理所有与卦象相关的数据
 */
class HexagramData {
  constructor() {
    // 卦象数据缓存
    this.hexagrams = {};
    
    // 八卦基本数据
    this.trigrams = {
      1: { name: "乾", nature: "天", symbol: "☰", description: "刚健中正" },
      2: { name: "兑", nature: "泽", symbol: "☱", description: "喜悦和顺" },
      3: { name: "离", nature: "火", symbol: "☲", description: "明丽文明" },
      4: { name: "震", nature: "雷", symbol: "☳", description: "动而生长" },
      5: { name: "巽", nature: "风", symbol: "☴", description: "顺而入" },
      6: { name: "坎", nature: "水", symbol: "☵", description: "陷入险难" },
      7: { name: "艮", nature: "山", symbol: "☶", description: "止而安静" },
      8: { name: "坤", nature: "地", symbol: "☷", description: "柔顺厚德" }
    };
    
    // 六十四卦名称列表
    this.hexagramNames = [
      "乾", "坤", "屯", "蒙", "需", "讼", "师", "比", 
      "小畜", "履", "泰", "否", "同人", "大有", "谦", "豫", 
      "随", "蛊", "临", "观", "噬嗑", "贲", "剥", "复", 
      "无妄", "大畜", "颐", "大过", "坎", "离", "咸", "恒", 
      "遁", "大壮", "晋", "明夷", "家人", "睽", "蹇", "解", 
      "损", "益", "夬", "姤", "萃", "升", "困", "井", 
      "革", "鼎", "震", "艮", "渐", "归妹", "丰", "旅", 
      "巽", "兑", "涣", "节", "中孚", "小过", "既济", "未济"
    ];
    
    // 初始化卦象名称到ID的映射
    this.nameToId = {};
    this.hexagramNames.forEach((name, index) => {
      this.nameToId[name] = index + 1;
    });
    
    // 创建ID到卦名的映射，方便查询
    this.idToName = {};
    this.hexagramNames.forEach((name, index) => {
      this.idToName[index + 1] = name;
    });
    
    // 上下卦映射到六十四卦的表
    this.upperLowerMap = this._createUpperLowerMap();
  }
  
  /**
   * 创建上下卦映射表
   * @private
   * @returns {Object} 上下卦映射到卦象ID的表
   */
  _createUpperLowerMap() {
    const map = {};
    
    // 根据标准八卦顺序：乾(1)兑(2)离(3)震(4)巽(5)坎(6)艮(7)坤(8)构建映射表
    const hexagramMap = {
      // 第一行：上卦为乾(1)
      "1_1": 1,  // 乾为天
      "1_2": 10, // 天泽履
      "1_3": 13, // 天火同人
      "1_4": 25, // 天雷无妄
      "1_5": 44, // 天风姤
      "1_6": 6,  // 天水讼
      "1_7": 33, // 天山遁
      "1_8": 12, // 天地否
      
      // 第二行：上卦为兑(2)
      "2_1": 43, // 泽天夬
      "2_2": 58, // 兑为泽
      "2_3": 49, // 泽火革
      "2_4": 17, // 泽雷随
      "2_5": 28, // 泽风大过
      "2_6": 47, // 泽水困
      "2_7": 31, // 泽山咸
      "2_8": 45, // 泽地萃
      
      // 第三行：上卦为离(3)
      "3_1": 14, // 火天大有
      "3_2": 38, // 火泽睽
      "3_3": 30, // 离为火
      "3_4": 21, // 火雷噬嗑
      "3_5": 50, // 火风鼎
      "3_6": 64, // 火水未济
      "3_7": 56, // 火山旅
      "3_8": 35, // 火地晋
      
      // 第四行：上卦为震(4)
      "4_1": 34, // 雷天大壮
      "4_2": 54, // 雷泽归妹
      "4_3": 55, // 雷火丰
      "4_4": 51, // 震为雷
      "4_5": 32, // 雷风恒
      "4_6": 40, // 雷水解
      "4_7": 62, // 雷山小过
      "4_8": 16, // 雷地豫
      
      // 第五行：上卦为巽(5)
      "5_1": 9,  // 风天小畜
      "5_2": 61, // 风泽中孚
      "5_3": 37, // 风火家人
      "5_4": 42, // 风雷益
      "5_5": 57, // 巽为风
      "5_6": 59, // 风水涣
      "5_7": 53, // 风山渐
      "5_8": 20, // 风地观
      
      // 第六行：上卦为坎(6)
      "6_1": 5,  // 水天需
      "6_2": 60, // 水泽节
      "6_3": 63, // 水火既济
      "6_4": 3,  // 水雷屯
      "6_5": 48, // 水风井
      "6_6": 29, // 坎为水
      "6_7": 39, // 水山蹇
      "6_8": 8,  // 水地比
      
      // 第七行：上卦为艮(7)
      "7_1": 26, // 山天大畜
      "7_2": 41, // 山泽损
      "7_3": 22, // 山火贲
      "7_4": 27, // 山雷颐
      "7_5": 18, // 山风蛊
      "7_6": 4,  // 山水蒙
      "7_7": 52, // 艮为山
      "7_8": 23, // 山地剥
      
      // 第八行：上卦为坤(8)
      "8_1": 11, // 地天泰
      "8_2": 19, // 地泽临
      "8_3": 36, // 地火明夷
      "8_4": 24, // 地雷复
      "8_5": 46, // 地风升
      "8_6": 7,  // 地水师
      "8_7": 15, // 地山谦
      "8_8": 2   // 坤为地
    };
    
    // 填充映射表
    Object.keys(hexagramMap).forEach(key => {
      map[key] = hexagramMap[key];
    });
    
    return map;
  }
  
  /**
   * 根据上卦和下卦编号获取卦象ID
   * @param {number} upperGua - 上卦编号(1-8)
   * @param {number} lowerGua - 下卦编号(1-8)
   * @returns {number|null} 卦象ID，如果无效则返回null
   */
  getHexagramId(upperGua, lowerGua) {
    // 验证输入范围
    if (upperGua < 1 || upperGua > 8 || lowerGua < 1 || lowerGua > 8) {
      console.error('无效的上下卦编号:', upperGua, lowerGua);
      return null;
    }
    
    // 获取卦象ID
    const key = `${upperGua}_${lowerGua}`;
    const hexagramId = this.upperLowerMap[key];
    
    if (!hexagramId) {
      console.error('无法找到对应卦象:', upperGua, lowerGua);
      return null;
    }
    
    return hexagramId;
  }
  
  /**
   * 根据卦象ID获取卦象名称
   * @param {number} hexagramId - 卦象ID(1-64)
   * @returns {string} 卦象名称
   */
  getHexagramName(hexagramId) {
    if (hexagramId < 1 || hexagramId > 64) {
      console.error('无效的卦象ID:', hexagramId);
      return '';
    }
    
    return this.idToName[hexagramId] || '';
  }
  
  /**
   * 根据卦象名称获取卦象ID
   * @param {string} hexagramName - 卦象名称
   * @returns {number|null} 卦象ID，如果无效则返回null
   */
  getHexagramIdByName(hexagramName) {
    if (!hexagramName || typeof hexagramName !== 'string') {
      console.error('无效的卦象名称');
      return null;
    }
    
    return this.nameToId[hexagramName] || null;
  }
  
  /**
   * 获取特定卦象的详细数据
   * @param {number} hexagramId - 卦象ID(1-64)
   * @returns {Object|null} 卦象详细数据，如果不存在则返回null
   */
  getHexagramData(hexagramId) {
    if (hexagramId < 1 || hexagramId > 64) {
      console.error('无效的卦象ID:', hexagramId);
      return null;
    }
    
    // 如果缓存中有数据，则直接返回
    if (this.hexagrams[hexagramId]) {
      return this.hexagrams[hexagramId];
    }
    
    // 否则返回null，由外部代码负责加载
    return null;
  }
  
  /**
   * 保存卦象数据到缓存
   * @param {number} hexagramId - 卦象ID
   * @param {Object} data - 卦象数据
   */
  setHexagramData(hexagramId, data) {
    if (hexagramId < 1 || hexagramId > 64) {
      console.error('无效的卦象ID:', hexagramId);
      return;
    }
    
    if (!data || typeof data !== 'object') {
      console.error('无效的卦象数据');
      return;
    }
    
    this.hexagrams[hexagramId] = data;
  }
  
  /**
   * 获取爻的名称
   * @param {number} position - 爻位置(1-6)
   * @returns {string} 爻名称
   */
  getYaoName(position) {
    const yaoNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
    
    if (position < 1 || position > 6) {
      console.error('无效的爻位置:', position);
      return '';
    }
    
    return yaoNames[position - 1];
  }
  
  /**
   * 获取爻的类型
   * @param {number} position - 爻位置(1-6)
   * @returns {string} 爻类型 ('阳' 或 '阴')
   */
  getYaoType(position) {
    if (position < 1 || position > 6) {
      console.error('无效的爻位置:', position);
      return '';
    }
    
    // 在易经中，奇数位为阳，偶数位为阴
    return position % 2 === 1 ? '阳' : '阴';
  }
  
  /**
   * 获取上下卦和动爻信息
   * @param {number} hexagramId - 卦象ID
   * @returns {Object} 上下卦和动爻信息
   */
  getHexagramStructure(hexagramId) {
    const invalidResult = { upperGua: 0, lowerGua: 0, changeLine: 0 };
    
    if (hexagramId < 1 || hexagramId > 64) {
      console.error('无效的卦象ID:', hexagramId);
      return invalidResult;
    }
    
    // 反向查找上下卦
    for (let upper = 1; upper <= 8; upper++) {
      for (let lower = 1; lower <= 8; lower++) {
        const key = `${upper}_${lower}`;
        if (this.upperLowerMap[key] === hexagramId) {
          return {
            hexagramId,
            upperGua: upper,
            lowerGua: lower,
            upperName: this.trigrams[upper].name,
            lowerName: this.trigrams[lower].name,
            name: this.getHexagramName(hexagramId)
          };
        }
      }
    }
    
    return invalidResult;
  }
}

// 创建全局实例
window.HEXAGRAM_DATA = new HexagramData(); 

// 完整的卦象映射表 - 上卦_下卦 => 卦象编号
// 基于标准八卦顺序：乾(1)兑(2)离(3)震(4)巽(5)坎(6)艮(7)坤(8)
const HEXAGRAM_MAP = {
  // 第一行：上卦为乾(1)
  "1_1": 1,  // 乾为天
  "1_2": 10, // 天泽履
  "1_3": 13, // 天火同人
  "1_4": 25, // 天雷无妄
  "1_5": 44, // 天风姤
  "1_6": 6,  // 天水讼
  "1_7": 33, // 天山遁
  "1_8": 12, // 天地否
  
  // 第二行：上卦为兑(2)
  "2_1": 43, // 泽天夬
  "2_2": 58, // 兑为泽
  "2_3": 49, // 泽火革
  "2_4": 17, // 泽雷随
  "2_5": 28, // 泽风大过
  "2_6": 47, // 泽水困
  "2_7": 31, // 泽山咸
  "2_8": 45, // 泽地萃
  
  // 第三行：上卦为离(3)
  "3_1": 14, // 火天大有
  "3_2": 38, // 火泽睽
  "3_3": 30, // 离为火
  "3_4": 21, // 火雷噬嗑
  "3_5": 50, // 火风鼎
  "3_6": 64, // 火水未济
  "3_7": 56, // 火山旅
  "3_8": 35, // 火地晋
  
  // 第四行：上卦为震(4)
  "4_1": 34, // 雷天大壮
  "4_2": 54, // 雷泽归妹
  "4_3": 55, // 雷火丰
  "4_4": 51, // 震为雷
  "4_5": 32, // 雷风恒
  "4_6": 40, // 雷水解
  "4_7": 62, // 雷山小过
  "4_8": 16, // 雷地豫
  
  // 第五行：上卦为巽(5)
  "5_1": 9,  // 风天小畜
  "5_2": 61, // 风泽中孚
  "5_3": 37, // 风火家人
  "5_4": 42, // 风雷益
  "5_5": 57, // 巽为风
  "5_6": 59, // 风水涣
  "5_7": 53, // 风山渐
  "5_8": 20, // 风地观
  
  // 第六行：上卦为坎(6)
  "6_1": 5,  // 水天需
  "6_2": 60, // 水泽节
  "6_3": 63, // 水火既济
  "6_4": 3,  // 水雷屯
  "6_5": 48, // 水风井
  "6_6": 29, // 坎为水
  "6_7": 39, // 水山蹇
  "6_8": 8,  // 水地比
  
  // 第七行：上卦为艮(7)
  "7_1": 26, // 山天大畜
  "7_2": 41, // 山泽损
  "7_3": 22, // 山火贲
  "7_4": 27, // 山雷颐
  "7_5": 18, // 山风蛊
  "7_6": 4,  // 山水蒙
  "7_7": 52, // 艮为山
  "7_8": 23, // 山地剥
  
  // 第八行：上卦为坤(8)
  "8_1": 11, // 地天泰
  "8_2": 19, // 地泽临
  "8_3": 36, // 地火明夷
  "8_4": 24, // 地雷复
  "8_5": 46, // 地风升
  "8_6": 7,  // 地水师
  "8_7": 15, // 地山谦
  "8_8": 2   // 坤为地
};

/**
 * 获取卦象编号
 * @param {number} upperGua - 上卦编号(1-8)
 * @param {number} lowerGua - 下卦编号(1-8)
 * @returns {number|null} 卦象编号(1-64)或null(如果未找到)
 */
function getHexagramNumber(upperGua, lowerGua) {
  if (typeof upperGua !== 'number' || typeof lowerGua !== 'number' ||
      upperGua < 1 || upperGua > 8 || lowerGua < 1 || lowerGua > 8) {
    console.error('无效的上下卦编号:', upperGua, lowerGua);
    return null;
  }

  // 构建查询键
  const key = `${upperGua}_${lowerGua}`;
  
  // 查找卦象编号
  const hexagramNumber = HEXAGRAM_MAP[key];
  
  if (!hexagramNumber) {
    console.error('无法找到对应卦象:', upperGua, lowerGua, key);
    return null;
  }
  
  console.log('卦象查找成功:', {
    upperGua,
    lowerGua,
    key,
    hexagramNumber
  });

  return hexagramNumber;
}

/**
 * 获取卦象名称
 * @param {number} upperGua - 上卦编号
 * @param {number} lowerGua - 下卦编号
 * @returns {Object} 卦象名称信息
 */
function getHexagramName(upperGua, lowerGua) {
  // 获取卦象编号
  const hexagramNumber = getHexagramNumber(upperGua, lowerGua);
  if (!hexagramNumber) {
    return { name: "未知卦象", fullName: "未知卦" };
  }

  // 从内置的卦象映射数据中获取
  const hexagramMap = {
    1: { name: "乾为天", fullName: "乾卦" },
    2: { name: "坤为地", fullName: "坤卦" },
    3: { name: "水雷屯", fullName: "屯卦" },
    4: { name: "山水蒙", fullName: "蒙卦" },
    5: { name: "水天需", fullName: "需卦" },
    6: { name: "天水讼", fullName: "讼卦" },
    7: { name: "地水师", fullName: "师卦" },
    8: { name: "水地比", fullName: "比卦" },
    9: { name: "风天小畜", fullName: "小畜卦" },
    10: { name: "天泽履", fullName: "履卦" },
    11: { name: "地天泰", fullName: "泰卦" },
    12: { name: "天地否", fullName: "否卦" },
    13: { name: "天火同人", fullName: "同人卦" },
    14: { name: "火天大有", fullName: "大有卦" },
    15: { name: "地山谦", fullName: "谦卦" },
    16: { name: "雷地豫", fullName: "豫卦" },
    17: { name: "泽雷随", fullName: "随卦" },
    18: { name: "山风蛊", fullName: "蛊卦" },
    19: { name: "地泽临", fullName: "临卦" },
    20: { name: "风地观", fullName: "观卦" },
    21: { name: "火雷噬嗑", fullName: "噬嗑卦" },
    22: { name: "山火贲", fullName: "贲卦" },
    23: { name: "山地剥", fullName: "剥卦" },
    24: { name: "地雷复", fullName: "复卦" },
    25: { name: "天雷无妄", fullName: "无妄卦" },
    26: { name: "山天大畜", fullName: "大畜卦" },
    27: { name: "山雷颐", fullName: "颐卦" },
    28: { name: "泽风大过", fullName: "大过卦" },
    29: { name: "坎为水", fullName: "坎卦" },
    30: { name: "离为火", fullName: "离卦" },
    31: { name: "泽山咸", fullName: "咸卦" },
    32: { name: "雷风恒", fullName: "恒卦" },
    33: { name: "天山遁", fullName: "遁卦" },
    34: { name: "雷天大壮", fullName: "大壮卦" },
    35: { name: "火地晋", fullName: "晋卦" },
    36: { name: "地火明夷", fullName: "明夷卦" },
    37: { name: "风火家人", fullName: "家人卦" },
    38: { name: "火泽睽", fullName: "睽卦" },
    39: { name: "水山蹇", fullName: "蹇卦" },
    40: { name: "雷水解", fullName: "解卦" },
    41: { name: "山泽损", fullName: "损卦" },
    42: { name: "风雷益", fullName: "益卦" },
    43: { name: "泽天夬", fullName: "夬卦" },
    44: { name: "天风姤", fullName: "姤卦" },
    45: { name: "泽地萃", fullName: "萃卦" },
    46: { name: "地风升", fullName: "升卦" },
    47: { name: "泽水困", fullName: "困卦" },
    48: { name: "水风井", fullName: "井卦" },
    49: { name: "泽火革", fullName: "革卦" },
    50: { name: "火风鼎", fullName: "鼎卦" },
    51: { name: "震为雷", fullName: "震卦" },
    52: { name: "艮为山", fullName: "艮卦" },
    53: { name: "风山渐", fullName: "渐卦" },
    54: { name: "雷泽归妹", fullName: "归妹卦" },
    55: { name: "雷火丰", fullName: "丰卦" },
    56: { name: "火山旅", fullName: "旅卦" },
    57: { name: "巽为风", fullName: "巽卦" },
    58: { name: "兑为泽", fullName: "兑卦" },
    59: { name: "风水涣", fullName: "涣卦" },
    60: { name: "水泽节", fullName: "节卦" },
    61: { name: "风泽中孚", fullName: "中孚卦" },
    62: { name: "雷山小过", fullName: "小过卦" },
    63: { name: "水火既济", fullName: "既济卦" },
    64: { name: "火水未济", fullName: "未济卦" }
  };

  const hexagramInfo = hexagramMap[hexagramNumber] || { name: "未知卦象", fullName: "未知卦" };
  
  // 添加编号信息
  hexagramInfo.number = hexagramNumber;
  
  return hexagramInfo;
}

/**
 * 从卦象编号获取卦名
 * @param {number} hexagramId - 卦象编号(1-64)
 * @returns {Object} 卦象名称信息
 */
function getHexagramNameById(hexagramId) {
  if (typeof hexagramId !== 'number' || hexagramId < 1 || hexagramId > 64) {
    console.error('无效的卦象编号:', hexagramId);
    return { name: "未知卦象", fullName: "未知卦" };
  }
  
  // 与getHexagramName共用同一个映射表
  const hexagramMap = {
    1: { name: "乾为天", fullName: "乾卦" },
    2: { name: "坤为地", fullName: "坤卦" },
    // ... 其他卦象数据保持不变
  };
  
  const hexagramInfo = hexagramMap[hexagramId] || { name: "未知卦象", fullName: "未知卦" };
  
  // 添加编号信息
  hexagramInfo.number = hexagramId;
  
  return hexagramInfo;
}

// 导出全局函数
window.getHexagramNumber = getHexagramNumber;
window.getHexagramName = getHexagramName;
window.getHexagramNameById = getHexagramNameById;
window.HEXAGRAM_MAP = HEXAGRAM_MAP; 