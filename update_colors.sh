#!/bin/bash

# 颜色配置
LEFT_BG="#FFF8E1"
RIGHT_BG="#F5F7FA"
LEFT_TITLE="#5D4037"
RIGHT_TITLE="#2F4F4F"
BORDER="#CFD8DC"
DIVIDER="#D7CCC8"

echo "开始批量更新卦象页面颜色..."

# 获取所有卦象HTML文件（除了模板文件）
for htmlfile in gao_dao_y_extension/assets/html_combined/hexagram_*.html; do
    # 跳过模板文件
    if [[ "$htmlfile" == *"_scheme1_combined.html" ]]; then
        continue
    fi
    
    echo "正在处理: $htmlfile"
    
    # 更新基础样式部分
    sed -i '' "s/border: 1px solid #ccc;/border: 1px solid $BORDER;/g" "$htmlfile"
    sed -i '' "s/border-right: 2px solid #ccc;/border-right: 2px solid $BORDER;/g" "$htmlfile"
    sed -i '' "s/background-color: #f9f9f9;/background-color: $LEFT_BG;/g" "$htmlfile"
    sed -i '' "s/background-color: #f5f0e0;/background-color: $RIGHT_BG;/g" "$htmlfile"
    sed -i '' "s/border-top: 1px dashed #ccc;/border-top: 1px dashed $DIVIDER;/g" "$htmlfile"
    sed -i '' "s/border-bottom: 1px solid #eee;/border-bottom: 1px dashed $DIVIDER;/g" "$htmlfile"
    
    # 添加左右页标题颜色样式（如果不存在）
    if ! grep -q ".left-page .header-title" "$htmlfile"; then
        sed -i '' "/\.header-title {/a\\
        \\
        .left-page .header-title {\\
            color: $LEFT_TITLE;\\
        }\\
        .right-page .header-title {\\
            color: $RIGHT_TITLE;\\
        }" "$htmlfile"
    else
        # 如果已存在，则更新颜色
        sed -i '' "s/\.left-page .header-title {.*color: #[0-9a-fA-F]\{6\};/\.left-page .header-title {\\
            color: $LEFT_TITLE;/g" "$htmlfile"
        sed -i '' "s/\.right-page .header-title {.*color: #[0-9a-fA-F]\{6\};/\.right-page .header-title {\\
            color: $RIGHT_TITLE;/g" "$htmlfile"
    fi
    
    # 更新现代化页面样式部分
    # 先检查是否有现代化样式块
    if grep -q "现代化页面样式" "$htmlfile"; then
        # 更新容器边框
        sed -i '' "/\.book-container {/,/}/s/border: none;/border: 1px solid $BORDER;/g" "$htmlfile"
        
        # 更新左右页背景
        sed -i '' "/\.left-page {/{n;s/background: linear-gradient.*$/background: $LEFT_BG;/}" "$htmlfile"
        sed -i '' "/\.left-page {/{n;n;s/border-right: 1px solid #eee;/border-right: 2px solid $BORDER;/}" "$htmlfile"
        sed -i '' "/\.right-page {/{n;s/background: linear-gradient.*$/background: $RIGHT_BG;/}" "$htmlfile"
    fi
    
    echo "✅ 已完成: $htmlfile"
done

echo "所有卦象页面颜色更新完毕!" 