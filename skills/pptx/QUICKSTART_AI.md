# PPTX修改工具 - 快速开始

## 5分钟快速上手

### 步骤1: 运行Demo

```bash
cd skills/pptx
python demo_modify_pptx_AI.py your_presentation.pptx
```

### 步骤2: 查看生成的文件

Demo会在 `workspace/` 目录下创建：
- `inventory.json` - 所有文本内容
- `replacement.json` - 替换示例

### 步骤3: 编辑替换文件

打开 `workspace/replacement.json`，修改为你想要的内容：

```json
{
  "slide-0": {
    "shape-0": {
      "paragraphs": [
        {
          "text": "你的新标题",
          "bold": true
        }
      ]
    }
  }
}
```

### 步骤4: 应用替换

```bash
python scripts/replace.py your_presentation.pptx workspace/replacement.json output.pptx
```

完成！现在 `output.pptx` 就是修改后的文件。

## 完整示例

假设你有一个包含3张幻灯片的演示文稿，想修改第2张幻灯片的标题：

### 1. 提取文本清单
```bash
python scripts/inventory.py presentation.pptx inventory.json
```

### 2. 查看内容
打开 `inventory.json`，找到第2张幻灯片（slide-1）的标题形状。

### 3. 创建替换文件
创建 `replacement.json`：
```json
{
  "slide-1": {
    "shape-0": {
      "paragraphs": [
        {
          "text": "修改后的标题",
          "bold": true,
          "font_size": 20.0,
          "alignment": "CENTER"
        }
      ]
    }
  }
}
```

### 4. 应用替换
```bash
python scripts/replace.py presentation.pptx replacement.json modified.pptx
```

## 常用操作

### 修改多个形状
```json
{
  "slide-0": {
    "shape-0": {
      "paragraphs": [{"text": "标题", "bold": true}]
    },
    "shape-1": {
      "paragraphs": [{"text": "副标题"}]
    }
  }
}
```

### 添加项目符号列表
```json
{
  "slide-1": {
    "shape-2": {
      "paragraphs": [
        {"text": "第一项", "bullet": true, "level": 0},
        {"text": "第二项", "bullet": true, "level": 0},
        {"text": "子项", "bullet": true, "level": 1}
      ]
    }
  }
}
```

### 修改颜色
```json
{
  "slide-0": {
    "shape-0": {
      "paragraphs": [
        {
          "text": "红色文本",
          "color": "FF0000",
          "bold": true
        }
      ]
    }
  }
}
```

## 提示

- **保留格式**: 替换时会保留原始格式，除非你明确指定新格式
- **自动清空**: 不在替换JSON中的形状会被自动清空
- **验证**: 替换后会自动检查文本溢出问题
- **项目符号**: 不要手动添加•、-、*等符号，设置`"bullet": true`即可

## 需要帮助？

查看详细文档：
- `README_DEMO_AI.md` - 完整使用指南
- `SKILL.md` - 技术文档
