@echo off
title Recorte - editor (NAO FECHE esta janela)
cd /d "%~dp0"

echo.
echo   RECORTE - editor de animacao
echo   ----------------------------
echo.

rem --- ja esta ligado? entao so abre o navegador ---
netstat -ano | findstr /c:":5173" | findstr /i "LISTENING" >nul 2>nul
if not errorlevel 1 (
  echo   O editor JA ESTAVA ligado. Abrindo o navegador.
  start "" http://localhost:5173
  echo.
  echo   Esta janela pode fechar. Quem segura o editor e a outra janela.
  echo.
  pause
  exit /b 0
)

rem --- o Node esta instalado? ---
where node >nul 2>nul
if errorlevel 1 (
  echo   [ERRO] O Node.js nao esta instalado neste computador.
  echo   Baixe em https://nodejs.org e instale. Depois rode este atalho de novo.
  echo.
  pause
  exit /b 1
)

rem --- primeira vez? instala ---
if not exist "node_modules\vite" (
  echo   Primeira vez: instalando o que falta. Isso demora alguns minutos.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo   [ERRO] A instalacao falhou. Me mostre esta janela.
    pause
    exit /b 1
  )
)

echo   Ligando o editor. O navegador abre sozinho em instantes.
echo.
echo   Enquanto voce trabalha, DEIXE esta janela aberta.
echo   Para desligar o editor, feche esta janela.
echo.

call npm run editor -- --open

echo.
echo   O editor foi desligado.
pause
