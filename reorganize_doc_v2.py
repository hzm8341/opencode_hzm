#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重新组织 USAGE_GUIDE.md 文档
1. 删除所有英文内容
2. 重新组织结构：基础信息在前，功能使用说明在最后
"""

import re
import sys

def clean_line(line):
    """清理单行，删除英文部分"""
    # 如果包含中文，保留但删除英文
    if re.search(r'[\u4e00-\u9fff]', line):
        # 删除 " / " 后面的英文
        line = re.sub(r'\s*/\s*[A-Z][^/]*$', '', line)
        # 删除行中的 " / English" 模式
        line = re.sub(r'\s*/\s*[A-Z][^\u4e00-\u9fff]*?(?=\s|$)', '', line)
        # 删除括号中的纯英文（但保留代码）
        if not re.search(r'[`\[]', line):  # 不是代码或链接
            line = re.sub(r'\([^)]*[A-Za-z]{3,}[^)]*\)', '', line)
    return line

def remove_english_from_content(content):
    """从内容中删除英文"""
    lines = content.split('\n')
    result = []
    in_code_block = False
    
    for line in lines:
        # 检测代码块
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
            result.append(line)
            continue
        
        if in_code_block:
            # 代码块内的内容全部保留
            result.append(line)
            continue
        
        # 处理非代码块内容
        if not line.strip():
            result.append(line)
            continue
        
        # 如果包含中文，清理英文部分
        if re.search(r'[\u4e00-\u9fff]', line):
            cleaned = clean_line(line)
            if cleaned.strip():
                result.append(cleaned)
        elif (line.strip().startswith('#') or 
              line.strip().startswith('-') or 
              line.strip().startswith('*') or 
              line.strip().startswith('|') or
              line.strip().startswith('`') or
              line.strip().startswith('[') or
              re.match(r'^\s*\d+\.', line.strip())):
            # 保留格式行
            result.append(line)
        # 其他纯英文行删除
    
    return '\n'.join(result)

def find_section_boundaries(content):
    """找到各个章节的边界"""
    sections = {}
    lines = content.split('\n')
    
    current_section = None
    current_start = 0
    
    for i, line in enumerate(lines):
        # 检测二级标题
        if re.match(r'^##\s+', line):
            if current_section:
                sections[current_section] = (current_start, i)
            
            # 提取章节名
            section_name = re.sub(r'^##\s+', '', line).strip()
            # 清理章节名中的格式
            section_name = re.sub(r'[^\w\s\u4e00-\u9fff-]', '', section_name)
            current_section = section_name
            current_start = i
    
    # 最后一个章节
    if current_section:
        sections[current_section] = (current_start, len(lines))
    
    return sections, lines

def extract_section_content(lines, start, end):
    """提取章节内容"""
    return '\n'.join(lines[start:end])

def main():
    print("读取文档...")
    with open('USAGE_GUIDE.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("删除英文内容...")
    cleaned = remove_english_from_content(content)
    
    print("分析章节结构...")
    sections, all_lines = find_section_boundaries(cleaned)
    
    # 定义章节顺序
    basic_sections = [
        '重要提示',
        '目录',
        '项目简介',
        '环境要求',
        '安装步骤',
        '配置说明',
        '构建说明',
        '开发指南',
        '常见问题',
        '相关链接',
        '更新日志',
        '许可证'
    ]
    
    usage_sections = [
        '使用方法',
        'Oh My OpenCode 插件使用指南',
        'Claude SDK Adapter 使用指南',
        'Skills 使用指南',
        '快速参考'
    ]
    
    # 提取基础章节
    basic_content = []
    for section_name in basic_sections:
        # 尝试匹配章节名
        matched = False
        for key in sections:
            if section_name in key or key in section_name:
                start, end = sections[key]
                section_text = extract_section_content(all_lines, start, end)
                basic_content.append(section_text)
                matched = True
                break
        if not matched:
            print(f"警告: 未找到章节 '{section_name}'")
    
    # 提取功能使用章节
    usage_content = []
    for section_name in usage_sections:
        matched = False
        for key in sections:
            if section_name in key or key in section_name:
                start, end = sections[key]
                section_text = extract_section_content(all_lines, start, end)
                usage_content.append(section_text)
                matched = True
                break
        if not matched:
            print(f"警告: 未找到章节 '{section_name}'")
    
    # 组合新文档
    print("重新组织文档...")
    new_content = []
    
    # 头部
    header_lines = []
    for line in all_lines[:sections.get('重要提示', (0, 0))[0]]:
        if line.strip() and not line.strip().startswith('##'):
            header_lines.append(line)
    if header_lines:
        new_content.append('\n'.join(header_lines))
    
    # 基础章节
    new_content.extend(basic_content)
    
    # 分隔
    new_content.append('\n---\n')
    new_content.append('# 功能使用说明\n')
    
    # 功能使用章节
    new_content.extend(usage_content)
    
    # 组合
    final_content = '\n\n'.join([part for part in new_content if part and part.strip()])
    
    # 清理多余空行
    final_content = re.sub(r'\n{4,}', '\n\n\n', final_content)
    
    # 更新目录
    print("更新目录...")
    new_toc = '''## 目录

- [重要提示](#️-重要提示)
- [项目简介](#项目简介)
- [环境要求](#环境要求)
- [安装步骤](#安装步骤)
- [配置说明](#配置说明)
- [构建说明](#构建说明)
- [开发指南](#开发指南)
- [常见问题](#常见问题)
- [相关链接](#相关链接)
- [更新日志](#更新日志)
- [许可证](#许可证)
- [功能使用说明](#功能使用说明)
  - [使用方法](#使用方法)
  - [Oh My OpenCode 插件使用指南](#oh-my-opencode-插件使用指南)
  - [Claude SDK Adapter 使用指南](#claude-sdk-adapter-使用指南)
  - [Skills 使用指南](#skills-使用指南)
  - [快速参考](#快速参考)'''
    
    # 替换目录
    final_content = re.sub(r'## 目录.*?(?=\n## |$)', new_toc, final_content, flags=re.DOTALL)
    
    # 保存
    print("保存文档...")
    with open('USAGE_GUIDE.md', 'w', encoding='utf-8') as f:
        f.write(final_content)
    
    print(f"完成！新文档行数: {len(final_content.split(chr(10)))}")

if __name__ == '__main__':
    main()

