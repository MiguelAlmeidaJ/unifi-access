# UnifiAccess

Identidade centralizada para aplicações internas.

O UnifiAccess é responsável por **quem o usuário é**. Cada sistema consumidor continua responsável por **o que o usuário pode fazer**.

## Stack

- Next.js 16 + TypeScript
- React 19
- PostgreSQL 17
- Node.js 22+
- `pg` para acesso ao banco
- Argon2id para senhas e segredos
- Docker Compose para o banco local

## Recursos do MVP

- Login por email ou nome de usuário
- Usuários `ADMIN` e `USER`
- Cadastro de usuários
- Nome, usuário, email, senha, CPF, endereço e PIX
- Cadastro de sistemas
- Geração de `clientId` e `clientSecret`
- API para um sistema autenticado consultar uma identidade pelo ID global
- Senhas e segredos armazenados somente como hash Argon2id

## Rodando no Windows

### Pré-requisitos

- Git
- Node.js 22 ou superior
- Docker Desktop com WSL 2

### 1. Clone

```powershell
git clone https://github.com/MiguelAlmeidaJ/unifi-access.git
cd unifi-access
```

### 2. Configure o ambiente

```powershell
Copy-Item .env.example .env
```

Altere pelo menos `SESSION_SECRET` e `ADMIN_PASSWORD` no arquivo `.env`.

### 3. Instale as dependências

```powershell
npm install
```

### 4. Suba o PostgreSQL

```powershell
docker compose up -d
docker compose ps
```

O schema é criado automaticamente na primeira inicialização do volume.

### 5. Crie o admin

```powershell
npm run db:seed
```

### 6. Rode o projeto

```powershell
npm run dev
```

Acesse http://localhost:3000.

## Resetando o banco local

Para apagar os dados e recriar o banco:

```powershell
docker compose down -v
docker compose up -d
npm run db:seed
```

## API de identidade

Ao cadastrar um sistema por `POST /api/systems`, a resposta entrega o `clientId` e o `clientSecret` uma única vez.

Um sistema pode consultar:

```http
GET /api/v1/users/{userId}
x-client-id: sys_...
x-client-secret: ua_...
```

A API nunca retorna senha ou hash da senha do usuário.

> Observação: nesta primeira versão, os dados de CPF/endereço/PIX são retornados ao sistema autenticado. Antes de produção, vamos adicionar escopos de dados por sistema e trilha de auditoria.

## Próximas etapas

- Tela de detalhe/edição de usuário
- Ativar/desativar usuários e sistemas
- Rotação de client secret
- Escopos de dados por sistema
- Auditoria
- Recuperação/troca de senha
- Fluxo SSO/OpenID Connect
