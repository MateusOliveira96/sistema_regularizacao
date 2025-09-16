# Sistema de Regularização de Imóveis Públicos
## Documentação Técnica Completa

**Versão:** 1.0  
**Data:** Setembro 2024  
**Autor:** Manus AI  
**Cliente:** Prefeitura Municipal de Mogi Mirim  

---

## Sumário Executivo

O Sistema de Regularização de Imóveis Públicos é uma solução tecnológica completa desenvolvida especificamente para atender às necessidades da Prefeitura Municipal de Mogi Mirim no processo de regularização fundiária de imóveis públicos. Este sistema integra funcionalidades de gestão de usuários, cadastro de imóveis, controle de etapas de regularização, dashboard analítico e módulo de localização geográfica com WebGIS, proporcionando uma ferramenta robusta e eficiente para o gerenciamento completo do processo de regularização.

A solução foi desenvolvida utilizando tecnologias modernas e consolidadas no mercado, garantindo escalabilidade, segurança e facilidade de manutenção. O backend foi implementado em Python utilizando o framework Flask, com banco de dados PostgreSQL/PostGIS para suporte a dados geoespaciais. O frontend foi desenvolvido em React com design responsivo, proporcionando uma experiência de usuário moderna e intuitiva em diferentes dispositivos.

O sistema atende aos principais desafios enfrentados pela administração pública na gestão de processos de regularização fundiária, oferecendo controle detalhado de etapas, rastreabilidade de documentos, análise de performance através de dashboards analíticos e visualização geográfica dos imóveis através de mapas interativos. A arquitetura modular permite futuras expansões e integrações com outros sistemas da prefeitura.




## 1. Arquitetura do Sistema

### 1.1 Visão Geral da Arquitetura

O Sistema de Regularização de Imóveis Públicos foi projetado seguindo uma arquitetura de três camadas (3-tier architecture), separando claramente as responsabilidades entre apresentação, lógica de negócio e persistência de dados. Esta abordagem garante maior flexibilidade, manutenibilidade e escalabilidade do sistema.

A arquitetura é composta pelos seguintes componentes principais:

**Camada de Apresentação (Frontend):** Desenvolvida em React, responsável pela interface do usuário e experiência de interação. Esta camada comunica-se com o backend através de APIs REST, garantindo uma separação clara entre a lógica de apresentação e a lógica de negócio.

**Camada de Aplicação (Backend):** Implementada em Python utilizando o framework Flask, esta camada contém toda a lógica de negócio do sistema, incluindo autenticação, autorização, validações, processamento de dados e integração com o banco de dados.

**Camada de Dados:** Utiliza PostgreSQL como sistema de gerenciamento de banco de dados principal, com extensão PostGIS para suporte a dados geoespaciais. Esta camada é responsável pela persistência e recuperação de dados, garantindo integridade e consistência das informações.

### 1.2 Padrões Arquiteturais Utilizados

O sistema implementa diversos padrões arquiteturais reconhecidos na indústria de software:

**Model-View-Controller (MVC):** O backend Flask segue o padrão MVC, onde os modelos representam a estrutura de dados, as views gerenciam a apresentação das informações e os controllers processam as requisições e coordenam as interações entre modelos e views.

**Repository Pattern:** Implementado para abstrair o acesso aos dados, permitindo maior flexibilidade na troca de tecnologias de persistência e facilitando a realização de testes unitários.

**RESTful API Design:** A comunicação entre frontend e backend segue os princípios REST, utilizando métodos HTTP apropriados (GET, POST, PUT, DELETE) e estrutura de URLs consistente e intuitiva.

**Component-Based Architecture:** O frontend React utiliza arquitetura baseada em componentes, promovendo reutilização de código, manutenibilidade e testabilidade.

### 1.3 Tecnologias e Frameworks

**Backend Technologies:**
- Python 3.11: Linguagem de programação principal do backend
- Flask 2.3: Framework web minimalista e flexível para Python
- SQLAlchemy 2.0: ORM (Object-Relational Mapping) para abstração do banco de dados
- Flask-CORS: Extensão para gerenciamento de Cross-Origin Resource Sharing
- Werkzeug: Biblioteca WSGI para aplicações web Python

**Frontend Technologies:**
- React 19.1: Biblioteca JavaScript para construção de interfaces de usuário
- React Router 6: Biblioteca para roteamento em aplicações React
- Tailwind CSS 4.1: Framework CSS utility-first para estilização
- Vite 6.3: Build tool e bundler para desenvolvimento frontend
- Lucide React: Biblioteca de ícones SVG para React

**Database Technologies:**
- PostgreSQL 15: Sistema de gerenciamento de banco de dados relacional
- PostGIS 3.3: Extensão espacial para PostgreSQL
- SQLite: Banco de dados para desenvolvimento e testes

**Development Tools:**
- Git: Sistema de controle de versão
- npm/pnpm: Gerenciadores de pacotes para Node.js
- pip: Gerenciador de pacotes para Python
- Virtual Environment: Isolamento de dependências Python

### 1.4 Segurança e Autenticação

O sistema implementa múltiplas camadas de segurança para proteger dados sensíveis e garantir acesso autorizado:

**Autenticação por Sessão:** Utiliza sessões HTTP para manter o estado de autenticação do usuário, com cookies seguros e configurações apropriadas de expiração.

**Controle de Acesso Baseado em Papéis (RBAC):** Implementa três níveis de acesso: Administrador (acesso completo), Gestor (acesso a relatórios e gestão de imóveis) e Operador (acesso limitado a operações básicas).

**Validação de Entrada:** Todas as entradas do usuário são validadas tanto no frontend quanto no backend, prevenindo ataques de injeção e garantindo integridade dos dados.

**CORS Configuration:** Configuração adequada de Cross-Origin Resource Sharing para permitir comunicação segura entre frontend e backend.

**Sanitização de Dados:** Implementação de sanitização de dados para prevenir ataques XSS (Cross-Site Scripting) e outras vulnerabilidades de segurança.


## 2. Modelo de Dados

### 2.1 Estrutura do Banco de Dados

O modelo de dados foi projetado para suportar eficientemente todas as operações relacionadas ao processo de regularização de imóveis públicos. A estrutura normalizada garante integridade referencial e minimiza redundância de dados, enquanto mantém performance adequada para consultas complexas.

### 2.2 Entidades Principais

**Tabela Users (Usuários)**
A tabela de usuários armazena informações sobre todos os usuários do sistema, incluindo funcionários da prefeitura e administradores. Cada usuário possui um papel específico que determina suas permissões no sistema.

Campos principais:
- id: Identificador único do usuário (chave primária)
- name: Nome completo do usuário
- email: Endereço de email único para autenticação
- password_hash: Hash da senha para segurança
- role: Papel do usuário (admin, manager, operator)
- active: Status ativo/inativo do usuário
- created_at: Data de criação do registro
- updated_at: Data da última atualização

**Tabela Properties (Imóveis)**
Esta tabela central armazena informações detalhadas sobre cada imóvel em processo de regularização. Inclui dados cadastrais, localização geográfica e status atual do processo.

Campos principais:
- id: Identificador único do imóvel (chave primária)
- code: Código único do imóvel para identificação
- address: Endereço completo do imóvel
- neighborhood: Bairro onde está localizado
- area: Área total do imóvel em metros quadrados
- coordinates: Coordenadas geográficas (latitude, longitude)
- owner: Proprietário atual do imóvel
- status: Status atual da regularização
- description: Descrição adicional do imóvel
- created_at: Data de cadastro no sistema
- updated_at: Data da última atualização

**Tabela RegularizationSteps (Etapas de Regularização)**
Define as etapas padrão do processo de regularização que devem ser seguidas para cada imóvel. Permite configuração flexível do fluxo de trabalho.

Campos principais:
- id: Identificador único da etapa (chave primária)
- name: Nome da etapa
- description: Descrição detalhada da etapa
- order: Ordem sequencial da etapa no processo
- estimated_duration: Duração estimada em dias
- required: Indica se a etapa é obrigatória
- active: Status ativo/inativo da etapa

**Tabela StepRecords (Registros de Etapas)**
Registra o progresso de cada imóvel através das etapas de regularização. Cada registro representa o status de uma etapa específica para um imóvel específico.

Campos principais:
- id: Identificador único do registro (chave primária)
- property_id: Referência ao imóvel (chave estrangeira)
- step_id: Referência à etapa (chave estrangeira)
- status: Status atual da etapa (pending, in_progress, completed, blocked)
- started_at: Data de início da etapa
- completed_at: Data de conclusão da etapa
- due_date: Data limite para conclusão
- responsible_user_id: Usuário responsável pela etapa
- notes: Observações sobre o progresso da etapa

**Tabela Documents (Documentos)**
Armazena informações sobre documentos anexados às etapas de regularização. Suporta diferentes tipos de documentos e mantém histórico de uploads.

Campos principais:
- id: Identificador único do documento (chave primária)
- step_record_id: Referência ao registro de etapa (chave estrangeira)
- filename: Nome original do arquivo
- file_path: Caminho do arquivo no sistema
- file_size: Tamanho do arquivo em bytes
- mime_type: Tipo MIME do arquivo
- document_type: Tipo de documento (contract, survey, approval, etc.)
- uploaded_by: Usuário que fez o upload
- uploaded_at: Data do upload

### 2.3 Relacionamentos entre Entidades

O modelo de dados implementa relacionamentos bem definidos que garantem integridade referencial e suportam consultas eficientes:

**Users → StepRecords (1:N):** Um usuário pode ser responsável por múltiplas etapas de diferentes imóveis. Este relacionamento permite rastreabilidade de responsabilidades e análise de produtividade.

**Properties → StepRecords (1:N):** Cada imóvel possui múltiplos registros de etapas, representando seu progresso através do processo de regularização. Este relacionamento é fundamental para o controle de fluxo de trabalho.

**RegularizationSteps → StepRecords (1:N):** Cada etapa padrão pode ter múltiplos registros associados a diferentes imóveis. Permite reutilização de definições de etapas e padronização de processos.

**StepRecords → Documents (1:N):** Cada registro de etapa pode ter múltiplos documentos anexados. Este relacionamento suporta a gestão documental completa do processo de regularização.

### 2.4 Índices e Performance

Para garantir performance adequada, especialmente com grandes volumes de dados, foram implementados índices estratégicos:

**Índices Primários:** Todas as tabelas possuem chaves primárias com índices automáticos para garantir unicidade e acesso rápido.

**Índices de Chaves Estrangeiras:** Todos os relacionamentos possuem índices nas chaves estrangeiras para otimizar joins e consultas relacionais.

**Índices Compostos:** Índices compostos foram criados para consultas frequentes, como busca de imóveis por status e bairro, ou registros de etapas por imóvel e status.

**Índices Geoespaciais:** Utilizando recursos do PostGIS, foram criados índices espaciais nas coordenadas dos imóveis para otimizar consultas geográficas e operações de proximidade.

### 2.5 Integridade e Constraints

O modelo implementa diversas restrições para garantir integridade dos dados:

**Constraints de Unicidade:** Emails de usuários e códigos de imóveis devem ser únicos no sistema.

**Constraints de Referência:** Todas as chaves estrangeiras possuem constraints de integridade referencial com ações apropriadas para cascata ou restrição.

**Constraints de Domínio:** Campos como status possuem constraints que limitam valores a opções válidas predefinidas.

**Constraints de Validação:** Validações adicionais garantem que dados como coordenadas geográficas estejam dentro de faixas válidas.


## 3. API REST - Documentação Completa

### 3.1 Visão Geral da API

A API REST do Sistema de Regularização de Imóveis segue os princípios RESTful, proporcionando uma interface consistente e intuitiva para todas as operações do sistema. A API é organizada em módulos funcionais, cada um responsável por um conjunto específico de operações relacionadas.

**Base URL:** `http://localhost:5001/api`  
**Formato de Dados:** JSON  
**Autenticação:** Session-based authentication  
**Versionamento:** v1 (implícito na URL base)  

### 3.2 Autenticação e Autorização

**Endpoint de Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@mogimimirim.sp.gov.br",
  "password": "senha_segura"
}
```

Resposta de sucesso:
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao.silva@mogimimirim.sp.gov.br",
    "role": "manager",
    "active": true
  }
}
```

**Endpoint de Logout**
```
POST /api/auth/logout
```

**Verificação de Usuário Atual**
```
GET /api/auth/me
```

### 3.3 Gestão de Usuários

**Listar Usuários**
```
GET /api/users?page=1&per_page=20&role=manager&active=true
```

Parâmetros de consulta:
- page: Número da página (padrão: 1)
- per_page: Itens por página (padrão: 20, máximo: 100)
- role: Filtrar por papel (admin, manager, operator)
- active: Filtrar por status ativo (true/false)
- search: Busca por nome ou email

Resposta:
```json
{
  "users": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao.silva@mogimimirim.sp.gov.br",
      "role": "manager",
      "active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "pages": 3
  }
}
```

**Criar Usuário**
```
POST /api/users
Content-Type: application/json

{
  "name": "Maria Santos",
  "email": "maria.santos@mogimimirim.sp.gov.br",
  "password": "senha_temporaria",
  "role": "operator",
  "active": true
}
```

**Atualizar Usuário**
```
PUT /api/users/{id}
Content-Type: application/json

{
  "name": "Maria Santos Silva",
  "role": "manager",
  "active": true
}
```

### 3.4 Gestão de Imóveis

**Listar Imóveis**
```
GET /api/properties?page=1&status=in_progress&neighborhood=Centro
```

Parâmetros de consulta:
- page, per_page: Paginação
- status: Filtrar por status (pending, in_progress, municipal_registered, registry_completed)
- neighborhood: Filtrar por bairro
- search: Busca por código ou endereço
- area_min, area_max: Filtrar por área
- created_after, created_before: Filtrar por data de criação

**Obter Detalhes do Imóvel**
```
GET /api/properties/{id}?include_steps=true&include_documents=true
```

Resposta detalhada:
```json
{
  "id": 1,
  "code": "MM001-2024",
  "address": "Rua das Flores, 123",
  "neighborhood": "Centro",
  "area": 500.0,
  "coordinates": [-22.4318, -46.9578],
  "owner": "Prefeitura Municipal",
  "status": "in_progress",
  "description": "Imóvel para regularização fundiária",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:45:00Z",
  "step_records": [
    {
      "id": 1,
      "step": {
        "id": 1,
        "name": "Levantamento Topográfico",
        "order": 1
      },
      "status": "completed",
      "started_at": "2024-01-15T10:30:00Z",
      "completed_at": "2024-01-18T16:20:00Z",
      "responsible_user": {
        "id": 2,
        "name": "Pedro Costa"
      }
    }
  ],
  "documents_count": 3
}
```

**Criar Imóvel**
```
POST /api/properties
Content-Type: application/json

{
  "code": "MM002-2024",
  "address": "Av. Brasil, 456",
  "neighborhood": "Vila Nova",
  "area": 750.0,
  "coordinates": [-22.4325, -46.9585],
  "owner": "Prefeitura Municipal",
  "description": "Terreno para regularização"
}
```

### 3.5 Gestão de Etapas de Regularização

**Listar Etapas Padrão**
```
GET /api/steps?active=true&order_by=order
```

**Criar Nova Etapa**
```
POST /api/steps
Content-Type: application/json

{
  "name": "Análise Jurídica",
  "description": "Análise da documentação jurídica do imóvel",
  "order": 3,
  "estimated_duration": 15,
  "required": true,
  "active": true
}
```

**Reordenar Etapas**
```
POST /api/steps/reorder
Content-Type: application/json

{
  "steps": [
    {"id": 1, "order": 1},
    {"id": 2, "order": 2},
    {"id": 3, "order": 3}
  ]
}
```

### 3.6 Gestão de Registros de Etapas

**Listar Registros de Etapas**
```
GET /api/step-records?property_id=1&status=in_progress&responsible_user_id=2
```

**Atualizar Status de Etapa**
```
PUT /api/step-records/{id}
Content-Type: application/json

{
  "status": "completed",
  "completed_at": "2024-01-20T16:30:00Z",
  "notes": "Etapa concluída com sucesso. Documentação aprovada."
}
```

**Obter Etapas em Atraso**
```
GET /api/step-records/overdue?days_overdue_min=5
```

### 3.7 Gestão de Documentos

**Upload de Documento**
```
POST /api/documents/upload
Content-Type: multipart/form-data

step_record_id: 1
document_type: survey
file: [arquivo]
```

Resposta:
```json
{
  "id": 1,
  "filename": "levantamento_topografico.pdf",
  "file_size": 2048576,
  "mime_type": "application/pdf",
  "document_type": "survey",
  "uploaded_at": "2024-01-20T10:15:00Z",
  "uploaded_by": {
    "id": 2,
    "name": "Pedro Costa"
  }
}
```

**Download de Documento**
```
GET /api/documents/{id}/download
```

**Listar Documentos por Etapa**
```
GET /api/documents/step-record/{step_record_id}
```

### 3.8 Dashboard e Relatórios

**Visão Geral do Dashboard**
```
GET /api/dashboard/overview
```

Resposta:
```json
{
  "properties": {
    "total": 150,
    "pending": 25,
    "in_progress": 85,
    "municipal_registered": 30,
    "registry_completed": 10
  },
  "steps": {
    "total": 750,
    "active": 320,
    "completed": 380,
    "blocked": 50
  },
  "documents": {
    "total": 1250
  },
  "users": {
    "total": 12,
    "active": 10
  }
}
```

**Imóveis por Status**
```
GET /api/dashboard/properties-by-status
```

**Progresso Mensal**
```
GET /api/dashboard/monthly-progress?months=6
```

**Métricas de Performance**
```
GET /api/dashboard/performance-metrics
```

### 3.9 Códigos de Status HTTP

A API utiliza códigos de status HTTP padrão para indicar o resultado das operações:

- **200 OK:** Operação realizada com sucesso
- **201 Created:** Recurso criado com sucesso
- **204 No Content:** Operação realizada sem conteúdo de retorno
- **400 Bad Request:** Dados de entrada inválidos
- **401 Unauthorized:** Autenticação necessária
- **403 Forbidden:** Acesso negado (permissões insuficientes)
- **404 Not Found:** Recurso não encontrado
- **409 Conflict:** Conflito de dados (ex: email já existe)
- **422 Unprocessable Entity:** Dados válidos mas não processáveis
- **500 Internal Server Error:** Erro interno do servidor

### 3.10 Tratamento de Erros

Todas as respostas de erro seguem um formato consistente:

```json
{
  "error": "Mensagem de erro legível",
  "code": "ERROR_CODE",
  "details": {
    "field": "Detalhes específicos do erro"
  },
  "timestamp": "2024-01-20T10:15:00Z"
}
```

### 3.11 Rate Limiting e Throttling

Para proteger a API contra abuso, foram implementadas limitações de taxa:

- **Limite Geral:** 1000 requisições por hora por IP
- **Limite de Login:** 5 tentativas por minuto por IP
- **Limite de Upload:** 10 uploads por minuto por usuário

Headers de resposta incluem informações sobre limites:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642680000
```

