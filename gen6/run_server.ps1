Set-Location -LiteralPath $PSScriptRoot

if (Get-Command python -ErrorAction SilentlyContinue) {
  python -m http.server 5173
  exit $LASTEXITCODE
}

Write-Host "Python not found. Install Python or use another static server." -ForegroundColor Yellow
Write-Host "Example: dotnet serve --port 5173" -ForegroundColor Yellow
exit 1
