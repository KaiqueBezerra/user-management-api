# API de Gerenciamento de Usuários

![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

API RESTful para gerenciamento de usuários, construída com um stack moderno, performático e com foco na experiência de desenvolvimento.

## 📜 Sobre o Projeto

Esta API fornece endpoints para operações CRUD (Criar, Ler, Atualizar, Deletar) em usuários. Foi desenvolvida seguindo as melhores práticas, utilizando um sistema de plugins robusto e validação de schemas para garantir a integridade dos dados.

## ✨ Tecnologias Principais

- **Framework Web:** [Fastify](https://www.fastify.io/) - Um framework web de alta performance e baixo overhead para Node.js.
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) - Para um código mais seguro, legível e escalável.
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) - Um ORM "headless" para TypeScript, que oferece total controle e segurança de tipos sobre as queries SQL.
- **Validação:** [Zod](https://zod.dev/) - Para declaração e validação de schemas.

## 🚀 Começando (Setup)

Siga os passos abaixo para configurar e executar o projeto localmente.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v22.17.0 ou superior)
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

## ▶️ Executando a Aplicação

- **Modo de Desenvolvimento:**
  Inicia o servidor em modo de desenvolvimento com hot-reload.
  ```bash
  npm run dev
  ```
