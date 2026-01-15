#!/usr/bin/env bun
/**
 * MoveIt2 自动配置脚本 / MoveIt2 Auto Configuration Script
 * 
 * 此脚本会自动配置 /media/hzm/Data/github/moveit2
 * 如果遇到问题，会使用 opencode 智能体自动修复
 * 
 * This script automatically configures /media/hzm/Data/github/moveit2
 * If problems are encountered, it uses opencode agent to automatically fix them
 * 
 * Version: v1.0
 * Date: 2026-01-07
 * AI Model: Claude-4 (Auto Agent Router)
 */

import { $ } from "bun"
import { existsSync } from "fs"
import { join } from "path"

const MOVEIT2_PATH = "/media/hzm/Data/github/moveit2"
const MAX_RETRIES = 10
const RETRY_DELAY = 5000 // 5 seconds

interface ConfigResult {
  success: boolean
  error?: string
  output?: string
}

/**
 * 检查目录是否存在 / Check if directory exists
 */
function checkDirectory(path: string): boolean {
  if (!existsSync(path)) {
    console.error(`❌ 目录不存在 / Directory does not exist: ${path}`)
    return false
  }
  console.log(`✅ 目录存在 / Directory exists: ${path}`)
  return true
}

/**
 * 检查 ROS2 环境 / Check ROS2 environment
 */
async function checkROS2(): Promise<ConfigResult> {
  try {
    // 检查 ROS_DISTRO 环境变量 / Check ROS_DISTRO environment variable
    const rosDistro = process.env.ROS_DISTRO
    if (!rosDistro) {
      return {
        success: false,
        error: "ROS_DISTRO 环境变量未设置 / ROS_DISTRO environment variable not set"
      }
    }
    console.log(`✅ ROS_DISTRO: ${rosDistro}`)

    // 检查 ROS2 是否已 source / Check if ROS2 is sourced
    const ros2Check = await $`which ros2`.quiet().nothrow()
    if (ros2Check.exitCode !== 0) {
      return {
        success: false,
        error: "ROS2 未找到，请先 source ROS2 环境 / ROS2 not found, please source ROS2 environment first"
      }
    }
    console.log(`✅ ROS2 已安装 / ROS2 installed`)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `检查 ROS2 时出错 / Error checking ROS2: ${error}`
    }
  }
}

/**
 * 检查 MoveIt2 依赖 / Check MoveIt2 dependencies
 */
async function checkDependencies(): Promise<ConfigResult> {
  try {
    console.log("🔍 检查依赖 / Checking dependencies...")
    
    // 检查 colcon / Check colcon
    const colconCheck = await $`which colcon`.quiet().nothrow()
    if (colconCheck.exitCode !== 0) {
      return {
        success: false,
        error: `缺少工具 / Missing tool: colcon`
      }
    }
    console.log(`✅ colcon 已安装 / colcon installed`)
    
    // 检查 vcs / Check vcs
    const vcsCheck = await $`which vcs`.quiet().nothrow()
    if (vcsCheck.exitCode !== 0) {
      return {
        success: false,
        error: `缺少工具 / Missing tool: vcs`
      }
    }
    console.log(`✅ vcs 已安装 / vcs installed`)
    
    // 检查 rosdep（支持直接命令或 python3 -m rosdep）/ Check rosdep (support direct command or python3 -m rosdep)
    const rosdepCheck = await $`which rosdep`.quiet().nothrow()
    const rosdepModuleCheck = await $`python3 -m rosdep --version`.quiet().nothrow()
    if (rosdepCheck.exitCode !== 0 && rosdepModuleCheck.exitCode !== 0) {
      return {
        success: false,
        error: `缺少工具 / Missing tool: rosdep (尝试安装: pip3 install rosdep 或 sudo apt install python3-rosdep2 / Try installing: pip3 install rosdep or sudo apt install python3-rosdep2)`
      }
    }
    if (rosdepCheck.exitCode === 0) {
      console.log(`✅ rosdep 已安装 / rosdep installed`)
    } else {
      console.log(`✅ rosdep 已安装（通过 python3 -m rosdep）/ rosdep installed (via python3 -m rosdep)`)
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `检查依赖时出错 / Error checking dependencies: ${error}`
    }
  }
}

/**
 * 尝试配置 MoveIt2 / Attempt to configure MoveIt2
 */
async function configureMoveIt2(): Promise<ConfigResult> {
  try {
    console.log("🚀 开始配置 MoveIt2 / Starting MoveIt2 configuration...")

    // 确保 ROS2 环境已 source / Ensure ROS2 environment is sourced
    const rosDistro = process.env.ROS_DISTRO || "humble"
    const rosSetupScript = `/opt/ros/${rosDistro}/setup.bash`
    
    if (existsSync(rosSetupScript)) {
      console.log(`📦 Source ROS2 ${rosDistro} 环境 / Sourcing ROS2 ${rosDistro} environment...`)
      // 注意：在子进程中 source 不会影响当前进程，需要在命令中显式 source
    } else {
      console.log(`⚠️  ROS2 ${rosDistro} 环境脚本未找到 / ROS2 ${rosDistro} environment script not found: ${rosSetupScript}`)
    }

    // 检查工作空间 / Check workspace
    const workspacePath = join(MOVEIT2_PATH, "..", "ws_moveit2")
    const srcPath = join(workspacePath, "src")
    
    // 创建工作空间（如果不存在）/ Create workspace if not exists
    if (!existsSync(workspacePath)) {
      console.log("📁 创建工作空间 / Creating workspace...")
      await $`mkdir -p ${srcPath}`
    }

    // 使用已下载的 moveit2 源码 / Use downloaded moveit2 source code
    console.log("📂 使用已下载的 MoveIt2 源码 / Using downloaded MoveIt2 source code...")
    const moveit2Path = join(srcPath, "moveit2")
    
    // 如果工作空间中还没有 moveit2，创建符号链接或复制 / If moveit2 not in workspace, create symlink or copy
    if (!existsSync(moveit2Path)) {
      console.log("🔗 在工作空间中链接 MoveIt2 源码 / Linking MoveIt2 source in workspace...")
      // 创建符号链接以节省空间 / Create symlink to save space
      await $`ln -s ${MOVEIT2_PATH} ${moveit2Path}`
    } else {
      console.log("✅ MoveIt2 已存在于工作空间 / MoveIt2 already exists in workspace")
    }

    // 导入依赖 / Import dependencies
    console.log("📦 导入依赖 / Importing dependencies...")
    const reposFile = join(MOVEIT2_PATH, "moveit2.repos")
    if (existsSync(reposFile)) {
      console.log("📥 使用 moveit2.repos 导入依赖仓库 / Using moveit2.repos to import dependency repositories...")
      // 在 bash 中 source ROS2 环境并执行 vcs import / Source ROS2 environment in bash and execute vcs import
      await $`bash -c "source ${rosSetupScript} && cd ${srcPath} && vcs import < ${reposFile}"`.nothrow()
    } else {
      console.log("⚠️  moveit2.repos 文件未找到，跳过依赖导入 / moveit2.repos not found, skipping dependency import")
    }

    // 安装依赖 / Install dependencies
    console.log("📥 安装系统依赖 / Installing system dependencies...")
    // 尝试使用 rosdep 命令，如果失败则使用 python3 -m rosdep / Try rosdep command, fallback to python3 -m rosdep
    const rosdepCmd = await $`which rosdep`.quiet().nothrow()
    const rosdepCommand = rosdepCmd.exitCode === 0 ? "rosdep" : "python3 -m rosdep"
    
    // 首先初始化 rosdep（如果尚未初始化）/ Initialize rosdep first if not already initialized
    console.log("🔄 更新 rosdep 数据库 / Updating rosdep database...")
    const rosdepUpdateResult = await $`bash -c "source ${rosSetupScript} && ${rosdepCommand} update"`.quiet().nothrow()
    if (rosdepUpdateResult.exitCode !== 0) {
      console.log("⚠️  rosdep 更新失败，继续尝试安装依赖 / rosdep update failed, continuing with dependency installation")
    } else {
      console.log("✅ rosdep 数据库更新成功 / rosdep database updated successfully")
    }
    
    console.log("📦 使用 rosdep 安装所有依赖 / Installing all dependencies with rosdep...")
    const rosdepInstallResult = await $`bash -c "source ${rosSetupScript} && cd ${srcPath} && ${rosdepCommand} install -r --from-paths . --ignore-src --rosdistro ${rosDistro} -y"`.nothrow()
    
    if (rosdepInstallResult.exitCode !== 0) {
      console.log("⚠️  rosdep 安装依赖时出现警告或错误，继续构建 / Warnings or errors during rosdep install, continuing with build")
      console.log(rosdepInstallResult.stderr.toString())
    } else {
      console.log("✅ 依赖安装完成 / Dependencies installed successfully")
    }

    // 构建工作空间 / Build workspace
    console.log("🔨 构建工作空间 / Building workspace...")
    // 在构建时 source ROS2 环境 / Source ROS2 environment during build
    let buildResult = await $`bash -c "source ${rosSetupScript} && cd ${workspacePath} && source install/setup.bash 2>/dev/null || true && colcon build --event-handlers desktop_notification- status- --cmake-args -DCMAKE_BUILD_TYPE=Release"`.nothrow()
    
    // 如果构建失败，检查是否缺少依赖包，尝试自动安装 / If build fails, check for missing dependencies and try to auto-install
    if (buildResult.exitCode !== 0) {
      const buildOutput = buildResult.stderr.toString() + "\n" + buildResult.stdout.toString()
      
      // 检查常见的缺失依赖 / Check for common missing dependencies
      const missingDeps: string[] = []
      if (buildOutput.includes("Could not find a package configuration file provided by")) {
        // 提取缺失的包名 / Extract missing package names
        const matches = buildOutput.match(/provided by "([^"]+)"/g)
        if (matches) {
          for (const match of matches) {
            const pkgName = match.replace(/provided by "|"/g, "")
            if (!missingDeps.includes(pkgName)) {
              missingDeps.push(pkgName)
            }
          }
        }
      }
      
      // 如果检测到缺失依赖，尝试通过 rosdep 安装 / If missing dependencies detected, try installing via rosdep
      if (missingDeps.length > 0) {
        console.log(`⚠️  检测到缺失依赖 / Missing dependencies detected: ${missingDeps.join(", ")}`)
        console.log("📦 尝试通过 rosdep 安装缺失依赖 / Attempting to install missing dependencies via rosdep...")
        
        // 尝试安装缺失的依赖 / Try to install missing dependencies
        for (const dep of missingDeps) {
          console.log(`🔍 检查依赖: ${dep} / Checking dependency: ${dep}`)
          // 这里让 opencode 智能体处理，因为手动安装可能很复杂 / Let opencode agent handle this as manual installation can be complex
        }
      }
      
      return {
        success: false,
        error: `构建失败 / Build failed`,
        output: buildOutput
      }
    }

    console.log("✅ MoveIt2 配置成功 / MoveIt2 configuration successful!")
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `配置 MoveIt2 时出错 / Error configuring MoveIt2: ${error}`,
      output: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * 查找 opencode 命令路径 / Find opencode command path
 */
async function findOpencodeCommand(): Promise<string> {
  // 1. 检查环境变量 / Check environment variable
  if (process.env.OPENCODE_BIN_PATH) {
    return process.env.OPENCODE_BIN_PATH
  }

  // 2. 检查是否在开发环境中，使用 bun dev / Check if in dev environment, use bun dev
  const opencodeProjectPath = "/media/hzm/Data/github/opencode"
  if (existsSync(opencodeProjectPath)) {
    // 在开发环境中，使用 bun dev / In dev environment, use bun dev
    return "bun"
  }

  // 3. 尝试查找系统安装的 opencode / Try to find system-installed opencode
  const whichResult = await $`which opencode`.quiet().nothrow()
  if (whichResult.exitCode === 0) {
    return "opencode"
  }

  // 4. 尝试查找本地 node_modules 中的 opencode / Try to find opencode in local node_modules
  const localOpencode = join(process.cwd(), "node_modules", ".bin", "opencode")
  if (existsSync(localOpencode)) {
    return localOpencode
  }

  throw new Error("无法找到 opencode 命令 / Cannot find opencode command")
}

/**
 * 使用 opencode 智能体修复问题 / Use opencode agent to fix issues
 */
async function fixWithOpencode(error: string, output?: string): Promise<ConfigResult> {
  try {
    console.log("🤖 使用 opencode 智能体修复问题 / Using opencode agent to fix issues...")
    
    const prompt = `
请帮助配置 MoveIt2 项目。当前遇到以下问题：

Please help configure the MoveIt2 project. Currently encountering the following issues:

错误信息 / Error message:
${error}

${output ? `构建输出 / Build output:\n${output}` : ""}

重要：所有操作必须在以下目录下进行 / Important: All operations must be performed in the following directory:
工作目录 / Working directory: ${MOVEIT2_PATH}

请执行以下任务：
1. 切换到 ${MOVEIT2_PATH} 目录
2. 检查项目目录结构和文件
3. 检查 ROS2 环境配置（ROS_DISTRO 等环境变量）
4. 检查依赖是否完整（colcon, vcs, rosdep 等工具）
5. 修复发现的问题
6. 重新尝试配置

Please perform the following tasks:
1. Change to ${MOVEIT2_PATH} directory
2. Check project directory structure and files
3. Check ROS2 environment configuration (ROS_DISTRO and other environment variables)
4. Check if dependencies are complete (colcon, vcs, rosdep and other tools)
5. Fix discovered issues
6. Retry configuration

请使用 bash 命令和文件编辑工具来修复问题。确保所有命令都在正确的目录下执行。
Please use bash commands and file editing tools to fix the issues. Ensure all commands are executed in the correct directory.
`

    // 查找 opencode 命令 / Find opencode command
    let opencodeCmd: string
    let opencodeArgs: string[]
    try {
      opencodeCmd = await findOpencodeCommand()
      // 如果在开发环境中使用 bun，需要添加 dev 参数 / If using bun in dev environment, add dev argument
      if (opencodeCmd === "bun") {
        opencodeArgs = ["dev", "run", "--agent", "build", prompt]
      } else {
        opencodeArgs = ["run", "--agent", "build", prompt]
      }
    } catch (e) {
      return {
        success: false,
        error: `无法找到 opencode 命令 / Cannot find opencode command: ${e}`
      }
    }

    // 使用 opencode run 命令 / Use opencode run command
    // 确保在 moveit2 目录下运行，这样 opencode 会在正确的目录下工作 / Ensure running in moveit2 directory so opencode works in correct directory
    console.log(`🔧 使用命令 / Using command: ${opencodeCmd} ${opencodeArgs.join(" ")}`)
    console.log(`📁 工作目录 / Working directory: ${MOVEIT2_PATH}`)
    
    // 如果在开发环境中使用 bun dev，需要在 opencode 项目目录下运行 / If using bun dev in dev environment, run in opencode project directory
    const opencodeProjectPath = "/media/hzm/Data/github/opencode"
    let result
    
    if (opencodeCmd === "bun" && existsSync(opencodeProjectPath)) {
      // 在 opencode 项目目录下运行，但通过提示告诉智能体在 moveit2 目录下工作 / Run in opencode project directory, but tell agent to work in moveit2 directory via prompt
      result = await $`${opencodeCmd} ${opencodeArgs}`.cwd(opencodeProjectPath).nothrow()
    } else {
      // 直接在 moveit2 目录下运行 opencode / Run opencode directly in moveit2 directory
      result = await $`${opencodeCmd} ${opencodeArgs}`.cwd(MOVEIT2_PATH).nothrow()
    }
    
    if (result.exitCode === 0) {
      console.log("✅ opencode 智能体修复完成 / opencode agent fix completed")
      return { success: true, output: result.stdout.toString() }
    } else {
      return {
        success: false,
        error: `opencode 修复失败 / opencode fix failed`,
        output: result.stderr.toString()
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `调用 opencode 时出错 / Error calling opencode: ${error}`,
      output: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * 主函数 / Main function
 */
async function main() {
  console.log("=".repeat(60))
  console.log("MoveIt2 自动配置脚本 / MoveIt2 Auto Configuration Script")
  console.log("Version: v1.0")
  console.log("Date: 2026-01-07")
  console.log("=".repeat(60))
  console.log()

  // 检查目录 / Check directory
  if (!checkDirectory(MOVEIT2_PATH)) {
    console.error("❌ 请确保 MoveIt2 目录存在 / Please ensure MoveIt2 directory exists")
    process.exit(1)
  }

  let attempt = 0
  let lastError: string | undefined
  let lastOutput: string | undefined

  while (attempt < MAX_RETRIES) {
    attempt++
    console.log(`\n🔄 尝试 ${attempt}/${MAX_RETRIES} / Attempt ${attempt}/${MAX_RETRIES}`)
    console.log("-".repeat(60))

    // 检查 ROS2 环境 / Check ROS2 environment
    const ros2Check = await checkROS2()
    if (!ros2Check.success) {
      console.error(`❌ ${ros2Check.error}`)
      lastError = ros2Check.error
      
      // 使用 opencode 修复 / Fix with opencode
      const fixResult = await fixWithOpencode(ros2Check.error || "ROS2 environment check failed")
      if (!fixResult.success) {
        console.error(`❌ 修复失败 / Fix failed: ${fixResult.error}`)
        await Bun.sleep(RETRY_DELAY)
        continue
      }
      // 修复后继续 / Continue after fix
      continue
    }

    // 检查依赖 / Check dependencies
    const depsCheck = await checkDependencies()
    if (!depsCheck.success) {
      console.error(`❌ ${depsCheck.error}`)
      lastError = depsCheck.error
      
      // 使用 opencode 修复 / Fix with opencode
      const fixResult = await fixWithOpencode(depsCheck.error || "Dependencies check failed")
      if (!fixResult.success) {
        console.error(`❌ 修复失败 / Fix failed: ${fixResult.error}`)
        await Bun.sleep(RETRY_DELAY)
        continue
      }
      // 修复后继续 / Continue after fix
      continue
    }

    // 配置 MoveIt2 / Configure MoveIt2
    const configResult = await configureMoveIt2()
    if (configResult.success) {
      console.log("\n" + "=".repeat(60))
      console.log("✅ MoveIt2 配置成功完成！/ MoveIt2 configuration completed successfully!")
      console.log("=".repeat(60))
      process.exit(0)
    } else {
      console.error(`❌ 配置失败 / Configuration failed: ${configResult.error}`)
      lastError = configResult.error
      lastOutput = configResult.output

      // 使用 opencode 修复 / Fix with opencode
      console.log("\n🤖 调用 opencode 智能体修复... / Calling opencode agent to fix...")
      const fixResult = await fixWithOpencode(
        configResult.error || "MoveIt2 configuration failed",
        configResult.output
      )

      if (fixResult.success) {
        console.log("✅ opencode 修复完成，重新尝试配置 / opencode fix completed, retrying configuration...")
        // 继续下一次尝试 / Continue to next attempt
        await Bun.sleep(2000) // 等待 2 秒后重试 / Wait 2 seconds before retry
        continue
      } else {
        console.error(`❌ opencode 修复失败 / opencode fix failed: ${fixResult.error}`)
        await Bun.sleep(RETRY_DELAY)
        continue
      }
    }
  }

  // 达到最大重试次数 / Maximum retries reached
  console.log("\n" + "=".repeat(60))
  console.error("❌ 达到最大重试次数，配置失败 / Maximum retries reached, configuration failed")
  console.error(`最后错误 / Last error: ${lastError}`)
  console.log("=".repeat(60))
  process.exit(1)
}

// 运行主函数 / Run main function
main().catch((error) => {
  console.error("❌ 未处理的错误 / Unhandled error:", error)
  process.exit(1)
})
