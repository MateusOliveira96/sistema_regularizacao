# Modelo de Dados - Sistema de Regularização de Imóveis Públicos

## 1. Introdução

Este documento apresenta o modelo de dados detalhado para o sistema de gestão de regularização de imóveis públicos da Prefeitura Municipal de Mogi Mirim. O modelo foi projetado para utilizar PostgreSQL como sistema de gerenciamento de banco de dados, com a extensão PostGIS para suporte a dados geoespaciais.

## 2. Visão Geral do Modelo

O modelo de dados é composto por cinco entidades principais:

1. **Usuários (users)** - Gerencia os usuários do sistema
2. **Imóveis (properties)** - Armazena informações dos imóveis públicos
3. **Etapas de Regularização (regularization_steps)** - Define as etapas do processo
4. **Registros de Etapas (step_records)** - Registra o progresso de cada etapa por imóvel
5. **Documentos (documents)** - Armazena documentos anexados às etapas

## 3. Entidades e Atributos

### 3.1. Tabela: users (Usuários)

Esta tabela armazena informações dos usuários do sistema, incluindo dados de autenticação e autorização.

**Atributos:**
- `id` (SERIAL PRIMARY KEY) - Identificador único do usuário
- `name` (VARCHAR(255) NOT NULL) - Nome completo do usuário
- `email` (VARCHAR(255) UNIQUE NOT NULL) - E-mail do usuário (usado para login)
- `password_hash` (VARCHAR(255) NOT NULL) - Hash da senha do usuário
- `role` (VARCHAR(50) NOT NULL) - Perfil de acesso (admin, manager, operator)
- `active` (BOOLEAN DEFAULT TRUE) - Status ativo/inativo do usuário
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Data da última atualização

### 3.2. Tabela: properties (Imóveis)

Esta tabela armazena informações detalhadas dos imóveis públicos, incluindo dados geoespaciais.

**Atributos:**
- `id` (SERIAL PRIMARY KEY) - Identificador único do imóvel
- `municipal_code` (VARCHAR(50) UNIQUE) - Código municipal do imóvel
- `registry_number` (VARCHAR(100)) - Número da matrícula no cartório
- `address_street` (VARCHAR(255) NOT NULL) - Logradouro
- `address_number` (VARCHAR(20)) - Número do endereço
- `address_neighborhood` (VARCHAR(100)) - Bairro
- `address_city` (VARCHAR(100) DEFAULT 'Mogi Mirim') - Cidade
- `address_zipcode` (VARCHAR(10)) - CEP
- `area_total` (DECIMAL(10,2)) - Área total em m²
- `area_built` (DECIMAL(10,2)) - Área construída em m²
- `property_type` (VARCHAR(100)) - Tipo do imóvel (residencial, comercial, etc.)
- `current_use` (TEXT) - Uso atual do imóvel
- `current_owner` (VARCHAR(255)) - Proprietário atual
- `regularization_status` (VARCHAR(50) DEFAULT 'pending') - Status da regularização
- `description` (TEXT) - Descrição adicional do imóvel
- `geometry` (GEOMETRY(POINT, 4326)) - Coordenadas geográficas (PostGIS)
- `polygon_geometry` (GEOMETRY(POLYGON, 4326)) - Polígono do terreno (PostGIS)
- `created_by` (INTEGER REFERENCES users(id)) - Usuário que cadastrou
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Data da última atualização

### 3.3. Tabela: regularization_steps (Etapas de Regularização)

Esta tabela define as etapas padrão do processo de regularização.

**Atributos:**
- `id` (SERIAL PRIMARY KEY) - Identificador único da etapa
- `name` (VARCHAR(255) NOT NULL) - Nome da etapa
- `description` (TEXT) - Descrição detalhada da etapa
- `order_sequence` (INTEGER NOT NULL) - Ordem sequencial da etapa
- `estimated_duration_days` (INTEGER) - Duração estimada em dias
- `required_documents` (TEXT) - Documentos necessários para a etapa
- `active` (BOOLEAN DEFAULT TRUE) - Status ativo/inativo da etapa
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Data da última atualização

### 3.4. Tabela: step_records (Registros de Etapas)

Esta tabela registra o progresso de cada etapa para cada imóvel específico.

**Atributos:**
- `id` (SERIAL PRIMARY KEY) - Identificador único do registro
- `property_id` (INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE) - Imóvel relacionado
- `step_id` (INTEGER NOT NULL REFERENCES regularization_steps(id)) - Etapa relacionada
- `status` (VARCHAR(50) DEFAULT 'not_started') - Status da etapa (not_started, in_progress, completed, blocked)
- `start_date` (DATE) - Data de início da etapa
- `end_date` (DATE) - Data de conclusão da etapa
- `responsible_user_id` (INTEGER REFERENCES users(id)) - Usuário responsável
- `observations` (TEXT) - Observações sobre o progresso
- `completion_percentage` (INTEGER DEFAULT 0) - Percentual de conclusão (0-100)
- `created_by` (INTEGER REFERENCES users(id)) - Usuário que criou o registro
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Data da última atualização

### 3.5. Tabela: documents (Documentos)

Esta tabela armazena informações sobre documentos anexados às etapas de regularização.

**Atributos:**
- `id` (SERIAL PRIMARY KEY) - Identificador único do documento
- `step_record_id` (INTEGER NOT NULL REFERENCES step_records(id) ON DELETE CASCADE) - Registro de etapa relacionado
- `filename` (VARCHAR(255) NOT NULL) - Nome original do arquivo
- `file_path` (VARCHAR(500) NOT NULL) - Caminho do arquivo no sistema
- `file_size` (BIGINT) - Tamanho do arquivo em bytes
- `file_type` (VARCHAR(100)) - Tipo MIME do arquivo
- `document_type` (VARCHAR(100)) - Tipo do documento (planta, certidão, parecer, etc.)
- `description` (TEXT) - Descrição do documento
- `uploaded_by` (INTEGER REFERENCES users(id)) - Usuário que fez o upload
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Data de upload

## 4. Relacionamentos

### 4.1. Relacionamentos Principais

- **users → properties**: Um usuário pode cadastrar vários imóveis (1:N)
- **properties → step_records**: Um imóvel pode ter vários registros de etapas (1:N)
- **regularization_steps → step_records**: Uma etapa pode estar associada a vários registros (1:N)
- **step_records → documents**: Um registro de etapa pode ter vários documentos (1:N)
- **users → step_records**: Um usuário pode ser responsável por vários registros de etapas (1:N)
- **users → documents**: Um usuário pode fazer upload de vários documentos (1:N)

### 4.2. Índices Recomendados

Para otimizar o desempenho das consultas, os seguintes índices são recomendados:

- `idx_properties_municipal_code` - Índice único no código municipal
- `idx_properties_status` - Índice no status de regularização
- `idx_properties_geometry` - Índice espacial PostGIS na geometria
- `idx_step_records_property_status` - Índice composto em property_id e status
- `idx_documents_step_record` - Índice em step_record_id
- `idx_users_email` - Índice único no e-mail do usuário

## 5. Estruturas Geoespaciais PostGIS

### 5.1. Configuração do PostGIS

O banco de dados deve ter a extensão PostGIS habilitada para suportar dados geoespaciais:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 5.2. Campos Geoespaciais

- **geometry**: Armazena a localização pontual do imóvel (coordenadas lat/lng)
- **polygon_geometry**: Armazena o polígono que representa os limites do terreno

Ambos os campos utilizam o sistema de coordenadas WGS84 (SRID 4326), que é o padrão para aplicações web e GPS.

### 5.3. Funcionalidades Geoespaciais

O PostGIS permitirá implementar funcionalidades como:
- Busca de imóveis por proximidade geográfica
- Cálculo de áreas e perímetros
- Análise de sobreposição de terrenos
- Integração com mapas web (Leaflet, OpenLayers)

## 6. Dados de Exemplo

### 6.1. Etapas Padrão de Regularização

As seguintes etapas padrão serão inseridas no sistema:

1. **Levantamento Topográfico** - Medição e demarcação do terreno
2. **Análise Jurídica** - Verificação da situação legal do imóvel
3. **Aprovação Municipal** - Análise e aprovação pelos órgãos municipais
4. **Documentação Cartorial** - Preparação de documentos para o cartório
5. **Registro em Cartório** - Registro oficial no cartório de imóveis

### 6.2. Perfis de Usuário

- **admin**: Acesso total ao sistema, gestão de usuários
- **manager**: Gestão de imóveis e etapas, visualização de relatórios
- **operator**: Operação básica, atualização de etapas

## 7. Considerações de Segurança

- Senhas são armazenadas como hash utilizando algoritmos seguros (bcrypt)
- Campos sensíveis podem ser criptografados conforme necessário
- Logs de auditoria podem ser implementados para rastrear alterações
- Backup regular dos dados geoespaciais é essencial

## 8. Próximos Passos

- Criação dos scripts SQL para implementação do modelo
- Definição de triggers para atualização automática de timestamps
- Implementação de stored procedures para operações complexas
- Criação de views para consultas frequentes

