$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$skillsRoot = Join-Path $repoRoot "skills"

if (-not (Test-Path $skillsRoot)) {
    throw "Missing skills directory: $skillsRoot"
}

$skillDirs = Get-ChildItem -Directory $skillsRoot
if ($skillDirs.Count -eq 0) {
    throw "No skills found in $skillsRoot"
}

foreach ($dir in $skillDirs) {
    $skillFile = Join-Path $dir.FullName "SKILL.md"
    if (-not (Test-Path $skillFile)) {
        throw "Missing SKILL.md in $($dir.FullName)"
    }

    $content = Get-Content -Raw $skillFile
    if ($content -notmatch '(?s)^---\s+.*?name:\s*([^\r\n]+).*?description:\s*([^\r\n]+).*?version:\s*([^\r\n]+).*?---') {
        throw "Invalid frontmatter in $skillFile"
    }

    $name = ($Matches[1].Trim().Trim('"').Trim("'"))
    if ($name -ne $dir.Name) {
        throw "Skill name '$name' does not match folder '$($dir.Name)' in $skillFile"
    }

    $version = ($Matches[3].Trim().Trim('"').Trim("'"))
    if ($version -notmatch '^(0|[1-9]\d*)\.\d+\.\d+([+-][0-9A-Za-z.-]+)?$') {
        throw "Invalid SemVer '$version' in $skillFile"
    }
}

Write-Host "Validated $($skillDirs.Count) skills."
