@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  원문결 문단 정리기 - GOyangmi GitHub Pages 즉시 배포
echo  GitHub 로그인 승인 후 나머지 단계는 자동으로 진행됩니다.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-github-pages.ps1" -RepoName "naver-blog-formatter" -Domain "subpathlaboratory.com" -AdsenseClient "ca-pub-5607762816055463" -ExpectedOwner "GOyangmi" -NonInteractive
if errorlevel 1 (
  echo.
  echo 배포 중 오류가 발생했습니다. 위 오류 내용을 확인해 주세요.
  pause
)
