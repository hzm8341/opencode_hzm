# PPTX Skill 实现可行性计划

**版本**: v1.0  
**日期**: 2025-01-25  
**目标**: 将 `skills/pptx` 实现为可通过 `@skills` 机制使用的技能

---

## 一、现状分析

### 1.1 当前状态

- **技能位置**: `/media/hzm/data_disk/opencode/skills/pptx/`
- **技能内容**: 已包含完整的技能文件：
  - `SKILL.md` - 技能主文档（484行，包含完整的YAML frontmatter）
  - `scripts/` - Python脚本目录（5个脚本文件）
  - `ooxml/` - OOXML处理目录（包含脚本和schema文件）
  - `html2pptx.md` - HTML转PPTX参考文档
  - `ooxml.md` - OOXML技术参考文档
  - `LICENSE.txt` - 许可证文件

### 1.2 OpenCode 技能发现机制

根据代码分析，OpenCode 会在以下位置自动发现技能：

1. **项目级别**:
   - `.opencode/skill/<name>/SKILL.md`
   - `.claude/skills/<name>/SKILL.md`

2. **全局级别**:
   - `~/.config/opencode/skill/<name>/SKILL.md`
   - `~/.claude/skills/<name>/SKILL.md`

### 1.3 问题识别

- `skills/pptx` 目录不在上述标准路径中
- OpenCode 不会自动发现 `skills/` 目录下的技能
- 需要通过符号链接或复制的方式将技能链接到标准路径

---

## 二、实现方案

### 方案1：项目级别符号链接（推荐）

**优点**:
- 不修改原始文件位置
- 保持技能文件在 `skills/` 目录的统一管理
- 易于维护和更新
- 符合项目结构规范

**实施步骤**:
1. 在项目根目录创建 `.opencode/skill/` 目录（如果不存在）
2. 创建符号链接：`.opencode/skill/pptx` → `../skills/pptx`
3. 验证技能可以被发现

**命令**:
```bash
# 创建目录
mkdir -p .opencode/skill

# 创建符号链接（从项目根目录执行）
ln -s ../../skills/pptx .opencode/skill/pptx

# 验证链接
ls -la .opencode/skill/pptx
```

### 方案2：全局级别符号链接

**优点**:
- 所有项目都可以使用该技能
- 一次配置，全局可用

**实施步骤**:
1. 在用户主目录创建 `~/.config/opencode/skill/` 目录（如果不存在）
2. 创建符号链接：`~/.config/opencode/skill/pptx` → `/media/hzm/data_disk/opencode/skills/pptx`
3. 验证技能可以被发现

**命令**:
```bash
# 创建目录
mkdir -p ~/.config/opencode/skill

# 创建符号链接
ln -s /media/hzm/data_disk/opencode/skills/pptx ~/.config/opencode/skill/pptx

# 验证链接
ls -la ~/.config/opencode/skill/pptx
```

### 方案3：复制到标准路径（不推荐）

**缺点**:
- 需要维护两份文件
- 更新时需要同步
- 占用额外磁盘空间

**适用场景**: 仅在需要完全独立副本时使用

---

## 三、推荐实施方案

### 3.1 首选方案：项目级别符号链接

**理由**:
1. 保持项目结构的一致性
2. 技能文件仍然在 `skills/` 目录统一管理
3. 其他开发者可以轻松找到技能位置
4. 符合 OpenCode 的最佳实践

### 3.2 实施检查清单

- [ ] 检查 `.opencode/skill/` 目录是否存在
- [ ] 检查是否已有 `pptx` 技能（避免冲突）
- [ ] 创建符号链接
- [ ] 验证 `SKILL.md` 文件可访问
- [ ] 验证技能描述和名称正确
- [ ] 测试技能是否可以被 OpenCode 发现
- [ ] 验证脚本路径引用正确（相对路径）

### 3.3 路径验证

创建符号链接后，需要验证：

1. **SKILL.md 可访问性**:
   ```bash
   cat .opencode/skill/pptx/SKILL.md | head -10
   ```

2. **脚本路径正确性**:
   - 检查 `SKILL.md` 中的脚本引用路径
   - 确保相对路径在符号链接后仍然有效
   - 例如：`scripts/html2pptx.js` 应该能正确解析

3. **资源文件完整性**:
   - 验证 `ooxml/` 目录可访问
   - 验证 `scripts/` 目录可访问
   - 验证所有参考文档可访问

---

## 四、技能内容验证

### 4.1 SKILL.md 格式检查

根据 `skills/pptx/SKILL.md` 的内容，需要验证：

- ✅ **YAML Frontmatter**:
  ```yaml
  name: pptx
  description: "Presentation creation, editing, and analysis..."
  license: Proprietary. LICENSE.txt has complete terms
  ```
  - `name` 字段符合规范（小写字母数字，单连字符分隔）
  - `description` 字段长度在 1-1024 字符范围内
  - 目录名与 `name` 字段匹配

- ✅ **技能内容**:
  - 包含完整的工作流程说明
  - 包含脚本使用说明
  - 包含依赖项说明

### 4.2 脚本文件检查

需要验证以下脚本文件存在且可执行：

- `scripts/html2pptx.js` - HTML转PPTX转换脚本
- `scripts/inventory.py` - 文本清单提取脚本
- `scripts/rearrange.py` - 幻灯片重排脚本
- `scripts/replace.py` - 文本替换脚本
- `scripts/thumbnail.py` - 缩略图生成脚本
- `ooxml/scripts/pack.py` - OOXML打包脚本
- `ooxml/scripts/unpack.py` - OOXML解包脚本
- `ooxml/scripts/validate.py` - OOXML验证脚本

### 4.3 参考文档检查

需要验证以下参考文档存在：

- `html2pptx.md` - HTML转PPTX详细指南
- `ooxml.md` - OOXML技术参考文档

---

## 五、潜在问题和解决方案

### 5.1 路径引用问题

**问题**: 符号链接后，相对路径引用可能失效

**解决方案**:
- 检查 `SKILL.md` 中的路径引用
- 确保所有路径都是相对于技能根目录的
- 如果使用绝对路径，需要更新为相对路径

### 5.2 权限问题

**问题**: 符号链接可能没有执行权限

**解决方案**:
- 确保原始目录和文件有适当的权限
- 符号链接会继承原始文件的权限

### 5.3 依赖项问题

**问题**: 脚本依赖的 Python/Node.js 包可能未安装

**解决方案**:
- 检查 `SKILL.md` 中的依赖项说明
- 确保所有依赖项已安装
- 在技能文档中明确列出依赖项

---

## 六、测试验证

### 6.1 技能发现测试

使用 OpenCode 的 `@skills` 机制测试技能是否被发现：

1. 启动 OpenCode
2. 使用 `@skills` 命令查看可用技能列表
3. 验证 `pptx` 技能出现在列表中
4. 验证技能描述正确显示

### 6.2 技能加载测试

测试技能内容是否正确加载：

1. 使用 `@skills pptx` 加载技能
2. 验证技能内容完整显示
3. 验证脚本路径正确
4. 验证参考文档可访问

### 6.3 功能测试

测试技能的实际功能：

1. 创建一个简单的 PPTX 文件
2. 使用技能中的脚本处理文件
3. 验证输出结果正确

---

## 七、实施时间表

### 阶段1：准备（5分钟）
- 检查目录结构
- 验证技能文件完整性
- 备份现有配置（如有）

### 阶段2：创建符号链接（2分钟）
- 创建 `.opencode/skill/` 目录
- 创建符号链接
- 验证链接正确性

### 阶段3：验证（10分钟）
- 验证技能发现
- 验证技能加载
- 验证路径引用
- 测试基本功能

### 阶段4：文档更新（可选，5分钟）
- 更新项目文档
- 记录技能位置
- 添加使用说明

**总预计时间**: 约 20-25 分钟

---

## 八、风险评估

### 8.1 低风险项

- ✅ 符号链接创建（标准操作，风险低）
- ✅ 路径验证（自动化检查，风险低）
- ✅ 技能格式验证（已有完整文件，风险低）

### 8.2 中等风险项

- ⚠️ 路径引用问题（需要仔细检查）
- ⚠️ 依赖项缺失（需要验证环境）

### 8.3 缓解措施

- 在实施前完整备份
- 逐步验证每个步骤
- 准备回滚方案（删除符号链接即可）

---

## 九、后续优化建议

### 9.1 批量处理

如果 `skills/` 目录下有多个技能需要实现，可以：

1. 编写脚本批量创建符号链接
2. 统一管理所有技能的符号链接
3. 建立技能注册机制

### 9.2 自动化脚本

创建自动化脚本：

```bash
#!/bin/bash
# link_skills.sh - 批量创建技能符号链接

SKILLS_DIR="skills"
TARGET_DIR=".opencode/skill"

mkdir -p "$TARGET_DIR"

for skill in "$SKILLS_DIR"/*/; do
    skill_name=$(basename "$skill")
    if [ -f "$skill/SKILL.md" ]; then
        ln -sf "../$SKILLS_DIR/$skill_name" "$TARGET_DIR/$skill_name"
        echo "Linked: $skill_name"
    fi
done
```

### 9.3 文档完善

- 在项目 README 中说明技能位置
- 创建技能使用指南
- 记录技能依赖项

---

## 十、总结

### 10.1 推荐方案

**首选**: 项目级别符号链接（方案1）

**理由**:
- 保持项目结构清晰
- 易于维护
- 符合最佳实践
- 风险最低

### 10.2 实施优先级

1. **高优先级**: 创建符号链接，验证技能发现
2. **中优先级**: 验证路径引用，测试基本功能
3. **低优先级**: 文档更新，批量处理其他技能

### 10.3 成功标准

- ✅ 技能可以通过 `@skills` 发现
- ✅ 技能内容可以正确加载
- ✅ 所有脚本路径引用正确
- ✅ 基本功能测试通过

---

## 附录：相关文件路径

- 技能位置: `/media/hzm/data_disk/opencode/skills/pptx/`
- 目标位置: `/media/hzm/data_disk/opencode/.opencode/skill/pptx`
- 技能文档: `skills/pptx/SKILL.md`
- 参考文档: 
  - `skills/pptx/html2pptx.md`
  - `skills/pptx/ooxml.md`

---

**计划制定日期**: 2025-01-25  
**计划版本**: v1.0  
**状态**: 待实施

