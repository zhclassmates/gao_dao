#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import glob

def update_html_files(base_dir):
    """更新HTML文件，添加CSS和JS引用"""
    # 找到所有HTML文件
    html_files = glob.glob(os.path.join(base_dir, 'gao_dao_y_extension/assets/html_combined/*.html'))
    
    # CSS引用行
    css_link = '<link rel="stylesheet" href="/css/detail_page_popover.css">'
    
    # JS引用行 - 注意引入顺序，数据先引入，再引入功能JS
    load_csv_script = '<script src="/js/load_gua_link_csv.js"></script>'
    yao_ci_data_script = '<script src="/js/yao_ci_data.js"></script>'
    detail_page_script = '<script src="/js/detail_page_enhancer.js"></script>'
    
    updated_count = 0
    
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        modified = False
        
        # 检查是否有CSS引用
        if '/css/detail_page_popover.css' not in content:
            # 在</head>之前添加CSS引用
            content = re.sub(r'(</head>)', f'{css_link}\\1', content)
            modified = True
        
        # 检查是否有CSV加载脚本
        if '/js/load_gua_link_csv.js' not in content:
            # 在</body>之前添加爻辞数据JS引用
            content = re.sub(r'(</body>)', f'{load_csv_script}\\1', content)
            modified = True
        
        # 检查是否有爻辞数据JS引用
        if '/js/yao_ci_data.js' not in content:
            # 在CSV加载脚本之后添加爻辞数据库脚本
            if load_csv_script in content:
                content = content.replace(load_csv_script, f'{load_csv_script}\n{yao_ci_data_script}')
            else:
                # 在</body>之前添加爻辞数据JS引用
                content = re.sub(r'(</body>)', f'{yao_ci_data_script}\\1', content)
            modified = True
        
        # 检查是否有详情页增强JS引用
        if '/js/detail_page_enhancer.js' not in content:
            # 在爻辞数据脚本之后添加详情页增强JS引用
            if yao_ci_data_script in content:
                content = content.replace(yao_ci_data_script, f'{yao_ci_data_script}\n{detail_page_script}')
            else:
                # 否则直接在</body>之前添加
                content = re.sub(r'(</body>)', f'{detail_page_script}\\1', content)
            modified = True
        
        # 确保脚本顺序正确：CSV加载 -> 爻辞数据 -> 页面增强
        if '/js/load_gua_link_csv.js' in content and '/js/yao_ci_data.js' in content:
            # 如果CSV加载脚本在爻辞数据之后，则调整顺序
            if content.find('/js/load_gua_link_csv.js') > content.find('/js/yao_ci_data.js'):
                content = content.replace(yao_ci_data_script, '')
                content = content.replace(load_csv_script, f'{load_csv_script}\n{yao_ci_data_script}')
                modified = True
        
        if '/js/yao_ci_data.js' in content and '/js/detail_page_enhancer.js' in content:
            # 如果爻辞数据脚本在页面增强脚本之后，则调整顺序
            if content.find('/js/yao_ci_data.js') > content.find('/js/detail_page_enhancer.js'):
                content = content.replace(detail_page_script, '')
                content = content.replace(yao_ci_data_script, f'{yao_ci_data_script}\n{detail_page_script}')
                modified = True
        
        # 检查是否需要添加id属性以支持动爻高亮
        for i in range(1, 8):  # 标题ID (从初爻到上爻，加上卦辞)
            tag_to_check = f'<h3>周易第{i}爻'
            id_to_add = f'zhou{i}'
            
            if tag_to_check in content and f'id="{id_to_add}"' not in content:
                # 添加id属性
                content = content.replace(
                    tag_to_check,
                    f'<h3 id="{id_to_add}">' + tag_to_check[4:]
                )
                modified = True
        
        if modified:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            updated_count += 1
            print(f"已更新: {os.path.basename(html_file)}")
    
    print(f"更新完成: 共更新了 {updated_count} 个HTML文件")

if __name__ == "__main__":
    # 获取当前工作目录
    current_dir = os.getcwd()
    update_html_files(current_dir) 