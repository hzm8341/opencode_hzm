# ============================================================
# OpenCode Windows Environment Setup Script (Full Version)
# ============================================================
# Features:
#   1. Check system requirements
#   2. Install Bun (if not installed)
#   3. Configure PATH environment variable
#   4. Install project dependencies
#   5. Verify installation
#   6. Optional: Configure API keys
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\setup-windows-environment-en.ps1
#   Or right-click script -> "Run with PowerShell"
# ============================================================

#Requires -Version 5.1

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Color output functions
function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n========================================" -ForegroundColor $Color
    Write-Host $Message -ForegroundColor $Color
    Write-Host "========================================`n" -ForegroundColor $Color
}

function Write-Info {
    param([string]$Message)
    Write-Host "  [INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  [OK] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  [!] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "  [ERROR] $Message" -ForegroundColor Red
}

# Check administrator privileges
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check if command exists
function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Get script directory (project root)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = $ScriptDir

# Start installation process
Write-Step "OpenCode Windows Environment Setup Script" "Cyan"
Write-Host "Project Path: $ProjectRoot`n" -ForegroundColor Gray

# ============================================================
# Step 1: Check System Requirements
# ============================================================
Write-Step "Step 1: Checking System Requirements" "Yellow"

# Check Windows version
$osVersion = [System.Environment]::OSVersion.Version
Write-Info "Windows Version: $($osVersion.Major).$($osVersion.Minor)"
if ($osVersion.Major -lt 10) {
    Write-Error "Windows 10 or higher is required"
    exit 1
}
Write-Success "Windows version meets requirements"

# Check PowerShell version
$psVersion = $PSVersionTable.PSVersion
Write-Info "PowerShell Version: $($psVersion.Major).$($psVersion.Minor)"
if ($psVersion.Major -lt 5) {
    Write-Error "PowerShell 5.1 or higher is required"
    exit 1
}
Write-Success "PowerShell version meets requirements"

# Check project directory
if (-not (Test-Path "$ProjectRoot\package.json")) {
    Write-Error "package.json not found. Please ensure you're running this script from the project root directory"
    exit 1
}
Write-Success "Project directory verified"

# ============================================================
# Step 2: Install Bun
# ============================================================
Write-Step "Step 2: Checking and Installing Bun" "Yellow"

$BUN_PATH = "$env:USERPROFILE\.bun\bin"
$BUN_EXE = "$BUN_PATH\bun.exe"

# Check if Bun is already installed
if (Test-Path $BUN_EXE) {
    $bunVersion = & $BUN_EXE --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Bun is already installed: $bunVersion"
    } else {
        Write-Warning "Bun found but cannot run. Will reinstall."
        $needInstallBun = $true
    }
} else {
    Write-Info "Bun is not installed. Starting installation..."
    $needInstallBun = $true
}

# Install Bun
if ($needInstallBun) {
    Write-Info "Installing Bun (this may take a few minutes)..."
    try {
        # Use official installation script
        $installScript = Invoke-WebRequest -Uri "https://bun.sh/install.ps1" -UseBasicParsing
        $installScript.Content | Invoke-Expression
        
        # Verify installation
        Start-Sleep -Seconds 2
        if (Test-Path $BUN_EXE) {
            $bunVersion = & $BUN_EXE --version 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Bun installed successfully: $bunVersion"
            } else {
                Write-Error "Bun cannot run after installation"
                exit 1
            }
        } else {
            Write-Error "Bun installation failed. Please install manually: https://bun.sh"
            exit 1
        }
    } catch {
        Write-Error "Error installing Bun: $($_.Exception.Message)"
        Write-Info "Please install Bun manually: powershell -c `"irm bun.sh/install.ps1 | iex`""
        exit 1
    }
}

# ============================================================
# Step 3: Configure PATH Environment Variable
# ============================================================
Write-Step "Step 3: Configuring PATH Environment Variable" "Yellow"

# Add to current session
$env:PATH += ";$BUN_PATH"
Write-Success "Added to current session PATH"

# Check if already in user PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$pathArray = $currentPath -split ';' | Where-Object { $_ -ne '' }

if ($pathArray -contains $BUN_PATH) {
    Write-Success "Bun is already in user PATH"
} else {
    Write-Info "Adding Bun to user PATH (permanent)..."
    try {
        $newPath = if ($currentPath) { "$currentPath;$BUN_PATH" } else { $BUN_PATH }
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Success "Bun added to user PATH"
        Write-Warning "Please restart PowerShell window for PATH changes to take effect permanently"
    } catch {
        Write-Warning "Cannot add to PATH permanently: $($_.Exception.Message)"
        Write-Info "You can manually add: $BUN_PATH"
    }
}

# ============================================================
# Step 4: Install Project Dependencies
# ============================================================
Write-Step "Step 4: Installing Project Dependencies" "Yellow"

Set-Location $ProjectRoot

# Check node_modules
if (Test-Path "node_modules") {
    Write-Success "Project dependencies are installed"
    
    # Ask if reinstall
    $reinstall = Read-Host "Do you want to reinstall dependencies? (y/N)"
    if ($reinstall -eq 'y' -or $reinstall -eq 'Y') {
        Write-Info "Reinstalling dependencies..."
        Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
        $needInstallDeps = $true
    }
} else {
    Write-Info "Project dependencies are not installed"
    $needInstallDeps = $true
}

# Install dependencies
if ($needInstallDeps) {
    Write-Info "Installing project dependencies (this may take a few minutes)..."
    try {
        & $BUN_EXE install
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Project dependencies installed successfully"
        } else {
            Write-Error "Project dependencies installation failed"
            exit 1
        }
    } catch {
        Write-Error "Error installing dependencies: $($_.Exception.Message)"
        exit 1
    }
}

# ============================================================
# Step 5: Verify Installation
# ============================================================
Write-Step "Step 5: Verifying Installation" "Yellow"

# Verify Bun
Write-Info "Verifying Bun..."
$bunVersion = & $BUN_EXE --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "Bun version: $bunVersion"
} else {
    Write-Error "Bun verification failed"
    exit 1
}

# Verify project structure
Write-Info "Verifying project structure..."
$requiredDirs = @("packages\opencode", "packages\app")
$allExist = $true
foreach ($dir in $requiredDirs) {
    if (Test-Path "$ProjectRoot\$dir") {
        Write-Success "$dir exists"
    } else {
        Write-Error "$dir does not exist"
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Error "Project structure is incomplete"
    exit 1
}

# Verify OpenCode command
Write-Info "Verifying OpenCode command..."
try {
    $opencodeVersion = & $BUN_EXE dev --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "OpenCode command is available"
    } else {
        Write-Warning "OpenCode command verification failed, but it may still work"
    }
} catch {
    Write-Warning "Cannot verify OpenCode command: $($_.Exception.Message)"
}

# ============================================================
# Step 6: Optional Configuration
# ============================================================
Write-Step "Step 6: Optional Configuration" "Yellow"

# Check configuration directory
$configDir = "$env:APPDATA\opencode"
$configFile = "$configDir\opencode.json"

if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    Write-Success "Created configuration directory: $configDir"
}

# Ask about API key configuration
Write-Info "API Key Configuration (Optional)"
$configureApi = Read-Host "Do you want to configure API keys? (y/N)"
if ($configureApi -eq 'y' -or $configureApi -eq 'Y') {
    Write-Info "You can set the following environment variables:"
    Write-Host "  - ANTHROPIC_API_KEY (Claude models)" -ForegroundColor Cyan
    Write-Host "  - OPENAI_API_KEY (GPT models)" -ForegroundColor Cyan
    Write-Host "  - GOOGLE_GENERATIVE_AI_API_KEY (Gemini models)" -ForegroundColor Cyan
    Write-Host ""
    Write-Info "Or edit the configuration file: $configFile"
    Write-Info "Configuration file example:"
    Write-Host @"
{
  `"`$schema`": `"https://opencode.ai/config.json`",
  `"model`": `"anthropic/claude-sonnet-4-20250514`",
  `"default_agent`": `"build`",
  `"provider`": {
    `"anthropic`": {
      `"options`": {
        `"apiKey`": `"{env:ANTHROPIC_API_KEY}`"
      }
    }
  }
}
"@ -ForegroundColor Gray
}

# ============================================================
# Completion
# ============================================================
Write-Step "Installation and Configuration Complete!" "Green"

Write-Host "`nUsage:" -ForegroundColor Yellow
Write-Host "  1. TUI Interface (Recommended):" -ForegroundColor White
Write-Host "     bun dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Run Command:" -ForegroundColor White
Write-Host "     bun dev run `"your question`"" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Web Application Interface:" -ForegroundColor White
Write-Host "     bun run --cwd packages/app dev" -ForegroundColor Cyan
Write-Host "     Then visit http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Server Mode:" -ForegroundColor White
Write-Host "     bun dev serve --port 4096" -ForegroundColor Cyan
Write-Host "     Then visit http://localhost:4096" -ForegroundColor Gray
Write-Host ""

Write-Host "Notes:" -ForegroundColor Yellow
Write-Host "  - If PATH changes don't take effect, restart PowerShell window" -ForegroundColor Gray
Write-Host "  - For detailed usage guide, see USAGE_GUIDE.md" -ForegroundColor Gray
Write-Host "  - Configuration file location: $configFile" -ForegroundColor Gray
Write-Host ""

Write-Success "Environment setup complete! You can start using OpenCode now."
Write-Host ""
