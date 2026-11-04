@echo off
title Recorte - editor pronto (NAO FECHE esta janela)
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   [ERRO] O Node.js nao esta instalado neste computador.
  echo   Baixe em https://nodejs.org e instale. Depois rode este atalho de novo.
  echo.
  pause
  exit /b 1
)

node servidor.mjs

echo.
echo   O editor foi desligado.
pause
