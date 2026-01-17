# OpenCode DEB 包手动测试指南 v1.0

**测试日期**: 2026-01-26  
**DEB 包**: opencode_1.1.4_amd64.deb  
**测试平台**: Linux (Debian/Ubuntu)

---

## 快速开始

### 方式一：在本地系统测试

```bash
# 1. 进入项目目录
cd /media/hzm/data_disk/opencode

# 2. 安装 DEB 包
sudo dpkg -i packages/opencode/dist/opencode_1.1.4_amd64.deb

# 3. 测试
opencode --version
opencode --help

# 4. 卸载
sudo dpkg -r opencode
```

---

## 方式二：在远程系统测试

### 步骤 1: 连接到远程系统

```bash
ssh hzm@192.168.1.100
# 密码: hzm
```

### 步骤 2: 传输 DEB 包

**在本地系统执行**:

```bash
cd /media/hzm/data_disk/opencode
scp packages/opencode/dist/opencode_1.1.4_amd64.deb hzm@192.168.1.100:/tmp/opencode_test.deb
```

**或者使用其他方法**:
- 使用 USB 设备
- 使用网络共享
- 使用 wget/curl 从服务器下载

### 步骤 3: 在远程系统上检查 DEB 包

```bash
# 检查文件
ls -lh /tmp/opencode_test.deb
file /tmp/opencode_test.deb

# 查看包信息
dpkg-deb -I /tmp/opencode_test.deb
```

**预期输出**:
```
-rwxr-xr-x 1 hzm hzm 37M Jan 16 17:21 /tmp/opencode_test.deb
/tmp/opencode_test.deb: Debian binary package (format 2.0)

Package: opencode
Version: 1.1.4
Architecture: amd64
...
```

### 步骤 4: 安装 DEB 包

```bash
sudo dpkg -i /tmp/opencode_test.deb
```

**预期输出**:
```
Selecting previously unselected package opencode.
(Reading database ...)
Preparing to unpack /tmp/opencode_test.deb ...
Unpacking opencode (1.1.4) ...
Setting up opencode (1.1.4) ...
```

**如果遇到依赖问题**:
```bash
# 修复依赖
sudo apt-get install -f
```

### 步骤 5: 验证安装

```bash
# 检查包状态
dpkg -l | grep opencode

# 检查安装的文件
dpkg -L opencode

# 检查可执行文件
ls -lh /usr/bin/opencode
file /usr/bin/opencode
```

**预期输出**:
```
ii  opencode  1.1.4  amd64  AI-powered development tool

/usr/bin/opencode
/usr/share/doc/opencode/LICENSE
/usr/share/doc/opencode/README.md

-rwxr-xr-x 1 root root 134M Jan 16 17:18 /usr/bin/opencode
/usr/bin/opencode: ELF 64-bit LSB executable
```

### 步骤 6: 测试功能

#### 测试 1: --version 命令

```bash
/usr/bin/opencode --version
```

**预期输出**: `1.1.4`

#### 测试 2: --help 命令

```bash
/usr/bin/opencode --help
```

**预期输出**: 显示帮助信息和 Logo

#### 测试 3: 检查依赖

```bash
ldd /usr/bin/opencode
```

**预期输出**: 只显示系统标准库（libc, libpthread, libdl, libm）

#### 测试 4: 检查 PATH

```bash
which opencode
opencode --version
```

**注意**: 如果 `which opencode` 显示其他路径（如 `/home/user/.bun/bin/opencode`），这是因为 PATH 优先级。系统安装的版本在 `/usr/bin/opencode`，可以直接使用。

### 步骤 7: 测试卸载

```bash
# 卸载
sudo dpkg -r opencode

# 验证文件已删除
ls /usr/bin/opencode
```

**预期输出**:
```
(Reading database ...)
Removing opencode (1.1.4) ...

ls: cannot access '/usr/bin/opencode': No such file or directory
```

### 步骤 8: 测试重新安装

```bash
# 重新安装
sudo dpkg -i /tmp/opencode_test.deb

# 验证功能
/usr/bin/opencode --version
```

**预期输出**: `1.1.4`

---

## 完整测试脚本

如果你想一次性执行所有测试，可以使用以下脚本：

```bash
#!/bin/bash
# DEB 包完整测试脚本

DEB_FILE="/tmp/opencode_test.deb"

echo "=== 1. 检查 DEB 包 ==="
ls -lh $DEB_FILE
file $DEB_FILE
dpkg-deb -I $DEB_FILE | head -10
echo ""

echo "=== 2. 安装 DEB 包 ==="
sudo dpkg -i $DEB_FILE
echo ""

echo "=== 3. 验证安装 ==="
dpkg -l | grep opencode
dpkg -L opencode
ls -lh /usr/bin/opencode
echo ""

echo "=== 4. 测试功能 ==="
/usr/bin/opencode --version
echo ""
/usr/bin/opencode --help | head -15
echo ""

echo "=== 5. 检查依赖 ==="
ldd /usr/bin/opencode | head -10
echo ""

echo "=== 6. 测试卸载 ==="
sudo dpkg -r opencode
ls /usr/bin/opencode 2>&1 || echo "文件已删除"
echo ""

echo "=== 7. 重新安装 ==="
sudo dpkg -i $DEB_FILE
/usr/bin/opencode --version
echo ""

echo "=== 测试完成 ==="
```

---

## 测试检查清单

使用以下清单确保所有测试都完成：

### 安装前检查
- [ ] DEB 包文件存在
- [ ] 文件大小正确（约 37MB）
- [ ] 包信息正确（版本 1.1.4）
- [ ] 系统兼容（Debian/Ubuntu）

### 安装检查
- [ ] 安装命令执行成功
- [ ] 无错误信息
- [ ] 包状态显示 "ii"（已安装）

### 文件检查
- [ ] `/usr/bin/opencode` 存在
- [ ] 文件权限正确（可执行）
- [ ] 文件大小正确（约 134MB）
- [ ] 文档文件存在

### 功能检查
- [ ] `--version` 命令成功
- [ ] `--help` 命令成功
- [ ] 依赖检查通过
- [ ] 可执行文件类型正确

### 卸载检查
- [ ] 卸载命令执行成功
- [ ] 文件已删除
- [ ] 无残留文件

### 重新安装检查
- [ ] 重新安装成功
- [ ] 功能正常

---

## 常见问题排查

### 问题 1: 安装失败 - 依赖问题

**症状**:
```
dpkg: dependency problems prevent configuration of opencode
```

**解决方案**:
```bash
# 修复依赖
sudo apt-get install -f

# 然后重新安装
sudo dpkg -i /tmp/opencode_test.deb
```

### 问题 2: 权限被拒绝

**症状**:
```
dpkg: error: requested operation requires superuser privilege
```

**解决方案**:
```bash
# 使用 sudo
sudo dpkg -i /tmp/opencode_test.deb
```

### 问题 3: 文件未找到

**症状**:
```
dpkg: error: cannot access archive '/tmp/opencode_test.deb': No such file or directory
```

**解决方案**:
```bash
# 检查文件是否存在
ls -lh /tmp/opencode_test.deb

# 如果不存在，重新传输
scp packages/opencode/dist/opencode_1.1.4_amd64.deb hzm@192.168.1.100:/tmp/opencode_test.deb
```

### 问题 4: 架构不匹配

**症状**:
```
package architecture (amd64) does not match system (arm64)
```

**解决方案**:
- 确保系统架构匹配（amd64 系统使用 amd64 包）
- 如果需要 arm64 版本，需要先构建 arm64 可执行文件

### 问题 5: 命令未找到

**症状**:
```
opencode: command not found
```

**解决方案**:
```bash
# 使用完整路径
/usr/bin/opencode --version

# 或检查 PATH
echo $PATH
which opencode

# 如果 PATH 中有其他 opencode，系统安装的版本在 /usr/bin/opencode
```

---

## 测试结果记录模板

测试完成后，请记录以下信息：

```markdown
## 手动测试结果

### 测试环境
- 测试时间: [日期时间]
- 测试系统: [系统信息]
- 测试人员: [姓名]

### 测试结果
- [ ] 文件传输: 成功/失败
- [ ] 包验证: 通过/失败
- [ ] 安装: 成功/失败
- [ ] 功能测试: 通过/失败
- [ ] 卸载: 成功/失败
- [ ] 重新安装: 成功/失败

### 发现的问题
[记录任何发现的问题]

### 备注
[其他备注信息]
```

---

## 快速参考命令

### 安装相关
```bash
# 安装
sudo dpkg -i opencode_1.1.4_amd64.deb

# 修复依赖
sudo apt-get install -f

# 查看包信息
dpkg -l | grep opencode
dpkg -L opencode

# 卸载
sudo dpkg -r opencode

# 完全卸载（包括配置文件）
sudo dpkg -P opencode
```

### 测试相关
```bash
# 版本测试
/usr/bin/opencode --version

# 帮助测试
/usr/bin/opencode --help

# 依赖检查
ldd /usr/bin/opencode

# 文件检查
ls -lh /usr/bin/opencode
file /usr/bin/opencode
```

---

## 相关文档

- [DEB 打包方案评估](./DEB打包方案评估_v1.0_20260126_AI.md)
- [DEB 打包测试结果](./DEB打包测试结果_v1.0_20260126_AI.md)
- [DEB 远程测试结果](./DEB远程测试结果_v1.0_20260126_AI.md)

---

**文档结束**

