// popup/popup.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const genderSection = document.getElementById('gender-selection-section');
    const numberInputSection = document.getElementById('number-input-section');
    const resultPreviewSection = document.getElementById('result-preview-section');

    const stepGender = document.getElementById('step-gender');
    const stepNumbers = document.getElementById('step-numbers');
    const stepResultPreview = document.getElementById('step-result-preview');

    const btnToNumbers = document.getElementById('btn-to-numbers');
    const btnBackToGender = document.getElementById('btn-back-to-gender');
    const btnCalculate = document.getElementById('btn-calculate');
    const btnBackToNumbers = document.getElementById('btn-back-to-numbers');
    const btnViewDetails = document.getElementById('btn-view-details');

    const numberInputTitle = document.getElementById('number-input-title');
    const inputNum1 = document.getElementById('input-num1');
    const inputNum2 = document.getElementById('input-num2');
    const inputNum3 = document.getElementById('input-num3');

    const previewShangGua = document.getElementById('preview-shang-gua');
    const previewXiaGua = document.getElementById('preview-xia-gua');
    const previewDongYao = document.getElementById('preview-dong-yao');
    const previewGuaXu = document.getElementById('preview-gua-xu');
    const previewGuaXiang = document.getElementById('preview-gua-xiang');

    let currentUserGender = 'male'; // Default
    let currentGuaDataForStorage = null; // To store the final data for content script

    // --- Navigation Functions ---
    function showSection(sectionToShow) {
        [genderSection, numberInputSection, resultPreviewSection].forEach(section => {
            section.classList.remove('active-section');
        });
        sectionToShow.classList.add('active-section');

        // Update step indicator
        stepGender.classList.remove('active');
        stepNumbers.classList.remove('active');
        stepResultPreview.classList.remove('active');
        if (sectionToShow === genderSection) stepGender.classList.add('active');
        if (sectionToShow === numberInputSection) stepNumbers.classList.add('active');
        if (sectionToShow === resultPreviewSection) stepResultPreview.classList.add('active');
    }

    // --- Event Listeners ---
    document.querySelectorAll('input[name="gender"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            currentUserGender = event.target.value;
            if (currentUserGender === 'male') {
                numberInputTitle.textContent = '男性请输入：左手为上卦，右手为下卦';
                // Potentially other gender-specific logic here
            } else {
                numberInputTitle.textContent = '女性请输入：右手为上卦，左手为下卦'; // Example
                 // Update labels for num1 and num2 if they differ for female
            }
        });
    });

    btnToNumbers.addEventListener('click', () => {
        showSection(numberInputSection);
    });

    btnBackToGender.addEventListener('click', () => {
        showSection(genderSection);
    });

    btnCalculate.addEventListener('click', async () => {
        const num1 = parseInt(inputNum1.value);
        const num2 = parseInt(inputNum2.value);
        const num3 = parseInt(inputNum3.value);

        if (isNaN(num1) || isNaN(num2) || isNaN(num3) || 
            num1 < 1 || num1 > 8 || 
            num2 < 1 || num2 > 8 || 
            num3 < 1 || num3 > 6) {
            alert('请输入有效范围内的数字！\n上卦和下卦：1-8\n动爻：1-6');
            return;
        }

        // Adjust for female input if necessary
        let n1 = num1, n2 = num2;
        if (currentUserGender === 'female') {
            n1 = num2; // Example: if female uses right for upper, left for lower
            n2 = num1;
        }

        const shangGuaNum = calculateShangGua(n1);
        const xiaGuaNum = calculateXiaGua(n2);
        const dongYaoPos = calculateDongYao(num3);

        const baseDetails = getHexagramBaseDetails(shangGuaNum, xiaGuaNum, dongYaoPos);
        if (!baseDetails) {
            alert('卦象信息计算失败，请检查输入或数据文件。');
            return;
        }

        // Display preview
        previewShangGua.textContent = `${baseDetails.shangGuaInfo} (数: ${n1}→${shangGuaNum})`;
        previewXiaGua.textContent = `${baseDetails.xiaGuaInfo} (数: ${n2}→${xiaGuaNum})`;
        previewDongYao.textContent = `${baseDetails.dongYaoName} (序: ${dongYaoPos})`;
        previewGuaXu.textContent = `第 ${baseDetails.hexOrder} 卦`;
        previewGuaXiang.textContent = baseDetails.guaMing;

        // Fetch Yao Ci (this is async)
        btnCalculate.textContent = '正在获取爻辞...';
        btnCalculate.disabled = true;

        const yaoCiContent = await fetchAndParseYaoCi(baseDetails.fileNameBase, dongYaoPos);
        
        btnCalculate.textContent = '计算卦象';
        btnCalculate.disabled = false;

        if (yaoCiContent === null) {
            alert('无法获取爻辞信息。');
            // Proceed to show preview without yaoCi or handle error
        }

        // Prepare data for storage
        currentGuaDataForStorage = {
            guaMing: baseDetails.guaMing,
            guaXu: baseDetails.hexOrder,
            shangGua: baseDetails.shangGuaInfo,
            xiaGua: baseDetails.xiaGuaInfo,
            dongYaoMing: baseDetails.dongYaoName,
            yaoCi: yaoCiContent ? `${baseDetails.dongYaoName}: ${yaoCiContent}` : `${baseDetails.dongYaoName}: (爻辞未找到)`,
            fileNameBase: baseDetails.fileNameBase,
            dongYaoPos: dongYaoPos,
            calculatedShangGuaNum: shangGuaNum,
            calculatedXiaGuaNum: xiaGuaNum
        };
        
        showSection(resultPreviewSection);
    });

    btnBackToNumbers.addEventListener('click', () => {
        showSection(numberInputSection);
    });

    btnViewDetails.addEventListener('click', () => {
        if (!currentGuaDataForStorage) {
            alert('没有可显示的卦象数据。请先计算。');
            return;
        }
        
        btnViewDetails.textContent = '正在处理...';
        btnViewDetails.disabled = true;

        // 1. 存储到 localStorage (供详情HTML页面使用)
        try {
            localStorage.setItem('gaodaoYi_current_fileNameBase', currentGuaDataForStorage.fileNameBase);
            localStorage.setItem('gaodaoYi_current_shangGuaNum', currentGuaDataForStorage.calculatedShangGuaNum);
            localStorage.setItem('gaodaoYi_current_xiaGuaNum', currentGuaDataForStorage.calculatedXiaGuaNum);
            localStorage.setItem('gaodaoYi_current_dongYaoPos', currentGuaDataForStorage.dongYaoPos); // 数字 1-6
            localStorage.setItem('gaodaoYi_current_guaMing', currentGuaDataForStorage.guaMing); // 例如 "1. 乾为天"
            localStorage.setItem('gaodaoYi_current_guaXu', currentGuaDataForStorage.guaXu); // 数字 1-64
            // currentGuaDataForStorage.dongYaoMing 是类似 "初九 (第1爻)"
            // currentGuaDataForStorage.yaoCi 是类似 "初九: 潜龙勿用。" 或 "初九: (爻辞未找到)"
            localStorage.setItem('gaodaoYi_current_full_yao_ci', currentGuaDataForStorage.yaoCi);
            console.log('[Popup] 卦象数据已存储到 localStorage for detail page.');
        } catch (e) {
            console.error('[Popup] 存储到 localStorage 失败:', e);
            alert('存储卦象数据失败，可能无法在详情页正确显示信息。');
            // 即使 localStorage 失败，也尝试继续打开页面
        }

        // 2. 打开新的详情HTML页面
        if (currentGuaDataForStorage.fileNameBase) {
            const detailUrl = chrome.runtime.getURL(`assets/html_combined/${currentGuaDataForStorage.fileNameBase}_combined.html`);
            // 使用window.open替代chrome.tabs.create，无需tabs权限
            window.open(detailUrl, '_blank');
            console.log('[Popup] 已在新标签页打开详情页:', detailUrl);
            // 恢复按钮状态
            btnViewDetails.textContent = '查看卦象详解';
            btnViewDetails.disabled = false;
        } else {
            console.error('[Popup] 无法打开详情页，缺少 fileNameBase。');
            alert('无法打开详情页，缺少卦象文件名信息。');
            btnViewDetails.textContent = '查看卦象详解';
            btnViewDetails.disabled = false;
        }
    });

    // Initialize first section
    showSection(genderSection);
    // Trigger gender radio change to set initial title correctly
    document.querySelector('input[name="gender"]:checked').dispatchEvent(new Event('change'));
}); 