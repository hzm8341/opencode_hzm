#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从微信文章中提取的Agent Skills下载脚本
下载日期: 2025-01-24
"""

import os
import subprocess
import re
import json
import urllib.request
import urllib.parse
from pathlib import Path

def run_cmd(cmd, check=True):
    """执行shell命令"""
    print(f"执行: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if check and result.returncode != 0:
        print(f"错误: {result.stderr}")
        return False
    return True

def download_github_skill(repo_url, skill_name=None):
    """从GitHub下载skill"""
    # 将tree/main转换为raw格式，或者直接clone
    if '/tree/main/' in repo_url:
        # 提取仓库路径和skill路径
        parts = repo_url.replace('https://github.com/', '').split('/tree/main/')
        if len(parts) == 2:
            repo_path = parts[0]
            skill_path = parts[1]
            # 使用GitHub API或直接clone
            repo_name = repo_path.split('/')[-1]
            clone_url = f"https://github.com/{repo_path}.git"
            
            # 创建skills目录
            skills_dir = Path("skills")
            skills_dir.mkdir(exist_ok=True)
            
            # Clone整个仓库到临时目录
            temp_dir = skills_dir / f"{repo_name}_temp"
            if temp_dir.exists():
                print(f"  跳过，目录已存在: {temp_dir}")
            else:
                print(f"  克隆仓库: {clone_url}")
                run_cmd(f"cd {skills_dir} && git clone {clone_url} {temp_dir.name}", check=False)
            
            # 复制skill文件夹
            source_skill = temp_dir / skill_path
            if source_skill.exists():
                target_skill = skills_dir / skill_path.split('/')[-1]
                if not target_skill.exists():
                    print(f"  复制skill: {source_skill} -> {target_skill}")
                    run_cmd(f"cp -r '{source_skill}' '{target_skill}'", check=False)
                    return True
                else:
                    print(f"  Skill已存在: {target_skill}")
                    return True
    else:
        # 直接clone整个仓库
        repo_name = repo_url.split('/')[-1].replace('.git', '')
        skills_dir = Path("skills")
        skills_dir.mkdir(exist_ok=True)
        target_dir = skills_dir / repo_name
        
        if target_dir.exists():
            print(f"  跳过，目录已存在: {target_dir}")
        else:
            print(f"  克隆仓库: {repo_url}")
            run_cmd(f"cd {skills_dir} && git clone {repo_url} {repo_name}", check=False)
        return True
    
    return False

def download_agentskills_skill(url):
    """从agentskills.io下载skill信息"""
    # 访问页面获取skill信息
    skills_dir = Path("skills")
    skills_dir.mkdir(exist_ok=True)
    
    skill_name = url.split('/')[-1]
    skill_dir = skills_dir / skill_name
    skill_dir.mkdir(exist_ok=True)
    
    # 保存URL信息
    info_file = skill_dir / "info.txt"
    with open(info_file, 'w', encoding='utf-8') as f:
        f.write(f"Skill URL: {url}\n")
        f.write(f"Source: agentskills.io\n")
        f.write(f"Note: 请访问 {url} 获取完整的skill文件\n")
    
    print(f"  已创建skill目录: {skill_dir}")
    print(f"  请访问 {url} 手动下载skill文件")
    
    return True

def main():
    """主函数"""
    print("=" * 60)
    print("Agent Skills 下载脚本")
    print("=" * 60)
    
    # 读取URL列表
    if not os.path.exists('skill_urls.txt'):
        print("错误: 找不到 skill_urls.txt 文件")
        return
    
    github_urls = []
    agentskills_urls = []
    
    with open('skill_urls.txt', 'r', encoding='utf-8') as f:
        current_section = None
        for line in f:
            line = line.strip()
            if line == "GitHub URLs:":
                current_section = "github"
            elif line == "Agentskills.io URLs:":
                current_section = "agentskills"
            elif line and not line.startswith("#"):
                if current_section == "github":
                    github_urls.append(line)
                elif current_section == "agentskills":
                    agentskills_urls.append(line)
    
    print(f"\n找到 {len(github_urls)} 个GitHub skills")
    print(f"找到 {len(agentskills_urls)} 个agentskills.io skills\n")
    
    # 下载GitHub skills
    if github_urls:
        print("=" * 60)
        print("下载GitHub Skills")
        print("=" * 60)
        for i, url in enumerate(github_urls, 1):
            print(f"\n[{i}/{len(github_urls)}] 处理: {url}")
            download_github_skill(url)
    
    # 处理agentskills.io skills
    if agentskills_urls:
        print("\n" + "=" * 60)
        print("处理Agentskills.io Skills")
        print("=" * 60)
        for i, url in enumerate(agentskills_urls, 1):
            print(f"\n[{i}/{len(agentskills_urls)}] 处理: {url}")
            download_agentskills_skill(url)
    
    print("\n" + "=" * 60)
    print("下载完成！")
    print("=" * 60)
    print(f"\n所有skills已保存到: {os.path.abspath('skills')}")
    print("\n注意:")
    print("  - GitHub skills已自动下载")
    print("  - agentskills.io skills需要手动访问URL下载")

if __name__ == "__main__":
    main()

