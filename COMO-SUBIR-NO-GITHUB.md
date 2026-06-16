# Como subir este projeto no GitHub

Você só precisa fazer **duas coisas**: criar um repositório vazio e rodar um script.

## Passo 1 — Criar o repositório (vazio) no GitHub

1. Acesse **https://github.com/new** (faça login se pedir).
2. Em **Repository name**, dê um nome, ex.: `reconhecimento-facial-fdr`.
3. Deixe marcado **Public** (público).
4. **NÃO** marque nenhuma das opções "Add a README", "Add .gitignore" nem "Choose a license".
   (O projeto já tem esses arquivos; marcar causaria conflito.)
5. Clique em **Create repository**.
6. Na página seguinte, copie a **URL** que termina em `.git`
   (ex.: `https://github.com/seu-usuario/reconhecimento-facial-fdr.git`).

## Passo 2 — Rodar o script

Na pasta do projeto:

- **Windows**: dê dois cliques em **`subir-no-github.bat`**
  (ou clique direito → "Executar"). Cole a URL quando ele pedir.
- **Mac/Linux**: abra o terminal na pasta e rode:
  ```
  bash subir-no-github.sh
  ```

O script vai: iniciar o repositório local, fazer o primeiro commit e enviar tudo
para o GitHub. Na primeira vez, pode abrir uma janelinha pedindo seu **login do GitHub** —
é normal, basta autorizar.

> Pré-requisito: ter o **Git** instalado.
> Windows: https://git-scm.com/download/win  •  Mac: `brew install git`

## Pronto!

Quando terminar, recarregue a página do repositório no GitHub e o código estará lá.
Agora é só **convidar o time** em: repositório → **Settings** → **Collaborators** → **Add people**.

---

### Se preferir fazer na mão (sem o script)

Na pasta do projeto, com o Git instalado:

```
git init
git add .
git commit -m "Protótipo inicial: reconhecimento facial"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

### O que vai (e o que não vai) para o GitHub

Já está tudo configurado no `.gitignore`. **Não** sobem: `node_modules/`, o banco
`data/`, arquivos `.env` (segredos) e os `.zip`. **Sobe** todo o código-fonte, o
`README.md`, o `package-lock.json` e a documentação.
