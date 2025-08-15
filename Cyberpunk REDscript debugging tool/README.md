# 🎮 Cyberpunk 2077 + REDscript Mod Diagnostic Tool

A comprehensive diagnostic and troubleshooting tool for macOS Cyberpunk 2077 launch issues with REDscript mod integration.

## 🚀 Overview

This tool helps diagnose and resolve common issues when trying to launch Cyberpunk 2077 on macOS with the REDscript mod installed. It provides detailed analysis of:

- Game installation and file integrity
- Dynamic library dependencies and loading issues
- File and directory permissions
- GOG Galaxy integration status
- REDscript mod installation and compilation
- Game launch simulation with detailed logging

## ✨ Features

### 🔍 Comprehensive Diagnostics
- **Game Installation Check**: Verifies Cyberpunk 2077 installation at `/Applications/Cyberpunk 2077/`
- **macOS Compatibility**: Checks if your macOS version meets requirements (15.5+)
- **Library Analysis**: Examines all required .dylib files and dependencies
- **Permission Verification**: Ensures proper file permissions for game and mod files
- **GOG Galaxy Status**: Checks GOG Galaxy client integration and authentication
- **REDscript Mod Analysis**: Validates mod installation and compilation status

### 🎯 Issue Detection
- **High Priority Issues**: Missing game files, incompatible macOS, library failures
- **Medium Priority Issues**: Permission problems, GOG Galaxy integration, REDscript compilation
- **Low Priority Issues**: Configuration suggestions and optimization recommendations

### 📊 Detailed Reporting
- **Tabbed Interface**: Organized diagnostic results across multiple categories
- **Real-time Analysis**: Live diagnostic execution with progress feedback
- **Actionable Insights**: Clear problem descriptions and suggested solutions
- **Exportable Results**: Comprehensive diagnostic data for further analysis

## 🚀 Quick Start

### Prerequisites
- macOS 15.5 or later
- Cyberpunk 2077 installed from GOG
- Node.js 18+ (for running the diagnostic tool)
- Terminal access with administrator privileges

### Installation & Usage

1. **Clone or download the diagnostic tool**
   ```bash
   # If you have the project repository
   git clone <repository-url>
   cd cyberpunk-diagnostic-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the diagnostic server**
   ```bash
   npm run dev
   ```

4. **Open the diagnostic interface**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Click "Run Full Diagnostic" to begin analysis

5. **Review the results**
   - Check the **Overview** tab for system status summary
   - Examine specific areas in dedicated tabs (Libraries, Permissions, GOG Galaxy, REDscript)
   - Follow recommended actions for any detected issues

## 🔧 Diagnostic Components

### 🎮 Game Installation Check
- Verifies game executable exists at `/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/MacOS/Cyberpunk2077`
- Checks game installation directory structure
- Validates executable permissions
- Ensures all required game files are present

### 📚 Library Dependency Analysis
- Examines required dynamic libraries:
  - `libBink2MacArm64.dylib`
  - `libGalaxy.dylib`
  - `libGameServicesGOG.dylib`
  - `libREDGalaxy64.dylib`
- Checks library integrity and dependencies
- Analyzes loading order and potential conflicts

### 🔐 Permission Verification
- Checks file and directory permissions for:
  - Game installation directory
  - Application bundle
  - Executable files
  - Framework libraries
- Verifies read/write/execute permissions
- Checks file ownership and access rights

### 🌐 GOG Galaxy Integration
- Detects if GOG Galaxy client is running
- Verifies authentication status
- Checks GOG Galaxy socket availability
- Validates game integration points

### 📜 REDscript Mod Analysis
- Detects REDscript mod installation
- Checks mod directory structure
- Verifies script compilation status
- Analyzes installed .reds files
- Reviews compilation logs for errors

### 🚀 Launch Simulation
- Simulates game launch with `DYLD_PRINT_LIBRARIES=1`
- Captures detailed loading information
- Identifies launch failure points
- Provides crash analysis and error reporting

## 🛠️ Common Issues & Solutions

### Issue: Game executable not found
**Symptom**: "Game Installation: Not Found" in overview
**Solution**: 
- Verify Cyberpunk 2077 is installed in `/Applications/Cyberpunk 2077/`
- Check if the game was installed from GOG (not Steam)
- Reinstall the game if necessary

### Issue: Missing dynamic libraries
**Symptom**: Red badges in Libraries tab, "Library not loaded" errors
**Solution**:
- Verify all required .dylib files exist in `Frameworks/` directory
- Check library permissions and ownership
- Reinstall the game to restore missing libraries

### Issue: Permission denied
**Symptom**: "No Access" badges in Permissions tab
**Solution**:
- Open Terminal and run: `chmod +x "/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/MacOS/Cyberpunk2077"`
- Fix directory permissions: `chmod -R 755 "/Applications/Cyberpunk 2077"`
- Ensure your user has ownership: `sudo chown -R $USER "/Applications/Cyberpunk 2077"`

### Issue: GOG Galaxy not running
**Symptom**: "GOG Galaxy: Not Running" in overview
**Solution**:
- Launch GOG Galaxy client
- Ensure you're logged in to your GOG account
- Verify Cyberpunk 2077 is linked to your GOG account
- Restart GOG Galaxy if necessary

### Issue: REDscript not compiled
**Symptom**: "REDscript: Failed" compilation status
**Solution**:
- Verify REDscript mod is properly installed
- Check mod directory structure
- Review compilation logs for specific errors
- Ensure all required dependencies are installed
- Try recompiling the mod

### Issue: Game crashes on launch
**Symptom**: Process IDs appear but game exits immediately
**Solution**:
- Review library loading information
- Check for segmentation faults or bus errors
- Verify all system requirements are met
- Try launching without mods first
- Check for conflicting software

## 🔧 Advanced Troubleshooting

### Manual Library Loading Analysis
For deeper analysis, you can run library loading commands manually:

```bash
# Check what libraries are being loaded
cd "/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/MacOS"
DYLD_PRINT_LIBRARIES=1 ./Cyberpunk2077

# Check library dependencies
otool -L "/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/Frameworks/libBink2MacArm64.dylib"
```

### Permission Repair
To fix permission issues system-wide:

```bash
# Repair game permissions
sudo chown -R $USER:staff "/Applications/Cyberpunk 2077"
sudo chmod -R 755 "/Applications/Cyberpunk 2077"

# Make executable
chmod +x "/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/MacOS/Cyberpunk2077"
```

### REDscript Manual Compilation
If automatic compilation fails:

```bash
# Navigate to mod directory
cd "/Applications/Cyberpunk 2077/archive/pc/mod"

# Manual compilation (if REDscript compiler is available)
# This depends on your specific REDscript setup
```

## 📊 Technical Details

### System Requirements
- **macOS**: 15.5 or later
- **Architecture**: Apple Silicon (ARM64) or Intel x86_64
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Storage**: 70GB available space for game installation
- **GOG Galaxy**: Latest version with active account

### Diagnostic Process
1. **Initial Assessment**: System overview and basic compatibility checks
2. **Deep Analysis**: Comprehensive examination of each component
3. **Issue Identification**: Categorization and prioritization of problems
4. **Solution Recommendations**: Actionable steps for resolution
5. **Launch Testing**: Simulated game launch with detailed logging

### Security Considerations
- All diagnostic operations are read-only by default
- No game files are modified during analysis
- Permission checks respect system security settings
- Diagnostic data is processed locally and not transmitted externally

## 🤝 Contributing

This diagnostic tool is designed to help the Cyberpunk 2077 macOS community. If you encounter issues not covered by this tool or have suggestions for improvements:

1. **Report Issues**: Provide detailed logs and system information
2. **Suggest Features**: Recommend additional diagnostic capabilities
3. **Share Solutions**: Contribute working fixes for common problems
4. **Test Updates**: Help validate diagnostic accuracy

## 📋 Troubleshooting Checklist

Before running the diagnostic tool, ensure:

- [ ] Cyberpunk 2077 is installed from GOG (not Steam)
- [ ] Game is installed in `/Applications/Cyberpunk 2077/`
- [ ] macOS version is 15.5 or later
- [ ] GOG Galaxy is installed and logged in
- [ ] REDscript mod is properly installed
- [ ] Sufficient disk space is available
- [ ] No conflicting software is running
- [ ] System meets minimum requirements

## 🚀 Getting Help

If the diagnostic tool doesn't resolve your issue:

1. **Check Logs**: Review all diagnostic tabs for detailed information
2. **Search Online**: Look for similar issues in Cyberpunk 2077 macOS communities
3. **GOG Support**: Contact GOG support for game-specific issues
4. **Mod Communities**: Seek help in REDscript mod forums
5. **Apple Support**: For macOS-specific system issues

---

Built with ❤️ for the Cyberpunk 2077 macOS community. May your game launch successfully! 🎮✨
