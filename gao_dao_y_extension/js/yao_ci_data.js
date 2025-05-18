// gao_dao_y_extension/js/yao_ci_data.js
(function() {
    // 存储爻辞数据的全局对象
    window.GaoDaoYi_YaoCiData = {
        // 格式: { 卦名: { 爻位序号: 爻辞名称 } }
        yaoCiMap: {
            "乾为天": { "1": "初九", "2": "九二", "3": "九三", "4": "九四", "5": "九五", "6": "上九" },
            "坤为地": { "1": "初六", "2": "六二", "3": "六三", "4": "六四", "5": "六五", "6": "上六" },
            "水雷屯": { "1": "初九", "2": "六二", "3": "六三", "4": "六四", "5": "九五", "6": "上六" },
            "山水蒙": { "1": "初六", "2": "九二", "3": "六三", "4": "六四", "5": "六五", "6": "上九" },
            "水天需": { "1": "初九", "2": "九二", "3": "九三", "4": "六四", "5": "九五", "6": "上六" },
            "天水讼": { "1": "初六", "2": "九二", "3": "六三", "4": "九四", "5": "九五", "6": "上九" },
            "地水师": { "1": "初六", "2": "九二", "3": "六三", "4": "六四", "5": "六五", "6": "上六" },
            "水地比": { "1": "初六", "2": "六二", "3": "六三", "4": "六四", "5": "九五", "6": "上六" },
            "风天小畜": { "1": "初九", "2": "九二", "3": "九三", "4": "六四", "5": "九五", "6": "上九" },
            "天泽履": { "1": "初九", "2": "九二", "3": "六三", "4": "九四", "5": "九五", "6": "上九" },
            "地天泰": { "1": "初九", "2": "九二", "3": "九三", "4": "六四", "5": "六五", "6": "上六" },
            "天地否": { "1": "初六", "2": "六二", "3": "六三", "4": "九四", "5": "九五", "6": "上九" },
            "天火同人": { "1": "初九", "2": "六二", "3": "九三", "4": "九四", "5": "九五", "6": "上九" },
            "火天大有": { "1": "初九", "2": "九二", "3": "九三", "4": "九四", "5": "六五", "6": "上九" },
            "地山谦": { "1": "初六", "2": "六二", "3": "九三", "4": "六四", "5": "六五", "6": "上六" },
            "雷地豫": { "1": "初六", "2": "六二", "3": "六三", "4": "九四", "5": "六五", "6": "上六" },
            "泽雷随": { "1": "初九", "2": "六二", "3": "六三", "4": "九四", "5": "九五", "6": "上六" },
            "山风蛊": { "1": "初六", "2": "九二", "3": "九三", "4": "六四", "5": "六五", "6": "上九" },
            "地泽临": { "1": "初九", "2": "九二", "3": "六三", "4": "六四", "5": "六五", "6": "上六" },
            "风地观": { "1": "初六", "2": "六二", "3": "六三", "4": "六四", "5": "九五", "6": "上九" },
            "火雷噬嗑": { "1": "初九", "2": "六二", "3": "六三", "4": "九四", "5": "六五", "6": "上九" },
            "山火贲": { "1": "初九", "2": "六二", "3": "九三", "4": "六四", "5": "六五", "6": "上九" },
            "山地剥": { "1": "初六", "2": "六二", "3": "六三", "4": "六四", "5": "六五", "6": "上九" },
            "地雷复": { "1": "初九", "2": "六二", "3": "六三", "4": "六四", "5": "六五", "6": "上六" },
            "天雷无妄": { "1": "初九", "2": "六二", "3": "六三", "4": "九四", "5": "九五", "6": "上九" },
            "山天大畜": { "1": "初九", "2": "九二", "3": "九三", "4": "六四", "5": "六五", "6": "上九" },
            "山雷颐": { "1": "初九", "2": "六二", "3": "六三", "4": "六四", "5": "六五", "6": "上九" },
            "泽风大过": { "1": "初六", "2": "九二", "3": "九三", "4": "九四", "5": "九五", "6": "上六" },
            "坎为水": { "1": "初六", "2": "九二", "3": "六三", "4": "六四", "5": "九五", "6": "上六" },
            "离为火": { "1": "初九", "2": "六二", "3": "九三", "4": "九四", "5": "六五", "6": "上九" },
            "泽山咸": { "1": "初六", "2": "六二", "3": "九三", "4": "九四", "5": "九五", "6": "上六" },
            "雷风恒": { "1": "初六", "2": "九二", "3": "九三", "4": "九四", "5": "六五", "6": "上六" },
            "天山遁": { "1": "初六", "2": "六二", "3": "九三", "4": "九四", "5": "九五", "6": "上九" },
            "雷天大壮": { "1": "初九", "2": "九二", "3": "九三", "4": "九四", "5": "六五", "6": "上六" },
            "火地晋": { "1": "初六", "2": "六二", "3": "六三", "4": "九四", "5": "六五", "6": "上九" },
            "地火明夷": { "1": "初九", "2": "六二", "3": "九三", "4": "六四", "5": "六五", "6": "上六" },
            "风火家人": { "1": "初九", "2": "六二", "3": "九三", "4": "六四", "5": "九五", "6": "上九" },
            "火泽睽": { "1": "初九", "2": "九二", "3": "六三", "4": "九四", "5": "六五", "6": "上九" },
            "水山蹇": { "1": "初六", "2": "六二", "3": "九三", "4": "六四", "5": "九五", "6": "上六" },
            "雷水解": { "1": "初六", "2": "九二", "3": "六三", "4": "九四", "5": "六五", "6": "上六" },
            "山泽损": { "1": "初九", "2": "九二", "3": "六三", "4": "六四", "5": "六五", "6": "上九" },
            "风雷益": { "1": "初九", "2": "六二", "3": "六三", "4": "六四", "5": "九五", "6": "上九" },
            "泽天夬": { "1": "初九", "2": "九二", "3": "九三", "4": "九四", "5": "九五", "6": "上六" },
            "天风姤": { "1": "初六", "2": "九二", "3": "九三", "4": "九四", "5": "九五", "6": "上九" },
            "泽地萃": { "1": "初六", "2": "六二", "3": "六三", "4": "九四", "5": "九五", "6": "上六" },
            "地风升": { "1": "初六", "2": "九二", "3": "九三", "4": "六四", "5": "六五", "6": "上六" },
            "泽水困": { "1": "初六", "2": "九二", "3": "六三", "4": "九四", "5": "九五", "6": "上六" },
            "水风井": { "1": "初六", "2": "九二", "3": "九三", "4": "六四", "5": "九五", "6": "上六" },
            "泽火革": { "1": "初九", "2": "六二", "3": "九三", "4": "九四", "5": "九五", "6": "上六" },
            "火风鼎": { "1": "初六", "2": "九二", "3": "九三", "4": "九四", "5": "六五", "6": "上九" },
            "震为雷": { "1": "初九", "2": "六二", "3": "六三", "4": "九四", "5": "六五", "6": "上六" },
            "艮为山": { "1": "初六", "2": "六二", "3": "九三", "4": "六四", "5": "六五", "6": "上九" },
            "风山渐": { "1": "初六", "2": "六二", "3": "九三", "4": "六四", "5": "九五", "6": "上九" },
            "雷泽归妹": { "1": "初九", "2": "九二", "3": "六三", "4": "九四", "5": "六五", "6": "上六" },
            "雷火丰": { "1": "初九", "2": "六二", "3": "九三", "4": "九四", "5": "六五", "6": "上六" },
            "火山旅": { "1": "初六", "2": "六二", "3": "九三", "4": "九四", "5": "六五", "6": "上九" },
            "巽为风": { "1": "初六", "2": "九二", "3": "九三", "4": "六四", "5": "九五", "6": "上九" },
            "兑为泽": { "1": "初九", "2": "九二", "3": "六三", "4": "九四", "5": "九五", "6": "上六" },
            "风水涣": { "1": "初六", "2": "九二", "3": "六三", "4": "六四", "5": "九五", "6": "上九" },
            "水泽节": { "1": "初九", "2": "九二", "3": "六三", "4": "六四", "5": "九五", "6": "上六" },
            "风泽中孚": { "1": "初九", "2": "九二", "3": "六三", "4": "六四", "5": "九五", "6": "上九" },
            "雷山小过": { "1": "初六", "2": "六二", "3": "九三", "4": "九四", "5": "六五", "6": "上六" },
            "水火既济": { "1": "初九", "2": "六二", "3": "九三", "4": "六四", "5": "九五", "6": "上六" },
            "火水未济": { "1": "初六", "2": "九二", "3": "六三", "4": "九四", "5": "六五", "6": "上九" }
        },

        // 根据卦名和爻位获取爻辞
        getYaoCiName: function(guaMing, yaoPosition) {
            if (!guaMing) {
                console.error(`[YaoCiData] getYaoCiName 错误: 卦名为空`);
                return "未知爻";
            }

            // 确保爻位是字符串
            const position = String(yaoPosition);
            
            // 标准化卦名 - 移除开头的空格和序号
            const normalizedGuaMing = String(guaMing).replace(/^\d+\.?\s*/, '').trim();
            
            if (!this.yaoCiMap[normalizedGuaMing]) {
                console.error(`[YaoCiData] 未找到卦名: ${normalizedGuaMing} (原始输入: ${guaMing})`);
                // 尝试模糊匹配
                const possibleMatch = this.findClosestGuaMing(normalizedGuaMing);
                if (possibleMatch) {
                    console.log(`[YaoCiData] 找到可能的卦名匹配: ${possibleMatch}`);
                    return this.yaoCiMap[possibleMatch][position] || "未知爻";
                }
                return "未知爻";
            }
            
            const yaoCi = this.yaoCiMap[normalizedGuaMing][position];
            if (!yaoCi) {
                console.error(`[YaoCiData] 卦 ${normalizedGuaMing} 未找到爻位 ${position}`);
                return "未知爻";
            }
            
            return yaoCi;
        },
        
        // 查找最接近的卦名（用于模糊匹配）
        findClosestGuaMing: function(inputGuaMing) {
            if (!inputGuaMing) return null;
            
            // 移除所有空格和数字进行比较
            const simplifiedInput = inputGuaMing.replace(/[\s\d\.]/g, '');
            
            for (const guaMing in this.yaoCiMap) {
                const simplifiedGua = guaMing.replace(/[\s\d\.]/g, '');
                if (simplifiedGua === simplifiedInput || 
                    simplifiedGua.includes(simplifiedInput) || 
                    simplifiedInput.includes(simplifiedGua)) {
                    return guaMing;
                }
            }
            
            return null;
        },
        
        // 获取所有爻辞列表
        getAllYaoCiList: function() {
            const result = [];
            for (let gua in this.yaoCiMap) {
                for (let pos in this.yaoCiMap[gua]) {
                    result.push({
                        guaMing: gua,
                        position: pos,
                        yaoCiName: this.yaoCiMap[gua][pos]
                    });
                }
            }
            return result;
        },
        
        // 获取指定卦的所有爻辞
        getGuaAllYaoCi: function(guaMing) {
            if (!guaMing) {
                console.error(`[YaoCiData] getGuaAllYaoCi 错误: 卦名为空`);
                return [];
            }
            
            // 标准化卦名 - 移除开头的空格和序号
            const normalizedGuaMing = String(guaMing).replace(/^\d+\.?\s*/, '').trim();
            
            if (!this.yaoCiMap[normalizedGuaMing]) {
                console.error(`[YaoCiData] getGuaAllYaoCi 未找到卦名: ${normalizedGuaMing} (原始输入: ${guaMing})`);
                // 尝试模糊匹配
                const possibleMatch = this.findClosestGuaMing(normalizedGuaMing);
                if (possibleMatch) {
                    console.log(`[YaoCiData] 找到可能的卦名匹配: ${possibleMatch}`);
                    return this.getGuaAllYaoCi(possibleMatch);
                }
                return [];
            }
            
            const result = [];
            for (let pos in this.yaoCiMap[normalizedGuaMing]) {
                result.push({
                    position: pos,
                    yaoCiName: this.yaoCiMap[normalizedGuaMing][pos]
                });
            }
            return result;
        },
        
        // 用于扩展或更新爻辞数据
        extendYaoCiData: function(dataArray) {
            if (!Array.isArray(dataArray)) {
                console.error('[YaoCiData] extendYaoCiData 错误: 参数非数组');
                return 0;
            }
            
            console.log(`[YaoCiData] 开始扩展爻辞数据，接收 ${dataArray.length} 条记录`);
            let updatedCount = 0;
            
            dataArray.forEach(item => {
                if (!item.guaMing || !item.position || !item.yaoCiName) {
                    console.warn('[YaoCiData] 跳过无效数据项:', item);
                    return;
                }
                
                // 标准化卦名 - 移除开头的空格和序号
                const normalizedGuaMing = String(item.guaMing).replace(/^\d+\.?\s*/, '').trim();
                
                // 如果卦象不存在，创建新条目
                if (!this.yaoCiMap[normalizedGuaMing]) {
                    this.yaoCiMap[normalizedGuaMing] = {};
                }
                
                // 更新爻辞
                this.yaoCiMap[normalizedGuaMing][String(item.position)] = item.yaoCiName;
                updatedCount++;
            });
            
            console.log(`[YaoCiData] 爻辞数据扩展完成，更新了 ${updatedCount} 条记录`);
            return updatedCount;
        }
    };
    
    // 尝试加载CSV格式的爻辞数据（如果页面中有定义）
    if (typeof window.GUA_LINK_CSV_DATA !== 'undefined') {
        console.log('[YaoCiData] 检测到CSV格式爻辞数据，开始处理');
        try {
            // 解析CSV数据
            const lines = window.GUA_LINK_CSV_DATA.split('\n');
            const dataArray = [];
            
            // 跳过标题行
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const parts = line.split(',');
                if (parts.length >= 3) {
                    dataArray.push({
                        guaMing: parts[0].trim(),
                        position: parts[1].trim(),
                        yaoCiName: parts[2].trim()
                    });
                }
            }
            
            // 扩展数据
            if (dataArray.length > 0) {
                const updatedCount = window.GaoDaoYi_YaoCiData.extendYaoCiData(dataArray);
                console.log(`[YaoCiData] 从CSV导入并更新了 ${updatedCount} 条爻辞数据`);
            }
        } catch (e) {
            console.error('[YaoCiData] 处理CSV数据时出错:', e);
        }
    }
    
    // 添加一个全局访问函数，确保即使对象未完全加载也可以安全访问
    window.getYaoCiNameSafe = function(guaMing, yaoPosition) {
        if (typeof window.GaoDaoYi_YaoCiData === 'undefined') {
            console.error('[YaoCiData] 爻辞数据对象尚未加载');
            return "未知爻";
        }
        
        try {
            return window.GaoDaoYi_YaoCiData.getYaoCiName(guaMing, yaoPosition);
        } catch (e) {
            console.error('[YaoCiData] 获取爻辞名称时出错:', e);
            return "未知爻";
        }
    };
})(); 