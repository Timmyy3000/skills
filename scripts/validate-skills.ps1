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

# Keep the source folder stable for existing installs while accepting the
# published skill name used by the Artifact Viewer package.
$skillNameAliases = @{
    "artifact-viewer" = @("artifact-viewer-publishing")
}

$releaseVersionFile = Join-Path $repoRoot "VERSION"
if (-not (Test-Path $releaseVersionFile)) {
    throw "Missing repository release version: $releaseVersionFile"
}

$releaseVersion = (Get-Content -Raw $releaseVersionFile).Trim()
if ($releaseVersion -notmatch '^(0|[1-9]\d*)\.\d+\.\d+([+-][0-9A-Za-z.-]+)?$') {
    throw "Invalid repository release SemVer '$releaseVersion' in $releaseVersionFile"
}

$skillVersions = @{}

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
    $allowedNames = @($dir.Name)
    if ($skillNameAliases.ContainsKey($dir.Name)) {
        $allowedNames += $skillNameAliases[$dir.Name]
    }

    if ($name -notin $allowedNames) {
        throw "Skill name '$name' does not match folder '$($dir.Name)' or its allowed aliases '$($allowedNames -join ', ')' in $skillFile"
    }

    $version = ($Matches[3].Trim().Trim('"').Trim("'"))
    if ($version -notmatch '^(0|[1-9]\d*)\.\d+\.\d+([+-][0-9A-Za-z.-]+)?$') {
        throw "Invalid SemVer '$version' in $skillFile"
    }

    $skillVersions[$dir.Name] = $version
}

if ($skillVersions["kickoff"] -ne $releaseVersion) {
    throw "Kickoff version '$($skillVersions["kickoff"])' must match repository release '$releaseVersion' because its preflight uses VERSION."
}

Write-Host "Validated $($skillDirs.Count) skills."
