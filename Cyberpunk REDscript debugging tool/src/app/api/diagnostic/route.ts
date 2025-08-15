import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'

interface DiagnosticResult {
  gameInstalled: boolean
  macosVersion: string
  macosCompatible: boolean
  redscriptInstalled: boolean
  redscriptCompiled: boolean
  launchSuccess: boolean
  issues: Array<{
    severity: 'high' | 'medium' | 'low'
    title: string
    description: string
  }>
  libraries: Array<{
    name: string
    path: string
    found: boolean
    loadingInfo?: string
  }>
  permissions: Array<{
    path: string
    permissions: string
    accessible: boolean
    owner?: string
  }>
  gogGalaxy: {
    running: boolean
    authenticated: boolean
    issues: string[]
  }
  redscript: {
    installed: boolean
    compiled: boolean
    compilationLog?: string
    scripts?: string[]
  }
}

function executeCommand(command: string): Promise<{ stdout: string; stderr: string; success: boolean }> {
  return new Promise((resolve) => {
    exec(command, (error: any, stdout: string, stderr: string) => {
      resolve({
        stdout,
        stderr,
        success: !error
      })
    })
  })
}

async function checkGameInstallation(): Promise<{
  installed: boolean
  executablePath: string
  issues: string[]
}> {
  const gamePath = '/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/MacOS/Cyberpunk2077'
  const issues: string[] = []
  
  try {
    const { success } = await executeCommand(`test -f "${gamePath}"`)
    
    if (!success) {
      issues.push('Game executable not found at expected location')
      return { installed: false, executablePath: gamePath, issues }
    }

    const { success: dirSuccess } = await executeCommand(`test -d "/Applications/Cyberpunk 2077"`)
    if (!dirSuccess) {
      issues.push('Game installation directory not found')
    }

    const { stdout: permOutput } = await executeCommand(`ls -la "${gamePath}"`)
    if (!permOutput.includes('-rwx')) {
      issues.push('Game executable lacks execute permissions')
    }

    return { 
      installed: success && dirSuccess, 
      executablePath: gamePath, 
      issues 
    }
  } catch (error) {
    issues.push(`Error checking game installation: ${error}`)
    return { installed: false, executablePath: gamePath, issues }
  }
}

async function checkMacOSVersion(): Promise<{
  version: string
  compatible: boolean
  issues: string[]
}> {
  const issues: string[] = []
  
  try {
    const { stdout, success } = await executeCommand('sw_vers -productVersion')
    
    if (!success) {
      issues.push('Unable to determine macOS version')
      return { version: 'Unknown', compatible: false, issues }
    }

    const version = stdout.trim()
    const versionParts = version.split('.').map(Number)
    const major = versionParts[0]
    const minor = versionParts[1] || 0

    const compatible = major > 15 || (major === 15 && minor >= 5)
    
    if (!compatible) {
      issues.push(`macOS ${version} is below minimum requirement (15.5+)`)
    }

    return { version, compatible, issues }
  } catch (error) {
    issues.push(`Error checking macOS version: ${error}`)
    return { version: 'Unknown', compatible: false, issues }
  }
}

async function checkLibraries(): Promise<{
  libraries: DiagnosticResult['libraries']
  issues: string[]
}> {
  const libraries: DiagnosticResult['libraries'] = []
  const issues: string[] = []
  
  const requiredLibs = [
    { name: 'libBink2MacArm64.dylib', path: '/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/Frameworks/libBink2MacArm64.dylib' },
    { name: 'libGalaxy.dylib', path: '/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/Frameworks/libGalaxy.dylib' },
    { name: 'libGameServicesGOG.dylib', path: '/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/Frameworks/libGameServicesGOG.dylib' },
    { name: 'libREDGalaxy64.dylib', path: '/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/Frameworks/libREDGalaxy64.dylib' }
  ]

  for (const lib of requiredLibs) {
    try {
      const { success } = await executeCommand(`test -f "${lib.path}"`)
      
      let loadingInfo = ''
      if (success) {
        const { stdout: otoolOutput } = await executeCommand(`otool -L "${lib.path}"`)
        loadingInfo = `Dependencies: ${otoolOutput.split('\n').length - 1}`
      } else {
        issues.push(`Required library missing: ${lib.name}`)
      }

      libraries.push({
        name: lib.name,
        path: lib.path,
        found: success,
        loadingInfo
      })
    } catch (error) {
      issues.push(`Error checking library ${lib.name}: ${error}`)
      libraries.push({
        name: lib.name,
        path: lib.path,
        found: false,
        loadingInfo: `Error: ${error}`
      })
    }
  }

  return { libraries, issues }
}

async function checkPermissions(): Promise<{
  permissions: DiagnosticResult['permissions']
  issues: string[]
}> {
  const permissions: DiagnosticResult['permissions'] = []
  const issues: string[] = []
  
  const pathsToCheck = [
    '/Applications/Cyberpunk 2077',
    '/Applications/Cyberpunk 2077/Cyberpunk2077.app',
    '/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/MacOS',
    '/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/MacOS/Cyberpunk2077',
    '/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/Frameworks'
  ]

  for (const path of pathsToCheck) {
    try {
      const { stdout: lsOutput, success } = await executeCommand(`ls -la "${path}"`)
      
      if (!success) {
        issues.push(`Cannot access path: ${path}`)
        permissions.push({
          path,
          permissions: 'No access',
          accessible: false
        })
        continue
      }

      const { stdout: statOutput } = await executeCommand(`stat -f "%Sp %Su" "${path}"`)
      const [perms, owner] = statOutput.trim().split(' ')
      
      const accessible = perms.includes('r') && (perms.includes('x') || !path.includes('Cyberpunk2077'))
      
      if (!accessible) {
        issues.push(`Insufficient permissions for: ${path}`)
      }

      permissions.push({
        path,
        permissions: perms,
        accessible,
        owner
      })
    } catch (error) {
      issues.push(`Error checking permissions for ${path}: ${error}`)
      permissions.push({
        path,
        permissions: 'Error checking',
        accessible: false
      })
    }
  }

  return { permissions, issues }
}

async function checkGOGGalaxy(): Promise<{
  running: boolean
  authenticated: boolean
  issues: string[]
}> {
  const issues: string[] = []
  
  try {
    const { success: galaxyRunning } = await executeCommand('pgrep -f "GOG Galaxy" > /dev/null 2>&1')
    
    if (!galaxyRunning) {
      issues.push('GOG Galaxy is not running')
      return { running: false, authenticated: false, issues }
    }

    const { stdout: processes } = await executeCommand('ps aux | grep -i "gog galaxy" | grep -v grep')
    const galaxyProcesses = processes.trim().split('\n').filter(line => line.length > 0)
    
    let authenticated = false
    for (const process of galaxyProcesses) {
      if (process.includes('--authenticated') || process.includes('--logged-in')) {
        authenticated = true
        break
      }
    }

    if (!authenticated) {
      issues.push('GOG Galaxy may not be authenticated')
    }

    const { success: galaxySocket } = await executeCommand('test -S /tmp/gog_galaxy_socket 2>/dev/null')
    if (!galaxySocket) {
      issues.push('GOG Galaxy socket not found')
    }

    return { running: galaxyRunning, authenticated, issues }
  } catch (error) {
    issues.push(`Error checking GOG Galaxy: ${error}`)
    return { running: false, authenticated: false, issues }
  }
}

async function checkREDscript(): Promise<{
  installed: boolean
  compiled: boolean
  compilationLog?: string
  scripts?: string[]
  issues: string[]
}> {
  const issues: string[] = []
  
  try {
    const redscriptPaths = [
      '/Applications/Cyberpunk 2077/archive/pc/mod',
      '/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/Resources/red4ext',
      '~/Library/Application Support/Cyberpunk 2077/red4ext'
    ]

    let installed = false
    let redscriptPath = ''

    for (const path of redscriptPaths) {
      const { success } = await executeCommand(`test -d "${path}"`)
      if (success) {
        installed = true
        redscriptPath = path
        break
      }
    }

    if (!installed) {
      issues.push('REDscript mod directory not found')
      return { installed: false, compiled: false, issues }
    }

    const { stdout: scriptFiles } = await executeCommand(`find "${redscriptPath}" -name "*.reds" 2>/dev/null`)
    const scripts = scriptFiles.trim().split('\n').filter(file => file.length > 0)

    if (scripts.length === 0) {
      issues.push('No REDscript files (.reds) found')
    }

    const { stdout: compileLog } = await executeCommand(`cd "${redscriptPath}" && ls -la *.reds 2>/dev/null || echo "No .reds files"`)
    
    let compiled = false
    if (scripts.length > 0) {
      const { success: compiledFiles } = await executeCommand(`test -f "${redscriptPath}/r6/scripts/compiled.reds" 2>/dev/null`)
      compiled = compiledFiles
      
      if (!compiled) {
        issues.push('REDscript files not compiled')
      }
    }

    return { 
      installed, 
      compiled, 
      compilationLog: compileLog,
      scripts: scripts.length > 0 ? scripts : undefined,
      issues 
    }
  } catch (error) {
    issues.push(`Error checking REDscript: ${error}`)
    return { installed: false, compiled: false, issues }
  }
}

async function testGameLaunch(): Promise<{
  success: boolean
  issues: string[]
}> {
  const issues: string[] = []
  
  try {
    const gamePath = '/Applications/Cyberpunk 2077/Cyberpunk2077.app/Contents/MacOS/Cyberpunk2077'
    
    const { stdout: dyldOutput } = await executeCommand(`DYLD_PRINT_LIBRARIES=1 timeout 5s "${gamePath}" 2>&1 || echo "Launch completed/failed"`)
    
    if (dyldOutput.includes('dyld: Library not loaded')) {
      issues.push('Dynamic library loading failed')
      const libError = dyldOutput.match(/dyld: Library not loaded: (.+)/)
      if (libError) {
        issues.push(`Missing library: ${libError[1]}`)
      }
    }

    if (dyldOutput.includes('Segmentation fault') || dyldOutput.includes('Bus error')) {
      issues.push('Game crashed during launch')
    }

    if (dyldOutput.includes('Permission denied')) {
      issues.push('Permission denied during launch')
    }

    const success = !issues.some(issue => 
      issue.includes('library loading failed') || 
      issue.includes('crashed') || 
      issue.includes('Permission denied')
    )

    return { success, issues }
  } catch (error) {
    issues.push(`Error testing game launch: ${error}`)
    return { success: false, issues }
  }
}

export async function POST(request: NextRequest) {
  try {
    const results: DiagnosticResult = {
      gameInstalled: false,
      macosVersion: 'Unknown',
      macosCompatible: false,
      redscriptInstalled: false,
      redscriptCompiled: false,
      launchSuccess: false,
      issues: [],
      libraries: [],
      permissions: [],
      gogGalaxy: {
        running: false,
        authenticated: false,
        issues: []
      },
      redscript: {
        installed: false,
        compiled: false
      }
    }

    const gameCheck = await checkGameInstallation()
    results.gameInstalled = gameCheck.installed
    
    const macosCheck = await checkMacOSVersion()
    results.macosVersion = macosCheck.version
    results.macosCompatible = macosCheck.compatible

    const libCheck = await checkLibraries()
    results.libraries = libCheck.libraries

    const permCheck = await checkPermissions()
    results.permissions = permCheck.permissions

    const gogCheck = await checkGOGGalaxy()
    results.gogGalaxy = {
      running: gogCheck.running,
      authenticated: gogCheck.authenticated,
      issues: gogCheck.issues
    }

    const redscriptCheck = await checkREDscript()
    results.redscriptInstalled = redscriptCheck.installed
    results.redscriptCompiled = redscriptCheck.compiled
    results.redscript = {
      installed: redscriptCheck.installed,
      compiled: redscriptCheck.compiled,
      compilationLog: redscriptCheck.compilationLog,
      scripts: redscriptCheck.scripts
    }

    const launchTest = await testGameLaunch()
    results.launchSuccess = launchTest.success

    const allIssues = [
      ...gameCheck.issues.map(issue => ({ severity: 'high' as const, title: 'Game Installation', description: issue })),
      ...macosCheck.issues.map(issue => ({ severity: 'high' as const, title: 'macOS Version', description: issue })),
      ...libCheck.issues.map(issue => ({ severity: 'high' as const, title: 'Library Issue', description: issue })),
      ...permCheck.issues.map(issue => ({ severity: 'medium' as const, title: 'Permission Issue', description: issue })),
      ...gogCheck.issues.map(issue => ({ severity: 'medium' as const, title: 'GOG Galaxy', description: issue })),
      ...redscriptCheck.issues.map(issue => ({ severity: 'medium' as const, title: 'REDscript', description: issue })),
      ...launchTest.issues.map(issue => ({ severity: 'high' as const, title: 'Launch Test', description: issue }))
    ]

    results.issues = allIssues

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Diagnostic failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}