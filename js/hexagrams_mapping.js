// hexagrams_mapping.js
// 定义八卦的基本映射和六十四卦的索引关系

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

// 通过上卦和下卦编号获取六十四卦序号
function getHexagramIndex(upperNum, lowerNum) {
  console.log(`获取卦象索引: 上卦=${upperNum}(${TRIGRAMS[upperNum].name}), 下卦=${lowerNum}(${TRIGRAMS[lowerNum].name})`);
  
  // 六十四卦映射表
  const HEXAGRAM_MAPPING = [
    // 1-乾卦在上
    [1, 11, 13, 34, 5, 9, 14, 26],
    // 2-兑卦在上
    [43, 45, 31, 33, 49, 10, 54, 40],
    // 3-离卦在上
    [13, 37, 30, 49, 55, 63, 38, 48],
    // 4-震卦在上
    [25, 17, 21, 51, 42, 3, 27, 24],
    // 5-巽卦在上
    [44, 28, 50, 32, 57, 59, 18, 46],
    // 6-坎卦在上
    [6, 47, 64, 40, 59, 29, 4, 7],
    // 7-艮卦在上
    [33, 31, 56, 62, 53, 39, 52, 15],
    // 8-坤卦在上
    [12, 16, 35, 8, 23, 20, 36, 2]
  ];
  
  // 确保编号在1-8之间
  if (upperNum < 1 || upperNum > 8 || lowerNum < 1 || lowerNum > 8) {
    console.error(`输入的卦象编号无效: 上卦=${upperNum}, 下卦=${lowerNum}`);
    return 1; // 默认返回第一卦
  }
  
  // 从映射表中获取卦序号
  const index = HEXAGRAM_MAPPING[upperNum - 1][lowerNum - 1];
  console.log(`映射结果: 卦象序号=${index}`);
  return index;
}

// 导出模块
window.TRIGRAMS = TRIGRAMS;
window.getHexagramIndex = getHexagramIndex; 