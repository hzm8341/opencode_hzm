#!/usr/bin/expect -f
# 使用 expect 自动输入密码的测试脚本

set timeout 30
set remote_host "hzm@10.200.1.59"
set remote_dir "/tmp/opencode_test"
set password "hzm"
set local_file "packages/opencode/dist/opencode-linux-x64/bin/opencode"

# 传输文件
spawn scp $local_file $remote_host:$remote_dir/opencode
expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}

# 等待传输完成
wait

# 在远程系统上测试
spawn ssh $remote_host
expect {
    "password:" {
        send "$password\r"
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
}

expect "$ "
send "cd $remote_dir\r"
expect "$ "
send "chmod +x opencode\r"
expect "$ "
send "echo '=== 远程系统信息 ==='\r"
expect "$ "
send "uname -a\r"
expect "$ "
send "cat /etc/os-release | head -5\r"
expect "$ "
send "echo ''\r"
expect "$ "
send "echo '=== 运行时检查 ==='\r"
expect "$ "
send "which bun || echo 'Bun: 未安装 (预期)'\r"
expect "$ "
send "which node || echo 'Node.js: 未安装 (预期)'\r"
expect "$ "
send "echo ''\r"
expect "$ "
send "echo '=== 可执行文件信息 ==='\r"
expect "$ "
send "ls -lh opencode\r"
expect "$ "
send "file opencode\r"
expect "$ "
send "echo ''\r"
expect "$ "
send "echo '=== 依赖检查 ==='\r"
expect "$ "
send "ldd opencode 2>&1 || echo '无法检查依赖'\r"
expect "$ "
send "echo ''\r"
expect "$ "
send "echo '=== 测试 --version ==='\r"
expect "$ "
send "./opencode --version\r"
expect "$ "
send "echo ''\r"
expect "$ "
send "echo '=== 测试 --help (前15行) ==='\r"
expect "$ "
send "./opencode --help | head -15\r"
expect "$ "
send "echo ''\r"
expect "$ "
send "echo '=== 测试完成 ==='\r"
expect "$ "
send "exit\r"
expect eof

