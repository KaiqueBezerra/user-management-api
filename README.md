# API de Gerenciamento de Usuários

![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger‑UI-85EA2D.svg?style=for-the-badge&logo=swagger&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=gemini&logoColor=white)
![Zod](https://img.shields.io/badge/zod-%233068b7.svg?style=for-the-badge&logo=zod&logoColor=white)

## 📜 Sobre o Projeto

API RESTful para gerenciamento de usuários, construída com um stack moderno e performático, focando na robustez e na experiência de desenvolvimento.

Esta API fornece endpoints para operações CRUD (Criar, Ler, Atualizar, Deletar) em usuários, com autenticação e validação de dados. Foi desenvolvida seguindo as melhores práticas, utilizando o ecossistema do Fastify com um sistema de plugins e validação de schemas para garantir a integridade e a segurança dos dados.

## ✨ Tecnologias Principais

- **Framework Web:** [Fastify](https://www.fastify.io/) - Um framework web de alta performance e baixo overhead para Node.js.
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) - Para um código mais seguro, legível e escalável.
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) - Um ORM "headless" para TypeScript, que oferece total controle e segurança de tipos sobre as queries SQL.
- **Validação:** [Zod](https://zod.dev/) - Para declaração e validação de schemas.
- **Autenticação:** JWT e Bcrypt.
- **Inteligência Artificial:** [Google Gemini](https://gemini.google.com/) - Utilizado para validação de e-mails e geração de descrições dinâmicas.

## 📖 Endpoints da API

A API utiliza o `@fastify/swagger` para gerar uma documentação interativa e completa. Após iniciar o servidor, você pode explorar todos os endpoints, seus parâmetros, schemas e respostas diretamente no seu navegador.

Acesse: **http://localhost:3333/docs**

## 🔑 Autenticação

As rotas protegidas da API esperam um Token JWT no cabeçalho de autorização.

**Formato do Cabeçalho:** `Authorization: Bearer <SEU_TOKEN_JWT>`

## 🤖 Integração com Gemini

A API também possui um endpoint que utiliza a IA do Google, Gemini, para realizar duas tarefas:

1. **Validação de E-mails:** O Gemini analisa o e-mail informado, garantindo que ele seja interpretado e confirmado como válido antes da consulta no banco de dados.
2. **Mensagens Humanizadas:** Após localizar o usuário, o Gemini gera uma mensagem de confirmação clara e natural, tornando as respostas da API mais compreensíveis e amigáveis.

Para obter um token, utilize o endpoint de login com as credenciais de um usuário válido.

## 🚀 Começando (Setup)

Siga os passos abaixo para configurar e executar o projeto localmente.

### Pré-requisitos

- Node.js (v22.17.0 ou superior)
- [Docker](https://www.docker.com/) (opcional, para rodar o banco de dados)

### Instalação

1.  **Clone o repositório:**

    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd user-management-api
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Copie o arquivo `.env.example` para um novo arquivo chamado `.env` e preencha com suas credenciais do banco de dados.

    ```bash
    cp .env.example .env
    ```

    Seu arquivo `.env` deve se parecer com isto:

    ```env
    # Porta da aplicação
    PORT=3333

    # URL de conexão do Banco de Dados (PostgreSQL)
    DATABASE_URL="postgresql://docker:docker@localhost:5432/user_management_db"

    # Secret Key do JWT
    JWT_SECRET="super_secret"

    # Chave da API do Gemini
    GEMINI_API_KEY="SUA_CHAVE_API_AQUI"
    ```

## 🗄️ Migrações do Banco de Dados

Utilizei o `drizzle-kit` para gerenciar as migrações do schema do banco de dados.

- **Gerar uma nova migração:**
  Após fazer alterações nos seus schemas em `src/db/schema`, rode o comando abaixo para gerar um novo arquivo de migração SQL.

  ```bash
  npm run db:generate
  ```

- **Aplicar as migrações:**
  Para aplicar as migrações pendentes no banco de dados.

  ```bash
  npm run db:migrate
  ```

- **Gerar seed:**
  Para gerar um seed no banco de dados.
  ```bash
  npm run db:seed
  ```

## 🧠 Triggers e Functions do Banco de Dados

Além das migrações com o Drizzle, este projeto utiliza **funções e triggers em PostgreSQL** para:

- Registrar o histórico de **desativações e reativações** de usuários.
- Atualizar automaticamente o campo `updated_at` na tabela `users`.

Essas definições **não são criadas automaticamente pelas migrações**, então você precisa executá-las manualmente após configurar o banco e aplicar o schema.

### 📂 Local do arquivo

O script SQL está localizado em: `src/db/triggers_and_functions.sql`

### 🔧 Execução do Script

Exemplo com DBeaver:

1. **Abra o DBeaver:**

2. **Conecte-se ao seu banco PostgreSQL:**
   Clique em Nova Conexão e selecione PostgreSQL.
   Preencha os dados da conexão:

- Host: localhost
- Porta: 5432
- Database: user_management_db
- Usuário: docker
- Senha: docker

3. **Abra o arquivo SQL:**
   Editor SQL
   Abrir arquivo SQL
   Cole o contéudo do arquivo localizado em: `src/db/triggers_and_functions.sql`
   Execute o script.

   **⚠️ Atenção:**
   Antes de rodar este script, verifique se as tabelas users, deactivated_users e users_deactivation_history já foram criadas no banco de dados.
   Caso contrário, o script falhará por falta de referência às tabelas mencionadas nas triggers e funções.

## ▶️ Executando a Aplicação

- **Modo de Desenvolvimento:**
  Inicia o servidor em modo de desenvolvimento com hot-reload.
  ```bash
  npm run dev
  ```
