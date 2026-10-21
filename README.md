# QinaDesign
Projeto integrador com a empresa Qina Design. Sistema para atualização e gerenciamento de status dos pedidos 

## Stack

| Camada | Tecnologia |
| --- | --- |
| Front-end | React, Next,js, JavaScript |
| Back-end | Node.js, NestJS, TypeScript |
| Banco de dados | PostgreSQL |
| ORM | Prisma |
| Autenticação | JWT |
| Hospedagem do front-end | Vercel |
| Hospedagem do back-end e do banco | Back4App |

## Estrutura do repositório

```
.
├── frontend/   Aplicação React (Vite)
├── backend/    API NestJS e schema do Prisma
├── docs/       Documentação do projeto
└── README.md
```

## Como executar

### Back-end

```bash
cd backend
npm install
cp .env.example .env   # preencher os valores
npm run start:dev
```

A API sobe em `http://localhost:3000`.

### Front-end

```bash
cd frontend
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`

## Variáveis de ambiente

O arquivo `.env.example` lista os nomes das variáveis, sem valores, e deve ser atualizado sempre que uma nova variável for adicionada.

## Fluxo de trabalho

- A branch `main` deve ser PROTEGIDA: alterações entram por pull request.
- O trabalho é feito em branches separadas, uma por tarefa.
- O arquivo `.env` nunca deve ser commitado. 
