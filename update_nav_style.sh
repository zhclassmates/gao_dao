#!/bin/bash

echo "开始更新所有卦象页面的导航栏样式..."

# 处理所有卦象HTML文件
for htmlfile in assets/html_combined/hexagram_*.html; do
    echo "正在处理: $htmlfile"
    
    # 修改红色背景为淡灰色背景
    perl -i -pe 's/background: linear-gradient\(to right, #d00000, #e00000\);/background: #f9f9f9;/' "$htmlfile"
    
    # 修改文字颜色
    perl -i -pe 's/color: white;/color: #333;/' "$htmlfile"
    
    # 修改阴影为边框
    perl -i -pe 's/box-shadow: 0 2px 10px rgba\(0,0,0,0.2\);/border-bottom: 1px solid #ddd;/' "$htmlfile"
    
    # 删除标题
    perl -i -0777 -pe 's/<h1 class="nav-title">[^<]*<\/h1>//g' "$htmlfile"
    
    echo "✅ 已完成: $htmlfile"
done

echo "所有卦象页面导航栏样式更新完毕!" 