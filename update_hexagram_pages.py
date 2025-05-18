#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import glob
from bs4 import BeautifulSoup

def update_hexagram_html_files(base_dir):
    """批量更新所有卦象HTML文件的样式"""
    # 找到所有卦象HTML文件
    html_files = glob.glob(os.path.join(base_dir, 'gao_dao_y_extension/assets/html_combined/*.html'))
    
    updated_count = 0
    
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 使用BeautifulSoup解析HTML
            soup = BeautifulSoup(content, 'html.parser')
            
            # 1. 更新<head>部分 - 添加现代化样式
            head = soup.find('head')
            if head:
                # 添加额外CSS样式
                style_tag = soup.new_tag('style')
                style_tag.string = """
                /* 现代化页面样式 */
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f9f9f9;
                    padding-top: 60px;
                }
                
                .book-container {
                    background: #fff;
                    border: none;
                    border-radius: 8px;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
                    overflow: hidden;
                }
                
                .left-page, .right-page {
                    padding: 30px;
                }
                
                .left-page {
                    background: linear-gradient(to bottom, #fcfcfc, #f5f5f5);
                    border-right: 1px solid #eee;
                }
                
                .right-page {
                    background: linear-gradient(to bottom, #fffdf5, #fff9e6);
                }
                
                .page-header {
                    margin-bottom: 25px;
                    text-align: center;
                }
                
                .header-title {
                    font-size: 28px;
                    color: #cc0000;
                    margin: 10px 0;
                    font-weight: bold;
                }
                
                h2, h3, h4 {
                    color: #cc0000;
                    font-weight: bold;
                    margin-top: 1.5em;
                    margin-bottom: 0.8em;
                }
                
                h2 {
                    font-size: 24px;
                    border-bottom: 2px solid rgba(204, 0, 0, 0.2);
                    padding-bottom: 0.3em;
                }
                
                h3 {
                    font-size: 20px;
                }
                
                h4 {
                    font-size: 18px;
                }
                
                p {
                    margin: 1em 0;
                    line-height: 1.8;
                }
                
                .hexagram-image {
                    margin: 25px auto;
                    text-align: center;
                }
                
                .hexagram-image img {
                    max-width: 85%;
                    border-radius: 4px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    padding: 5px;
                    background: #fff;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .hexagram-image img:hover {
                    transform: scale(1.02);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
                }
                
                .nav-bar {
                    background: linear-gradient(to right, #d00000, #e00000);
                    color: white;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                }
                
                .back-button {
                    background-color: white;
                    color: #d00000;
                    font-weight: bold;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 15px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .back-button:hover {
                    background-color: #f0f0f0;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                
                .nav-title {
                    font-size: 20px;
                    font-weight: bold;
                }
                
                .highlighted-yao {
                    background-color: #fff1d6 !important;
                    border-left: 3px solid #d87d00;
                    padding-left: 15px;
                    margin-left: -18px;
                    border-radius: 0 4px 4px 0;
                }
                
                h3.highlighted-yao {
                    background-color: #fff5e6 !important;
                    color: #d87d00 !important;
                    padding: 10px 15px;
                    margin-left: -18px;
                    border-left: 3px solid #d87d00;
                    border-radius: 0 4px 4px 0;
                }
                
                .hexagram-table {
                    margin: 20px auto;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                    overflow: hidden;
                }
                
                #gaodao-yi-enhanced-yao-ci-header {
                    background: linear-gradient(to right, #fff8e1, #fff4d4) !important;
                    border-bottom: 2px solid rgba(204, 0, 0, 0.3) !important;
                    border-radius: 8px !important;
                    margin: 0 0 25px 0 !important;
                    padding: 18px !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
                }
                
                /* 滚动条样式 */
                ::-webkit-scrollbar {
                    width: 10px;
                }
                
                ::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 5px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: #d3d3d3;
                    border-radius: 5px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: #aaaaaa;
                }
                """
                head.append(style_tag)
            
            # 2. 更新导航栏样式
            nav_bar = soup.find('div', class_='nav-bar')
            if nav_bar:
                nav_bar['style'] = """position: fixed;
                                    top: 0;
                                    left: 0;
                                    width: 100%;
                                    background: linear-gradient(to right, #d00000, #e00000);
                                    color: white;
                                    padding: 10px;
                                    text-align: center;
                                    z-index: 1000;
                                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;"""
            
            # 保存修改后的内容
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            
            updated_count += 1
            print(f"更新: {os.path.basename(html_file)}")
            
        except Exception as e:
            print(f"处理 {os.path.basename(html_file)} 时出错: {e}")
    
    print(f"\n完成! 共更新了 {updated_count} 个卦象详情页。")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    update_hexagram_html_files(base_dir) 