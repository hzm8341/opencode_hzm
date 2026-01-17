# Skills 同步脚本使用说明

## 快速开始

### 一键同步

```bash
# 从项目根目录运行
./scripts/sync-skills.sh sync
```

### 查看已链接的 skills

```bash
./scripts/sync-skills.sh list
```

### 验证链接

```bash
./scripts/sync-skills.sh verify
```

### 清理所有链接

```bash
./scripts/sync-skills.sh clean
```

## 命令说明

| 命令 | 说明 |
|------|------|
| `sync [路径]` | 同步 skills（创建符号链接）。如果不指定路径，会自动检测 |
| `list` | 列出所有已链接的 skills 及其详细信息 |
| `verify` | 验证所有符号链接是否有效 |
| `clean` | 清理所有符号链接（会提示确认） |

## 使用示例

### 自动检测并同步

```bash
./scripts/sync-skills.sh sync
```

### 从指定路径同步

```bash
./scripts/sync-skills.sh sync /media/hzm/data_disk/opencode/skills
```

### 从云存储路径同步

```bash
./scripts/sync-skills.sh sync ~/Dropbox/opencode-skills
```

## 工作原理

1. **自动检测路径**：脚本会按优先级检查以下路径：
   - `/media/hzm/data_disk/opencode/skills`
   - `~/Dropbox/opencode-skills`
   - `~/OneDrive/opencode-skills`
   - `~/Google Drive/opencode-skills`
   - 以及其他常见路径

2. **创建符号链接**：在 `~/.config/opencode/skill/` 目录下为每个包含 `SKILL.md` 的目录创建符号链接

3. **验证链接**：检查所有链接是否指向有效的 `SKILL.md` 文件

## 跨设备使用

### 方法 1：Git 同步

1. 确保 skills 目录在 Git 仓库中
2. 在每台设备上克隆仓库
3. 在每台设备上运行：`./scripts/sync-skills.sh sync`

### 方法 2：云存储同步

1. 将 skills 目录放在云存储中（如 Dropbox、OneDrive）
2. 在每台设备上运行：`./scripts/sync-skills.sh sync`
3. 脚本会自动检测云存储路径

## 故障排除

### 找不到 skills 目录

如果自动检测失败，可以手动指定路径：

```bash
./scripts/sync-skills.sh sync /path/to/your/skills
```

### 链接无效

运行验证命令查看问题：

```bash
./scripts/sync-skills.sh verify
```

### 清理并重新同步

```bash
./scripts/sync-skills.sh clean
./scripts/sync-skills.sh sync
```

## 更多信息

详细文档请参考：`docs/Cursor_Skills_使用指南_v1.0_20250116_AI.md`

