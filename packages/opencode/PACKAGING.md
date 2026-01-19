# OpenCode 打包指南

## 快速开始

### 1. 构建可执行文件

```bash
cd packages/opencode
bun run script/build.ts --single
```

### 2. 打包

#### Linux - DEB 包

```bash
# 自动检测架构
bun run script/package.ts --format deb

# 指定架构
bun run script/package.ts --format deb --arch amd64
bun run script/package.ts --format deb --arch arm64

# 或使用快捷命令
bun run package:deb
```

**输出**: `dist/opencode_<version>_<arch>.deb`

**安装**:
```bash
sudo dpkg -i dist/opencode_1.1.4_amd64.deb
opencode --version
```

#### macOS - DMG 包

```bash
# 自动检测架构
bun run script/package.ts --format dmg

# 指定架构
bun run script/package.ts --format dmg --arch arm64
bun run script/package.ts --format dmg --arch x64

# 或使用快捷命令
bun run package:dmg
```

**输出**: `dist/opencode_<version>_<arch>.dmg`

**安装**:
1. 双击 DMG 文件
2. 复制 `opencode` 到 `/usr/local/bin/`:
   ```bash
   sudo cp /Volumes/OpenCode/opencode /usr/local/bin/
   ```
3. 验证: `opencode --version`

## 详细文档

完整的使用指南请参考: [docs/打包使用指南_v1.0_20260126_AI.md](../../docs/打包使用指南_v1.0_20260126_AI.md)

