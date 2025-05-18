// content_scripts/content_script.js

(function() {
    console.log('[高岛易] 内容脚本已加载');
    
    // 监听storage变化
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.gaodaoYiGuaData) {
            console.log('[高岛易] 检测到数据变化');
            
            // 移除旧的悬浮框(如果存在)
            const existingPopover = document.getElementById('gaodao-yi-simple-popover');
            if (existingPopover) {
                existingPopover.remove();
            }

            // 如果有新数据，创建悬浮框
            if (changes.gaodaoYiGuaData.newValue) {
                createSimplePopover(changes.gaodaoYiGuaData.newValue);
            }
        }
    });

    // 检查是否已有数据(页面刷新时恢复显示)
    chrome.storage.local.get(['gaodaoYiGuaData'], (result) => {
        if (result.gaodaoYiGuaData) {
            createSimplePopover(result.gaodaoYiGuaData);
        }
    });

    // 创建简化版悬浮框
    function createSimplePopover(data) {
        console.log('[高岛易] 创建简化悬浮框:', data);
        
        // 创建悬浮框容器
        const popover = document.createElement('div');
        popover.id = 'gaodao-yi-simple-popover';
        popover.style.position = 'fixed';
        popover.style.top = '20px';
        popover.style.right = '20px';
        popover.style.width = '220px';
        popover.style.backgroundColor = '#ffffff';
        popover.style.border = '2px solid #e60000';
        popover.style.borderRadius = '8px';
        popover.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        popover.style.zIndex = '2147483647';
        popover.style.padding = '15px';
        popover.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
        popover.style.fontSize = '14px';
        popover.style.color = '#333';

        // 添加标题
        const title = document.createElement('div');
        title.textContent = data.guaMing || '卦象结果';
        title.style.fontSize = '18px';
        title.style.fontWeight = 'bold';
        title.style.color = '#e60000';
        title.style.textAlign = 'center';
        title.style.marginBottom = '15px';
        popover.appendChild(title);

        // 创建基本信息表格
        const infoTable = document.createElement('table');
        infoTable.style.width = '100%';
        infoTable.style.marginBottom = '15px';
        infoTable.style.borderCollapse = 'collapse';

        // 添加表格行
        const addRow = (label, value) => {
            const row = infoTable.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            
            cell1.textContent = label;
            cell1.style.fontWeight = 'bold';
            cell1.style.padding = '4px 0';
            cell1.style.width = '35%';
            
            cell2.textContent = value;
            cell2.style.padding = '4px 0';
        };

        // 添加基本信息
        addRow('卦序:', data.guaXu);
        addRow('上卦:', data.shangGua);
        addRow('下卦:', data.xiaGua);
        addRow('动爻:', data.dongYaoMing);
        
        popover.appendChild(infoTable);

        // 添加动爻辞
        if (data.yaoCi) {
            const yaoCiDiv = document.createElement('div');
            yaoCiDiv.textContent = data.yaoCi;
            yaoCiDiv.style.padding = '8px 10px';
            yaoCiDiv.style.backgroundColor = '#f9f9f9';
            yaoCiDiv.style.borderLeft = '3px solid #e60000';
            yaoCiDiv.style.marginBottom = '15px';
            yaoCiDiv.style.borderRadius = '0 4px 4px 0';
            yaoCiDiv.style.fontSize = '13px';
            popover.appendChild(yaoCiDiv);
        }

        // 添加收款码部分
        const supportDiv = document.createElement('div');
        supportDiv.style.textAlign = 'center';
        supportDiv.style.marginTop = '15px';
        supportDiv.style.paddingTop = '15px';
        supportDiv.style.borderTop = '1px solid #eee';

        const supportTitle = document.createElement('div');
        supportTitle.textContent = '赞赏支持';
        supportTitle.style.fontSize = '14px';
        supportTitle.style.marginBottom = '10px';
        supportTitle.style.color = '#666';
        supportDiv.appendChild(supportTitle);

        // 收款码容器
        const qrCodesDiv = document.createElement('div');
        qrCodesDiv.style.display = 'flex';
        qrCodesDiv.style.justifyContent = 'space-around';

        // 创建收款码函数
        const createQrCode = (type, imagePath) => {
            const codeDiv = document.createElement('div');
            codeDiv.style.textAlign = 'center';
            
            try {
                const img = document.createElement('img');
                img.src = chrome.runtime.getURL(imagePath);
                img.style.width = '80px';
                img.style.height = '80px';
                img.style.display = 'block';
                img.style.margin = '0 auto 5px auto';
                img.style.backgroundColor = '#f9f9f9';
                img.style.border = '1px solid #eee';
                img.onerror = () => {
                    img.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.textContent = `[${type}码]`;
                    fallback.style.width = '80px';
                    fallback.style.height = '80px';
                    fallback.style.display = 'flex';
                    fallback.style.alignItems = 'center';
                    fallback.style.justifyContent = 'center';
                    fallback.style.backgroundColor = '#f0f0f0';
                    fallback.style.border = '1px solid #ddd';
                    fallback.style.borderRadius = '4px';
                    fallback.style.fontSize = '12px';
                    fallback.style.color = '#666';
                    codeDiv.insertBefore(fallback, codeDiv.firstChild);
                };
                codeDiv.appendChild(img);
            } catch (e) {
                const fallback = document.createElement('div');
                fallback.textContent = `[${type}码]`;
                fallback.style.width = '80px';
                fallback.style.height = '80px';
                fallback.style.display = 'flex';
                fallback.style.alignItems = 'center';
                fallback.style.justifyContent = 'center';
                fallback.style.backgroundColor = '#f0f0f0';
                fallback.style.border = '1px solid #ddd';
                fallback.style.borderRadius = '4px';
                fallback.style.fontSize = '12px';
                fallback.style.color = '#666';
                codeDiv.appendChild(fallback);
            }
            
            const label = document.createElement('div');
            label.textContent = type;
            label.style.fontSize = '12px';
            label.style.marginTop = '5px';
            codeDiv.appendChild(label);
            
            return codeDiv;
        };

        // 添加微信和支付宝收款码
        qrCodesDiv.appendChild(createQrCode('微信', 'assets/images/wechat_qr.png'));
        qrCodesDiv.appendChild(createQrCode('支付宝', 'assets/images/alipay_qr.png'));
        
        supportDiv.appendChild(qrCodesDiv);
        popover.appendChild(supportDiv);

        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '5px';
        closeButton.style.right = '5px';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '20px';
        closeButton.style.lineHeight = '20px';
        closeButton.style.color = '#999';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '0 5px';
        
        closeButton.onmouseover = () => {
            closeButton.style.color = '#333';
        };
        
        closeButton.onmouseout = () => {
            closeButton.style.color = '#999';
        };
        
        closeButton.onclick = () => {
            popover.remove();
            // 清除存储数据
            chrome.storage.local.remove('gaodaoYiGuaData');
        };
        
        popover.appendChild(closeButton);

        // 添加到页面
        document.body.appendChild(popover);
        console.log('[高岛易] 悬浮框已添加到页面');
    }
})(); 