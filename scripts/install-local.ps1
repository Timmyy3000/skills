param(
    [string[]] $Skills = @(),
    [string[]] $Agents = @(),
    [switch] $Global,
    [switch] $Copy,
    [switch] $Yes
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$argsList = @("skills", "add", $repoRoot.Path)

foreach ($skill in $Skills) {
    if ($skill -and $skill.Trim()) {
        $argsList += @("--skill", $skill.Trim())
    }
}

foreach ($agent in $Agents) {
    if ($agent -and $agent.Trim()) {
        $argsList += @("--agent", $agent.Trim())
    }
}

if ($Global) {
    $argsList += "--global"
}

if ($Copy) {
    $argsList += "--copy"
}

if ($Yes) {
    $argsList += "--yes"
}

Write-Host "Running: npx $($argsList -join ' ')"
& npx @argsList
