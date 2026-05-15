@echo off
set SCRIPT_DIR=%~dp0
powershell -NoLogo -ExecutionPolicy Bypass -File "%SCRIPT_DIR%start-inventory-app.ps1"