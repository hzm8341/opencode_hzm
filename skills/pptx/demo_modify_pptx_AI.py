#!/usr/bin/env python3
"""
PPTX修改工具Demo

这个demo展示了如何使用pptx工具来修改PowerPoint演示文稿：
1. 提取文本清单
2. 创建替换内容
3. 应用替换

使用方法：
    python demo_modify_pptx_AI.py <input.pptx> [output.pptx]

示例：
    python demo_modify_pptx_AI.py presentation.pptx modified.pptx
"""

import json
import sys
from pathlib import Path

# 导入工具函数
sys.path.insert(0, str(Path(__file__).parent / "scripts"))
from inventory import extract_text_inventory, save_inventory
from replace import apply_replacements


def print_section(title: str):
    """打印分节标题"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def demo_extract_inventory(input_pptx: Path, inventory_json: Path):
    """Demo: 提取文本清单"""
    print_section("步骤1: 提取文本清单")
    
    print(f"正在从 '{input_pptx}' 提取文本清单...")
    inventory = extract_text_inventory(input_pptx)
    
    # 保存到JSON文件
    save_inventory(inventory, inventory_json)
    print(f"✓ 文本清单已保存到: {inventory_json}")
    
    # 显示统计信息
    total_slides = len(inventory)
    total_shapes = sum(len(shapes) for shapes in inventory.values())
    print(f"\n统计信息:")
    print(f"  - 幻灯片数量: {total_slides}")
    print(f"  - 文本形状数量: {total_shapes}")
    
    # 显示每个幻灯片的形状数量
    print(f"\n各幻灯片文本形状分布:")
    for slide_key in sorted(inventory.keys()):
        shape_count = len(inventory[slide_key])
        print(f"  {slide_key}: {shape_count} 个文本形状")
    
    return inventory


def demo_preview_inventory(inventory_json: Path):
    """Demo: 预览文本清单内容"""
    print_section("步骤2: 预览文本清单")
    
    with open(inventory_json, "r", encoding="utf-8") as f:
        inventory = json.load(f)
    
    print("文本内容预览（前3个幻灯片）:")
    slide_count = 0
    for slide_key in sorted(inventory.keys()):
        if slide_count >= 3:
            break
        slide_count += 1
        
        print(f"\n{slide_key}:")
        shapes = inventory[slide_key]
        for shape_key in sorted(shapes.keys()):
            shape_data = shapes[shape_key]
            paragraphs = shape_data.get("paragraphs", [])
            if paragraphs:
                # 显示第一个段落的文本（前50个字符）
                first_text = paragraphs[0].get("text", "")
                preview = first_text[:50] + ("..." if len(first_text) > 50 else "")
                placeholder = shape_data.get("placeholder_type", "N/A")
                print(f"  {shape_key} ({placeholder}): {preview}")


def demo_create_replacement_example(inventory_json: Path, replacement_json: Path):
    """Demo: 创建替换示例"""
    print_section("步骤3: 创建替换内容示例")
    
    with open(inventory_json, "r", encoding="utf-8") as f:
        inventory = json.load(f)
    
    # 创建一个简单的替换示例：修改第一个幻灯片的第一个形状
    replacements = {}
    
    # 找到第一个有文本的幻灯片和形状
    first_slide = None
    first_shape = None
    
    for slide_key in sorted(inventory.keys()):
        shapes = inventory[slide_key]
        for shape_key in sorted(shapes.keys()):
            shape_data = shapes[shape_key]
            paragraphs = shape_data.get("paragraphs", [])
            if paragraphs and paragraphs[0].get("text"):
                first_slide = slide_key
                first_shape = shape_key
                break
        if first_slide:
            break
    
    if first_slide and first_shape:
        print(f"找到第一个文本形状: {first_slide}/{first_shape}")
        
        # 创建替换内容
        replacements[first_slide] = {
            first_shape: {
                "paragraphs": [
                    {
                        "text": "[已修改] 这是演示替换功能的示例文本",
                        "bold": True,
                        "font_size": 18.0
                    }
                ]
            }
        }
        
        # 保存替换JSON
        with open(replacement_json, "w", encoding="utf-8") as f:
            json.dump(replacements, f, indent=2, ensure_ascii=False)
        
        print(f"✓ 替换示例已保存到: {replacement_json}")
        print(f"\n替换内容预览:")
        print(json.dumps(replacements, indent=2, ensure_ascii=False))
        
        print("\n注意: 这是一个简单的示例。")
        print("在实际使用中，你需要:")
        print("  1. 编辑 replacement.json 文件")
        print("  2. 为需要修改的形状添加 'paragraphs' 字段")
        print("  3. 未在替换JSON中列出的形状将被自动清空")
    else:
        print("未找到可替换的文本形状")


def demo_apply_replacements(input_pptx: Path, replacement_json: Path, output_pptx: Path):
    """Demo: 应用替换"""
    print_section("步骤4: 应用替换")
    
    if not replacement_json.exists():
        print(f"错误: 替换文件不存在: {replacement_json}")
        print("请先运行步骤3创建替换文件，或手动创建替换JSON文件")
        return False
    
    print(f"正在应用替换...")
    print(f"  输入文件: {input_pptx}")
    print(f"  替换文件: {replacement_json}")
    print(f"  输出文件: {output_pptx}")
    
    try:
        apply_replacements(str(input_pptx), str(replacement_json), str(output_pptx))
        print(f"\n✓ 替换完成！输出文件: {output_pptx}")
        return True
    except Exception as e:
        print(f"\n✗ 替换失败: {e}")
        return False


def print_usage_guide():
    """打印使用指南"""
    print_section("使用指南")
    
    print("""
完整工作流程：

1. 提取文本清单
   python scripts/inventory.py input.pptx inventory.json

2. 查看和编辑文本清单
   打开 inventory.json 文件，查看所有文本内容

3. 创建替换JSON文件
   创建 replacement.json，格式如下：
   {
     "slide-0": {
       "shape-0": {
         "paragraphs": [
           {
             "text": "新文本内容",
             "bold": true,
             "font_size": 18.0
           }
         ]
       }
     }
   }

4. 应用替换
   python scripts/replace.py input.pptx replacement.json output.pptx

支持的段落属性：
  - text: 文本内容（必需）
  - bold: 粗体 (true/false)
  - italic: 斜体 (true/false)
  - underline: 下划线 (true/false)
  - font_size: 字体大小（点数）
  - font_name: 字体名称
  - color: RGB颜色（如 "FF0000"）
  - theme_color: 主题颜色（如 "DARK_1"）
  - alignment: 对齐方式 ("LEFT", "CENTER", "RIGHT", "JUSTIFY")
  - bullet: 项目符号 (true/false)
  - level: 项目符号级别（当bullet为true时）
  - space_before: 段前间距（点数）
  - space_after: 段后间距（点数）
  - line_spacing: 行距（点数）

重要提示：
  - 所有在inventory.json中但不在replacement.json中的形状将被清空
  - 只有包含"paragraphs"字段的形状会被替换
  - 项目符号文本不要包含符号（•、-、*），会自动添加
  - 替换后会自动检查文本溢出和格式问题
    """)


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print(__doc__)
        print_usage_guide()
        sys.exit(1)
    
    input_pptx = Path(sys.argv[1])
    output_pptx = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("output.pptx")
    
    if not input_pptx.exists():
        print(f"错误: 输入文件不存在: {input_pptx}")
        sys.exit(1)
    
    # 创建工作目录
    work_dir = Path("workspace")
    work_dir.mkdir(exist_ok=True)
    
    inventory_json = work_dir / "inventory.json"
    replacement_json = work_dir / "replacement.json"
    
    print("=" * 60)
    print("  PPTX修改工具Demo")
    print("=" * 60)
    print(f"\n输入文件: {input_pptx}")
    print(f"输出文件: {output_pptx}")
    print(f"工作目录: {work_dir}")
    
    try:
        # 步骤1: 提取文本清单
        inventory = demo_extract_inventory(input_pptx, inventory_json)
        
        # 步骤2: 预览文本清单
        demo_preview_inventory(inventory_json)
        
        # 步骤3: 创建替换示例
        demo_create_replacement_example(inventory_json, replacement_json)
        
        # 询问是否应用替换
        print_section("应用替换")
        print("替换文件已创建。是否应用替换？")
        print(f"  输入文件: {input_pptx}")
        print(f"  替换文件: {replacement_json}")
        print(f"  输出文件: {output_pptx}")
        print("\n提示: 这是一个演示，实际使用时请先编辑 replacement.json")
        
        response = input("\n是否继续应用替换？(y/n): ").strip().lower()
        if response == 'y':
            success = demo_apply_replacements(input_pptx, replacement_json, output_pptx)
            if success:
                print_section("完成")
                print("✓ Demo执行完成！")
                print(f"\n生成的文件:")
                print(f"  - 文本清单: {inventory_json}")
                print(f"  - 替换示例: {replacement_json}")
                print(f"  - 修改后的PPTX: {output_pptx}")
        else:
            print("\n跳过应用替换步骤。")
            print(f"你可以手动编辑 {replacement_json} 后运行:")
            print(f"  python scripts/replace.py {input_pptx} {replacement_json} {output_pptx}")
        
        print_usage_guide()
        
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
