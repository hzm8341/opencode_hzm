# OpenCode Skills Collection

Skills 位于 `.opencode/skill/` 目录下。

## 可用 Skills

| Skill                 | 描述                    | 状态      |
| --------------------- | ----------------------- | --------- |
| `planning-with-files` | Manus风格的文件规划技能 | ✅ 已安装 |
| `pdf`                 | PDF文档处理技能         | ✅ 已安装 |
| `test-skill`          | 测试技能                | ✅ 已安装 |

## 使用方法

### Planning with Files

用于复杂任务的Manus风格规划：

```bash
# 初始化规划文件
cd .opencode/skill/planning-with-files && bash scripts/init-session.sh

# 检查任务完成状态
cd .opencode/skill/planning-with-files && bash scripts/check-complete.sh
```

或在OpenCode中直接引用：

```
Use planning-with-files skill to create a task plan
```

### PDF Skill

处理PDF文档：

```
Use pdf skill to extract text from document.pdf
```

## 添加新 Skill

1. 在 `.opencode/skill/` 下创建目录
2. 添加 `SKILL.md` 文件
3. 重启OpenCode即可自动加载
