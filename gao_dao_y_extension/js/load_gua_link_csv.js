// gao_dao_y_extension/js/load_gua_link_csv.js
(function() {
    console.log('[GaoDaoYi CSV Loader] 开始加载爻辞CSV数据');
    
    // 检查是否已经加载
    if (typeof window.GUA_LINK_CSV_DATA !== 'undefined') {
        console.log('[GaoDaoYi CSV Loader] 爻辞CSV数据已加载，跳过');
        return;
    }
    
    // 内置CSV数据 - 从gua_link.csv提取
    // 格式: gui-name,number3,change-number
    window.GUA_LINK_CSV_DATA = `gui-name,number3,change-number
　乾为天,1,初九
　乾为天,2,九二
　乾为天,3,九三
　乾为天,4,九四
　乾为天,5,九五
　乾为天,6,上九
　坤为地,1,初六
　坤为地,2,六二
　坤为地,3,六三
　坤为地,4,六四
　坤为地,5,六五
　坤为地,6,上六
　水雷屯,1,初九
　水雷屯,2,六二
　水雷屯,3,六三
　水雷屯,4,六四
　水雷屯,5,九五
　水雷屯,6,上六
　山水蒙,1,初六
　山水蒙,2,九二
　山水蒙,3,六三
　山水蒙,4,六四
　山水蒙,5,六五
　山水蒙,6,上九
　水天需,1,初九
　水天需,2,九二
　水天需,3,九三
　水天需,4,六四
　水天需,5,九五
　水天需,6,上六
　天水讼,1,初六
　天水讼,2,九二
　天水讼,3,六三
　天水讼,4,九四
　天水讼,5,九五
　天水讼,6,上九
　地水师,1,初六
　地水师,2,九二
　地水师,3,六三
　地水师,4,六四
　地水师,5,六五
　地水师,6,上六
　水地比,1,初六
　水地比,2,六二
　水地比,3,六三
　水地比,4,六四
　水地比,5,九五
　水地比,6,上六
　风天小畜,1,初九
　风天小畜,2,九二
　风天小畜,3,九三
　风天小畜,4,六四
　风天小畜,5,九五
　风天小畜,6,上九
　天泽履,1,初九
　天泽履,2,九二
　天泽履,3,六三
　天泽履,4,九四
　天泽履,5,九五
　天泽履,6,上九
　地天泰,1,初九
　地天泰,2,九二
　地天泰,3,九三
　地天泰,4,六四
　地天泰,5,六五
　地天泰,6,上六
　天地否,1,初六
　天地否,2,六二
　天地否,3,六三
　天地否,4,九四
　天地否,5,九五
　天地否,6,上九`;
    
    console.log('[GaoDaoYi CSV Loader] 爻辞CSV数据已内置加载');
    
    // 尝试触发爻辞数据扩展
    if (typeof window.GaoDaoYi_YaoCiData !== 'undefined' && 
        typeof window.GaoDaoYi_YaoCiData.extendYaoCiData === 'function') {
        
        console.log('[GaoDaoYi CSV Loader] 尝试自动扩展爻辞数据');
        
        // 解析CSV数据
        try {
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
                console.log(`[GaoDaoYi CSV Loader] 从CSV直接扩展了 ${updatedCount} 条爻辞数据`);
            }
        } catch (e) {
            console.error('[GaoDaoYi CSV Loader] 处理CSV数据时出错:', e);
        }
    } else {
        console.log('[GaoDaoYi CSV Loader] 爻辞数据库尚未加载，CSV数据将在其加载后自动应用');
    }
})(); 