# Como abrir o sistema — passo a passo bem fácil

Siga na ordem. É como montar um brinquedo: um passinho de cada vez.

---

## Parte 1 — Instalar o "motorzinho" (só na primeira vez)

O sistema precisa de um programa chamado **Node.js** para funcionar.
É de graça e você instala uma vez só.

1. Abra seu navegador (Chrome, Edge…).
2. Vá no site: **https://nodejs.org**
3. Clique no botão grande que diz **"LTS"** (é a versão recomendada).
4. Abra o arquivo que baixou e clique em **"Avançar / Next"** até o fim, depois **"Concluir / Finish"**.

Pronto! O motorzinho está instalado.

> Dica: se já tiver o Node instalado, ele precisa ser a versão **22 ou maior**.

---

## Parte 2 — Abrir a "caixa de comandos" na pasta certa

1. Abra o **Explorador de Arquivos** (a pastinha amarela na barra de baixo).
2. Entre na pasta do projeto:
   **Reconhecimento Facial - FdR**
3. Clique uma vez na **barra de endereço** lá em cima (onde aparece o caminho da pasta).
4. Apague o que estiver escrito, digite **`powershell`** e aperte **Enter**.

Vai abrir uma janelinha preta ou azul. É a "caixa de comandos". Não se assuste: você só vai digitar duas frases nela.

---

## Parte 3 — Ligar o sistema

Na janelinha que abriu, digite **exatamente** isto e aperte **Enter**:

```
npm install
```

Espere. Vão aparecer várias letrinhas se mexendo (é normal, ele está se preparando).
Quando parar e voltar a piscar o cursor, digite a segunda frase e aperte **Enter**:

```
npm start
```

Quando aparecer uma mensagem assim:

```
Servidor rodando em http://localhost:3000
```

…o sistema está **ligado**! Deixe essa janelinha **aberta** (se fechar, o sistema desliga).

---

## Parte 4 — Entrar no sistema

1. Abra o navegador.
2. Na barra de endereço, digite:
   **http://localhost:3000**
   e aperte **Enter**.
3. Vai aparecer a tela de entrar. Digite:
   - **Usuário:** `admin`
   - **Senha:** `admin123`
4. Clique em **Entrar**.

---

## Parte 5 — Deixar a câmera funcionar

O navegador vai perguntar se pode usar a **câmera**. Clique em **"Permitir"**.
(Sem isso, o rosto não aparece.)

---

## Parte 6 — Cadastrar um rosto

1. Você estará na tela **Cadastro**.
2. Escreva o **nome** da pessoa no campinho.
3. Olhe para a câmera, com o rosto bem na frente e com luz.
4. Clique em **"Capturar rosto e cadastrar"**.
5. Vai aparecer "cadastrado com sucesso". Pronto!

---

## Parte 7 — Testar o acesso

1. Lá em cima, clique em **"Estação de Acesso"**.
2. Olhe para a câmera.
3. Clique em **"Verificar acesso"**.
4. Se for a mesma pessoa cadastrada, aparece em verde: **ACESSO LIBERADO** com o nome.
   Se for outra pessoa, aparece em vermelho: **ACESSO NEGADO**.

É isso! Você testou o reconhecimento facial.

---

## Para desligar

Volte na janelinha preta/azul e aperte ao mesmo tempo as teclas:
**Ctrl** + **C**

Ou simplesmente feche a janelinha.

---

## Se der algum errinho

- **"npm não é reconhecido"**: o Node.js não foi instalado direito. Refaça a Parte 1 e **reinicie o computador**.
- **A câmera não liga**: confira se clicou em "Permitir". Feche outros programas que usam a câmera (Zoom, Teams…).
- **A página não abre**: confirme que a janelinha está mostrando "Servidor rodando…". Se não, digite `npm start` de novo.
- **Pede senha e diz que está errada**: use exatamente `admin` e `admin123` (tudo minúsculo, sem espaço).
