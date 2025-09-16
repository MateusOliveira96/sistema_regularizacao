-- Dados de exemplo para o Sistema de Regularização de Imóveis Públicos
-- Prefeitura Municipal de Mogi Mirim

-- Inserir usuários de exemplo
INSERT INTO users (name, email, password_hash, role) VALUES
('Maria Silva Santos', 'maria.santos@mogimimirim.sp.gov.br', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEuBNpNjHEsHjKqP5vHEhfHi8.', 'manager'),
('João Carlos Oliveira', 'joao.oliveira@mogimimirim.sp.gov.br', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEuBNpNjHEsHjKqP5vHEhfHi8.', 'operator'),
('Ana Paula Costa', 'ana.costa@mogimimirim.sp.gov.br', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEuBNpNjHEsHjKqP5vHEhfHi8.', 'operator'),
('Roberto Ferreira', 'roberto.ferreira@mogimimirim.sp.gov.br', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADfEuBNpNjHEsHjKqP5vHEhfHi8.', 'manager');

-- Inserir imóveis de exemplo com coordenadas reais de Mogi Mirim
INSERT INTO properties (
    municipal_code, registry_number, address_street, address_number, 
    address_neighborhood, address_zipcode, area_total, area_built, 
    property_type, current_use, current_owner, regularization_status, 
    description, geometry, created_by
) VALUES
(
    'MM001-2024', '12345', 'Rua das Flores', '123', 
    'Centro', '13800-000', 500.00, 200.00, 
    'Residencial', 'Casa de apoio social', 'Prefeitura Municipal', 'in_progress',
    'Imóvel utilizado para atividades sociais da comunidade',
    ST_SetSRID(ST_MakePoint(-46.9578, -22.4318), 4326), 2
),
(
    'MM002-2024', '12346', 'Avenida Brasil', '456', 
    'Vila Nova', '13800-100', 1200.00, 800.00, 
    'Comercial', 'Centro comunitário', 'Prefeitura Municipal', 'pending',
    'Centro comunitário para atividades culturais e esportivas',
    ST_SetSRID(ST_MakePoint(-46.9598, -22.4298), 4326), 2
),
(
    'MM003-2024', '12347', 'Rua São José', '789', 
    'Jardim Alvorada', '13800-200', 800.00, 300.00, 
    'Institucional', 'Posto de saúde', 'Prefeitura Municipal', 'municipal_registered',
    'Unidade básica de saúde do bairro',
    ST_SetSRID(ST_MakePoint(-46.9618, -22.4278), 4326), 3
),
(
    'MM004-2024', '12348', 'Rua das Palmeiras', '321', 
    'Parque das Laranjeiras', '13800-300', 2000.00, 1000.00, 
    'Educacional', 'Escola municipal', 'Prefeitura Municipal', 'registry_completed',
    'Escola municipal de ensino fundamental',
    ST_SetSRID(ST_MakePoint(-46.9638, -22.4258), 4326), 2
),
(
    'MM005-2024', '12349', 'Avenida dos Trabalhadores', '654', 
    'Distrito Industrial', '13800-400', 5000.00, 2500.00, 
    'Industrial', 'Galpão municipal', 'Prefeitura Municipal', 'in_progress',
    'Galpão para armazenamento de equipamentos municipais',
    ST_SetSRID(ST_MakePoint(-46.9658, -22.4238), 4326), 4
);

-- Inserir registros de etapas para os imóveis
-- Imóvel MM001-2024 (em progresso)
INSERT INTO step_records (property_id, step_id, status, start_date, end_date, responsible_user_id, observations, completion_percentage, created_by) VALUES
(1, 1, 'completed', '2024-01-15', '2024-02-10', 3, 'Levantamento topográfico concluído com sucesso', 100, 2),
(1, 2, 'completed', '2024-02-11', '2024-03-15', 2, 'Análise jurídica finalizada, documentação em ordem', 100, 2),
(1, 3, 'in_progress', '2024-03-16', NULL, 2, 'Aguardando aprovação final da secretaria de obras', 75, 2),
(1, 4, 'not_started', NULL, NULL, NULL, NULL, 0, 2),
(1, 5, 'not_started', NULL, NULL, NULL, NULL, 0, 2);

-- Imóvel MM002-2024 (pendente)
INSERT INTO step_records (property_id, step_id, status, start_date, end_date, responsible_user_id, observations, completion_percentage, created_by) VALUES
(2, 1, 'in_progress', '2024-02-01', NULL, 3, 'Levantamento topográfico em andamento', 60, 2),
(2, 2, 'not_started', NULL, NULL, NULL, NULL, 0, 2),
(2, 3, 'not_started', NULL, NULL, NULL, NULL, 0, 2),
(2, 4, 'not_started', NULL, NULL, NULL, NULL, 0, 2),
(2, 5, 'not_started', NULL, NULL, NULL, NULL, 0, 2);

-- Imóvel MM003-2024 (cadastrado no município)
INSERT INTO step_records (property_id, step_id, status, start_date, end_date, responsible_user_id, observations, completion_percentage, created_by) VALUES
(3, 1, 'completed', '2023-10-01', '2023-10-25', 3, 'Levantamento topográfico concluído', 100, 3),
(3, 2, 'completed', '2023-10-26', '2023-11-30', 2, 'Análise jurídica concluída', 100, 3),
(3, 3, 'completed', '2023-12-01', '2024-01-15', 2, 'Aprovação municipal obtida', 100, 3),
(3, 4, 'in_progress', '2024-01-16', NULL, 4, 'Preparando documentação para cartório', 80, 3),
(3, 5, 'not_started', NULL, NULL, NULL, NULL, 0, 3);

-- Imóvel MM004-2024 (regularizado)
INSERT INTO step_records (property_id, step_id, status, start_date, end_date, responsible_user_id, observations, completion_percentage, created_by) VALUES
(4, 1, 'completed', '2023-06-01', '2023-06-20', 3, 'Levantamento topográfico concluído', 100, 2),
(4, 2, 'completed', '2023-06-21', '2023-07-25', 2, 'Análise jurídica concluída', 100, 2),
(4, 3, 'completed', '2023-07-26', '2023-09-10', 2, 'Aprovação municipal obtida', 100, 2),
(4, 4, 'completed', '2023-09-11', '2023-09-25', 4, 'Documentação cartorial preparada', 100, 2),
(4, 5, 'completed', '2023-09-26', '2023-10-15', 4, 'Registro em cartório concluído', 100, 2);

-- Imóvel MM005-2024 (em progresso)
INSERT INTO step_records (property_id, step_id, status, start_date, end_date, responsible_user_id, observations, completion_percentage, created_by) VALUES
(5, 1, 'completed', '2024-01-10', '2024-02-05', 3, 'Levantamento topográfico concluído', 100, 4),
(5, 2, 'in_progress', '2024-02-06', NULL, 2, 'Análise jurídica em andamento, aguardando certidões', 40, 4),
(5, 3, 'not_started', NULL, NULL, NULL, NULL, 0, 4),
(5, 4, 'not_started', NULL, NULL, NULL, NULL, 0, 4),
(5, 5, 'not_started', NULL, NULL, NULL, NULL, 0, 4);

-- Inserir alguns documentos de exemplo
INSERT INTO documents (step_record_id, filename, file_path, file_size, file_type, document_type, description, uploaded_by) VALUES
(1, 'planta_topografica_mm001.pdf', '/uploads/documents/planta_topografica_mm001.pdf', 2048576, 'application/pdf', 'Planta Topográfica', 'Planta topográfica do imóvel MM001-2024', 3),
(1, 'memorial_descritivo_mm001.pdf', '/uploads/documents/memorial_descritivo_mm001.pdf', 1024768, 'application/pdf', 'Memorial Descritivo', 'Memorial descritivo do levantamento topográfico', 3),
(2, 'parecer_juridico_mm001.pdf', '/uploads/documents/parecer_juridico_mm001.pdf', 1536000, 'application/pdf', 'Parecer Jurídico', 'Parecer jurídico sobre a situação legal do imóvel', 2),
(6, 'planta_topografica_mm002.pdf', '/uploads/documents/planta_topografica_mm002.pdf', 2560000, 'application/pdf', 'Planta Topográfica', 'Planta topográfica do imóvel MM002-2024', 3),
(11, 'planta_aprovada_mm003.pdf', '/uploads/documents/planta_aprovada_mm003.pdf', 3072000, 'application/pdf', 'Planta Aprovada', 'Planta aprovada pela prefeitura', 2),
(16, 'escritura_mm004.pdf', '/uploads/documents/escritura_mm004.pdf', 2048000, 'application/pdf', 'Escritura', 'Escritura do imóvel registrada em cartório', 4),
(21, 'levantamento_mm005.pdf', '/uploads/documents/levantamento_mm005.pdf', 2304000, 'application/pdf', 'Levantamento', 'Levantamento topográfico do galpão municipal', 3);

-- Atualizar geometrias de polígono para alguns imóveis (exemplo de terrenos)
UPDATE properties SET polygon_geometry = ST_SetSRID(ST_GeomFromText('POLYGON((-46.9578 -22.4318, -46.9576 -22.4318, -46.9576 -22.4316, -46.9578 -22.4316, -46.9578 -22.4318))'), 4326) WHERE id = 1;
UPDATE properties SET polygon_geometry = ST_SetSRID(ST_GeomFromText('POLYGON((-46.9598 -22.4298, -46.9595 -22.4298, -46.9595 -22.4295, -46.9598 -22.4295, -46.9598 -22.4298))'), 4326) WHERE id = 2;
UPDATE properties SET polygon_geometry = ST_SetSRID(ST_GeomFromText('POLYGON((-46.9618 -22.4278, -46.9616 -22.4278, -46.9616 -22.4276, -46.9618 -22.4276, -46.9618 -22.4278))'), 4326) WHERE id = 3;

COMMIT;

