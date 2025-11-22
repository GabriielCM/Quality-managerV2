@echo off
echo ============================================
echo Q-Manager - Instalacao Automatica
echo ============================================
echo.

echo [1/5] Instalando dependencias do backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do backend!
    pause
    exit /b 1
)
echo.

echo [2/5] Gerando Prisma Client...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo Erro ao gerar Prisma Client!
    pause
    exit /b 1
)
echo.

echo [3/5] Criando tabelas no banco de dados...
call npm run prisma:migrate
if %errorlevel% neq 0 (
    echo Erro ao criar tabelas! Verifique a conexao com o banco de dados.
    echo Certifique-se de que o PostgreSQL esta rodando e o arquivo .env esta configurado corretamente.
    pause
    exit /b 1
)
echo.

echo [4/5] Populando banco de dados com dados iniciais...
call npm run prisma:seed
if %errorlevel% neq 0 (
    echo Erro ao popular banco de dados!
    pause
    exit /b 1
)
echo.

echo [5/5] Instalando dependencias do frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do frontend!
    pause
    exit /b 1
)
echo.

cd ..

echo ============================================
echo Instalacao concluida com sucesso!
echo ============================================
echo.
echo Para iniciar o sistema:
echo.
echo 1. Backend:
echo    cd backend
echo    npm run start:dev
echo.
echo 2. Frontend (em outro terminal):
echo    cd frontend
echo    npm run dev
echo.
echo Credenciais:
echo - Admin: admin@qmanager.com / admin123
echo - User:  user@qmanager.com / admin123
echo.
echo Acesse: http://localhost:5173
echo API Docs: http://localhost:3000/api/docs
echo ============================================
pause
