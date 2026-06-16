#!/usr/bin/env bash
# Sobe o projeto para um repositório GitHub vazio (Mac/Linux).
set -e
echo "============================================================"
echo "  Subir projeto no GitHub"
echo "============================================================"
echo
echo "Passo 1: crie um repositório VAZIO e PÚBLICO em https://github.com/new"
echo "         (NÃO marque README, .gitignore ou license)."
echo
read -rp "URL do repositório (https://github.com/usuario/repo.git): " REPO
[ -z "$REPO" ] && { echo "URL vazia. Abortando."; exit 1; }

command -v git >/dev/null 2>&1 || { echo "Git não encontrado. Instale: https://git-scm.com"; exit 1; }

[ -d .git ] || git init
git config user.name  >/dev/null 2>&1 || git config user.name  "Matheus Siqueira"
git config user.email >/dev/null 2>&1 || git config user.email "matheus.siqueira@futebolderua.org"

git add .
git commit -m "Protótipo inicial: reconhecimento facial (face-api.js + Node.js + SQLite)" || true
git branch -M main
git remote remove origin >/dev/null 2>&1 || true
git remote add origin "$REPO"

echo
echo "Enviando..."
git push -u origin main
echo
echo "Pronto! Código enviado para: $REPO"
