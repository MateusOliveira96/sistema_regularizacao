-- Sistema de Regularização de Imóveis Públicos
-- Script de criação do banco de dados PostgreSQL com PostGIS
-- Prefeitura Municipal de Mogi Mirim

-- Habilitar extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Criar função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'operator')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar updated_at na tabela users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de imóveis
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    municipal_code VARCHAR(50) UNIQUE,
    registry_number VARCHAR(100),
    address_street VARCHAR(255) NOT NULL,
    address_number VARCHAR(20),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100) DEFAULT 'Mogi Mirim',
    address_zipcode VARCHAR(10),
    area_total DECIMAL(10,2),
    area_built DECIMAL(10,2),
    property_type VARCHAR(100),
    current_use TEXT,
    current_owner VARCHAR(255),
    regularization_status VARCHAR(50) DEFAULT 'pending' 
        CHECK (regularization_status IN ('pending', 'in_progress', 'municipal_registered', 'registry_completed')),
    description TEXT,
    geometry GEOMETRY(POINT, 4326),
    polygon_geometry GEOMETRY(POLYGON, 4326),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar updated_at na tabela properties
CREATE TRIGGER update_properties_updated_at 
    BEFORE UPDATE ON properties 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de etapas de regularização
CREATE TABLE regularization_steps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_sequence INTEGER NOT NULL,
    estimated_duration_days INTEGER,
    required_documents TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar updated_at na tabela regularization_steps
CREATE TRIGGER update_regularization_steps_updated_at 
    BEFORE UPDATE ON regularization_steps 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de registros de etapas
CREATE TABLE step_records (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    step_id INTEGER NOT NULL REFERENCES regularization_steps(id),
    status VARCHAR(50) DEFAULT 'not_started' 
        CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
    start_date DATE,
    end_date DATE,
    responsible_user_id INTEGER REFERENCES users(id),
    observations TEXT,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, step_id)
);

-- Trigger para atualizar updated_at na tabela step_records
CREATE TRIGGER update_step_records_updated_at 
    BEFORE UPDATE ON step_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de documentos
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    step_record_id INTEGER NOT NULL REFERENCES step_records(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    document_type VARCHAR(100),
    description TEXT,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para otimização de performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

CREATE INDEX idx_properties_municipal_code ON properties(municipal_code);
CREATE INDEX idx_properties_status ON properties(regularization_status);
CREATE INDEX idx_properties_created_by ON properties(created_by);
CREATE INDEX idx_properties_neighborhood ON properties(address_neighborhood);

-- Índices espaciais PostGIS
CREATE INDEX idx_properties_geometry ON properties USING GIST(geometry);
CREATE INDEX idx_properties_polygon_geometry ON properties USING GIST(polygon_geometry);

CREATE INDEX idx_regularization_steps_order ON regularization_steps(order_sequence);
CREATE INDEX idx_regularization_steps_active ON regularization_steps(active);

CREATE INDEX idx_step_records_property ON step_records(property_id);
CREATE INDEX idx_step_records_step ON step_records(step_id);
CREATE INDEX idx_step_records_status ON step_records(status);
CREATE INDEX idx_step_records_property_status ON step_records(property_id, status);
CREATE INDEX idx_step_records_responsible ON step_records(responsible_user_id);

CREATE INDEX idx_documents_step_record ON documents(step_record_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Inserir etapas padrão de regularização
INSERT INTO regularization_steps (name, description, order_sequence, estimated_duration_days, required_documents) VALUES
('Levantamento Topográfico', 'Medição e demarcação do terreno, elaboração de planta topográfica', 1, 30, 'Planta topográfica, memorial descritivo, ART do responsável técnico'),
('Análise Jurídica', 'Verificação da situação legal do imóvel, análise de documentos', 2, 45, 'Certidões negativas, histórico de propriedade, parecer jurídico'),
('Aprovação Municipal', 'Análise e aprovação pelos órgãos municipais competentes', 3, 60, 'Projeto aprovado, alvará de construção, certidão de conformidade'),
('Documentação Cartorial', 'Preparação de documentos para registro em cartório', 4, 20, 'Escritura, certidões atualizadas, planta aprovada'),
('Registro em Cartório', 'Registro oficial no cartório de registro de imóveis', 5, 30, 'Documentação completa, taxa de registro, matrícula atualizada');

-- Inserir usuário administrador padrão (senha: admin123 - deve ser alterada em produção)
INSERT INTO users (name, email, password_hash, role) VALUES
('Administrador do Sistema', 'admin@mogimimirim.sp.gov.br', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEuBNpNjHEsHjKqP5vHEhfHi8.', 'admin');

-- Criar views úteis para relatórios

-- View para estatísticas de imóveis por status
CREATE VIEW property_status_stats AS
SELECT 
    regularization_status,
    COUNT(*) as total_properties,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM properties 
GROUP BY regularization_status;

-- View para progresso de etapas por imóvel
CREATE VIEW property_progress AS
SELECT 
    p.id as property_id,
    p.municipal_code,
    p.address_street,
    p.address_number,
    p.regularization_status,
    COUNT(sr.id) as total_steps,
    COUNT(CASE WHEN sr.status = 'completed' THEN 1 END) as completed_steps,
    ROUND(
        COUNT(CASE WHEN sr.status = 'completed' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(sr.id), 0), 2
    ) as completion_percentage
FROM properties p
LEFT JOIN step_records sr ON p.id = sr.property_id
LEFT JOIN regularization_steps rs ON sr.step_id = rs.id AND rs.active = true
GROUP BY p.id, p.municipal_code, p.address_street, p.address_number, p.regularization_status;

-- View para dashboard de estatísticas gerais
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM properties) as total_properties,
    (SELECT COUNT(*) FROM properties WHERE regularization_status = 'in_progress') as properties_in_progress,
    (SELECT COUNT(*) FROM properties WHERE regularization_status = 'municipal_registered') as properties_municipal_registered,
    (SELECT COUNT(*) FROM properties WHERE regularization_status = 'registry_completed') as properties_registry_completed,
    (SELECT COUNT(*) FROM step_records WHERE status = 'in_progress') as active_steps,
    (SELECT COUNT(*) FROM documents) as total_documents;

-- Comentários nas tabelas
COMMENT ON TABLE users IS 'Usuários do sistema de regularização';
COMMENT ON TABLE properties IS 'Imóveis públicos em processo de regularização';
COMMENT ON TABLE regularization_steps IS 'Etapas padrão do processo de regularização';
COMMENT ON TABLE step_records IS 'Registros de progresso das etapas por imóvel';
COMMENT ON TABLE documents IS 'Documentos anexados às etapas de regularização';

-- Comentários nos campos geoespaciais
COMMENT ON COLUMN properties.geometry IS 'Localização pontual do imóvel (lat/lng)';
COMMENT ON COLUMN properties.polygon_geometry IS 'Polígono representando os limites do terreno';

COMMIT;

