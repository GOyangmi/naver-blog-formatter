param(
  [string]$Domain = "subpathlaboratory.com",
  [string]$AdsenseClient = "ca-pub-5607762816055463",
  [string]$GithubOwner = "GOyangmi"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Assert-Domain([string]$Value) {
  if ($Value -notmatch '^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$') {
    throw "도메인 형식이 올바르지 않습니다: $Value"
  }
}

Assert-Domain $Domain
$Domain = $Domain.ToLowerInvariant()
$AdsenseClient = $AdsenseClient.Trim()

if ($AdsenseClient -and $AdsenseClient -notmatch '^ca-pub-\d{16}$') {
  throw "AdSense 게시자 ID는 ca-pub- 뒤에 숫자 16자리 형식이어야 합니다."
}

$configPath = Join-Path $Root 'assets\config.js'
$enabled = if ($AdsenseClient) { 'true' } else { 'false' }
$config = @"
window.SUBPATH_SITE_CONFIG = Object.freeze({
  siteName: "원문결 문단 정리기",
  siteUrl: "https://$Domain",
  adsenseEnabled: $enabled,
  adsenseClient: "$AdsenseClient",
  updatedAt: "$(Get-Date -Format 'yyyy-MM-dd')"
});
"@
Set-Content -LiteralPath $configPath -Value $config -Encoding UTF8

if ($AdsenseClient) {
  $publisher = $AdsenseClient -replace '^ca-', ''
  Set-Content -LiteralPath (Join-Path $Root 'ads.txt') -Value "google.com, $publisher, DIRECT, f08c47fec0942fa0`n" -Encoding ASCII
} else {
  Set-Content -LiteralPath (Join-Path $Root 'ads.txt') -Value "# AdSense publisher ID가 아직 설정되지 않았습니다.`n" -Encoding UTF8
}

Set-Content -LiteralPath (Join-Path $Root 'CNAME') -Value "$Domain`n" -Encoding ASCII

$robots = "User-agent: *`nAllow: /`n`nSitemap: https://$Domain/sitemap.xml`n"
Set-Content -LiteralPath (Join-Path $Root 'robots.txt') -Value $robots -Encoding ASCII

$htmlFiles = Get-ChildItem -LiteralPath $Root -Filter '*.html' -File
foreach ($file in $htmlFiles) {
  $html = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
  $pagePath = if ($file.Name -eq 'index.html') { '/' } else { '/' + $file.Name }
  $canonical = "https://$Domain$pagePath"
  $html = [regex]::Replace(
    $html,
    '<link rel="canonical" href="[^"]*"\s*/>',
    "<link rel=`"canonical`" href=`"$canonical`" />"
  )

  $metaPattern = '<meta name="google-adsense-account" content="[^"]*"\s*/>'
  if ($AdsenseClient) {
    $meta = "<meta name=`"google-adsense-account`" content=`"$AdsenseClient`" />"
    if ($html -match $metaPattern) {
      $html = [regex]::Replace($html, $metaPattern, $meta)
    } else {
      $html = $html -replace '(<meta name="viewport"[^>]*>\s*)', "`$1`n  $meta`n  "
    }
  } else {
    $html = [regex]::Replace($html, "\s*$metaPattern", '')
  }

  Set-Content -LiteralPath $file.FullName -Value $html -Encoding UTF8
}

$pages = @('', 'formatter.html', 'guide.html', 'preservation.html', 'about.html', 'privacy.html', 'terms.html', 'contact.html')
$today = Get-Date -Format 'yyyy-MM-dd'
$urlLines = foreach ($page in $pages) {
  "  <url><loc>https://$Domain/$page</loc><lastmod>$today</lastmod></url>"
}
$sitemap = @("<?xml version=`"1.0`" encoding=`"UTF-8`"?>", '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">') + $urlLines + @('</urlset>')
Set-Content -LiteralPath (Join-Path $Root 'sitemap.xml') -Value ($sitemap -join "`n") -Encoding UTF8

if ($GithubOwner) {
  $dns = @"
GitHub Pages 사용자: $GithubOwner
사용할 도메인: $Domain

루트 도메인 A 레코드 (@):
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153

www CNAME:
$GithubOwner.github.io

중요:
- 기존 웹사이트가 연결돼 있다면 A/CNAME 변경 전에 영향을 확인하세요.
- Google Workspace 메일용 MX 레코드와 도메인 인증용 TXT 레코드는 삭제하지 마세요.
- GitHub 저장소 Settings > Pages에서 Custom domain과 HTTPS 상태를 확인하세요.
"@
  Set-Content -LiteralPath (Join-Path $Root 'DNS-SETUP.txt') -Value $dns -Encoding UTF8
}

Write-Host "사이트 설정 완료" -ForegroundColor Green
Write-Host "도메인: https://$Domain"
Write-Host "AdSense: $(if ($AdsenseClient) { '코드, 계정 메타 태그, ads.txt 활성화' } else { '비활성화' })"
