#!/bin/bash

# 颜色配置
LEFT_BG="#FFF8E1"
RIGHT_BG="#F5F7FA"
LEFT_TITLE="#5D4037"
RIGHT_TITLE="#2F4F4F"
BORDER="#CFD8DC"
DIVIDER="#D7CCC8"

echo "开始批量更新卦象页面颜色..."

# 从模板提取CSS样式片段
TEMPLATE="gao_dao_y_extension/assets/html_combined/hexagram_01_scheme1_combined.html"

# 获取所有卦象HTML文件（除了模板文件）
for htmlfile in gao_dao_y_extension/assets/html_combined/hexagram_*.html; do
    # 跳过模板文件
    if [[ "$htmlfile" == *"_scheme1_combined.html" ]]; then
        continue
    fi
    
    echo "正在处理: $htmlfile"
    
    # 1. 更新初始css样式
    perl -i -pe "s/background-color: #f9f9f9;/background-color: $LEFT_BG;/g" "$htmlfile"
    perl -i -pe "s/background-color: #f5f0e0;/background-color: $RIGHT_BG;/g" "$htmlfile"
    perl -i -pe "s/border: 1px solid #ccc;/border: 1px solid $BORDER;/g" "$htmlfile"
    perl -i -pe "s/border-right: 2px solid #ccc;/border-right: 2px solid $BORDER;/g" "$htmlfile"
    perl -i -pe "s/border-top: 1px dashed #ccc;/border-top: 1px dashed $DIVIDER;/g" "$htmlfile"
    perl -i -pe "s/border-bottom: 1px solid #eee;/border-bottom: 1px dashed $DIVIDER;/g" "$htmlfile"
    
    # 2. 添加左右页标题颜色样式
    if ! grep -q ".left-page .header-title" "$htmlfile"; then
        perl -i -pe "s/\.header-title \{/\.header-title \{\n        \}\n        .left-page .header-title \{\n            color: $LEFT_TITLE;\n        \}\n        .right-page .header-title \{\n            color: $RIGHT_TITLE;\n        /g" "$htmlfile"
    else
        # 如果已存在，则更新颜色
        perl -i -pe "s/\.left-page .header-title \{[^\}]*\}/\.left-page .header-title \{\n            color: $LEFT_TITLE;/g" "$htmlfile"
        perl -i -pe "s/\.right-page .header-title \{[^\}]*\}/\.right-page .header-title \{\n            color: $RIGHT_TITLE;/g" "$htmlfile"
    fi
    
    # 3. 如果有现代化样式块，更新其中的颜色
    if grep -q "现代化页面样式" "$htmlfile"; then
        # 容器背景和边框
        perl -i -pe "s/\.book-container \{[^\}]*border: none;[^\}]*\}/\.book-container \{\n                    background: #fff;\n                    border: 1px solid $BORDER;\n                    border-radius: 8px;\n                    box-shadow: 0 8px 30px rgba(0,0,0,0.12);\n                    overflow: hidden;/g" "$htmlfile"
        
        # 左页背景和边框
        perl -i -pe "s/\.left-page \{[^\}]*background: linear-gradient[^\}]*\}/\.left-page \{\n                    background: $LEFT_BG;\n                    border-right: 2px solid $BORDER;/g" "$htmlfile"
        
        # 右页背景
        perl -i -pe "s/\.right-page \{[^\}]*background: linear-gradient[^\}]*\}/\.right-page \{\n                    background: $RIGHT_BG;/g" "$htmlfile"
    fi
    
    echo "✅ 已完成: $htmlfile"
done

echo "所有卦象页面颜色更新完毕!" 