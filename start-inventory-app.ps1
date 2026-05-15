$ErrorActionPreference = 'Stop'

Set-Location -Path $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host 'Node.js is not installed. Install Node.js LTS from https://nodejs.org/ and rerun this file.' -ForegroundColor Red
  Read-Host 'Press Enter to close'
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host 'npm is not available in this terminal. Reopen PowerShell after installing Node.js and rerun this file.' -ForegroundColor Red
  Read-Host 'Press Enter to close'
  exit 1
}

if (-not (Test-Path -Path 'node_modules')) {
  Write-Host 'Installing dependencies (first run only)...' -ForegroundColor Yellow
  npm install
}

Write-Host ''
Write-Host 'Starting Rio Bravito Inventory...' -ForegroundColor Green
Write-Host 'Use this link on your computer: http://localhost:5173' -ForegroundColor Cyan
Write-Host 'Use this link on your phone (same Wi-Fi): http://<YOUR_COMPUTER_IP>:5173' -ForegroundColor Cyan
Write-Host ''

npm run dev -- --host --open