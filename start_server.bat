@echo off
echo Starting Nomad Travel Portal backend server...
start /B cmd /c "npm start"

echo Starting Nomad Travel Portal local frontend server...
echo.
echo Please keep this window open while you test the app.
echo Once the server starts, open your browser to: http://localhost:8080/public/index.html
echo.
npx http-server -p 8080
