'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export default function Home() {
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostic = async () => {
    setIsRunning(true)
    try {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const results = await response.json()
      setDiagnosticResults(results)
    } catch (error) {
      console.error('Diagnostic failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Cyberpunk 2077 + REDscript Mod Diagnostic Tool</h1>
        <p className="text-muted-foreground">
          Comprehensive troubleshooting for macOS Cyberpunk 2077 launch issues with REDscript mod
        </p>
      </div>

      <div className="mb-6 flex justify-center">
        <Button 
          onClick={runDiagnostic} 
          disabled={isRunning}
          size="lg"
          className="w-full max-w-md"
        >
          {isRunning ? 'Running Diagnostic...' : 'Run Full Diagnostic'}
        </Button>
      </div>

      {diagnosticResults && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="libraries">Libraries</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="gog">GOG Galaxy</TabsTrigger>
            <TabsTrigger value="redscript">REDscript</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>General system and game installation status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Game Installation</h4>
                    <Badge variant={diagnosticResults.gameInstalled ? "default" : "destructive"}>
                      {diagnosticResults.gameInstalled ? "Found" : "Not Found"}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold">macOS Version</h4>
                    <Badge variant={diagnosticResults.macosCompatible ? "default" : "destructive"}>
                      {diagnosticResults.macosVersion}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold">REDscript Mod</h4>
                    <Badge variant={diagnosticResults.redscriptInstalled ? "default" : "destructive"}>
                      {diagnosticResults.redscriptInstalled ? "Installed" : "Not Found"}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold">Launch Status</h4>
                    <Badge variant={diagnosticResults.launchSuccess ? "default" : "destructive"}>
                      {diagnosticResults.launchSuccess ? "Working" : "Failing"}
                    </Badge>
                  </div>
                </div>

                {diagnosticResults.issues && diagnosticResults.issues.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Detected Issues</h4>
                      <div className="space-y-2">
                        {diagnosticResults.issues.map((issue: any, index: number) => (
                          <Alert key={index} variant={issue.severity === "high" ? "destructive" : "default"}>
                            <AlertTitle>{issue.title}</AlertTitle>
                            <AlertDescription>{issue.description}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="libraries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Library Dependencies</CardTitle>
                <CardDescription>Analysis of required dynamic libraries</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full">
                  <div className="space-y-3">
                    {diagnosticResults.libraries?.map((lib: any, index: number) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{lib.name}</h4>
                          <Badge variant={lib.found ? "default" : "destructive"}>
                            {lib.found ? "Found" : "Missing"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{lib.path}</p>
                        {lib.loadingInfo && (
                          <p className="text-xs text-muted-foreground">{lib.loadingInfo}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>File Permissions</CardTitle>
                <CardDescription>Check file and directory permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full">
                  <div className="space-y-3">
                    {diagnosticResults.permissions?.map((perm: any, index: number) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{perm.path}</h4>
                          <Badge variant={perm.accessible ? "default" : "destructive"}>
                            {perm.accessible ? "Accessible" : "No Access"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Permissions: {perm.permissions}</p>
                        {perm.owner && (
                          <p className="text-xs text-muted-foreground">Owner: {perm.owner}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gog" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>GOG Galaxy Integration</CardTitle>
                <CardDescription>GOG Galaxy client and authentication status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">GOG Galaxy Running</h4>
                    <Badge variant={diagnosticResults.gogGalaxy?.running ? "default" : "destructive"}>
                      {diagnosticResults.gogGalaxy?.running ? "Running" : "Not Running"}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold">Authentication</h4>
                    <Badge variant={diagnosticResults.gogGalaxy?.authenticated ? "default" : "destructive"}>
                      {diagnosticResults.gogGalaxy?.authenticated ? "Authenticated" : "Not Authenticated"}
                    </Badge>
                  </div>
                </div>

                {diagnosticResults.gogGalaxy?.issues && diagnosticResults.gogGalaxy.issues.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">GOG Galaxy Issues</h4>
                      <div className="space-y-2">
                        {diagnosticResults.gogGalaxy.issues.map((issue: string, index: number) => (
                          <Alert key={index} variant="default">
                            <AlertTitle>GOG Galaxy Issue</AlertTitle>
                            <AlertDescription>{issue}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redscript" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>REDscript Mod Status</CardTitle>
                <CardDescription>REDscript mod installation and compilation status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Mod Installed</h4>
                    <Badge variant={diagnosticResults.redscript?.installed ? "default" : "destructive"}>
                      {diagnosticResults.redscript?.installed ? "Installed" : "Not Found"}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold">Compilation Status</h4>
                    <Badge variant={diagnosticResults.redscript?.compiled ? "default" : "destructive"}>
                      {diagnosticResults.redscript?.compiled ? "Compiled" : "Failed"}
                    </Badge>
                  </div>
                </div>

                {diagnosticResults.redscript?.compilationLog && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Compilation Log</h4>
                      <ScrollArea className="h-64 w-full">
                        <pre className="text-xs bg-muted p-3 rounded">
                          {diagnosticResults.redscript.compilationLog}
                        </pre>
                      </ScrollArea>
                    </div>
                  </>
                )}

                {diagnosticResults.redscript?.scripts && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Installed Scripts</h4>
                      <ScrollArea className="h-32 w-full">
                        <div className="space-y-1">
                          {diagnosticResults.redscript.scripts.map((script: string, index: number) => (
                            <div key={index} className="text-sm p-2 bg-muted rounded">
                              {script}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!diagnosticResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🎮 Game Installation Check</CardTitle>
              <CardDescription>Verify Cyberpunk 2077 installation and file integrity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Checks if the game is properly installed in /Applications/Cyberpunk 2077/ and verifies all required files are present.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔧 Library Analysis</CardTitle>
              <CardDescription>Analyze dynamic library dependencies and loading issues</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Examines all required .dylib files, checks their integrity, and analyzes loading order and dependencies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔐 Permission Verification</CardTitle>
              <CardDescription>Check file and directory permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verifies that the game and mod files have proper read/write/execute permissions for the current user.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🌐 GOG Galaxy Status</CardTitle>
              <CardDescription>Check GOG Galaxy integration and authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verifies GOG Galaxy is running, authenticated, and properly integrated with the game.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📜 REDscript Mod Analysis</CardTitle>
              <CardDescription>Analyze REDscript mod installation and compilation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Checks REDscript mod installation, compilation status, and identifies any script-related issues.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🚀 Launch Simulation</CardTitle>
              <CardDescription>Simulate game launch with detailed logging</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Attempts to launch the game with comprehensive logging to identify exactly where the launch process fails.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}