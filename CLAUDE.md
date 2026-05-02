# DomBills

App de controle financeiro pessoal e em grupos, com foco em funcionamento offline-first. Integra gestão de despesas pessoais ("meu dinheiro") com divisões em grupos ("nosso dinheiro").

## Estrutura do Monorepo

```
dombills/
├── app/          ← Expo + React Native (já existe)
├── api/          ← NestJS + TypeORM + PostgreSQL (a criar)
├── CLAUDE.md
└── package.json  ← workspace root (a criar)
```

## Tech Stack

### Frontend (`app/`)
- Expo 55 + React Native 0.83
- Expo Router 55 (file-based routing, typed routes)
- NativeWind 4 + Tailwind CSS (estilização)
- CVA (Class Variance Authority) — sistema de variantes de componentes
- WatermelonDB — SQLite local, reativo, offline-first
- React Native Reanimated 4
- Lucide React Native (ícones)

### Backend (`api/`)
- NestJS (framework)
- TypeORM (ORM)
- PostgreSQL (banco de dados)
- JWT (autenticação)
- class-validator + class-transformer (validação de DTOs)

## Arquitetura Offline-First

```
┌──────────────────────────┐
│   Expo App (device)      │
│   WatermelonDB (SQLite)  │ ← leitura/escrita sempre local
└────────────┬─────────────┘
             │ sync quando online
             ▼
┌──────────────────────────┐
│   NestJS API             │
│   POST /sync             │ ← protocolo pull/push do WatermelonDB
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│   PostgreSQL             │
└──────────────────────────┘
```

**Protocolo de Sync (WatermelonDB nativo):**
- App chama `synchronize({ pullChanges, pushChanges })`
- `pullChanges(lastPulledAt)` → NestJS retorna `{ changes, timestamp }`
- `pushChanges(changes)` → NestJS persiste as alterações locais
- Soft delete: campo `deleted_at` em todas as tabelas; nunca deletar fisicamente antes do sync

## Banco de Dados

### WatermelonDB (local SQLite — app)
Schema espelha o servidor com adaptações para o modelo reativo do WatermelonDB (campos snake_case, sem UUID explícito — WatermelonDB gera internamente).

### PostgreSQL (servidor — api)

#### users
| campo | tipo |
|-------|------|
| id | UUID PK |
| name | VARCHAR |
| email | VARCHAR UNIQUE |
| password_hash | VARCHAR |
| avatar_url | TEXT nullable |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP nullable |

#### groups
| campo | tipo |
|-------|------|
| id | UUID PK |
| name | VARCHAR |
| hex_color | VARCHAR |
| image_path | TEXT nullable |
| owner_id | UUID FK→users |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP nullable |

#### group_members
| campo | tipo |
|-------|------|
| id | UUID PK |
| group_id | UUID FK→groups |
| user_id | UUID FK→users |
| role | ENUM('ADMIN','MEMBER') |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP nullable |

#### categories
| campo | tipo |
|-------|------|
| id | UUID PK |
| name | VARCHAR |
| icon_name | VARCHAR |
| color | VARCHAR |
| user_id | UUID FK nullable (null = categoria do sistema) |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP nullable |

#### payment_methods
| campo | tipo |
|-------|------|
| id | UUID PK |
| user_id | UUID FK→users |
| name | VARCHAR |
| type | ENUM('CREDIT','DEBIT','PIX','CASH') |
| last_digits | VARCHAR(4) nullable |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP nullable |

#### transactions
| campo | tipo |
|-------|------|
| id | UUID PK |
| description | VARCHAR |
| total_amount | DECIMAL(12,2) |
| type | ENUM('REVENUE','EXPENSE') |
| category_id | UUID FK |
| payment_method_id | UUID FK |
| group_id | UUID FK nullable |
| created_by | UUID FK→users |
| date | DATE |
| due_date | DATE |
| status | ENUM('PENDING','PAID') |
| parent_id | UUID nullable (parcelamento/recorrência) |
| installment_number | INT default 1 |
| total_installments | INT default 1 |
| is_recurring | BOOLEAN default false |
| frequency | ENUM('NONE','MONTHLY','WEEKLY') |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP nullable |

#### transaction_splits
| campo | tipo |
|-------|------|
| id | UUID PK |
| transaction_id | UUID FK→transactions |
| user_id | UUID FK→users |
| share_amount | DECIMAL(12,2) |
| is_payer | BOOLEAN |
| paid_to_payer | BOOLEAN |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP nullable |

## Regras de Negócio

### Cálculo do Card de Pendências (Home)
- **Total Pendente**: `SUM(share_amount)` onde `user_id = logged_user` e `paid_to_payer = false`
- **Pessoais**: filtro acima + `group_id IS NULL`
- **De Grupos**: filtro acima + `group_id IS NOT NULL`

### Parcelamento
Ao criar despesa de R$1200 em 12x, gerar 12 registros em `transactions`:
- Todos com o mesmo `parent_id` (ID da 1ª parcela)
- `due_date` incrementado 1 mês por parcela
- `installment_number` de 1 a 12

### Split Híbrido
- Despesa pode envolver: grupo inteiro, alguns membros, ou amigos avulsos
- `is_payer = true` para quem pagou o total
- `paid_to_payer = false` para devedores até eles confirmarem

### Conflito de Dívida
- Devedor marca como pago → sinal enviado ao pagador confirmar recebimento
- Ambos precisam confirmar para a dívida sair do pendente

## Navegação

**Framework:** Expo Router (já configurado). Construído sobre React Navigation — sem perda de funcionalidade. Deep linking e typed routes automáticos.

```
app/
├── _layout.tsx              ← root (Stack global)
├── (auth)/                  ← fora das tabs
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
└── (tabs)/                  ← bottom tabs principais
    ├── _layout.tsx          ← configura os 5 tabs
    ├── index.tsx            ← Home (dashboard)
    ├── calendar.tsx         ← Visão Temporal
    ├── add.tsx              ← botão central: intercepta tabPress, abre bottom sheet
    ├── settings.tsx         ← Configurações
    └── profile.tsx          ← Perfil
```

Telas secundárias (stack modal ou push):
- `expenses/index.tsx` — Listagem completa de despesas
- `groups/[id].tsx` — Detalhes do grupo
- `groups/[id]/expenses.tsx` — Despesas do grupo

**Botão central:** tab que não navega para tela — usa evento `tabPress` para abrir um bottom sheet com "Adicionar Despesa" e "Adicionar Receita" flutuando acima da tab bar.

## Padrões de Código

- Componentes UI em `app/components/ui/` com CVA
- Absolute imports com alias `@/`
- TypeScript strict mode
- NativeWind para estilização (className)
- Prettier + Tailwind plugin (já configurado)
- Nenhum comentário exceto WHY não óbvio

## Telas e Jornada do Usuário

### 1. Home (Dashboard de Controle)
Ponto de entrada com visão imediata da saúde financeira. Seções em ordem:

**Header de Pendências (Card Azul Marinho)**
- Lado esquerdo: label "Pendências", valor Total (grande), breakdown Pessoais | Grupos
- Lado direito: "Saldo Atual" (Receitas − total já pago) com botão olho para ocultar valor
- Fundo: `bg-blue-950`, texto branco, valores positivos em verde, negativos em vermelho

**Carrossel de Grupos**
- Cards arrastáveis horizontalmente com fundo na cor do grupo + overlay escuro para legibilidade
- Dados do card: nome, total de despesas do grupo, sua parte, quanto já pagou

**Ações Rápidas (Grid 3×2)**
Botões: Ver Grupos · Criar Grupo · Ver Despesas | Adicionar Despesa · Ver Receitas · Adicionar Receita

**Feed de Vencimentos Críticos**
- Próximas 5 despesas pendentes ordenadas por `due_date` ASC (vencidas primeiro)
- Ícone + cor diferente: vermelho (vencida), laranja (hoje), neutro (futura)
- Botão "Ver Todas" → `/expenses`

**Análise Rápida**
- Barras horizontais de despesas por Categoria (top 5) e Forma de Pagamento (top 4)
- Cada barra proporcional ao valor total

### 2. Visão Temporal (`calendar.tsx`)
- Switch "Mensal" / "Personalizado"
- **Mensal**: navegador de meses + calendário interativo (bolinha vermelha = despesa, verde = receita). Clique no dia filtra lista abaixo
- **Personalizado**: date range picker em vez do calendário
- Lista de transações com chips de filtro: Ambos / Somente Despesas / Somente Receitas

### 3. Botão Central `add.tsx`
Intercepta `tabPress` e abre `AddExpenseSheet` (suporta `initialType: 'EXPENSE' | 'REVENUE'`). O sheet trata ambos os tipos, parcelamento e recorrência.

### 4. Settings (`settings.tsx`)
Lista de opções que redirecionam para: Gerenciar Grupos · Gerenciar Categorias · Gerenciar Formas de Pagamento

### 5. Perfil (`profile.tsx`)
Nome e foto do usuário. Opções: Alterar dados · Redefinir senha · Notificações · Tema (Dark/Light) · Logout

### Tela: Listagem de Despesas (`expenses/index.tsx`)
- Sumarizador no topo (total filtrado)
- Filtros: por grupo/amigo específico, por método de pagamento

## Padrões de Componentização

- Utilitários de formatação em `app/lib/format.ts` (`formatBRL`, `formatShortDate`) — nunca redefinir inline
- Componentes UI genéricos em `app/components/ui/` com CVA (react-native-reusables style)
- Componentes de feature em `app/components/features/<feature>/`
- Qualquer padrão visual usado em ≥2 lugares vira componente reutilizável
- Preferir primitivos do `@rn-primitives/*` quando disponível antes de construir do zero

## Fases de Desenvolvimento

| Fase | Descrição |
|------|-----------|
| 1 | Monorepo setup + NestJS scaffolding + WatermelonDB no app |
| 2 | Auth (login/register) + cache de perfil local |
| 3 | Schema WatermelonDB + Entities TypeORM + CRUD base |
| 4 | Protocolo de Sync (pull/push endpoint) |
| 5 | Home Dashboard (card pendências + carrossel grupos) |
| 6 | Cadastro de despesas (split, parcelamento, recorrência) |
| 7 | Grupos (criação, membros, gestão) |
| 8 | Settings (categorias, formas de pagamento) |
| 9 | Visão Temporal (calendário + fluxo de caixa) |
| 10 | Perfil + Notificações + Polimento |
