#!/bin/bash

echo "开始移除所有卦象页面顶部的白条..."

# 处理所有卦象HTML文件
for htmlfile in assets/html_combined/hexagram_*.html; do
    echo "正在处理: $htmlfile"
    
    # 移除body的padding-top设置 (两处)
    perl -i -pe 's/padding-top: 60px;/padding-top: 0;/' "$htmlfile"
    
    # 修改背景色为白色
    perl -i -pe 's/background-color: #FFF8E1;/background-color: #fff;/' "$htmlfile"
    
    echo "✅ 已完成: $htmlfile"
done

echo "所有卦象页面顶部白条已移除!" 