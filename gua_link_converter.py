#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import os
import json

# 读取CSV文件并转换为JavaScript数据结构
def convert_csv_to_js(csv_file_path, output_js_path):
    # 用于存储解析后的数据
    gua_data = {}
    hexagram_details = {}
    
    # 卦名到编号的映射，用于排序 - 修复前导空格问题
    hexagram_order_map = {
        "乾为天": 1, "坤为地": 2, "水雷屯": 3, "山水蒙": 4, "水天需": 5,
        "天水讼": 6, "地水师": 7, "水地比": 8, "风天小畜": 9, "天泽履": 10,
        "地天泰": 11, "天地否": 12, "天火同人": 13, "火天大有": 14, "地山谦": 15,
        "雷地豫": 16, "泽雷随": 17, "山风蛊": 18, "地泽临": 19, "风地观": 20,
        "火雷噬嗑": 21, "山火贲": 22, "山地剥": 23, "地雷复": 24, "天雷无妄": 25,
        "山天大畜": 26, "山雷颐": 27, "泽风大过": 28, "坎为水": 29, "离为火": 30,
        "泽山咸": 31, "雷风恒": 32, "天山遁": 33, "雷天大壮": 34, "火地晋": 35,
        "地火明夷": 36, "风火家人": 37, "火泽睽": 38, "水山蹇": 39, "雷水解": 40,
        "山泽损": 41, "风雷益": 42, "泽天夬": 43, "天风姤": 44, "泽地萃": 45,
        "地风升": 46, "泽水困": 47, "水风井": 48, "泽火革": 49, "火风鼎": 50,
        "震为雷": 51, "艮为山": 52, "风山渐": 53, "雷泽归妹": 54, "雷火丰": 55,
        "火山旅": 56, "巽为风": 57, "兑为泽": 58, "风水涣": 59, "水泽节": 60,
        "风泽中孚": 61, "雷山小过": 62, "水火既济": 63, "火水未济": 64
    }
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            # 跳过标题行（如果有的话）
            first_row = next(reader, None)
            if first_row and "gui-name" in first_row[0]:
                print("已跳过标题行")
            else:
                # 如果第一行不是标题行，需要处理它
                process_row(first_row, gua_data, hexagram_order_map)
                
            # 为每个卦象创建数据记录
            for row in reader:
                process_row(row, gua_data, hexagram_order_map)
        
        # 构建第二个数据结构：以卦序为键的详细信息映射
        for gua_name, details in gua_data.items():
            hex_order = details["hexOrder"]
            
            # 创建文件名基础（例如："hexagram_01"）
            file_name_base = f"hexagram_{hex_order:02d}"
            
            hexagram_details[hex_order] = {
                "name": gua_name,
                "lines": details["lines"],
                "fileNameBase": file_name_base
            }
        
        # 生成JavaScript代码
        js_content = """// 从gua_link.csv生成的数据
// 包含每个卦象的爻位信息
const GUA_LINK_DATA = {
"""
        # 按卦名排序添加GUA_LINK_DATA
        for gua_name, details in sorted(gua_data.items(), key=lambda x: x[1]["hexOrder"]):
            js_content += f'    "{gua_name}": {{ hexOrder: {details["hexOrder"]}, lines: {{ '
            
            # 添加爻位信息
            lines_parts = []
            for line_num, yao_name in sorted(details["lines"].items()):
                lines_parts.append(f'{line_num}: "{yao_name}"')
            
            js_content += ", ".join(lines_parts)
            js_content += " } },\n"
        
        js_content = js_content.rstrip(",\n") + "\n};\n\n"
        
        # 添加HEXAGRAM_DETAILS_MAP
        js_content += """// 以卦序为键的卦象详细信息映射
const HEXAGRAM_DETAILS_MAP = {
"""
        # 按卦序排序添加HEXAGRAM_DETAILS_MAP
        for hex_order, details in sorted(hexagram_details.items()):
            js_content += f'    {hex_order}: {{ name: "{details["name"]}", lines: {{ '
            
            # 添加爻位信息
            lines_parts = []
            for line_num, yao_name in sorted(details["lines"].items()):
                lines_parts.append(f'{line_num}: "{yao_name}"')
            
            js_content += ", ".join(lines_parts)
            js_content += f' }}, fileNameBase: "{details["fileNameBase"]}" }},\n'
        
        js_content = js_content.rstrip(",\n") + "\n};"
        
        # 写入JavaScript文件
        with open(output_js_path, 'w', encoding='utf-8') as jsfile:
            jsfile.write(js_content)
        
        print(f"转换完成! JavaScript数据已写入: {output_js_path}")
        return True
        
    except Exception as e:
        print(f"转换过程中发生错误: {e}")
        return False

def process_row(row, gua_data, hexagram_order_map):
    if row and len(row) >= 3:  
        gua_name_raw = row[0].strip()  # 卦名（可能带前导空格）
        # 移除前导空格
        gua_name = gua_name_raw.replace('　', '')
        
        try:
            line_num = int(row[1])     # 爻位置
            yao_name = row[2].strip()  # 爻名称
            
            # 初始化卦象数据（如果尚未存在）
            if gua_name not in gua_data:
                hex_order = hexagram_order_map.get(gua_name, 0)
                if hex_order == 0:
                    print(f"警告: 未找到卦象 '{gua_name}' 对应的编号")
                
                gua_data[gua_name] = {
                    "hexOrder": hex_order,
                    "lines": {}
                }
            
            # 添加爻数据
            gua_data[gua_name]["lines"][line_num] = yao_name
        except ValueError:
            print(f"跳过行: {row} - 无法将 '{row[1]}' 转换为整数")

if __name__ == "__main__":
    # 设置源CSV和输出JS文件路径
    csv_file_path = "gua_link.csv"
    output_js_path = "gao_dao_y_extension/assets/data/gua_link_parsed.js"
    
    # 确保输出目录存在
    os.makedirs(os.path.dirname(output_js_path), exist_ok=True)
    
    # 执行转换
    convert_csv_to_js(csv_file_path, output_js_path) 