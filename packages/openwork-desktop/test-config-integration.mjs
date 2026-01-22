#!/usr/bin/env node
/**
 * 测试 OpenWork Desktop 配置集成
 * 验证全局配置和项目配置是否可以正确读取
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 模拟 Rust 的配置路径解析逻辑
function resolveOpencodeConfigPath(scope, projectDir) {
  const home = process.env.HOME || process.env.USERPROFILE;
  
  if (scope === "project") {
    if (!projectDir || projectDir.trim() === "") {
      throw new Error("projectDir is required");
    }
    // Try .opencode/opencode.jsonc first, then opencode.jsonc, then opencode.json
    const opencodeDir = join(projectDir, ".opencode");
    const jsoncPath1 = join(opencodeDir, "opencode.jsonc");
    if (existsSync(jsoncPath1)) {
      return jsoncPath1;
    }
    const jsoncPath2 = join(projectDir, "opencode.jsonc");
    if (existsSync(jsoncPath2)) {
      return jsoncPath2;
    }
    const jsonPath1 = join(opencodeDir, "opencode.json");
    if (existsSync(jsonPath1)) {
      return jsonPath1;
    }
    return join(projectDir, "opencode.json");
  }
  
  if (scope === "global") {
    const base = process.env.XDG_CONFIG_HOME || (home ? join(home, ".config") : null);
    if (!base) {
      throw new Error("Unable to resolve config directory");
    }
    
    const configDir = join(base, "opencode");
    // Try jsonc first, then json (matching OpenCode's behavior)
    const jsoncPath = join(configDir, "opencode.jsonc");
    if (existsSync(jsoncPath)) {
      return jsoncPath;
    }
    return join(configDir, "opencode.json");
  }
  
  throw new Error("scope must be 'project' or 'global'");
}

function readOpencodeConfig(scope, projectDir) {
  const path = resolveOpencodeConfigPath(scope, projectDir);
  const exists = existsSync(path);
  
  const content = exists ? readFileSync(path, "utf-8") : null;
  
  return {
    path,
    exists,
    content,
  };
}

// 解析 JSONC 内容
function parseJsonc(content) {
  if (!content) return null;
  
  try {
    // 使用更完善的 JSONC 解析
    // 移除单行注释（但不在字符串内）
    let cleaned = content;
    let inString = false;
    let escapeNext = false;
    let result = "";
    
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      const nextChar = cleaned[i + 1];
      
      if (escapeNext) {
        result += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        result += char;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        result += char;
        continue;
      }
      
      if (!inString && char === '/' && nextChar === '/') {
        // 跳过单行注释
        while (i < cleaned.length && cleaned[i] !== '\n') {
          i++;
        }
        if (i < cleaned.length) result += '\n';
        continue;
      }
      
      if (!inString && char === '/' && nextChar === '*') {
        // 跳过多行注释
        i += 2;
        while (i < cleaned.length - 1) {
          if (cleaned[i] === '*' && cleaned[i + 1] === '/') {
            i += 2;
            break;
          }
          i++;
        }
        continue;
      }
      
      result += char;
    }
    
    return JSON.parse(result);
  } catch (e) {
    // 如果解析失败，尝试直接解析（可能是纯JSON）
    return JSON.parse(content);
  }
}

// 测试函数
function test(name, fn) {
  try {
    const result = fn();
    console.log(`✅ ${name}`);
    return { name, passed: true, result };
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    return { name, passed: false, error: error.message };
  }
}

console.log("🧪 开始测试 OpenWork Desktop 配置集成...\n");

const projectDir = join(__dirname, "../..");
const results = [];

// 测试1: 全局配置路径解析
results.push(test("测试1: 全局配置路径解析", () => {
  const path = resolveOpencodeConfigPath("global", "");
  if (!path.includes(".config/opencode")) {
    throw new Error(`路径不正确: ${path}`);
  }
  return path;
}));

// 测试2: 项目配置路径解析
results.push(test("测试2: 项目配置路径解析", () => {
  const path = resolveOpencodeConfigPath("project", projectDir);
  if (!path.includes("opencode.jsonc") && !path.includes("opencode.json")) {
    throw new Error(`路径不正确: ${path}`);
  }
  return path;
}));

// 测试3: 读取全局配置
results.push(test("测试3: 读取全局配置", () => {
  const config = readOpencodeConfig("global", "");
  if (!config.exists) {
    throw new Error("全局配置文件不存在");
  }
  if (!config.content) {
    throw new Error("全局配置文件内容为空");
  }
  return config;
}));

// 测试4: 解析全局配置内容
results.push(test("测试4: 解析全局配置内容", () => {
  const config = readOpencodeConfig("global", "");
  const parsed = parseJsonc(config.content);
  if (!parsed.plugin || !Array.isArray(parsed.plugin)) {
    throw new Error("插件配置格式不正确");
  }
  if (!parsed.plugin.includes("oh-my-opencode")) {
    throw new Error("全局配置中未找到 oh-my-opencode 插件");
  }
  return parsed;
}));

// 测试5: 读取项目配置
results.push(test("测试5: 读取项目配置", () => {
  const config = readOpencodeConfig("project", projectDir);
  if (!config.exists) {
    throw new Error("项目配置文件不存在");
  }
  return config;
}));

// 测试6: 验证 jsonc 优先读取
results.push(test("测试6: 验证 jsonc 优先读取", () => {
  const jsoncPath = join(process.env.HOME, ".config", "opencode", "opencode.jsonc");
  const jsonPath = join(process.env.HOME, ".config", "opencode", "opencode.json");
  
  const resolvedPath = resolveOpencodeConfigPath("global", "");
  
  // 如果 jsonc 存在，应该优先返回 jsonc
  if (existsSync(jsoncPath) && !resolvedPath.includes("jsonc")) {
    throw new Error("应该优先读取 jsonc 文件");
  }
  return resolvedPath;
}));

// 测试7: 验证插件符号链接
results.push(test("测试7: 验证插件符号链接", () => {
  const pluginPath = join(projectDir, ".opencode", "plugin", "oh-my-opencode.ts");
  if (!existsSync(pluginPath)) {
    throw new Error("插件符号链接不存在");
  }
  
  // 检查是否是符号链接
  const fs = require("fs");
  const stats = fs.lstatSync(pluginPath);
  if (!stats.isSymbolicLink()) {
    throw new Error("插件文件不是符号链接");
  }
  
  // 检查目标路径
  const target = fs.readlinkSync(pluginPath);
  if (!target.includes("plugin-oh-my-opencode")) {
    throw new Error(`符号链接目标不正确: ${target}`);
  }
  
  return { path: pluginPath, target };
}));

// 测试8: 验证 oh-my-opencode.json 配置
results.push(test("测试8: 验证 oh-my-opencode.json 配置", () => {
  const configPath = join(process.env.HOME, ".config", "opencode", "oh-my-opencode.json");
  if (!existsSync(configPath)) {
    throw new Error("oh-my-opencode.json 配置文件不存在");
  }
  
  const content = readFileSync(configPath, "utf-8");
  const parsed = JSON.parse(content);
  
  if (!parsed.hooks || !parsed.hooks["unified-flow"]) {
    throw new Error("unified-flow hook 未配置");
  }
  
  if (parsed.disabled_hooks && parsed.disabled_hooks.includes("unified-flow")) {
    throw new Error("unified-flow hook 被禁用了");
  }
  
  return parsed;
}));

// 汇总结果
console.log("\n" + "=".repeat(60));
const passed = results.filter(r => r.passed).length;
const total = results.length;

console.log(`\n📊 测试结果: ${passed}/${total} 通过`);

if (passed === total) {
  console.log("✅ 所有测试通过！OpenWork Desktop 集成成功！\n");
  console.log("📝 配置摘要:");
  console.log(`   - 全局配置: ${resolveOpencodeConfigPath("global", "")}`);
  console.log(`   - 项目配置: ${resolveOpencodeConfigPath("project", projectDir)}`);
  console.log(`   - 插件符号链接: ${join(projectDir, ".opencode/plugin/oh-my-opencode.ts")}`);
  process.exit(0);
} else {
  console.log("❌ 部分测试失败，请检查配置\n");
  results.filter(r => !r.passed).forEach(r => {
    console.log(`   - ${r.name}: ${r.error}`);
  });
  process.exit(1);
}
