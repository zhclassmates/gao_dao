#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import glob
import json
from bs4 import BeautifulSoup

def verify_hexagram_pages(base_dir):
    """验证所有卦象HTML页面的爻辞标记"""
    # 找到所有HTML文件
    html_files = glob.glob(os.path.join(base_dir, 'gao_dao_y_extension/assets/html_combined/*.html'))
    
    # 爻辞标记统计
    stats = {
        'total_files': len(html_files),
        'files_with_issues': [],
        'yao_id_missing': [],
        'pattern_mismatch': []
    }
    
    # 爻辞ID格式
    yao_id_pattern = r'id="zhou(\d+)"'
    
    for html_file in html_files:
        file_basename = os.path.basename(html_file)
        hexagram_id = file_basename.split('_')[1]
        
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 使用BeautifulSoup解析HTML
        soup = BeautifulSoup(content, 'html.parser')
        
        # 查找所有h3标签
        h3_tags = soup.find_all('h3')
        
        # 检查是否有匹配"周易第X爻"的标签
        yao_headers = [h3 for h3 in h3_tags if '周易第' in h3.text and '爻' in h3.text]
        
        # 检查是否有匹配ID格式的标签
        yao_ids = re.findall(yao_id_pattern, content)
        
        # 统计各爻位
        yao_positions = {}
        for yao_header in yao_headers:
            match = re.search(r'周易第(\d+)爻', yao_header.text)
            if match:
                pos = match.group(1)
                yao_positions[pos] = yao_positions.get(pos, 0) + 1
                
                # 检查该爻位是否有对应的ID
                if yao_header.get('id') != f'zhou{pos}':
                    stats['yao_id_missing'].append({
                        'file': file_basename,
                        'position': pos,
                        'text': yao_header.text
                    })
        
        # 检查是否缺少某些爻位
        expected_positions = set(['1', '2', '3', '4', '5', '6', '7'])  # 7是"卦辞"
        missing_positions = expected_positions - set(yao_positions.keys())
        
        if missing_positions or len(stats['yao_id_missing']) > 0:
            stats['files_with_issues'].append({
                'file': file_basename,
                'hexagram_id': hexagram_id,
                'missing_positions': list(missing_positions),
                'found_positions': list(yao_positions.keys())
            })
    
    # 打印统计结果
    print(f"总计检查文件: {stats['total_files']}")
    print(f"有问题的文件: {len(stats['files_with_issues'])}")
    
    if len(stats['files_with_issues']) > 0:
        print("\n有问题的文件列表:")
        for issue in stats['files_with_issues']:
            print(f"文件: {issue['file']}, 卦象ID: {issue['hexagram_id']}")
            print(f"  缺少爻位: {issue['missing_positions']}")
            print(f"  找到爻位: {issue['found_positions']}")
        
    if len(stats['yao_id_missing']) > 0:
        print("\n缺少ID的爻位:")
        for missing in stats['yao_id_missing']:
            print(f"文件: {missing['file']}, 爻位: {missing['position']}, 文本: {missing['text']}")
    
    # 将结果保存到JSON文件
    with open('hexagram_verification_results.json', 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    
    print(f"\n验证结果已保存到 hexagram_verification_results.json")
    
    return stats

if __name__ == "__main__":
    # 获取当前工作目录
    current_dir = os.getcwd()
    verify_hexagram_pages(current_dir) 