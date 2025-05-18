// content_scripts/content_script.js

(function() {
    console.log('[GaoDaoYi] Content script loaded.');
    let isPopoverDisplayed = false; 

    function removePopover() {
        const existingPopover = document.getElementById('gaodao-yi-popover-container');
        if (existingPopover) {
            existingPopover.remove();
            isPopoverDisplayed = false;
            console.log('[GaoDaoYi] Popover removed.');
        }
    }

    // 初始检查是否有数据，避免在页面刷新时重复创建（如果storage中仍有数据）
    chrome.storage.local.get(['gaodaoYiGuaData'], (result) => {
        if (chrome.runtime.lastError) {
            console.error('[GaoDaoYi] Error getting initial data from storage:', chrome.runtime.lastError);
            return;
        }
        if (result.gaodaoYiGuaData) {
            console.log('[GaoDaoYi] Initial data found in storage, creating popover:', result.gaodaoYiGuaData);
            // 确保没有已存在的popover，以防万一
            removePopover(); 
            createAndShowPopover(result.gaodaoYiGuaData);
        } else {
            console.log('[GaoDaoYi] No initial data in storage.');
        }
    });

    // 监听storage变化，实时响应
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.gaodaoYiGuaData) {
            console.log('[GaoDaoYi] Storage changed for gaodaoYiGuaData:', changes.gaodaoYiGuaData);
            
            // 总是先尝试移除旧的，以处理更新和清除的情况
            removePopover();

            if (changes.gaodaoYiGuaData.newValue) {
                console.log('[GaoDaoYi] New data received, creating popover.');
                createAndShowPopover(changes.gaodaoYiGuaData.newValue);
            } else {
                console.log('[GaoDaoYi] Data removed from storage, popover (if any) has been removed.');
            }
        }
    });

    function createAndShowPopover(data) {
        console.log('[GaoDaoYi] createAndShowPopover called with data:', data);
        if (document.getElementById('gaodao-yi-popover-container')) {
            console.warn('[GaoDaoYi] Popover container already exists. Aborting creation to prevent duplicates.');
            return;
        }

        const container = document.createElement('div');
        container.id = 'gaodao-yi-popover-container';

        const closeButton = document.createElement('button');
        closeButton.id = 'gaodao-yi-popover-close-btn';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = () => {
            removePopover();
            // 清除storage中的数据，这将触发onChanged事件，确保状态一致
            chrome.storage.local.remove('gaodaoYiGuaData', () => {
                console.log('[GaoDaoYi] Data cleared from storage by close button.');
            }); 
        };
        container.appendChild(closeButton);

        const title = document.createElement('div');
        title.className = 'popover-title';
        title.textContent = data.guaMing || '卦象结果';
        container.appendChild(title);

        const infoGrid = document.createElement('div');
        infoGrid.className = 'info-grid';
        const infoItems = [
            { label: '卦序:', value: data.guaXu },
            { label: '上卦:', value: data.shangGua },
            { label: '下卦:', value: data.xiaGua },
            { label: '动爻:', value: data.dongYaoMing }
        ];
        infoItems.forEach(item => {
            if (item.value !== undefined && item.value !== null) {
                const labelSpan = document.createElement('span');
                labelSpan.className = 'info-label';
                labelSpan.textContent = item.label;
                infoGrid.appendChild(labelSpan);
                const valueSpan = document.createElement('span');
                valueSpan.className = 'info-value';
                valueSpan.textContent = item.value;
                infoGrid.appendChild(valueSpan);
            }
        });
        container.appendChild(infoGrid);

        if (data.yaoCi) {
            const yaoCiP = document.createElement('p');
            yaoCiP.className = 'yao-ci-line';
            yaoCiP.textContent = data.yaoCi; // yaoCi from popup.js already includes dongYaoName
            container.appendChild(yaoCiP);
        }

        // Support Section - 准备好使用图片
        const supportSection = document.createElement('div');
        supportSection.className = 'support-section';
        const supportTitle = document.createElement('div');
        supportTitle.className = 'support-title';
        supportTitle.textContent = '赞赏支持';
        supportSection.appendChild(supportTitle);

        const paymentIcons = document.createElement('div');
        paymentIcons.className = 'payment-icons';

        // WeChat
        const wechatBlock = document.createElement('div');
        wechatBlock.className = 'payment-icon-block';
        const wechatImg = document.createElement('img');
        
        // 尝试加载微信图片
        try {
            const wechatImageUrl = chrome.runtime.getURL('assets/images/wechat_qr.png');
            console.log('[GaoDaoYi] 加载微信收款码图片:', wechatImageUrl);
            wechatImg.src = wechatImageUrl;
            wechatImg.onerror = () => {
                console.error('[GaoDaoYi] 微信收款码图片加载失败');
                // 图片加载失败时显示占位符
                wechatImg.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.className = 'payment-icon-placeholder';
                placeholder.textContent = '[微信收款码]';
                wechatBlock.insertBefore(placeholder, wechatLabel);
            };
        } catch (e) {
            console.error('[GaoDaoYi] 获取微信收款码URL时出错:', e);
            // 显示占位符
            wechatImg.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'payment-icon-placeholder';
            placeholder.textContent = '[微信收款码]';
            wechatBlock.insertBefore(placeholder, wechatLabel || null);
        }
        
        wechatImg.alt = '微信收款码';
        wechatImg.style.width = '80px'; // 适当调整大小，和截图更匹配
        wechatImg.style.height = 'auto'; // 保持宽高比
        wechatImg.style.display = 'block';
        wechatImg.style.margin = '0 auto 5px auto';
        wechatImg.style.backgroundColor = '#f9f9f9'; // 添加背景色
        
        const wechatLabel = document.createElement('div');
        wechatLabel.className = 'payment-icon-label';
        wechatLabel.textContent = '微信';
        wechatBlock.appendChild(wechatImg); 
        wechatBlock.appendChild(wechatLabel);
        paymentIcons.appendChild(wechatBlock);

        // Alipay
        const alipayBlock = document.createElement('div');
        alipayBlock.className = 'payment-icon-block';
        const alipayImg = document.createElement('img');
        
        // 尝试加载支付宝图片
        try {
            const alipayImageUrl = chrome.runtime.getURL('assets/images/alipay_qr.png');
            console.log('[GaoDaoYi] 加载支付宝收款码图片:', alipayImageUrl);
            alipayImg.src = alipayImageUrl;
            alipayImg.onerror = () => {
                console.error('[GaoDaoYi] 支付宝收款码图片加载失败');
                // 图片加载失败时显示占位符
                alipayImg.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.className = 'payment-icon-placeholder';
                placeholder.textContent = '[支付宝收款码]';
                alipayBlock.insertBefore(placeholder, alipayLabel);
            };
        } catch (e) {
            console.error('[GaoDaoYi] 获取支付宝收款码URL时出错:', e);
            // 显示占位符
            alipayImg.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'payment-icon-placeholder';
            placeholder.textContent = '[支付宝收款码]';
            alipayBlock.insertBefore(placeholder, alipayLabel || null);
        }
        
        alipayImg.alt = '支付宝收款码';
        alipayImg.style.width = '80px'; // 适当调整大小，和截图更匹配
        alipayImg.style.height = 'auto'; // 保持宽高比
        alipayImg.style.display = 'block';
        alipayImg.style.margin = '0 auto 5px auto';
        alipayImg.style.backgroundColor = '#f9f9f9'; // 添加背景色

        const alipayLabel = document.createElement('div');
        alipayLabel.className = 'payment-icon-label';
        alipayLabel.textContent = '支付宝';
        alipayBlock.appendChild(alipayImg); 
        alipayBlock.appendChild(alipayLabel);
        paymentIcons.appendChild(alipayBlock);

        supportSection.appendChild(paymentIcons);
        container.appendChild(supportSection);

        // "View Full Details" Button
        const detailsButton = document.createElement('button');
        detailsButton.id = 'gaodao-yi-view-full-details-btn';
        detailsButton.textContent = '查看完整解读';
        detailsButton.onclick = () => {
            console.log('[GaoDaoYi] "View Full Details" clicked. Data:', data);
            if (data && data.fileNameBase) {
                // Store data for the target HTML page in localStorage
                localStorage.setItem('gaodaoYi_current_fileNameBase', data.fileNameBase);
                localStorage.setItem('gaodaoYi_current_shangGuaNum', data.calculatedShangGuaNum);
                localStorage.setItem('gaodaoYi_current_xiaGuaNum', data.calculatedXiaGuaNum);
                localStorage.setItem('gaodaoYi_current_dongYaoPos', data.dongYaoPos);
                localStorage.setItem('gaodaoYi_current_guaMing', data.guaMing);
                localStorage.setItem('gaodaoYi_current_guaXu', data.guaXu);
                localStorage.setItem('gaodaoYi_current_dongYaoMing', data.dongYaoMing); // For title consistency

                const url = chrome.runtime.getURL(`assets/html_combined/${data.fileNameBase}_combined.html`);
                // chrome.tabs.create({ url: url }); // Content scripts cannot use chrome.tabs API
                window.open(url, '_blank'); // Use window.open instead
                console.log('[GaoDaoYi] Opening full details page:', url);
            } else {
                console.error('[GaoDaoYi] Missing data for opening full details page.', data);
                alert('无法打开详情页，缺少卦象文件名信息。');
            }
        };
        container.appendChild(detailsButton);

        document.body.appendChild(container);
        isPopoverDisplayed = true; 
        console.log('[GaoDaoYi] Popover created and shown.');
    }
})(); 