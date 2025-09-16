# Manual de Instalação e Configuração
## Sistema de Regularização de Imóveis Públicos

**Versão:** 1.0  
**Data:** Setembro 2024  
**Autor:** Manus AI  

---

## Sumário

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Preparação do Ambiente](#preparação-do-ambiente)
3. [Instalação do Backend](#instalação-do-backend)
4. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
5. [Instalação do Frontend](#instalação-do-frontend)
6. [Configuração de Produção](#configuração-de-produção)
7. [Configuração de Segurança](#configuração-de-segurança)
8. [Backup e Recuperação](#backup-e-recuperação)
9. [Monitoramento](#monitoramento)
10. [Troubleshooting](#troubleshooting)

---

## Requisitos do Sistema

### Requisitos de Hardware

**Servidor de Aplicação (Mínimo):**
- CPU: 2 cores, 2.4 GHz
- RAM: 4 GB
- Armazenamento: 50 GB SSD
- Rede: 100 Mbps

**Servidor de Aplicação (Recomendado):**
- CPU: 4 cores, 3.0 GHz
- RAM: 8 GB
- Armazenamento: 100 GB SSD
- Rede: 1 Gbps

**Servidor de Banco de Dados (Mínimo):**
- CPU: 2 cores, 2.4 GHz
- RAM: 4 GB
- Armazenamento: 100 GB SSD
- Rede: 100 Mbps

**Servidor de Banco de Dados (Recomendado):**
- CPU: 4 cores, 3.0 GHz
- RAM: 16 GB
- Armazenamento: 200 GB SSD com RAID 1
- Rede: 1 Gbps

### Requisitos de Software

**Sistema Operacional:**
- Ubuntu 22.04 LTS (recomendado)
- CentOS 8 ou superior
- Red Hat Enterprise Linux 8 ou superior
- Debian 11 ou superior

**Dependências do Sistema:**
- Python 3.11 ou superior
- Node.js 18 ou superior
- PostgreSQL 15 ou superior
- PostGIS 3.3 ou superior
- Nginx 1.18 ou superior
- Git 2.34 ou superior

**Navegadores Suportados (Cliente):**
- Google Chrome 100+
- Mozilla Firefox 100+
- Microsoft Edge 100+
- Safari 15+ (macOS)

## Preparação do Ambiente

### Atualização do Sistema

Antes de iniciar a instalação, atualize o sistema operacional:

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### Instalação de Dependências Base

**Ubuntu/Debian:**
```bash
sudo apt install -y curl wget git build-essential python3 python3-pip python3-venv nodejs npm postgresql postgresql-contrib postgresql-15-postgis-3 nginx
```

**CentOS/RHEL:**
```bash
sudo yum install -y curl wget git gcc gcc-c++ make python3 python3-pip nodejs npm postgresql15-server postgresql15-contrib postgis33_15 nginx
```

### Configuração de Usuários

Crie um usuário dedicado para a aplicação:

```bash
sudo useradd -m -s /bin/bash regularizacao
sudo usermod -aG sudo regularizacao
sudo su - regularizacao
```

### Configuração de Diretórios

Crie a estrutura de diretórios necessária:

```bash
mkdir -p /home/regularizacao/{app,logs,backups,uploads}
mkdir -p /home/regularizacao/app/{backend,frontend}
```

## Instalação do Backend

### Download do Código Fonte

Clone o repositório do projeto:

```bash
cd /home/regularizacao/app/backend
git clone [URL_DO_REPOSITORIO] .
```

### Configuração do Ambiente Virtual Python

Crie e ative o ambiente virtual:

```bash
python3 -m venv venv
source venv/bin/activate
```

### Instalação de Dependências Python

Instale as dependências do projeto:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Configuração de Variáveis de Ambiente

Crie o arquivo de configuração:

```bash
cp .env.example .env
nano .env
```

Configure as seguintes variáveis:

```env
# Configurações da Aplicação
FLASK_APP=src/main.py
FLASK_ENV=production
SECRET_KEY=sua_chave_secreta_muito_segura_aqui

# Configurações do Banco de Dados
DATABASE_URL=postgresql://regularizacao_user:senha_segura@localhost:5432/regularizacao_db

# Configurações de Upload
UPLOAD_FOLDER=/home/regularizacao/uploads
MAX_CONTENT_LENGTH=10485760

# Configurações de Email (opcional)
MAIL_SERVER=smtp.mogimimirim.sp.gov.br
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=sistema@mogimimirim.sp.gov.br
MAIL_PASSWORD=senha_email

# Configurações de Logs
LOG_LEVEL=INFO
LOG_FILE=/home/regularizacao/logs/app.log
```

### Teste da Instalação Backend

Teste se o backend está funcionando:

```bash
source venv/bin/activate
python src/main.py
```

Acesse `http://localhost:5001/api/health` para verificar se a API está respondendo.

## Configuração do Banco de Dados

### Instalação e Configuração do PostgreSQL

**Inicialização do PostgreSQL:**

```bash
# Ubuntu/Debian
sudo systemctl start postgresql
sudo systemctl enable postgresql

# CentOS/RHEL
sudo postgresql-15-setup initdb
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15
```

### Criação do Banco de Dados

Conecte-se ao PostgreSQL como superusuário:

```bash
sudo -u postgres psql
```

Execute os seguintes comandos SQL:

```sql
-- Criar usuário da aplicação
CREATE USER regularizacao_user WITH PASSWORD 'senha_segura_aqui';

-- Criar banco de dados
CREATE DATABASE regularizacao_db OWNER regularizacao_user;

-- Conectar ao banco criado
\c regularizacao_db

-- Habilitar extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE regularizacao_db TO regularizacao_user;
GRANT ALL ON SCHEMA public TO regularizacao_user;

-- Sair do psql
\q
```

### Configuração de Acesso

Edite o arquivo de configuração do PostgreSQL:

```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Adicione ou modifique as seguintes linhas:

```
# Acesso local para a aplicação
local   regularizacao_db    regularizacao_user                md5
host    regularizacao_db    regularizacao_user    127.0.0.1/32    md5
```

Edite o arquivo postgresql.conf:

```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Configure os seguintes parâmetros:

```
listen_addresses = 'localhost'
port = 5432
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

Reinicie o PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### Inicialização do Schema

Execute as migrações do banco de dados:

```bash
cd /home/regularizacao/app/backend
source venv/bin/activate
python -c "from src.main import app; from src.models import db; app.app_context().push(); db.create_all()"
```

### Criação do Usuário Administrador

Execute o script de criação do usuário inicial:

```bash
python scripts/create_admin_user.py
```

## Instalação do Frontend

### Download e Configuração

```bash
cd /home/regularizacao/app/frontend
git clone [URL_DO_REPOSITORIO_FRONTEND] .
```

### Instalação de Dependências Node.js

```bash
npm install
```

### Configuração do Frontend

Crie o arquivo de configuração:

```bash
cp .env.example .env.production
nano .env.production
```

Configure as variáveis:

```env
VITE_API_BASE_URL=https://seu-dominio.com/api
VITE_APP_TITLE=Sistema de Regularização de Imóveis
VITE_APP_VERSION=1.0.0
```

### Build de Produção

Gere os arquivos de produção:

```bash
npm run build
```

Os arquivos serão gerados no diretório `dist/`.

## Configuração de Produção

### Configuração do Nginx

Crie o arquivo de configuração do site:

```bash
sudo nano /etc/nginx/sites-available/regularizacao
```

Adicione a seguinte configuração:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    # Redirecionamento para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;
    
    # Configurações SSL
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Configurações de segurança
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    
    # Servir arquivos estáticos do frontend
    location / {
        root /home/regularizacao/app/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache para arquivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Proxy para API backend
    location /api/ {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Configurações para upload de arquivos
        client_max_body_size 10M;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # Logs
    access_log /var/log/nginx/regularizacao_access.log;
    error_log /var/log/nginx/regularizacao_error.log;
}
```

Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/regularizacao /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Configuração do Systemd para Backend

Crie o arquivo de serviço:

```bash
sudo nano /etc/systemd/system/regularizacao-backend.service
```

Adicione a configuração:

```ini
[Unit]
Description=Sistema de Regularização de Imóveis - Backend
After=network.target postgresql.service

[Service]
Type=simple
User=regularizacao
Group=regularizacao
WorkingDirectory=/home/regularizacao/app/backend
Environment=PATH=/home/regularizacao/app/backend/venv/bin
ExecStart=/home/regularizacao/app/backend/venv/bin/python src/main.py
Restart=always
RestartSec=10

# Configurações de segurança
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/home/regularizacao

[Install]
WantedBy=multi-user.target
```

Ative e inicie o serviço:

```bash
sudo systemctl daemon-reload
sudo systemctl enable regularizacao-backend
sudo systemctl start regularizacao-backend
```

### Configuração de Logs

Configure a rotação de logs:

```bash
sudo nano /etc/logrotate.d/regularizacao
```

Adicione:

```
/home/regularizacao/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 regularizacao regularizacao
    postrotate
        systemctl reload regularizacao-backend
    endscript
}
```

## Configuração de Segurança

### Firewall

Configure o firewall para permitir apenas as portas necessárias:

```bash
# Ubuntu/Debian
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Configuração SSL/TLS

Para obter certificados SSL gratuitos com Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Configure renovação automática:

```bash
sudo crontab -e
```

Adicione:

```
0 12 * * * /usr/bin/certbot renew --quiet
```

### Hardening do PostgreSQL

Edite o arquivo postgresql.conf:

```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Configure:

```
ssl = on
ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key'
log_connections = on
log_disconnections = on
log_statement = 'mod'
```

### Backup Automático

Crie script de backup:

```bash
nano /home/regularizacao/scripts/backup.sh
```

Adicione:

```bash
#!/bin/bash
BACKUP_DIR="/home/regularizacao/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup do banco de dados
pg_dump -h localhost -U regularizacao_user regularizacao_db > $BACKUP_DIR/db_backup_$DATE.sql

# Backup dos uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /home/regularizacao/uploads

# Remover backups antigos (manter 30 dias)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

Configure execução automática:

```bash
chmod +x /home/regularizacao/scripts/backup.sh
crontab -e
```

Adicione:

```
0 2 * * * /home/regularizacao/scripts/backup.sh
```

