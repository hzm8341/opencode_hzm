# PPTX修改工具Demo使用指南

## 简介

`demo_modify_pptx_AI.py` 是一个演示脚本，展示了如何使用pptx工具来修改PowerPoint演示文稿。

## 功能

这个demo会引导你完成以下步骤：

1. **提取文本清单** - 从PPTX文件中提取所有文本内容和格式信息
2. **预览文本清单** - 查看提取的文本内容
3. **创建替换示例** - 生成一个替换JSON文件示例
4. **应用替换** - 将替换内容应用到PPTX文件

## 使用方法

### 基本用法

```bash
python demo_modify_pptx_AI.py <input.pptx> [output.pptx]
```

### 示例

```bash
# 使用默认输出文件名 output.pptx
python demo_modify_pptx_AI.py presentation.pptx

# 指定输出文件名
python demo_modify_pptx_AI.py presentation.pptx modified.pptx
```

## 工作流程

### 步骤1: 提取文本清单

Demo会自动运行：
```bash
python scripts/inventory.py input.pptx workspace/inventory.json
```

这会生成一个包含所有文本内容的JSON文件，包括：
- 每个幻灯片的文本形状
- 文本内容
- 格式信息（字体、大小、颜色、对齐等）
- 位置信息

### 步骤2: 预览文本清单

Demo会显示前3个幻灯片的文本内容预览，帮助你了解文件结构。

### 步骤3: 创建替换示例

Demo会创建一个简单的替换JSON文件示例 (`workspace/replacement.json`)，你可以编辑这个文件来定义要替换的内容。

### 步骤4: 应用替换

Demo会询问你是否应用替换。如果选择"是"，会运行：
```bash
python scripts/replace.py input.pptx workspace/replacement.json output.pptx
```

## 替换JSON格式

替换JSON文件的格式如下：

```json
{
  "slide-0": {
    "shape-0": {
      "paragraphs": [
        {
          "text": "新文本内容",
          "bold": true,
          "font_size": 18.0,
          "alignment": "CENTER"
        }
      ]
    },
    "shape-1": {
      "paragraphs": [
        {
          "text": "第一项",
          "bullet": true,
          "level": 0
        },
        {
          "text": "第二项",
          "bullet": true,
          "level": 0
        }
      ]
    }
  }
}
```

### 支持的段落属性

- `text` (必需) - 文本内容
- `bold` - 粗体 (true/false)
- `italic` - 斜体 (true/false)
- `underline` - 下划线 (true/false)
- `font_size` - 字体大小（点数）
- `font_name` - 字体名称
- `color` - RGB颜色（如 "FF0000"）
- `theme_color` - 主题颜色（如 "DARK_1"）
- `alignment` - 对齐方式 ("LEFT", "CENTER", "RIGHT", "JUSTIFY")
- `bullet` - 项目符号 (true/false)
- `level` - 项目符号级别（当bullet为true时必需）
- `space_before` - 段前间距（点数）
- `space_after` - 段后间距（点数）
- `line_spacing` - 行距（点数）

## 重要提示

1. **自动清空**: 所有在`inventory.json`中但不在`replacement.json`中的形状将被自动清空
2. **必须包含paragraphs**: 只有包含`"paragraphs"`字段的形状会被替换
3. **项目符号**: 项目符号文本不要包含符号（•、-、*），会自动添加
4. **验证**: 替换后会自动检查文本溢出和格式问题

## 手动使用工具

如果你想手动使用这些工具：

### 1. 提取文本清单
```bash
python scripts/inventory.py input.pptx inventory.json
```

### 2. 查看文本清单
```bash
# 使用文本编辑器打开 inventory.json
notepad inventory.json  # Windows
# 或
cat inventory.json       # Linux/Mac
```

### 3. 创建替换JSON
编辑 `replacement.json` 文件，定义要替换的内容。

### 4. 应用替换
```bash
python scripts/replace.py input.pptx replacement.json output.pptx
```

## 输出文件

Demo会在 `workspace/` 目录下创建以下文件：

- `inventory.json` - 文本清单（包含所有文本内容和格式）
- `replacement.json` - 替换内容（你可以编辑这个文件）
- `output.pptx` - 修改后的PPTX文件（如果应用了替换）

## 示例场景

### 场景1: 修改标题

假设你想修改第一个幻灯片的标题：

1. 运行demo提取文本清单
2. 查看`inventory.json`，找到标题所在的slide和shape
3. 编辑`replacement.json`：
```json
{
  "slide-0": {
    "shape-0": {
      "paragraphs": [
        {
          "text": "新标题",
          "bold": true,
          "font_size": 24.0,
          "alignment": "CENTER"
        }
      ]
    }
  }
}
```
4. 应用替换

### 场景2: 修改项目符号列表

```json
{
  "slide-1": {
    "shape-2": {
      "paragraphs": [
        {
          "text": "第一项",
          "bullet": true,
          "level": 0
        },
        {
          "text": "第二项",
          "bullet": true,
          "level": 0
        },
        {
          "text": "子项",
          "bullet": true,
          "level": 1
        }
      ]
    }
  }
}
```

## 故障排除

### 错误: 形状未找到

如果看到"Shape 'shape-X' not found"错误：
1. 检查`inventory.json`中实际存在的形状ID
2. 确保slide和shape的ID格式正确（如 "slide-0", "shape-0"）

### 错误: 文本溢出

如果看到文本溢出警告：
1. 减少文本长度
2. 减小字体大小
3. 增加形状大小（需要手动编辑XML）

### 错误: 替换文件格式错误

确保JSON格式正确：
- 使用双引号
- 正确的逗号和括号
- 段落数组格式正确

## 更多信息

详细的技术文档请参考：
- `SKILL.md` - 完整的使用指南
- `ooxml.md` - OOXML技术参考
- `scripts/inventory.py` - 文本提取工具源码
- `scripts/replace.py` - 文本替换工具源码
