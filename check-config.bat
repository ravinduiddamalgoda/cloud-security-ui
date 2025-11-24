@echo off
REM Configuration Status Checker for Windows
REM Verifies frontend-backend integration setup

echo.
echo ==============================================
echo    SIEM Dashboard Configuration Status Check
echo ==============================================
echo.

echo Environment Configuration:
if exist ".env" (
    echo    [OK] .env file exists
    
    findstr /C:"REACT_APP_USE_MOCK_DATA=true" .env >nul
    if %errorlevel% equ 0 (
        echo    [INFO] Mode: MOCK DATA ^(Development^)
        echo    [INFO] No backend required
    ) else (
        findstr /C:"REACT_APP_USE_MOCK_DATA=false" .env >nul
        if %errorlevel% equ 0 (
            echo    [INFO] Mode: API ^(Production^)
            echo    [WARN] Backend required
        ) else (
            echo    [WARN] REACT_APP_USE_MOCK_DATA not set
        )
    )
    
    for /f "tokens=2 delims==" %%a in ('findstr "REACT_APP_API_URL=" .env') do (
        echo    [INFO] API URL: %%a
    )
) else (
    echo    [ERROR] .env file not found
    echo    [TIP] Run: copy .env.example .env
)

echo.
echo Dependencies:
if exist "node_modules\" (
    echo    [OK] node_modules installed
) else (
    echo    [ERROR] node_modules not found
    echo    [TIP] Run: npm install
)

echo.
echo Backend Status:
findstr /C:"REACT_APP_USE_MOCK_DATA=false" .env >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2 delims==" %%a in ('findstr "REACT_APP_API_URL=" .env') do (
        echo    [INFO] Checking backend at %%a
        curl -s --max-time 3 "%%a/api/health" >nul 2>&1
        if %errorlevel% equ 0 (
            echo    [OK] Backend is reachable
        ) else (
            echo    [ERROR] Backend not reachable
            echo    [TIP] Start backend: cd ..\SIEM_Tool_AWS ^&^& python app.py
            echo    [TIP] Or switch to mock mode
        )
    )
) else (
    echo    [INFO] Using mock data mode - backend not required
)

echo.
echo Project Structure:
set FILES=src\AdvancedDashboard.jsx src\axiosConfig.js package.json INTEGRATION_GUIDE.md QUICK_START.md
for %%f in (%FILES%) do (
    if exist "%%f" (
        echo    [OK] %%f
    ) else (
        echo    [ERROR] %%f
    )
)

echo.
echo ==============================================
echo Quick Commands:
echo    Development ^(mock data^):  npm run start:mock
echo    Development ^(with API^):   npm run start:api
echo    Standard start:           npm start
echo    Production build:         npm run build:production
echo.
echo Documentation:
echo    Quick Start:    type QUICK_START.md
echo    Full Guide:     type INTEGRATION_GUIDE.md
echo    Main README:    type README.md
echo ==============================================
echo.

if exist ".env" (
    if exist "node_modules\" (
        echo [OK] Setup looks good! Ready to run.
        exit /b 0
    )
)

echo [WARN] Setup incomplete. Review the checks above.
exit /b 1
