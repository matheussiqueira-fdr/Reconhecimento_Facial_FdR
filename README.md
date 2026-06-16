# Controle de Acesso por Reconhecimento Facial

Sistema de reconhecimento facial para controle de acesso, projetado para substituir
um legado baseado em impressão digital. Arquitetura enxuta e acessível:

- **Frontend**: JavaScript puro (sem framework, sem build, sem instalação), roda direto no navegador.
- **face-api.js**: detecção e reconhecimento facial no próprio navegador.
- **API**: Node.js + Express — autenticação, registros de acesso, permissões por perfil (RBAC).
- **Banco**: SQLite **embutido no Node** (`node:sqlite`), trocável por PostgreSQL. Armazena **apenas os descriptors** (vetor de 128 números) junto aos dados cadastrais — **nunca as imagens dos rostos**. Sem dependência nativa para compilar.

## Por que essa arquitetura

- **Manutenção simplificada**: atualizar o software é um *deploy*, não um chamado técnico em campo (sem leitor físico para manter).
- **Experiência fluida**: acesso sem contato físico, sem fila, sem depender de o leitor digital estar funcionando.
- **Postura defensável sob LGPD**: o processamento do rosto acontece localmente no navegador e o servidor guarda apenas o *descriptor* (representação matemática não reversível para a imagem original). Não centralizamos imagens biométricas em servidor.
- **Liveness pela operação**: o acesso ocorre sempre com um operador físico presente acompanhando. Uma tentativa com foto impressa é barrada no próprio fluxo presencial.

## Estrutura

```
.
├── server/                 # API Node.js (Express)
│   ├── index.js            # entrada: API + arquivos estáticos
│   ├── db.js               # SQLite + esquema (system_users, people, access_logs)
│   ├── auth.js             # JWT + RBAC (requireAuth, requireRole)
│   ├── seed.js             # cria o admin inicial
│   ├── lib/match.js        # distância euclidiana + melhor correspondência
│   └── routes/             # auth, people, recognize, logs
├── public/                 # frontend estático (sem build)
│   ├── index.html          # login
│   ├── enroll.html         # cadastro de pessoas (admin)
│   ├── station.html        # estação de acesso (operador)
│   ├── logs.html           # auditoria (admin)
│   ├── js/                 # api, nav, faceapi-config + scripts de página
│   ├── css/styles.css
│   └── models/             # (opcional) pesos da face-api.js para modo offline
└── scripts/download-models.mjs
```

## Como rodar (teste rápido — 2 comandos)

Pré-requisito: **Node.js 22.5+** (LTS atual — usa o SQLite embutido). Confira com `node -v`.

```bash
npm install
npm start
```

Pronto. Abra **http://localhost:3000** no navegador.

O `npm start` cria automaticamente o usuário admin na primeira vez. Os modelos da
face-api.js são carregados via CDN, então não há nada para baixar. Login inicial:
**admin / admin123** (defina em `.env`, veja abaixo).

### Configuração opcional (`.env`)

```bash
cp .env.example .env   # ajuste JWT_SECRET, senha do admin, limiar, etc.
```

### Modo offline (sem CDN)

Para não depender da internet em tempo de execução, baixe os modelos e use-os localmente:

```bash
npm run download-models
# depois, em public/js/faceapi-config.js, troque MODEL_URL para '/models'
```

> A câmera (`getUserMedia`) exige contexto seguro: funciona em `http://localhost`.
> Em rede/produção, sirva por **HTTPS**.

## Perfis (RBAC)

- **admin**: cadastra/edita/remove pessoas, vê os registros de acesso e usa a estação.
- **operador**: usa apenas a estação de acesso (verificação + registro).

## Fluxo de reconhecimento

1. O navegador captura o rosto e calcula o *descriptor* localmente (face-api.js).
2. Só o vetor de 128 números é enviado a `POST /api/recognize`.
3. O servidor compara (distância euclidiana) com os descriptors cadastrados ativos.
4. Se a menor distância ≤ `MATCH_THRESHOLD`, acesso liberado; caso contrário, negado.
5. Toda tentativa é registrada em `access_logs` (auditoria), com o operador responsável.

`MATCH_THRESHOLD` padrão = `0.55` (a face-api.js recomenda 0.6; menor = mais rígido).

## Endpoints da API

| Método | Rota                | Perfil          | Descrição                          |
|--------|---------------------|-----------------|------------------------------------|
| POST   | `/api/auth/login`   | público         | login, retorna JWT                 |
| GET    | `/api/auth/me`      | autenticado     | dados do usuário logado            |
| GET    | `/api/people`       | autenticado     | lista pessoas (sem descriptor)     |
| POST   | `/api/people`       | admin           | cadastra pessoa (+ descriptor)     |
| PATCH  | `/api/people/:id`   | admin           | edita / ativa / desativa           |
| DELETE | `/api/people/:id`   | admin           | remove                             |
| POST   | `/api/recognize`    | operador/admin  | matching + registro de acesso      |
| GET    | `/api/logs`         | admin           | registros de acesso (auditoria)    |

## Migrar para PostgreSQL

A lógica de matching (`server/lib/match.js`) é independente do banco. Para migrar:
substitua `server/db.js` por uma conexão `pg`, ajuste tipos no esquema (`TEXT`→`JSONB`
ou a extensão `pgvector` para o descriptor, `INTEGER PRIMARY KEY`→`SERIAL`) e adapte as
queries. Com `pgvector` é possível indexar os descriptors e fazer o matching no próprio banco.

## Segurança / produção

- Troque `JWT_SECRET` e a senha padrão do admin.
- Sirva por HTTPS (obrigatório para câmera fora de `localhost` e para proteger o token).
- Considere rate limiting em `/api/auth/login` e `/api/recognize`.
- Mantenha a política: **nunca** persistir imagens — apenas descriptors.
