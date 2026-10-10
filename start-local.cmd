@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js bulunamadi. Once Node.js 18 veya daha yenisini kurun.
  pause
  exit /b 1
)
start "" http://127.0.0.1:4173
node server.js
pause
