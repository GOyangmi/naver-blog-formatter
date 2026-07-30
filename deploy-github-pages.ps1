param(
  [string]$RepoName = "",
  [string]$Domain = "subpathlaboratory.com",
  [string]$AdsenseClient = "ca-pub-5607762816055463",
  [string]$ExpectedOwner = "",
  [switch]$NonInteractive
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

function Run([string]$Label, [scriptblock]$Command) {
  Write-Host "`n▶ $Label" -ForegroundColor Cyan
  & $Command
  $exitCode = $LASTEXITCODE
  if ($null -ne $exitCode -and $exitCode -ne 0) {
    throw "$Label 단계에서 오류가 발생했습니다. (종료 코드: $exitCode)"
  }
}

function Require-Winget {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "자동 설치에 필요한 winget을 찾지 못했습니다. Microsoft App Installer를 설치한 뒤 다시 실행하세요."
  }
}

function Refresh-ToolPaths {
  $paths = @(
    "$env:ProgramFiles\Git\cmd",
    "$env:ProgramFiles\GitHub CLI",
    "$env:LOCALAPPDATA\Programs\GitHub CLI"
  )
  foreach ($path in $paths) {
    if ((Test-Path $path) -and (($env:Path -split ';') -notcontains $path)) {
      $env:Path += ";$path"
    }
  }
}

Write-Host "원문결 문단 정리기 · GitHub Pages 자동 배포" -ForegroundColor Green
Write-Host "GitHub 로그인, 저장소 생성, 업로드, Pages, 도메인, AdSense 파일 설정을 진행합니다."

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Require-Winget
  Run "Git 설치" {
    winget install --id Git.Git --exact --source winget --accept-package-agreements --accept-source-agreements
  }
  Refresh-ToolPaths
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Require-Winget
  Run "GitHub CLI 설치" {
    winget install --id GitHub.cli --exact --source winget --accept-package-agreements --accept-source-agreements
  }
  Refresh-ToolPaths
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git 설치 후 현재 창에서 명령을 찾지 못했습니다. 이 창을 닫고 DEPLOY-NOW.cmd를 한 번 더 실행하세요."
}
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "GitHub CLI 설치 후 현재 창에서 명령을 찾지 못했습니다. 이 창을 닫고 DEPLOY-NOW.cmd를 한 번 더 실행하세요."
}

& gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "`n브라우저에서 GitHub 로그인을 승인하면 배포가 자동으로 계속됩니다." -ForegroundColor Yellow
  Run "GitHub 로그인" {
    gh auth login --hostname github.com --git-protocol https --web
  }
}

$owner = (& gh api user --jq .login).Trim()
if (-not $owner) { throw "GitHub 계정명을 확인하지 못했습니다." }

if ($ExpectedOwner -and $owner -ine $ExpectedOwner) {
  throw "현재 로그인 계정은 '$owner'입니다. 이 패키지의 대상 계정 '$ExpectedOwner'로 GitHub CLI에 로그인한 뒤 다시 실행하세요."
}

if ([string]::IsNullOrWhiteSpace($RepoName)) {
  if ($NonInteractive) {
    $RepoName = "naver-blog-formatter"
  } else {
    $defaultRepo = "naver-blog-formatter"
    $inputRepo = Read-Host "저장소 이름 [$defaultRepo]"
    $RepoName = if ([string]::IsNullOrWhiteSpace($inputRepo)) { $defaultRepo } else { $inputRepo }
  }
}
if ($RepoName -notmatch '^[A-Za-z0-9._-]+$') {
  throw "저장소 이름에는 영문, 숫자, 점, 밑줄, 하이픈만 사용할 수 있습니다."
}

if (-not $NonInteractive) {
  $inputDomain = Read-Host "연결할 루트 도메인 [$Domain]"
  if (-not [string]::IsNullOrWhiteSpace($inputDomain)) { $Domain = $inputDomain }

  $maskedPublisher = $AdsenseClient -replace '^ca-', ''
  $inputAdsense = Read-Host "AdSense 게시자 ID [$maskedPublisher]"
  if (-not [string]::IsNullOrWhiteSpace($inputAdsense)) { $AdsenseClient = $inputAdsense }
}

& (Join-Path $Root 'configure-site.ps1') -Domain $Domain -AdsenseClient $AdsenseClient -GithubOwner $owner
if ($LASTEXITCODE -ne 0) { throw "사이트 설정 파일 생성에 실패했습니다." }

if (-not (Test-Path '.git')) {
  Run "Git 저장소 초기화" { git init -b main }
}

& git config user.name *> $null
if ($LASTEXITCODE -ne 0) { git config user.name $owner }
& git config user.email *> $null
if ($LASTEXITCODE -ne 0) { git config user.email "$owner@users.noreply.github.com" }

Run "배포 파일 추가" { git add --all }
$hasChanges = & git status --porcelain
if ($hasChanges) {
  Run "배포 커밋 생성" { git commit -m "Deploy Naver blog formatter with AdSense setup" }
}

$repoSlug = "$owner/$RepoName"
$repoUrl = "https://github.com/$repoSlug"
$remoteUrl = "$repoUrl.git"

& gh repo view $repoSlug *> $null
if ($LASTEXITCODE -ne 0) {
  Run "공개 GitHub 저장소 생성 및 업로드" {
    gh repo create $repoSlug --public --description "원문을 보존하며 네이버 블로그용 문단으로 정리하는 브라우저 도구" --source . --remote origin --push
  }
} else {
  & git remote get-url origin *> $null
  if ($LASTEXITCODE -ne 0) {
    git remote add origin $remoteUrl
  } else {
    git remote set-url origin $remoteUrl
  }
  Run "기존 저장소에 업로드" { git push -u origin main }
}

$pagesPayload = @{ source = @{ branch = 'main'; path = '/' } } | ConvertTo-Json -Depth 4 -Compress
$pagesPayload | gh api --method POST "repos/$repoSlug/pages" --input - *> $null
if ($LASTEXITCODE -ne 0) {
  $pagesPayload | gh api --method PUT "repos/$repoSlug/pages" --input - *> $null
  if ($LASTEXITCODE -ne 0) {
    throw "GitHub Pages 설정에 실패했습니다. 저장소 Settings > Pages에서 main / (root)를 선택하세요."
  }
}

$domainPayload = @{ cname = $Domain; source = @{ branch = 'main'; path = '/' } } | ConvertTo-Json -Depth 4 -Compress
$domainPayload | gh api --method PUT "repos/$repoSlug/pages" --input - *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "사용자 도메인 자동 등록은 실패했지만 기본 GitHub Pages 배포는 완료됐습니다." -ForegroundColor Yellow
}

& gh api --method POST "repos/$repoSlug/pages/builds" *> $null

$defaultUrl = "https://$owner.github.io/$RepoName/"
$customUrl = "https://$Domain/"
$publisher = $AdsenseClient -replace '^ca-', ''

$info = @"
배포 완료 정보
================
GitHub 계정: $owner
GitHub 저장소: $repoUrl
GitHub Pages 기본 주소: $defaultUrl
사용자 도메인 목표 주소: $customUrl
AdSense 게시자: $publisher

자동 완료 항목
- 공개 저장소 생성 또는 업데이트
- main 브랜치 업로드
- GitHub Pages 활성화
- 사용자 도메인 설정 요청
- AdSense 코드 활성화
- ads.txt, CNAME, robots.txt, sitemap.xml 생성

계정/도메인 사업자 화면에서 확인할 항목
1. 도메인 DNS에 DNS-SETUP.txt의 A 레코드 4개와 www CNAME을 등록합니다.
2. GitHub 저장소 Settings > Pages에서 DNS check와 HTTPS 상태를 확인합니다.
3. AdSense > Sites에서 경로나 하위도메인이 아닌 루트 도메인 $Domain 을 추가합니다.
4. 사이트 연결 확인 후 검토를 요청하고, Ads에서 Auto ads를 켭니다.
5. Privacy & messaging에서 필요한 지역의 Google 인증 CMP 메시지를 설정합니다.

광고 코드는 홈, 가독성 가이드, 원문 보존 원칙 페이지에만 로드됩니다.
사용자 원문이 표시되는 formatter.html에는 광고 코드가 로드되지 않습니다.
"@
Set-Content -LiteralPath (Join-Path $Root 'deployment-info.txt') -Value $info -Encoding UTF8

Write-Host "`nGitHub 업로드와 Pages 설정 요청을 마쳤습니다." -ForegroundColor Green
Write-Host "저장소: $repoUrl"
Write-Host "기본 Pages: $defaultUrl"
Write-Host "사용자 도메인: $customUrl"
Write-Host "`n이제 DNS-SETUP.txt의 DNS 값만 도메인 관리 화면에 등록하고 AdSense 사이트 검토를 요청하세요." -ForegroundColor Yellow

try { Start-Process "$repoUrl/settings/pages" } catch {}
try { Start-Process "https://dash.cloudflare.com/" } catch {}
try { Start-Process "https://adsense.google.com/start/" } catch {}
Read-Host "확인하려면 Enter"
