// utils/calculation_logic.js

/**
 * 计算上卦编号 (1-8)
 * @param {number} num1 - 用户输入的第一个数字
 * @returns {number} 上卦编号
 */
function calculateShangGua(num1) {
    if (isNaN(num1) || num1 < 0) {
        console.error(`[计算逻辑] 无效的上卦数字: ${num1}`);
        return 1; // 默认值
    }
    const remainder = num1 % 8;
    return remainder === 0 ? 8 : remainder;
}

/**
 * 计算下卦编号 (1-8)
 * @param {number} num2 - 用户输入的第二个数字
 * @returns {number} 下卦编号
 */
function calculateXiaGua(num2) {
    if (isNaN(num2) || num2 < 0) {
        console.error(`[计算逻辑] 无效的下卦数字: ${num2}`);
        return 1; // 默认值
    }
    const remainder = num2 % 8;
    return remainder === 0 ? 8 : remainder;
}

/**
 * 计算动爻位置 (1-6)
 * @param {number} num3 - 用户输入的第三个数字
 * @returns {number} 动爻位置
 */
function calculateDongYao(num3) {
    if (isNaN(num3) || num3 < 1) {
        console.error(`[计算逻辑] 无效的动爻数字: ${num3}`);
        return 1; // 默认值
    }
    const remainder = num3 % 6;
    return remainder === 0 ? 6 : remainder;
}

/**
 * 获取卦象的综合信息，但不包含异步获取的爻辞
 * @param {number} upperGuaNum - 上卦编号 (1-8)
 * @param {number} lowerGuaNum - 下卦编号 (1-8)
 * @param {number} dongYaoPosition - 动爻位置 (1-6)
 * @returns {object | null} 包含卦序、卦名、动爻名的对象，或在错误时返回null
 */
function getHexagramBaseDetails(upperGuaNum, lowerGuaNum, dongYaoPosition) {
    // 参数验证
    if (upperGuaNum < 1 || upperGuaNum > 8 || lowerGuaNum < 1 || lowerGuaNum > 8 || 
        dongYaoPosition < 1 || dongYaoPosition > 6) {
        console.error(`[计算逻辑] 参数无效: 上卦=${upperGuaNum}, 下卦=${lowerGuaNum}, 动爻=${dongYaoPosition}`);
        return null;
    }

    const hexagramOrder = getHexagramNumber(upperGuaNum, lowerGuaNum); // Assumes getHexagramNumber is accessible
    if (hexagramOrder === null) {
        console.error("[计算逻辑] 无法确定卦序");
        return null;
    }

    const details = HEXAGRAM_DETAILS_MAP[hexagramOrder]; // Assumes HEXAGRAM_DETAILS_MAP is accessible
    if (!details) {
        console.error(`[计算逻辑] 未找到卦序 ${hexagramOrder} 的详细信息`);
        return null;
    }

    const dongYaoName = details.lines[dongYaoPosition];
    if (!dongYaoName) {
        console.error(`[计算逻辑] 未找到卦序 ${hexagramOrder} 中动爻位置 ${dongYaoPosition} 的名称`);
        
        // 尝试使用yao_ci_data.js中的数据获取爻辞名称
        try {
            if (typeof window.getYaoCiNameSafe === 'function') {
                const guaMing = details.name || '';
                const yaoCiName = window.getYaoCiNameSafe(guaMing, dongYaoPosition);
                console.log(`[计算逻辑] 通过备用方法获取到爻辞名称: ${yaoCiName}`);
                
                // 创建一个临时的details副本，以避免修改原对象
                const detailsCopy = JSON.parse(JSON.stringify(details));
                if (!detailsCopy.lines) detailsCopy.lines = {};
                detailsCopy.lines[dongYaoPosition] = yaoCiName;
                
                return {
                    hexOrder: hexagramOrder,
                    guaMing: detailsCopy.name,
                    dongYaoName: yaoCiName,
                    fileNameBase: detailsCopy.fileNameBase,
                    shangGuaInfo: `${TRIGRAMS[upperGuaNum].name} (${TRIGRAMS[upperGuaNum].representation})`,
                    xiaGuaInfo: `${TRIGRAMS[lowerGuaNum].name} (${TRIGRAMS[lowerGuaNum].representation})`,
                    dongYaoPosForDisplay: dongYaoPosition
                };
            }
        } catch (e) {
            console.error('[计算逻辑] 尝试通过备用方法获取爻辞名称时出错:', e);
        }
        
        // 使用位置名称作为回退
        const fallbackNames = [null, '初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
        const fallbackYaoName = fallbackNames[dongYaoPosition] || `第${dongYaoPosition}爻`;
        
        // 创建一个临时的details副本
        const detailsCopy = JSON.parse(JSON.stringify(details));
        if (!detailsCopy.lines) detailsCopy.lines = {};
        detailsCopy.lines[dongYaoPosition] = fallbackYaoName;
        
        return {
            hexOrder: hexagramOrder,
            guaMing: detailsCopy.name,
            dongYaoName: fallbackYaoName,
            fileNameBase: detailsCopy.fileNameBase,
            shangGuaInfo: `${TRIGRAMS[upperGuaNum].name} (${TRIGRAMS[upperGuaNum].representation})`,
            xiaGuaInfo: `${TRIGRAMS[lowerGuaNum].name} (${TRIGRAMS[lowerGuaNum].representation})`,
            dongYaoPosForDisplay: dongYaoPosition
        };
    }

    return {
        hexOrder: hexagramOrder,
        guaMing: details.name,
        dongYaoName: dongYaoName,
        fileNameBase: details.fileNameBase,
        shangGuaInfo: `${TRIGRAMS[upperGuaNum].name} (${TRIGRAMS[upperGuaNum].representation})`,
        xiaGuaInfo: `${TRIGRAMS[lowerGuaNum].name} (${TRIGRAMS[lowerGuaNum].representation})`,
        dongYaoPosForDisplay: dongYaoPosition // For preview display
    };
}

/**
 * 异步获取并解析爻辞
 * @param {string} fileNameBase - HTML文件的基础名 (例如 "hexagram_01")
 * @param {number} dongYaoPosition - 动爻位置 (1-6)
 * @returns {Promise<string|null>} 格式化后的爻辞，或在错误时返回null
 */
async function fetchAndParseYaoCi(fileNameBase, dongYaoPosition) {
    if (!fileNameBase || dongYaoPosition < 1 || dongYaoPosition > 6) {
        console.error("[计算逻辑] 获取爻辞的参数无效");
        return null;
    }

    // 首先尝试使用zhou4XX格式ID查找
    const targetYaoCiIds = [
        `zhou4${String(dongYaoPosition).padStart(2, '0')}`, // zhou401, zhou402, ...
        `zhou${dongYaoPosition + 1}`,                       // zhou2, zhou3, ... (之前的格式)
        `yao${dongYaoPosition}`                            // 其他可能的格式
    ];
    
    const filePath = `assets/html_combined/${fileNameBase}_combined.html`;
    const fileURL = chrome.runtime.getURL(filePath);

    try {
        console.log(`[计算逻辑] 开始获取爻辞内容，文件: ${fileNameBase}, 动爻位置: ${dongYaoPosition}`);
        const response = await fetch(fileURL);
        if (!response.ok) {
            console.error(`[计算逻辑] 获取爻辞文件失败: ${response.status} ${response.statusText} - ${fileURL}`);
            return null;
        }
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        
        // 尝试所有可能的ID格式
        let yaoCiElement = null;
        for (const id of targetYaoCiIds) {
            const element = doc.getElementById(id);
            if (element && element.textContent) {
                yaoCiElement = element;
                console.log(`[计算逻辑] 使用ID ${id} 找到爻辞元素`);
                break;
            }
        }
        
        // 如果通过ID没找到，尝试查找包含特定爻辞名的标题
        if (!yaoCiElement) {
            console.log('[计算逻辑] 通过ID未找到爻辞，尝试通过爻辞名查找');
            
            // 获取卦名
            let guaMing = '';
            const hexMatch = fileNameBase.match(/hexagram_(\d+)/);
            if (hexMatch && hexMatch[1] && window.HEXAGRAM_NAMES) {
                const hexagramId = parseInt(hexMatch[1], 10);
                if (hexagramId >= 1 && hexagramId <= 64) {
                    guaMing = window.HEXAGRAM_NAMES[hexagramId - 1];
                }
            }
            
            // 获取爻辞名称
            let yaoCiName = '';
            if (guaMing && typeof window.getYaoCiNameSafe === 'function') {
                yaoCiName = window.getYaoCiNameSafe(guaMing, dongYaoPosition);
            }
            
            if (yaoCiName) {
                console.log(`[计算逻辑] 获取到爻辞名称: ${yaoCiName}`);
                // 查找包含此爻辞名称的标题
                const headers = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, strong, b'));
                for (const header of headers) {
                    if (header.textContent.includes(yaoCiName)) {
                        yaoCiElement = header;
                        console.log(`[计算逻辑] 通过爻辞名称 ${yaoCiName} 找到元素`);
                        break;
                    }
                }
            }
        }
        
        if (yaoCiElement && yaoCiElement.textContent) {
            let yaoCiText = yaoCiElement.textContent.trim();
            // 格式化爻辞: "高岛易断 上九：亢龙有悔。" -> "上九: 亢龙有悔"
            // 1. 移除 "高岛易断 " (如果存在)
            yaoCiText = yaoCiText.replace(/^高岛易断\s*/, "");
            // 2. 获取爻名和爻辞内容，爻名可能已知，或者从文本中提取
            // 简单的处理：去除爻名前缀（如果爻名在文本中且已知），替换中文冒号，去除句号
            // 例如 "上九：亢龙有悔。" -> "亢龙有悔"
            const parts = yaoCiText.split(/：|:/); // 分割中文或英文冒号
            let mainYaoCi = parts.length > 1 ? parts[1].trim() : yaoCiText; // 取冒号后的部分
            mainYaoCi = mainYaoCi.replace(/。$/, ""); // 去除末尾句号
            return mainYaoCi; // 返回纯爻辞内容，爻名由 getHexagramBaseDetails 提供
        } else {
            console.warn(`[计算逻辑] 在 ${fileNameBase} 中未找到ID为 ${targetYaoCiIds.join('/')} 的爻辞元素或其内容为空`);
            
            // 尝试基于爻位寻找内容
            const positionPatterns = [
                new RegExp(`第${dongYaoPosition}爻`), 
                new RegExp(`${dongYaoPosition}爻`)
            ];
            
            let foundText = '';
            // 查找所有段落和标题，寻找可能包含爻位的内容
            const allElements = Array.from(doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6'));
            for (const element of allElements) {
                const text = element.textContent;
                for (const pattern of positionPatterns) {
                    if (pattern.test(text)) {
                        foundText = text.replace(/^高岛易断\s*/, "").trim();
                        break;
                    }
                }
                if (foundText) break;
            }
            
            if (foundText) {
                console.log(`[计算逻辑] 通过爻位模式匹配找到内容: ${foundText}`);
                // 提取冒号后的内容
                const parts = foundText.split(/：|:/);
                return parts.length > 1 ? parts[1].trim().replace(/。$/, "") : foundText;
            }
            
            return "未能找到具体爻辞内容";
        }
    } catch (error) {
        console.error(`[计算逻辑] 获取或解析爻辞时发生错误 (${fileNameBase}):`, error);
        return null;
    }
}

// 注意: TRIGRAMS, HEXAGRAM_MAP, getHexagramNumber, HEXAGRAM_DETAILS_MAP
// 需要在此文件作用域内可用。
// 如果它们定义在其他文件中并通过 <script> 标签在popup.html中引入，
// 那么在popup的JS上下文中它们是全局可用的。
// 对于扩展的其他部分（如background script，如果在这里执行逻辑），需要确保正确导入或定义。 