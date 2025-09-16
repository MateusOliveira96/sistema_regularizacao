# Documento de Requisitos e Arquitetura do Sistema de Regularização de Imóveis Públicos

## 1. Introdução

Este documento descreve os requisitos funcionais e não funcionais, bem como a arquitetura proposta para o sistema de gestão de regularização de imóveis públicos da Prefeitura Municipal de Mogi Mirim. O objetivo principal do sistema é fornecer uma ferramenta robusta e eficiente para auxiliar na gestão do processo de regularização, desde o cadastro inicial dos imóveis e usuários até o acompanhamento das etapas de regularização e a visualização de dados estratégicos.

## 2. Requisitos Funcionais

Os requisitos funcionais definem as funcionalidades que o sistema deve oferecer aos usuários.

### 2.1. Gestão de Usuários

- O sistema deve permitir o cadastro de novos usuários, incluindo informações como nome, e-mail, senha e perfil de acesso (ex: administrador, gestor, operador).
- O sistema deve permitir a edição e exclusão de usuários existentes.
- O sistema deve implementar um sistema de autenticação e autorização para controlar o acesso às diferentes funcionalidades com base no perfil do usuário.

### 2.2. Gestão de Imóveis

- O sistema deve permitir o cadastro de imóveis públicos, incluindo informações detalhadas como:
    - Identificação única do imóvel (ex: número de matrícula, código municipal).
    - Endereço completo (logradouro, número, bairro, cidade, CEP).
    - Descrição do imóvel (área, tipo de construção, uso atual).
    - Informações de propriedade (matrícula no cartório de registro de imóveis, proprietário atual).
    - Status de regularização (em processo, regularizado, pendente).
- O sistema deve permitir a edição e exclusão de imóveis existentes.
- O sistema deve permitir a busca e filtragem de imóveis com base em diversos critérios (ex: status, endereço, identificação).

### 2.3. Gestão de Etapas de Regularização

- O sistema deve permitir a definição de etapas padronizadas para o processo de regularização de imóveis (ex: levantamento topográfico, análise jurídica, aprovação municipal, registro em cartório).
- O sistema deve permitir a associação de um imóvel a um fluxo de etapas de regularização.
- O sistema deve permitir o registro do progresso de cada etapa para um imóvel específico, incluindo:
    - Data de início e fim da etapa.
    - Responsável pela etapa.
    - Observações relevantes.
    - Status da etapa (iniciada, em andamento, concluída, pendente).
- O sistema deve permitir a anexação de documentos a cada etapa (ex: plantas, certidões, pareceres jurídicos, fotos).
- O sistema deve permitir a visualização do histórico de etapas de regularização para cada imóvel.

### 2.4. Dashboard Analítico

- O sistema deve apresentar um dashboard com indicadores chave de desempenho (KPIs) relacionados à regularização de imóveis, incluindo:
    - Quantidade de imóveis em processo de regularização.
    - Quantidade de imóveis cadastrados no cadastro municipal.
    - Quantidade de imóveis já regularizados junto ao cartório de registro de imóveis.
    - Gráficos de progresso por etapa.
    - Gráficos de imóveis por status de regularização.
- O dashboard deve ser interativo, permitindo a filtragem de dados por período, tipo de imóvel, etc.

### 2.5. Módulo WebGIS

- O sistema deve permitir a visualização dos imóveis em um mapa interativo.
- O sistema deve permitir a busca de imóveis diretamente no mapa.
- O sistema deve exibir informações básicas do imóvel ao clicar em sua representação no mapa.
- O sistema deve permitir a sobreposição de camadas de informações geográficas relevantes (ex: zoneamento, limites de bairros).
- O sistema deve permitir o upload e visualização de arquivos geoespaciais (ex: KML, GeoJSON) associados aos imóveis.

## 3. Requisitos Não Funcionais

Os requisitos não funcionais descrevem as qualidades e restrições do sistema.

### 3.1. Desempenho

- O sistema deve ser responsivo, com tempo de resposta máximo de 3 segundos para a maioria das operações.
- O sistema deve suportar um número X de usuários simultâneos sem degradação significativa de desempenho (X a ser definido com base na demanda da prefeitura).

### 3.2. Segurança

- O sistema deve proteger os dados contra acesso não autorizado, utilizando autenticação e autorização robustas.
- O sistema deve criptografar senhas de usuários.
- O sistema deve implementar mecanismos de prevenção contra ataques comuns (ex: SQL Injection, XSS).
- O sistema deve garantir a integridade dos dados.

### 3.3. Usabilidade

- A interface do usuário deve ser intuitiva e fácil de usar.
- O sistema deve ser responsivo, adaptando-se a diferentes tamanhos de tela (desktop, tablet, mobile).
- O sistema deve fornecer mensagens de erro claras e informativas.

### 3.4. Escalabilidade

- A arquitetura do sistema deve permitir a adição de novas funcionalidades e o aumento da capacidade de processamento e armazenamento de dados no futuro.

### 3.5. Manutenibilidade

- O código-fonte deve ser bem documentado, modular e fácil de entender e modificar.
- O sistema deve ser fácil de implantar e configurar.

### 3.6. Confiabilidade

- O sistema deve ser tolerante a falhas, com mecanismos de recuperação de erros.
- O sistema deve garantir a persistência dos dados em caso de falhas.

## 4. Arquitetura do Sistema

A arquitetura proposta para o sistema é baseada em uma abordagem de três camadas, com um backend robusto, um frontend interativo e um banco de dados geoespacial.

### 4.1. Camada de Apresentação (Frontend)

- **Tecnologias:** HTML5, CSS3, JavaScript, React (ou framework similar como Vue.js/Angular).
- **Responsabilidade:** Interface do usuário, exibição de dados, interação com o usuário, consumo da API backend.
- **Responsividade:** Design responsivo para garantir compatibilidade com diferentes dispositivos (desktop, tablet, mobile).

### 4.2. Camada de Lógica de Negócios (Backend)

- **Tecnologias:** Python, Flask (ou FastAPI/Django).
- **Responsabilidade:** Lógica de negócios, processamento de dados, autenticação e autorização, comunicação com o banco de dados, exposição de APIs RESTful.
- **APIs:** Fornecerá endpoints para gestão de usuários, imóveis, etapas, documentos e dados para o dashboard.

### 4.3. Camada de Dados

- **Tecnologias:** PostgreSQL com extensão PostGIS.
- **Responsabilidade:** Armazenamento persistente de todos os dados do sistema, incluindo dados alfanuméricos e geoespaciais.
- **PostGIS:** Essencial para o armazenamento e consulta de dados geográficos, suportando o módulo WebGIS.

### 4.4. Módulo WebGIS

- **Tecnologias:** Leaflet.js (ou OpenLayers) para o mapa interativo no frontend, PostGIS para o armazenamento geoespacial no backend.
- **Integração:** O frontend consumirá dados geoespaciais do backend via APIs, que por sua vez consultarão o PostGIS.

## 5. Tecnologias Propostas

- **Linguagem de Programação:** Python
- **Framework Backend:** Flask (leve e flexível para APIs RESTful)
- **Banco de Dados:** PostgreSQL
- **Extensão Geoespacial:** PostGIS
- **Framework Frontend:** React (ou similar, para uma SPA moderna e responsiva)
- **Biblioteca de Mapas:** Leaflet.js (leve e fácil de usar para WebGIS)
- **Servidor Web (Produção):** Nginx/Gunicorn (para servir a aplicação Flask)
- **Controle de Versão:** Git

## 6. Próximos Passos

- Detalhamento do modelo de dados.
- Definição das APIs RESTful.
- Criação do ambiente de desenvolvimento.
- Início da implementação do backend.


