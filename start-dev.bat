@echo off
echo ============================================
echo Q-Manager - Iniciando em modo desenvolvimento
echo ============================================
echo.

echo Iniciando Backend e Frontend...
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo Swagger: http://localhost:3000/api/docs
echo.

start cmd /k "cd backend && npm run start:dev"
start cmd /k "cd frontend && npm run dev"

echo.
echo Servidores iniciados em janelas separadas!
echo Feche esta janela apos os servidores iniciarem.
echo.
pause
