#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重新组织 USAGE_GUIDE.md 文档
1. 删除所有英文内容
2. 重新组织结构：基础信息在前，功能使用说明在最后
"""

import re

def remove_english(text):
    """删除英文内容，保留中文和代码块"""
    lines = text.split('\n')
    result = []
    in_code_block = False
    code_block_lang = None
    
    for line in lines:
        # 检测代码块
        code_match = re.match(r'^```(\w*)$', line.strip())
        if code_match:
            in_code_block = not in_code_block
            if in_code_block:
                code_block_lang = code_match.group(1)
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
        
        # 如果包含中文，保留但清理英文部分
        if re.search(r'[\u4e00-\u9fff]', line):
            # 删除 " / " 后面的英文
            line = re.sub(r'\s*/\s*[A-Z][^/]*$', '', line)
            # 删除括号中的纯英文内容（但保留代码）
            line = re.sub(r'\([^)]*[A-Za-z]{3,}[^)]*\)(?![^(]*\))', '', line)
            # 删除行尾的 " / English text" 模式
            line = re.sub(r'\s*/\s*[A-Z][^\u4e00-\u9fff]*$', '', line)
            result.append(line)
        elif line.strip().startswith('#') or line.strip().startswith('-') or line.strip().startswith('*') or line.strip().startswith('|') or line.strip().startswith('`'):
            # 保留格式行（标题、列表、表格、代码引用）
            result.append(line)
        # 其他纯英文行删除
    
    return '\n'.join(result)

def extract_section(content, start_pattern, end_pattern=None):
    """提取章节内容"""
    if end_pattern:
        pattern = rf'## {re.escape(start_pattern)}.*?(?=## {re.escape(end_pattern)}|$)'
    else:
        pattern = rf'## {re.escape(start_pattern)}.*?$'
    
    match = re.search(pattern, content, re.DOTALL | re.MULTILINE)
    if match:
        return match.group(0).strip()
    return None

def main():
    # 读取原文档
    with open('USAGE_GUIDE.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 删除英文内容
    print("正在删除英文内容...")
    cleaned_content = remove_english(content)
    
    # 提取各个章节
    print("正在提取章节...")
    
    # 基础信息部分（放在前面）
    header = cleaned_content.split('## ⚠️ 重要提示')[0]
    important = extract_section(cleaned_content, '⚠️ 重要提示', '目录')
    toc = extract_section(cleaned_content, '目录', '项目简介')
    intro = extract_section(cleaned_content, '项目简介', '环境要求')
    requirements = extract_section(cleaned_content, '环境要求', '安装步骤')
    installation = extract_section(cleaned_content, '安装步骤', '配置说明')
    configuration = extract_section(cleaned_content, '配置说明', '构建说明')
    building = extract_section(cleaned_content, '构建说明', '开发指南')
    development = extract_section(cleaned_content, '开发指南', '常见问题')
    faq = extract_section(cleaned_content, '常见问题', '相关链接')
    links = extract_section(cleaned_content, '相关链接', '更新日志')
    changelog = extract_section(cleaned_content, '更新日志', '许可证')
    license_section = extract_section(cleaned_content, '许可证', '快速参考')
    
    # 功能使用说明部分（放在最后）
    usage = extract_section(cleaned_content, '使用方法', 'Oh My OpenCode')
    oh_my_opencode = extract_section(cleaned_content, 'Oh My OpenCode 插件使用指南', 'Claude SDK Adapter')
    claude_sdk = extract_section(cleaned_content, 'Claude SDK Adapter 使用指南', 'Skills 使用指南')
    skills = extract_section(cleaned_content, 'Skills 使用指南', '常见问题')
    quick_ref = extract_section(cleaned_content, '快速参考', None)
    
    # 重新组织文档
    print("正在重新组织文档...")
    
    new_content_parts = [
        header.rstrip(),
        important,
        toc,
        intro,
        requirements,
        installation,
        configuration,
        building,
        development,
        faq,
        links,
        changelog,
        license_section,
        '',
        '---',
        '',
        '# 功能使用说明',
        '',
        usage,
        oh_my_opencode,
        claude_sdk,
        skills,
        quick_ref
    ]
    
    # 过滤空内容并组合
    new_content = '\n\n'.join([part for part in new_content_parts if part and part.strip()])
    
    # 清理多余的空白行
    new_content = re.sub(r'\n{4,}', '\n\n\n', new_content)
    
    # 更新目录
    print("正在更新目录...")
    toc_pattern = r'## 目录.*?(?=---|##)'
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
    
    new_content = re.sub(toc_pattern, new_toc, new_content, flags=re.DOTALL)
    
    # 保存新文档
    with open('USAGE_GUIDE.md', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("文档重组完成！")
    print(f"新文档行数: {len(new_content.split(chr(10)))}")

if __name__ == '__main__':
    main()

