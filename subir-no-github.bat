@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ============================================================
echo   Subir projeto no GitHub
echo ============================================================
echo.
echo Passo 1: crie um repositorio VAZIO e PUBLICO no GitHub:
echo    https://github.com/new
echo    - De um nome (ex: reconhecimento-facial-fdr)
echo    - NAO marque "Add a README", ".gitignore" nem "license"
echo    - Clique em "Create repository"
echo.
echo Passo 2: copie a URL que aparece (termina em .git) e cole abaixo.
echo.
set /p REPO="URL do repositorio (https://github.com/usuario/repo.git): "
if "!REPO!"=="" echo URL vazia. Abortando. & pause & exit /b 1

where git >nul 2>&1
if errorlevel 1 (
  echo.
  echo Git nao encontrado. Instale em: https://git-scm.com/download/win
  echo Depois rode este arquivo de novo.
  pause & exit /b 1
)

if not exist ".git" git init
git config user.name  >nul 2>&1 || git config user.name  "Matheus Siqueira"
git config user.email >nul 2>&1 || git config user.email "matheus.siqueira@futebolderua.org"

git add .
git commit -m "Prototipo inicial: reconhecimento facial (face-api.js + Node.js + SQLite)"
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin "!REPO!"

echo.
echo Enviando... (pode abrir uma janela pedindo seu login do GitHub)
git push -u origin main
if errorlevel 1 (
  echo.
  echo Algo deu errado no envio. Veja a mensagem acima.
  pause & exit /b 1
)
echo.
echo ============================================================
echo   Pronto! Codigo enviado para: !REPO!
echo ============================================================
pause
