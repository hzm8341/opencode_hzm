# Cursor 中使用 @skills 目录的 Skills 指南

**版本**: v1.0  
**日期**: 2025-01-16  
**作者**: AI Assistant (Claude-4)

---

## 目录

- [概述](#概述)
- [Skills 目录结构](#skills-目录结构)
- [配置方法](#配置方法)
  - [方法一：使用符号链接（推荐）](#方法一使用符号链接推荐)
  - [方法二：使用配置文件 sources](#方法二使用配置文件-sources)
  - [方法三：复制到标准目录](#方法三复制到标准目录)
- [跨设备同步方案](#跨设备同步方案)
  - [方案一：Git 同步（推荐）](#方案一git-同步推荐)
  - [方案二：云存储同步](#方案二云存储同步)
  - [方案三：符号链接 + 同步](#方案三符号链接--同步)
- [验证配置](#验证配置)
- [常见问题](#常见问题)

---

## 概述

在 Cursor 中使用 `@skills` 目录中的 skills，需要让 oh-my-opencode 插件能够发现并加载这些 skills。Skills 是包含 `SKILL.md` 文件的目录，提供了特定任务的详细指导。

### Skills 的默认加载位置

oh-my-opencode 会从以下位置自动加载 skills：

1. **全局 OpenCode Skills**: `~/.config/opencode/skill/`
2. **项目级 OpenCode Skills**: `.opencode/skill/`
3. **全局 Claude Skills**: `~/.claude/skills/`
4. **项目级 Claude Skills**: `.claude/skills/`

### 你的 Skills 目录

你的 skills 位于：`/media/hzm/data_disk/opencode/skills/`

---

## Skills 目录结构

每个 skill 必须是一个包含 `SKILL.md` 文件的目录：

```
skills/
├── docx/
│   ├── SKILL.md          # Skill 定义文件（必需）
│   ├── LICENSE.txt        # 许可证文件（可选）
│   └── scripts/           # 相关脚本（可选）
├── pdf/
│   ├── SKILL.md
│   └── scripts/
└── ...
```

### SKILL.md 格式

每个 `SKILL.md` 文件必须以 YAML frontmatter 开头：

```markdown
---
name: docx
description: "Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction."
license: Proprietary
---

# Skill 内容

这里是 skill 的详细说明和使用方法...
```

---

## 快速开始

### 一键设置（推荐）

使用项目提供的同步脚本，自动检测并创建符号链接：

```bash
# 从项目根目录运行
./scripts/sync-skills.sh sync

# 或者指定路径
./scripts/sync-skills.sh sync /media/hzm/data_disk/opencode/skills
```

脚本会自动：
- 检测 skills 目录位置
- 创建必要的目录
- 为所有 skills 创建符号链接
- 验证链接有效性

### 查看已链接的 skills

```bash
./scripts/sync-skills.sh list
```

### 验证链接

```bash
./scripts/sync-skills.sh verify
```

---

## 配置方法

### 方法一：使用符号链接（推荐）

这是最简单且不占用额外空间的方法。

#### 使用同步脚本（最简单）

```bash
# 自动检测并同步
./scripts/sync-skills.sh sync

# 或手动指定路径
./scripts/sync-skills.sh sync /media/hzm/data_disk/opencode/skills
```

#### 手动创建符号链接

##### 步骤 1：创建全局 OpenCode Skills 目录

```bash
mkdir -p ~/.config/opencode/skill
```

##### 步骤 2：为每个 skill 创建符号链接

```bash
# 进入目标目录
cd ~/.config/opencode/skill

# 为每个 skill 创建符号链接
ln -s /media/hzm/data_disk/opencode/skills/docx docx
ln -s /media/hzm/data_disk/opencode/skills/pdf pdf
ln -s /media/hzm/data_disk/opencode/skills/pptx pptx
# ... 为其他 skills 创建链接
```

##### 或者批量创建符号链接

```bash
cd ~/.config/opencode/skill
for skill_dir in /media/hzm/data_disk/opencode/skills/*/; do
    skill_name=$(basename "$skill_dir")
    if [ -f "$skill_dir/SKILL.md" ]; then
        ln -s "$skill_dir" "$skill_name"
        echo "Linked: $skill_name"
    fi
done
```

#### 验证符号链接

```bash
ls -la ~/.config/opencode/skill/
# 应该看到类似这样的输出：
# docx -> /media/hzm/data_disk/opencode/skills/docx
# pdf -> /media/hzm/data_disk/opencode/skills/pdf
```

---

### 方法二：使用配置文件 sources

如果符号链接不方便，可以在项目或全局配置文件中指定自定义路径。

#### 步骤 1：创建或编辑配置文件

在项目根目录创建 `.opencode/oh-my-opencode.json`：

```json
{
  "skills": {
    "sources": [
      "/media/hzm/data_disk/opencode/skills"
    ]
  }
}
```

#### 或者使用对象格式指定更多选项

```json
{
  "skills": {
    "sources": [
      {
        "path": "/media/hzm/data_disk/opencode/skills",
        "recursive": true,
        "glob": "**/SKILL.md"
      }
    ]
  }
}
```

#### 注意

根据代码分析，`sources` 配置在 `merger.ts` 中被提取，但实际加载逻辑可能需要进一步验证。如果此方法不生效，请使用方法一或方法三。

---

### 方法三：复制到标准目录

如果上述方法都不适用，可以直接复制 skills 到标准目录。

#### 步骤 1：复制所有 skills

```bash
# 创建目标目录
mkdir -p ~/.config/opencode/skill

# 复制所有 skills
cp -r /media/hzm/data_disk/opencode/skills/* ~/.config/opencode/skill/

# 或者只复制包含 SKILL.md 的目录
for skill_dir in /media/hzm/data_disk/opencode/skills/*/; do
    if [ -f "$skill_dir/SKILL.md" ]; then
        skill_name=$(basename "$skill_dir")
        cp -r "$skill_dir" ~/.config/opencode/skill/
        echo "Copied: $skill_name"
    fi
done
```

#### 缺点

- 占用额外磁盘空间
- 需要手动同步更新

---

## 跨设备同步方案

### 方案一：Git 同步（推荐）

如果你的 skills 目录在 Git 仓库中，这是最佳方案。

#### 步骤 1：确保 skills 在 Git 仓库中

```bash
cd /media/hzm/data_disk/opencode
git status  # 确认 skills 目录已提交
```

#### 步骤 2：在其他设备上克隆仓库

```bash
# 在设备 B 上
git clone <your-repo-url> /path/to/opencode
```

#### 步骤 3：在每台设备上创建符号链接

```bash
# 在设备 B 上
mkdir -p ~/.config/opencode/skill
cd ~/.config/opencode/skill
ln -s /path/to/opencode/skills/docx docx
# ... 其他 skills
```

#### 步骤 4：使用项目同步脚本

项目已提供同步脚本 `scripts/sync-skills.sh`，可以直接使用：

```bash
# 在每台设备上运行
cd /path/to/opencode
./scripts/sync-skills.sh sync
```

脚本会自动检测 skills 目录位置，无需手动配置路径。

#### 或者创建自定义同步脚本

如果需要自定义，可以创建 `~/.config/opencode/sync-skills.sh`：

```bash
#!/bin/bash
# 同步 skills 符号链接脚本

SKILLS_SOURCE="/media/hzm/data_disk/opencode/skills"  # 根据设备调整
SKILLS_TARGET="$HOME/.config/opencode/skill"

mkdir -p "$SKILLS_TARGET"
cd "$SKILLS_TARGET"

for skill_dir in "$SKILLS_SOURCE"/*/; do
    skill_name=$(basename "$skill_dir")
    if [ -f "$skill_dir/SKILL.md" ]; then
        # 如果链接已存在，先删除
        [ -L "$skill_name" ] && rm "$skill_name"
        # 创建新的符号链接
        ln -s "$skill_dir" "$skill_name"
        echo "✓ Linked: $skill_name"
    fi
done

echo "Skills sync completed!"
```

使脚本可执行：

```bash
chmod +x ~/.config/opencode/sync-skills.sh
```

---

### 方案二：云存储同步

使用 Dropbox、OneDrive、Google Drive 等云存储同步 skills 目录。

#### 步骤 1：将 skills 目录移动到云存储

```bash
# 例如使用 Dropbox
mv /media/hzm/data_disk/opencode/skills ~/Dropbox/opencode-skills
```

#### 步骤 2：在每台设备上创建符号链接

```bash
# 在设备 A 上
mkdir -p ~/.config/opencode/skill
cd ~/.config/opencode/skill
ln -s ~/Dropbox/opencode-skills/docx docx
# ... 其他 skills

# 在设备 B 上（云存储同步后）
mkdir -p ~/.config/opencode/skill
cd ~/.config/opencode/skill
ln -s ~/Dropbox/opencode-skills/docx docx
# ... 其他 skills
```

#### 步骤 3：使用项目同步脚本

项目提供的 `scripts/sync-skills.sh` 脚本已经支持自动检测多种路径，包括云存储路径。只需在每台设备上运行：

```bash
cd /path/to/opencode
./scripts/sync-skills.sh sync
```

脚本会自动检测以下路径（按优先级）：
- `/media/hzm/data_disk/opencode/skills`
- `~/Dropbox/opencode-skills`
- `~/OneDrive/opencode-skills`
- `~/Google Drive/opencode-skills`
- 以及其他常见路径

#### 或者使用环境变量（高级用法）

如果需要自定义，可以创建 `~/.config/opencode/skills-path.sh`：

```bash
#!/bin/bash
# 根据设备设置 SKILLS_PATH 环境变量

# 检测云存储路径
if [ -d "$HOME/Dropbox/opencode-skills" ]; then
    export SKILLS_PATH="$HOME/Dropbox/opencode-skills"
elif [ -d "$HOME/OneDrive/opencode-skills" ]; then
    export SKILLS_PATH="$HOME/OneDrive/opencode-skills"
elif [ -d "/media/hzm/data_disk/opencode/skills" ]; then
    export SKILLS_PATH="/media/hzm/data_disk/opencode/skills"
else
    echo "Skills directory not found!"
    exit 1
fi

# 使用项目脚本同步
cd /path/to/opencode
./scripts/sync-skills.sh sync "$SKILLS_PATH"
```

---

### 方案三：符号链接 + 自动同步（推荐）

使用项目提供的同步脚本，支持自动检测路径。

#### 使用项目同步脚本

项目已提供 `scripts/sync-skills.sh` 脚本，支持：

- 自动检测多个可能的 skills 路径
- 创建和管理符号链接
- 验证链接有效性
- 列出所有已链接的 skills

**在每台设备上运行**：

```bash
# 克隆或同步项目后
cd /path/to/opencode
./scripts/sync-skills.sh sync
```

**查看已链接的 skills**：

```bash
./scripts/sync-skills.sh list
```

**验证链接**：

```bash
./scripts/sync-skills.sh verify
```

**清理所有链接**：

```bash
./scripts/sync-skills.sh clean
```

#### 添加到 shell 配置（可选）

在 `~/.bashrc` 或 `~/.zshrc` 中添加别名：

```bash
# OpenCode Skills 同步别名
alias sync-skills='cd /path/to/opencode && ./scripts/sync-skills.sh sync'
alias list-skills='cd /path/to/opencode && ./scripts/sync-skills.sh list'
```

或者每次登录时自动同步（可选）：

```bash
# 在 ~/.bashrc 或 ~/.zshrc 中添加
if [ -f /path/to/opencode/scripts/sync-skills.sh ]; then
    /path/to/opencode/scripts/sync-skills.sh sync >/dev/null 2>&1
fi
```

---

## 验证配置

### 方法 1：检查符号链接

```bash
ls -la ~/.config/opencode/skill/
# 应该看到所有 skills 的符号链接
```

### 方法 2：检查 SKILL.md 文件

```bash
# 检查某个 skill 是否可以访问
ls -l ~/.config/opencode/skill/docx/SKILL.md
cat ~/.config/opencode/skill/docx/SKILL.md | head -20
```

### 方法 3：在 Cursor 中测试

1. 打开 Cursor
2. 在聊天中输入：`@skill docx` 或使用 skill 工具
3. 应该能看到 docx skill 的详细信息

### 方法 4：查看可用 skills

在 Cursor 中使用 skill 工具时，应该能在可用 skills 列表中看到你配置的所有 skills。

---

## 常见问题

### Q1: 符号链接创建后，Cursor 仍然找不到 skills

**解决方案**：
1. 重启 Cursor
2. 检查符号链接是否正确：`ls -la ~/.config/opencode/skill/`
3. 检查 SKILL.md 文件是否存在：`test -f ~/.config/opencode/skill/docx/SKILL.md && echo "OK" || echo "Missing"`
4. 检查权限：确保符号链接指向的目录可读

### Q2: 跨设备路径不同怎么办？

**解决方案**：
- 使用方案三的通用同步脚本，它会自动检测路径
- 或者使用云存储同步（方案二），确保所有设备使用相同的相对路径

### Q3: 如何更新 skills？

**解决方案**：
- 如果使用符号链接：直接更新源目录，所有设备自动生效
- 如果使用复制：需要在每台设备上重新复制
- 如果使用 Git：`git pull` 后自动更新

### Q4: 可以同时使用多个 skills 目录吗？

**解决方案**：
- 可以创建多个符号链接指向不同的目录
- 或者使用配置文件的 `sources` 数组指定多个路径

### Q5: 如何禁用某些 skills？

**解决方案**：
在 `.opencode/oh-my-opencode.json` 中配置：

```json
{
  "skills": {
    "disable": ["skill-name-1", "skill-name-2"]
  }
}
```

---

## 总结

**推荐方案**：
1. **单设备**：使用方法一（符号链接）
2. **多设备 + Git**：方案一（Git 同步 + 符号链接）
3. **多设备 + 云存储**：方案二（云存储同步 + 符号链接）
4. **多设备 + 自动检测**：方案三（通用同步脚本）

**关键点**：
- Skills 必须包含 `SKILL.md` 文件
- 符号链接是最灵活的方案
- 跨设备同步需要确保路径一致性或使用自动检测脚本

---

## 相关资源

- [OpenCode Skills 文档](packages/web/src/content/docs/skills.mdx)
- [oh-my-opencode README](oh-my-opencode/README.md)
- [Skills 规范](https://agentskills.io/specification)

---

**最后更新**: 2025-01-16  
**维护者**: AI Assistant

