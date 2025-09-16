# Documentação da API - Sistema de Regularização de Imóveis

## Visão Geral

Esta API RESTful foi desenvolvida em Python/Flask para gerenciar o processo de regularização de imóveis públicos da Prefeitura Municipal de Mogi Mirim. A API oferece endpoints para autenticação, gestão de usuários, imóveis, etapas de regularização, documentos e dashboard analítico.

## Base URL

```
http://localhost:5000/api
```

## Autenticação

A API utiliza sessões para autenticação. Após o login bem-sucedido, as informações do usuário são armazenadas na sessão.

### POST /auth/login

Realiza login no sistema.

**Request Body:**
```json
{
  "email": "usuario@mogimimirim.sp.gov.br",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "name": "Nome do Usuário",
    "email": "usuario@mogimimirim.sp.gov.br",
    "role": "admin",
    "active": true,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

### POST /auth/logout

Realiza logout do sistema.

**Response (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

### GET /auth/me

Obtém informações do usuário logado.

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Nome do Usuário",
    "email": "usuario@mogimimirim.sp.gov.br",
    "role": "admin",
    "active": true,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

## Usuários

### GET /users

Lista todos os usuários (requer permissão admin/manager).

**Query Parameters:**
- `page` (int): Página (padrão: 1)
- `per_page` (int): Itens por página (padrão: 10)
- `search` (string): Busca por nome ou email
- `role` (string): Filtrar por papel

**Response (200):**
```json
{
  "users": [...],
  "total": 50,
  "pages": 5,
  "current_page": 1,
  "per_page": 10
}
```

### POST /users

Cria novo usuário (requer permissão admin).

**Request Body:**
```json
{
  "name": "Nome do Usuário",
  "email": "usuario@mogimimirim.sp.gov.br",
  "password": "senha123",
  "role": "operator",
  "active": true
}
```

### PUT /users/{id}

Atualiza usuário (requer permissão admin).

### DELETE /users/{id}

Exclui usuário (requer permissão admin).

## Imóveis

### GET /properties

Lista todos os imóveis.

**Query Parameters:**
- `page` (int): Página
- `per_page` (int): Itens por página
- `search` (string): Busca por código, endereço ou proprietário
- `status` (string): Filtrar por status de regularização
- `neighborhood` (string): Filtrar por bairro
- `include_geometry` (boolean): Incluir coordenadas geográficas

**Response (200):**
```json
{
  "properties": [
    {
      "id": 1,
      "municipal_code": "MM001-2024",
      "registry_number": "12345",
      "address_street": "Rua das Flores",
      "address_number": "123",
      "address_neighborhood": "Centro",
      "address_city": "Mogi Mirim",
      "address_zipcode": "13800-000",
      "full_address": "Rua das Flores, 123, Centro, Mogi Mirim",
      "area_total": 500.00,
      "area_built": 200.00,
      "property_type": "Residencial",
      "current_use": "Casa de apoio social",
      "current_owner": "Prefeitura Municipal",
      "regularization_status": "in_progress",
      "description": "Imóvel utilizado para atividades sociais",
      "created_by": 2,
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00",
      "coordinates": {
        "latitude": -22.4318,
        "longitude": -46.9578
      }
    }
  ],
  "total": 100,
  "pages": 10,
  "current_page": 1,
  "per_page": 10
}
```

### POST /properties

Cria novo imóvel.

**Request Body:**
```json
{
  "municipal_code": "MM006-2024",
  "address_street": "Rua Nova",
  "address_number": "456",
  "address_neighborhood": "Bairro Novo",
  "area_total": 300.00,
  "property_type": "Residencial",
  "current_owner": "Prefeitura Municipal",
  "latitude": -22.4300,
  "longitude": -46.9600
}
```

### PUT /properties/{id}

Atualiza imóvel.

### DELETE /properties/{id}

Exclui imóvel (requer permissão admin/manager).

### GET /properties/{id}/progress

Obtém progresso das etapas de um imóvel.

**Response (200):**
```json
{
  "property": {...},
  "steps": [
    {
      "id": 1,
      "property_id": 1,
      "step_id": 1,
      "status": "completed",
      "start_date": "2024-01-15",
      "end_date": "2024-02-10",
      "completion_percentage": 100,
      "observations": "Levantamento concluído",
      "step": {
        "name": "Levantamento Topográfico",
        "description": "Medição e demarcação do terreno"
      }
    }
  ],
  "summary": {
    "total_steps": 5,
    "completed_steps": 2,
    "completion_percentage": 40.0
  }
}
```

## Etapas de Regularização

### GET /steps

Lista todas as etapas de regularização.

**Query Parameters:**
- `active_only` (boolean): Apenas etapas ativas

### POST /steps

Cria nova etapa (requer permissão admin/manager).

### PUT /steps/{id}

Atualiza etapa (requer permissão admin/manager).

### DELETE /steps/{id}

Exclui etapa (requer permissão admin).

## Registros de Etapas

### GET /step-records

Lista registros de etapas.

**Query Parameters:**
- `property_id` (int): Filtrar por imóvel
- `step_id` (int): Filtrar por etapa
- `status` (string): Filtrar por status
- `responsible_user_id` (int): Filtrar por responsável

### PUT /step-records/{id}

Atualiza registro de etapa.

**Request Body:**
```json
{
  "status": "in_progress",
  "start_date": "2024-01-15",
  "responsible_user_id": 3,
  "observations": "Iniciando levantamento",
  "completion_percentage": 25
}
```

### GET /step-records/property/{property_id}

Obtém todos os registros de etapas de um imóvel.

### GET /step-records/overdue

Lista registros em atraso (requer permissão admin/manager).

## Documentos

### GET /documents

Lista documentos.

**Query Parameters:**
- `step_record_id` (int): Filtrar por registro de etapa
- `document_type` (string): Filtrar por tipo de documento

### POST /documents/upload

Faz upload de documento.

**Form Data:**
- `file`: Arquivo a ser enviado
- `step_record_id`: ID do registro de etapa
- `document_type`: Tipo do documento
- `description`: Descrição do documento

### GET /documents/{id}/download

Faz download de documento.

### PUT /documents/{id}

Atualiza informações do documento.

### DELETE /documents/{id}

Exclui documento (requer permissão admin/manager).

## Dashboard

### GET /dashboard/overview

Obtém visão geral do dashboard.

**Response (200):**
```json
{
  "properties": {
    "total": 100,
    "pending": 20,
    "in_progress": 50,
    "municipal_registered": 20,
    "registry_completed": 10
  },
  "steps": {
    "total": 500,
    "active": 150,
    "completed": 300,
    "blocked": 50
  },
  "documents": {
    "total": 1200
  },
  "users": {
    "total": 15
  }
}
```

### GET /dashboard/properties-by-status

Obtém distribuição de imóveis por status.

### GET /dashboard/properties-by-neighborhood

Obtém distribuição de imóveis por bairro.

### GET /dashboard/steps-progress

Obtém progresso das etapas de regularização.

### GET /dashboard/monthly-progress

Obtém progresso mensal de conclusão de etapas.

### GET /dashboard/overdue-steps

Obtém etapas em atraso (requer permissão admin/manager).

### GET /dashboard/recent-activities

Obtém atividades recentes.

### GET /dashboard/performance-metrics

Obtém métricas de performance (requer permissão admin/manager).

## Códigos de Status HTTP

- `200 OK`: Sucesso
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

## Tipos de Dados

### Status de Regularização
- `pending`: Pendente
- `in_progress`: Em Progresso
- `municipal_registered`: Cadastrado no Município
- `registry_completed`: Regularizado no Cartório

### Status de Etapa
- `not_started`: Não Iniciada
- `in_progress`: Em Andamento
- `completed`: Concluída
- `blocked`: Bloqueada

### Papéis de Usuário
- `admin`: Administrador (acesso total)
- `manager`: Gestor (gestão de imóveis e relatórios)
- `operator`: Operador (operações básicas)

## Arquivos Permitidos para Upload

- Documentos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF, ODT, ODS, ODP
- Imagens: JPG, JPEG, PNG, GIF, BMP, TIFF

## Configuração de Produção

Para produção, altere a configuração do banco de dados no arquivo `.env`:

```
DATABASE_URL=postgresql://username:password@localhost:5432/regularizacao_imoveis
```

E instale o PostgreSQL com PostGIS para suporte completo a dados geoespaciais.

