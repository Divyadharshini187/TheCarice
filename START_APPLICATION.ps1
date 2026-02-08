# The Carice - Full Application Startup Script
# This script starts both the backend Flask server and opens the frontend in a browser

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Starting The Carice Application" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$venvPath = Join-Path $projectRoot ".venv"
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"

# Check if virtual environment exists
if (-not (Test-Path $activateScript)) {
    Write-Host "ERROR: Virtual environment not found at $venvPath" -ForegroundColor Red
    Write-Host "Please run: python -m venv .venv" -ForegroundColor Yellow
    exit 1
}

# Activate virtual environment
Write-Host "`nActivating Python virtual environment..." -ForegroundColor Green
& $activateScript

# Check if required packages are installed
Write-Host "Checking dependencies..." -ForegroundColor Green
$requiredPackages = @("flask", "flask-cors", "livekit", "livekit-agents", "python-dotenv")
foreach ($package in $requiredPackages) {
    python -c "import $($package.Replace('-', '_'))" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Required package '$package' is not installed" -ForegroundColor Red
        Write-Host "Please run: pip install -r requirements.txt" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "All dependencies are installed!" -ForegroundColor Green

# Start the Flask backend server in a new window
Write-Host "`nStarting Flask backend server..." -ForegroundColor Green
$flaskCommand = {
    Set-Location $backendDir
    & $activateScript
    python server.py
}

# Create a new PowerShell window for the backend
$flaskProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location $projectRoot; & '$activateScript'; Set-Location $backendDir; python server.py" -PassThru
Write-Host "Backend server started (PID: $($flaskProcess.Id))" -ForegroundColor Green

# Wait for server to start
Write-Host "`nWaiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Check if server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 2 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "Backend server is running successfully!" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING: Could not verify server status, but it may still be starting..." -ForegroundColor Yellow
}

# Open the application in the default browser
Write-Host "`nOpening application in browser..." -ForegroundColor Green
Start-Sleep -Seconds 1
Start-Process "http://localhost:5000"

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "The Carice has started!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "Frontend:    http://localhost:5000" -ForegroundColor White
Write-Host "`nPress Ctrl+C in the backend window to stop the server" -ForegroundColor Yellow
