@echo off
echo Starting Satarkar Jewellers Development Servers...
echo.

:: Start Backend in a new window
echo Starting Backend...
start cmd /k "npm run start:backend"

:: Start Frontend in current window (or another one)
echo Starting Frontend...
start cmd /k "npm run start:frontend"

echo.
echo Both servers are starting in separate windows.
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
pause
