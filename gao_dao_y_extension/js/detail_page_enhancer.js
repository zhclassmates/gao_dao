// gao_dao_y_extension/js/detail_page_enhancer.js
(function() {
    console.log('[GaoDaoYi HTML Enhancer] 脚本加载, 页面路径:', window.location.href);

    // 调试工具 - 显示所有localStorage数据
    function debugLocalStorage() {
        console.log('[GaoDaoYi HTML Enhancer] localStorage内容:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('gaodaoYi_')) {
                console.log(`  ${key}: ${localStorage.getItem(key)}`);
            }
        }
    }
    
    // 爻辞匹配函数 - 根据卦名和爻位找到对应的爻辞
    function matchYaoCi(guaMing, yaoPosition) {
        if (!guaMing || !yaoPosition) {
            console.error(`[GaoDaoYi HTML Enhancer] matchYaoCi参数错误: 卦名=${guaMing}, 爻位=${yaoPosition}`);
            return `第${yaoPosition}爻`;
        }

        // 确保爻位是数字
        const position = parseInt(yaoPosition, 10);
        if (isNaN(position) || position < 1 || position > 6) {
            console.error(`[GaoDaoYi HTML Enhancer] 无效的爻位: ${yaoPosition}`);
            return `未知爻位`;
        }
        
        // 清除卦名中可能的空格和序号
        const cleanGuaMing = String(guaMing).replace(/^\d+\.?\s*/, '').trim();
        console.log(`[GaoDaoYi HTML Enhancer] 尝试匹配卦名: "${cleanGuaMing}", 爻位: ${position}`);
        
        // 使用安全的全局访问函数(如果可用)
        if (typeof window.getYaoCiNameSafe === 'function') {
            try {
                const yaoCiName = window.getYaoCiNameSafe(cleanGuaMing, position);
                console.log(`[GaoDaoYi HTML Enhancer] 从全局安全函数找到: ${yaoCiName}`);
                return yaoCiName;
            } catch (e) {
                console.error(`[GaoDaoYi HTML Enhancer] 全局安全函数异常:`, e);
            }
        }
        
        // 如果已加载爻辞数据库
        if (typeof window.GaoDaoYi_YaoCiData !== 'undefined') {
            try {
                // 使用爻辞数据库直接获取
                const yaoCiName = window.GaoDaoYi_YaoCiData.getYaoCiName(cleanGuaMing, position);
                console.log(`[GaoDaoYi HTML Enhancer] 从爻辞数据库找到: ${yaoCiName}`);
                return yaoCiName;
            } catch (e) {
                console.error(`[GaoDaoYi HTML Enhancer] 从爻辞数据库获取爻辞失败:`, e);
            }
        }
        
        // 回退到标准映射
        const yaoNames = {
            '乾为天': {1: '初九', 2: '九二', 3: '九三', 4: '九四', 5: '九五', 6: '上九'},
            '坤为地': {1: '初六', 2: '六二', 3: '六三', 4: '六四', 5: '六五', 6: '上六'}
            // ... 其他卦的爻辞名称映射可以根据需要添加
        };
        
        if (yaoNames[cleanGuaMing] && yaoNames[cleanGuaMing][position]) {
            console.log(`[GaoDaoYi HTML Enhancer] 从回退映射找到: ${yaoNames[cleanGuaMing][position]}`);
            return yaoNames[cleanGuaMing][position];
        }
        
        // 默认回退到标准命名
        const defaultNames = [null, '初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
        return defaultNames[position] || `第${position}爻`;
    }
    
    // 找到所有爻位元素并添加标记
    function findAndMarkAllYaoPositions() {
        console.log('[GaoDaoYi HTML Enhancer] 开始标记所有爻位...');
        
        // 尝试检测当前查看的卦象信息
        const urlPath = window.location.pathname;
        const hexagramMatch = urlPath.match(/hexagram_(\d+)_combined/);
        if (!hexagramMatch || !hexagramMatch[1]) {
            console.warn('[GaoDaoYi HTML Enhancer] 无法从URL识别卦象编号');
            return;
        }
        
        const hexagramId = parseInt(hexagramMatch[1], 10);
        if (isNaN(hexagramId) || hexagramId < 1 || hexagramId > 64) {
            console.warn(`[GaoDaoYi HTML Enhancer] 无效的卦象编号: ${hexagramId}`);
            return;
        }
        
        // 获取卦名
        let hexagramName = '';
        if (typeof window.HEXAGRAM_NAMES !== 'undefined' && window.HEXAGRAM_NAMES.length >= hexagramId) {
            hexagramName = window.HEXAGRAM_NAMES[hexagramId - 1];
        } else if (typeof window.GaoDaoYi_YaoCiData !== 'undefined') {
            // 尝试从爻辞数据库获取卦名列表
            const allGuaList = Object.keys(window.GaoDaoYi_YaoCiData.yaoCiMap);
            if (allGuaList.length >= hexagramId) {
                hexagramName = allGuaList[hexagramId - 1];
            }
        }
        
        if (!hexagramName) {
            console.warn(`[GaoDaoYi HTML Enhancer] 无法确定卦象 ${hexagramId} 的名称，尝试从页面中获取...`);
            // 尝试从页面标题获取
            const titleElement = document.querySelector('title');
            if (titleElement && titleElement.textContent) {
                const titleMatches = titleElement.textContent.match(/[\d\.]*\s*([^-]+)/);
                if (titleMatches && titleMatches[1]) {
                    hexagramName = titleMatches[1].trim();
                    console.log(`[GaoDaoYi HTML Enhancer] 从页面标题获取到卦名: ${hexagramName}`);
                }
            }
            
            if (!hexagramName) return;
        }
        
        console.log(`[GaoDaoYi HTML Enhancer] 识别到当前卦象: ${hexagramId}. ${hexagramName}`);
        
        // 查找所有可能的爻位元素
        const allPossibleHeaders = [];
        
        // 方法1: 查找id以zhou开头的元素
        const zhouHeaders = document.querySelectorAll('[id^="zhou"]');
        zhouHeaders.forEach(header => allPossibleHeaders.push(header));
        
        // 方法2: 查找含有"爻"字的h3标签
        const yaoH3s = Array.from(document.querySelectorAll('h3')).filter(h3 => 
            h3.textContent.includes('爻') || 
            h3.textContent.includes('初') || 
            h3.textContent.includes('九') || 
            h3.textContent.includes('六')
        );
        yaoH3s.forEach(header => {
            if (!allPossibleHeaders.includes(header)) {
                allPossibleHeaders.push(header);
            }
        });

        // 方法3: 查找匹配爻名的h3或h4标签
        const yaoPatterns = [/初九/, /九二/, /六二/, /九三/, /六三/, /九四/, /六四/, /九五/, /六五/, /上九/, /上六/];
        const titleElements = Array.from(document.querySelectorAll('h3, h4, strong, b'));
        
        titleElements.forEach(element => {
            if (!allPossibleHeaders.includes(element)) {
                const textContent = element.textContent.trim();
                for (const pattern of yaoPatterns) {
                    if (pattern.test(textContent)) {
                        allPossibleHeaders.push(element);
                        break;
                    }
                }
            }
        });
        
        console.log(`[GaoDaoYi HTML Enhancer] 找到 ${allPossibleHeaders.length} 个可能的爻位元素`);
        
        // 为每个爻位添加正确的标记和事件
        allPossibleHeaders.forEach(header => {
            // 尝试从ID或文本内容推断爻位
            let position = 0;
            
            // 从ID推断 - zhou4XX格式
            const zhou4Match = header.id.match(/zhou4(\d+)/);
            if (zhou4Match && zhou4Match[1]) {
                position = parseInt(zhou4Match[1], 10);
                if (position > 0 && position <= 6) {
                    console.log(`[GaoDaoYi HTML Enhancer] 从ID zhou4XX 推断爻位: ${position}`);
                }
            }
            
            // 从ID推断 - zhouX格式
            if (position === 0) {
                const zhouMatch = header.id.match(/zhou(\d+)/);
                if (zhouMatch && zhouMatch[1]) {
                    // 注意这里的差异：zhouX中X是从1开始的，但实际爻位需要减1
                    position = parseInt(zhouMatch[1], 10) - 1;
                    if (position > 0 && position <= 6) {
                        console.log(`[GaoDaoYi HTML Enhancer] 从ID zhouX 推断爻位: ${position}`);
                    }
                }
            }
            
            // 从文本内容推断
            if (position === 0) {
                const text = header.textContent.trim();
                // 尝试匹配"第X爻"或"X爻"格式
                const posMatch = text.match(/第(\d+)爻|(\d+)爻/);
                if (posMatch) {
                    position = parseInt(posMatch[1] || posMatch[2], 10);
                    console.log(`[GaoDaoYi HTML Enhancer] 从文本推断爻位: ${position}`);
                } 
                // 尝试匹配"初X"、"X二"、"X三"等格式
                else if (text.includes('初九') || text.includes('初六')) {
                    position = 1;
                } else if (text.includes('九二') || text.includes('六二')) {
                    position = 2;
                } else if (text.includes('九三') || text.includes('六三')) {
                    position = 3;
                } else if (text.includes('九四') || text.includes('六四')) {
                    position = 4;
                } else if (text.includes('九五') || text.includes('六五')) {
                    position = 5;
                } else if (text.includes('上九') || text.includes('上六')) {
                    position = 6;
                } else if (text.includes('初')) {
                    position = 1;
                } else if (text.includes('二')) {
                    position = 2;
                } else if (text.includes('三')) {
                    position = 3;
                } else if (text.includes('四')) {
                    position = 4;
                } else if (text.includes('五')) {
                    position = 5;
                } else if (text.includes('上')) {
                    position = 6;
                }
            }
            
            if (position > 0 && position <= 6) {
                // 获取正确的爻辞名称
                const correctYaoCiName = matchYaoCi(hexagramName, position);
                
                // 添加数据属性
                header.dataset.yaoPosition = position;
                header.dataset.yaoCiName = correctYaoCiName;
                
                // 添加视觉标记
                const marker = document.createElement('span');
                marker.className = 'yao-marker';
                marker.style.backgroundColor = '#ffeb3b';
                marker.style.color = '#333';
                marker.style.padding = '2px 5px';
                marker.style.borderRadius = '3px';
                marker.style.marginLeft = '8px';
                marker.style.fontSize = '14px';
                marker.style.fontWeight = 'normal';
                marker.textContent = correctYaoCiName;
                
                // 检查是否已有标记
                if (!header.querySelector('.yao-marker')) {
                    header.appendChild(marker);
                }
                
                // 添加点击事件用于高亮
                if (!header.hasAttribute('data-event-added')) {
                    header.style.cursor = 'pointer';
                    header.title = '点击高亮/取消高亮此爻位说明';
                    
                    header.addEventListener('click', function() {
                        const isHighlighted = this.classList.contains('highlighted-yao');
                        
                        // 清除所有高亮
                        document.querySelectorAll('.highlighted-yao').forEach(el => {
                            el.classList.remove('highlighted-yao');
                        });
                        
                        // 如果未高亮，添加高亮
                        if (!isHighlighted) {
                            this.classList.add('highlighted-yao');
                            
                            // 高亮后续段落直到下一个标题
                            let sibling = this.nextElementSibling;
                            while (sibling && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(sibling.tagName)) {
                                if (sibling.tagName === 'P') {
                                    sibling.classList.add('highlighted-yao');
                                }
                                sibling = sibling.nextElementSibling;
                            }
                        }
                    });
                    
                    header.setAttribute('data-event-added', 'true');
                }
            } else {
                console.log(`[GaoDaoYi HTML Enhancer] 无法确定元素的爻位: ${header.textContent}`);
            }
        });

        // 添加CSS样式
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .highlighted-yao {
                background-color: #fffce0 !important;
                border-left: 3px solid #ffc107 !important;
                padding-left: 10px !important;
                scroll-margin-top: 60px;
            }
            .yao-marker {
                transition: all 0.3s ease;
            }
            .yao-marker:hover {
                background-color: #ffc107;
            }
            [data-yao-position] {
                transition: all 0.2s ease;
            }
            [data-yao-position]:hover {
                background-color: #f8f9fa;
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    // 调用调试函数
    debugLocalStorage();

    // 从 localStorage 获取数据
    const fullYaoCi = localStorage.getItem('gaodaoYi_current_full_yao_ci');
    const guaMing = localStorage.getItem('gaodaoYi_current_guaMing');
    const changeLine = localStorage.getItem('gaodaoYi_current_dongYaoPos');
    
    // 无论是否有localStorage数据，都标记所有爻位
    // 这样用户在浏览模式下也能看到爻辞标记
    // 使用延迟加载确保页面元素都已加载，并且yao_ci_data.js已经执行
    setTimeout(findAndMarkAllYaoPositions, 500);

    // 验证数据
    if (!fullYaoCi || !guaMing || !changeLine) {
        console.warn('[GaoDaoYi HTML Enhancer] 警告: 无法从localStorage获取完整卦象数据。将尝试从URL解析卦象编号');
        
        // 尝试从URL路径获取卦象编号
        const urlPath = window.location.pathname;
        const hexagramMatch = urlPath.match(/hexagram_(\d+)_combined/);
        let detectedHexagramId = null;
        
        if (hexagramMatch && hexagramMatch[1]) {
            detectedHexagramId = parseInt(hexagramMatch[1], 10);
            console.log('[GaoDaoYi HTML Enhancer] 从URL检测到卦象编号:', detectedHexagramId);
            
            // 查找卦名
            let detectedGuaMing = '';
            try {
                if (typeof window.GaoDaoYi_YaoCiData !== 'undefined') {
                    // 使用爻辞数据库中的卦名列表
                    const allGuaList = Object.keys(window.GaoDaoYi_YaoCiData.yaoCiMap);
                    if (detectedHexagramId >= 1 && detectedHexagramId <= 64 && window.HEXAGRAM_NAMES) {
                        detectedGuaMing = window.HEXAGRAM_NAMES[detectedHexagramId - 1];
                    }
                }
            } catch (e) {
                console.error('[GaoDaoYi HTML Enhancer] 尝试获取卦名时出错:', e);
            }
            
            // 显示所有六爻信息
            if (detectedGuaMing && typeof window.GaoDaoYi_YaoCiData !== 'undefined') {
                const allYaoCiOfGua = window.GaoDaoYi_YaoCiData.getGuaAllYaoCi(detectedGuaMing);
                
                if (allYaoCiOfGua && allYaoCiOfGua.length > 0) {
                    const yaoCiInfo = document.createElement('div');
                    yaoCiInfo.style.background = '#f0f8ff';
                    yaoCiInfo.style.border = '1px solid #4682b4';
                    yaoCiInfo.style.borderRadius = '8px';
                    yaoCiInfo.style.padding = '15px';
                    yaoCiInfo.style.margin = '15px 0';
                    yaoCiInfo.style.fontSize = '16px';
                    yaoCiInfo.style.position = 'relative';
                    yaoCiInfo.style.zIndex = '1000';
                    
                    let yaoListHTML = `<div style="font-weight:bold;font-size:18px;margin-bottom:10px;">
                        ${detectedHexagramId}. ${detectedGuaMing} - 六爻一览</div><ul style="list-style:none;padding:0;">`;
                    
                    allYaoCiOfGua.forEach(yao => {
                        yaoListHTML += `<li style="margin-bottom:8px;padding:5px;border-left:3px solid #4682b4;padding-left:10px;cursor:pointer;" 
                            class="yao-list-item" data-position="${yao.position}">
                            第${yao.position}爻: <strong>${yao.yaoCiName}</strong></li>`;
                    });
                    
                    yaoListHTML += '</ul>';
                    yaoCiInfo.innerHTML = yaoListHTML;
                    
                    // 添加点击爻位的事件
                    setTimeout(() => {
                        document.querySelectorAll('.yao-list-item').forEach(item => {
                            item.addEventListener('click', function() {
                                const position = this.getAttribute('data-position');
                                // 查找并滚动到对应的爻位
                                document.querySelectorAll(`[data-yao-position="${position}"]`).forEach(el => {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    el.click(); // 触发高亮
                                });
                            });
                        });
                    }, 100);
                    
                    if (document.body.firstChild) {
                        document.body.insertBefore(yaoCiInfo, document.body.firstChild);
                    } else {
                        document.body.appendChild(yaoCiInfo);
                    }
                }
            }
            
            // 创建提示信息
            const infoMsg = document.createElement('div');
            infoMsg.style.background = '#fffaeb';
            infoMsg.style.color = '#d87500';
            infoMsg.style.padding = '12px 15px';
            infoMsg.style.margin = '15px 0';
            infoMsg.style.borderRadius = '6px';
            infoMsg.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            infoMsg.style.fontSize = '16px';
            infoMsg.style.lineHeight = '1.5';
            infoMsg.style.position = 'relative';
            infoMsg.style.zIndex = '1000';
            infoMsg.innerHTML = `<strong>您正在查看第 ${detectedHexagramId} 卦 ${detectedGuaMing || ''}</strong>
                <p>请返回扩展界面，使用"计算卦象"功能来获取特定于您的卦象解释。</p>`;
            
            if (document.body.firstChild) {
                document.body.insertBefore(infoMsg, document.body.firstChild);
            } else {
                document.body.appendChild(infoMsg);
            }
            
            // 尝试查找并高亮所有爻位标题 - 使用统一ID格式查找
            findAllYaoElements();
            
            // 我们不需要显示错误消息，因为用户可能只是在浏览卦象
            return;
        }
        
        // 仍然创建错误提示
        const errorMsg = document.createElement('div');
        errorMsg.style.background = '#ffeeee';
        errorMsg.style.color = '#cc0000';
        errorMsg.style.padding = '15px';
        errorMsg.style.margin = '15px 0';
        errorMsg.style.borderLeft = '4px solid #cc0000';
        errorMsg.style.borderRadius = '4px';
        errorMsg.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        errorMsg.innerHTML = '<strong>数据获取失败</strong><p>请重新从扩展计算卦象并查看详情。</p>';
        
        if (document.body.firstChild) {
            document.body.insertBefore(errorMsg, document.body.firstChild);
        } else {
            document.body.appendChild(errorMsg);
        }
        return;
    }

    // 获取卦名信息，移除序号部分
    const guaMingWithoutNumber = guaMing.replace(/^\d+\.\s*/, '');
    console.log('[GaoDaoYi HTML Enhancer] 卦名(不含序号):', guaMingWithoutNumber);
    
    // 获取正确的爻辞名称
    let changeLinePosition = parseInt(changeLine, 10);
    let correctYaoCiName = '';
    
    // 使用带回退机制的爻辞名称获取
    correctYaoCiName = matchYaoCi(guaMingWithoutNumber, changeLinePosition);
    console.log('[GaoDaoYi HTML Enhancer] 获取的爻辞名称:', correctYaoCiName);
    
    // 1. 创建并插入动爻标题
    const yaoCiHeader = document.createElement('h3');
    yaoCiHeader.id = 'gaodao-yi-enhanced-yao-ci-header';
    yaoCiHeader.textContent = `${guaMing} - ${correctYaoCiName}`;
    yaoCiHeader.style.textAlign = 'center';
    yaoCiHeader.style.color = '#c00';
    yaoCiHeader.style.backgroundColor = '#fff8e1';
    yaoCiHeader.style.padding = '15px';
    yaoCiHeader.style.margin = '0';
    yaoCiHeader.style.borderBottom = '2px solid #c00';
    yaoCiHeader.style.fontSize = '18px';
    yaoCiHeader.style.fontWeight = 'bold';
    yaoCiHeader.style.position = 'sticky';
    yaoCiHeader.style.top = '0';
    yaoCiHeader.style.zIndex = '999';

    if (document.body.firstChild) {
        document.body.insertBefore(yaoCiHeader, document.body.firstChild);
    } else {
        document.body.appendChild(yaoCiHeader);
    }
    console.log('[GaoDaoYi HTML Enhancer] 爻辞标题已添加');

    // 减少页面顶部空白
    document.body.style.marginTop = '0';
    document.body.style.paddingTop = '0';
    
    // 查找并移除可能的顶部空白元素
    const firstElements = document.body.children;
    for (let i = 0; i < Math.min(5, firstElements.length); i++) {
        const el = firstElements[i];
        if (el.id !== 'gaodao-yi-enhanced-yao-ci-header' && 
            el.id !== 'gaodao-yi-payment-popover' &&
            (el.tagName === 'DIV' || el.tagName === 'P') && 
            !el.textContent.trim() && 
            (!el.children || el.children.length === 0)) {
            el.style.display = 'none';
            console.log('[GaoDaoYi HTML Enhancer] 移除了一个空白元素');
        }
    }
    
    // 为整个页面添加CSS修复
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        body {
            margin-top: 0 !important;
            padding-top: 0 !important;
        }
        h1, h2 {
            margin-top: 10px !important;
        }
        .highlighted-yao {
            background-color: #fffce0 !important;
            border-left: 3px solid #ffc107 !important;
            padding-left: 10px !important;
            scroll-margin-top: 60px;
        }
    `;
    document.head.appendChild(styleEl);
    
    // 查找所有可能的爻位元素
    function findAllYaoElements() {
        if (!changeLinePosition || changeLinePosition < 1 || changeLinePosition > 6) {
            console.error(`[GaoDaoYi HTML Enhancer] 无效的动爻位置: ${changeLinePosition}`);
            return;
        }
        
        // 使用更智能的方法查找爻位ID
        // 首先尝试使用统一格式查找
        const possibleIDs = [
            `zhou4${String(changeLinePosition).padStart(2, '0')}`, // zhou401, zhou402, ...
            `zhou${changeLinePosition + 1}`, // zhou2, zhou3, ... (之前的格式)
            `yao${changeLinePosition}` // 其他可能的格式
        ];
        
        let foundYaoHeader = null;
        
        // 尝试所有可能的ID格式
        for (const id of possibleIDs) {
            const yaoHeader = document.getElementById(id);
            if (yaoHeader) {
                foundYaoHeader = yaoHeader;
                console.log(`[GaoDaoYi HTML Enhancer] 找到爻位元素，ID: ${id}`);
                break;
            }
        }
        
        // 如果没有通过ID找到，尝试通过文本内容查找
        if (!foundYaoHeader) {
            console.log('[GaoDaoYi HTML Enhancer] 通过ID未找到爻位元素，尝试通过文本内容查找');
            
            // 获取正确的爻辞名称，如"初九"、"六二"等
            const yaoCiName = correctYaoCiName || matchYaoCi(guaMingWithoutNumber, changeLinePosition);
            
            // 查找包含此爻辞名称的标题或段落
            const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
            for (const heading of allHeadings) {
                if (heading.textContent.includes(yaoCiName)) {
                    foundYaoHeader = heading;
                    console.log(`[GaoDaoYi HTML Enhancer] 通过爻辞名称'${yaoCiName}'找到元素:`, heading.textContent);
                    break;
                }
            }
            
            if (!foundYaoHeader) {
                // 尝试通过位置名称找，如"初爻"、"二爻"等
                const positionNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
                const posName = positionNames[changeLinePosition - 1];
                
                for (const heading of allHeadings) {
                    if (heading.textContent.includes(posName) || 
                        heading.textContent.includes(`第${changeLinePosition}爻`)) {
                        foundYaoHeader = heading;
                        console.log(`[GaoDaoYi HTML Enhancer] 通过位置名称'${posName}'找到元素:`, heading.textContent);
                        break;
                    }
                }
            }
        }
        
        // 如果找到了爻位元素，高亮并滚动到它
        if (foundYaoHeader) {
            // 添加数据属性和标记
            foundYaoHeader.dataset.yaoPosition = changeLinePosition;
            foundYaoHeader.dataset.yaoCiName = correctYaoCiName;
            
            // 添加效果
            foundYaoHeader.classList.add('highlighted-yao');
            
            // 高亮后续段落直到下一个标题
            let sibling = foundYaoHeader.nextElementSibling;
            while (sibling && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(sibling.tagName)) {
                if (sibling.tagName === 'P') {
                    sibling.classList.add('highlighted-yao');
                }
                sibling = sibling.nextElementSibling;
            }
            
            // 平滑滚动到元素位置
            setTimeout(() => {
                foundYaoHeader.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 500);
            
            console.log('[GaoDaoYi HTML Enhancer] 成功标记和高亮动爻位置');
            return true;
        } else {
            console.warn(`[GaoDaoYi HTML Enhancer] 未找到动爻位置元素 (位置: ${changeLinePosition}, 名称: ${correctYaoCiName})`);
            return false;
        }
    }
    
    // 调用查找元素函数
    setTimeout(findAllYaoElements, 800);
    
    // 3. 创建并显示右上角收款码悬浮框
    const popoverContainer = document.createElement('div');
    popoverContainer.id = 'gaodao-yi-payment-popover';
    
    // 调整popoverContainer的样式，确保位置固定
    popoverContainer.style.position = 'fixed';
    popoverContainer.style.top = '70px';  // 稍微下移，避免与动爻标题重叠
    popoverContainer.style.right = '20px';
    popoverContainer.style.zIndex = '9999';

    const title = document.createElement('div');
    title.className = 'popover-title';
    title.textContent = '赞赏支持';
    popoverContainer.appendChild(title);

    const paymentIcons = document.createElement('div');
    paymentIcons.className = 'payment-icons';

    // 创建图片函数
    function createPaymentImage(altText, imageUrl, labelText) {
        const block = document.createElement('div');
        block.className = 'payment-icon-block';
        
        // 创建链接而不是图片
        const supportLink = document.createElement('a');
        supportLink.href = 'https://wjz5788.github.io/donate/';
        supportLink.target = '_blank';
        supportLink.className = 'support-link';
        supportLink.style.display = 'block';
        supportLink.style.width = '80px';
        supportLink.style.height = '80px';
        supportLink.style.margin = '0 auto 5px auto';
        supportLink.style.backgroundColor = '#f8e9a1';
        supportLink.style.borderRadius = '4px';
        supportLink.style.color = '#d62828';
        supportLink.style.fontWeight = 'bold';
        supportLink.style.textDecoration = 'none';
        supportLink.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        supportLink.style.textAlign = 'center';
        supportLink.style.lineHeight = '80px';
        supportLink.textContent = '打赏支持';
        
        block.appendChild(supportLink);

        const label = document.createElement('div');
        label.className = 'payment-icon-label';
        label.textContent = labelText;
        block.appendChild(label);
        return block;
    }

    // 尝试两种可能的路径
    paymentIcons.appendChild(createPaymentImage('微信收款码', 'assets/images/wechat_qr.png', '微信'));
    paymentIcons.appendChild(createPaymentImage('支付宝收款码', 'assets/images/alipay_qr.png', '支付宝'));
    popoverContainer.appendChild(paymentIcons);

    const closeButton = document.createElement('button');
    closeButton.id = 'gaodao-yi-popover-close-btn';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => {
        popoverContainer.style.display = 'none';
        localStorage.setItem('gaodaoYi_popover_closed', 'true');
    };
    popoverContainer.appendChild(closeButton);

    // 检查是否之前关闭过
    if (localStorage.getItem('gaodaoYi_popover_closed') === 'true') {
        popoverContainer.style.display = 'none';
    }

    document.body.appendChild(popoverContainer);
    console.log('[GaoDaoYi HTML Enhancer] 收款码悬浮框已添加');

    // 4. 添加成功加载提示
    const successMessage = document.createElement('div');
    successMessage.style.position = 'fixed';
    successMessage.style.bottom = '20px';
    successMessage.style.left = '50%';
    successMessage.style.transform = 'translateX(-50%)';
    successMessage.style.backgroundColor = '#4CAF50';
    successMessage.style.color = 'white';
    successMessage.style.padding = '10px 20px';
    successMessage.style.borderRadius = '4px';
    successMessage.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    successMessage.style.zIndex = '9999';
    successMessage.style.fontSize = '14px';
    successMessage.textContent = `${guaMing} 详情页加载成功`;

    document.body.appendChild(successMessage);
    
    // 3秒后自动消失
    setTimeout(() => {
        successMessage.style.opacity = '0';
        successMessage.style.transition = 'opacity 0.5s ease';
        setTimeout(() => successMessage.remove(), 500);
    }, 3000);

})(); 