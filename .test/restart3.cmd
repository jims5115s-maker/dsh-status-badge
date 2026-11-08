@echo off
rem Restart the desktop shell. Point DSH_EXE at your own install before running.
if "%DSH_EXE%"=="" set "DSH_EXE=DeepSeek Harness.exe"
timeout /t 6 /nobreak >nul
taskkill /F /IM "DeepSeek Harness.exe" >nul 2>&1
timeout /t 8 /nobreak >nul
taskkill /F /IM "DeepSeek Harness.exe" >nul 2>&1
timeout /t 4 /nobreak >nul
start "" "%DSH_EXE%" %DSH_ARGS%
