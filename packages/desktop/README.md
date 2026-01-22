# OpenCode Desktop

Native OpenCode desktop app, built with Tauri v2.

## Download

Pre-built binaries are available for download from [GitHub Releases](https://github.com/hzm8341/opencode_hzm/releases).

### Supported Platforms

| Platform              | Architecture | Download                                                                                    |
| --------------------- | ------------ | ------------------------------------------------------------------------------------------- |
| macOS (Apple Silicon) | ARM64        | [OpenCode_1.1.4_macOS.dmg](https://github.com/hzm8341/opencode_hzm/releases/download/v0.1/OpenCode_1.1.4_macOS.dmg) |
| macOS (Intel)         | x64          | Coming soon                                                                                 |
| Windows               | x64          | [OpenCode.exe](https://github.com/hzm8341/opencode_hzm/releases/download/v0.1/OpenCode.exe) |
| Linux (Ubuntu/Debian) | x64          | [opencode_0.0.0-dev-202601221306_amd64.deb](https://github.com/hzm8341/opencode_hzm/releases/download/v0.1/opencode_0.0.0-dev-202601221306_amd64.deb) |

### Installation

#### macOS

1. Download the `.dmg` file
2. Double-click to open
3. Drag `OpenCode.app` to `Applications` folder
4. Launch from Applications

**Note**: If macOS shows a security warning, right-click the DMG or app and select "Open".

#### Windows

1. Download `OpenCode.exe` and `sidecars/opencode-cli-x86_64-pc-windows-msvc.exe`
2. Place both files in the same directory
3. Run `OpenCode.exe`

**System Requirements**: Windows 10 or higher, WebView2 Runtime

#### Linux (Ubuntu/Debian)

```bash
# Install DEB package
sudo dpkg -i opencode_0.0.0-dev-202601221306_amd64.deb
sudo apt-get install -f  # If dependency issues occur

# Verify installation
opencode --version
```

**System Requirements**: Ubuntu 18.04+ / Debian 10+, amd64 architecture

## Development

From the repo root:

```bash
bun install
bun run --cwd packages/desktop tauri dev
```

This starts the Vite dev server on http://localhost:1420 and opens the native window.

If you only want the web dev server (no native shell):

```bash
bun run --cwd packages/desktop dev
```

## Build

To create a production `dist/` and build the native app bundle:

```bash
bun run --cwd packages/desktop tauri build
```

### Building DMG for macOS

To build a DMG installer for macOS:

```bash
# Development version
bun run --cwd packages/desktop build:dmg

# Production version (recommended)
bun run --cwd packages/desktop build:dmg:prod
```

The DMG file will be created in `packages/desktop/dist/`.

## Prerequisites

Running the desktop app requires additional Tauri dependencies (Rust toolchain, platform-specific libraries). See the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for setup instructions.
