from flask import Blueprint, request, jsonify, session, send_file, current_app
import os
from werkzeug.utils import secure_filename
from src.models import db
from src.models.document import Document
from src.models.step_record import StepRecord

documents_bp = Blueprint('documents', __name__)

def require_auth(role_required=None):
    """Decorator para verificar autenticação e autorização"""
    def decorator(f):
        def wrapper(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'error': 'Usuário não autenticado'}), 401
            
            if role_required and session.get('user_role') not in role_required:
                return jsonify({'error': 'Acesso negado'}), 403
            
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

def allowed_file(filename):
    """Verificar se o arquivo é permitido"""
    ALLOWED_EXTENSIONS = {
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff',
        'txt', 'rtf', 'odt', 'ods', 'odp'
    }
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@documents_bp.route('', methods=['GET'])
@require_auth()
def get_documents():
    """Listar documentos"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        step_record_id = request.args.get('step_record_id', type=int)
        document_type = request.args.get('document_type')
        
        query = Document.query
        
        if step_record_id:
            query = query.filter(Document.step_record_id == step_record_id)
        
        if document_type:
            query = query.filter(Document.document_type.ilike(f'%{document_type}%'))
        
        query = query.order_by(Document.created_at.desc())
        
        documents = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'documents': [doc.to_dict(include_relations=True) for doc in documents.items],
            'total': documents.total,
            'pages': documents.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/<int:document_id>', methods=['GET'])
@require_auth()
def get_document(document_id):
    """Obter documento por ID"""
    try:
        document = Document.query.get_or_404(document_id)
        return jsonify({'document': document.to_dict(include_relations=True)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/upload', methods=['POST'])
@require_auth(['admin', 'manager', 'operator'])
def upload_document():
    """Upload de documento"""
    try:
        # Verificar se o arquivo foi enviado
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo foi enviado'}), 400
        
        file = request.files['file']
        step_record_id = request.form.get('step_record_id', type=int)
        document_type = request.form.get('document_type', '')
        description = request.form.get('description', '')
        
        if not step_record_id:
            return jsonify({'error': 'ID do registro de etapa é obrigatório'}), 400
        
        # Verificar se o registro de etapa existe
        step_record = StepRecord.query.get_or_404(step_record_id)
        
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo foi selecionado'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipo de arquivo não permitido'}), 400
        
        # Gerar nome seguro para o arquivo
        filename = secure_filename(file.filename)
        
        # Criar diretório se não existir
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'documents')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Gerar nome único para evitar conflitos
        import uuid
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Salvar arquivo
        file.save(file_path)
        
        # Criar registro no banco
        document = Document(
            step_record_id=step_record_id,
            filename=filename,
            file_path=file_path,
            file_size=os.path.getsize(file_path),
            file_type=file.content_type,
            document_type=document_type,
            description=description,
            uploaded_by=session['user_id']
        )
        
        db.session.add(document)
        db.session.commit()
        
        return jsonify({
            'message': 'Documento enviado com sucesso',
            'document': document.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/<int:document_id>/download', methods=['GET'])
@require_auth()
def download_document(document_id):
    """Download de documento"""
    try:
        document = Document.query.get_or_404(document_id)
        
        if not os.path.exists(document.file_path):
            return jsonify({'error': 'Arquivo não encontrado no servidor'}), 404
        
        return send_file(
            document.file_path,
            as_attachment=True,
            download_name=document.filename
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/<int:document_id>', methods=['PUT'])
@require_auth(['admin', 'manager', 'operator'])
def update_document(document_id):
    """Atualizar informações do documento"""
    try:
        document = Document.query.get_or_404(document_id)
        data = request.get_json()
        
        # Atualizar campos permitidos
        if 'document_type' in data:
            document.document_type = data['document_type']
        
        if 'description' in data:
            document.description = data['description']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Documento atualizado com sucesso',
            'document': document.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/<int:document_id>', methods=['DELETE'])
@require_auth(['admin', 'manager'])
def delete_document(document_id):
    """Excluir documento"""
    try:
        document = Document.query.get_or_404(document_id)
        
        # Remover arquivo físico
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
        
        # Remover registro do banco
        db.session.delete(document)
        db.session.commit()
        
        return jsonify({'message': 'Documento excluído com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/step-record/<int:step_record_id>', methods=['GET'])
@require_auth()
def get_step_record_documents(step_record_id):
    """Obter todos os documentos de um registro de etapa"""
    try:
        # Verificar se o registro de etapa existe
        step_record = StepRecord.query.get_or_404(step_record_id)
        
        documents = Document.query\
            .filter(Document.step_record_id == step_record_id)\
            .order_by(Document.created_at.desc())\
            .all()
        
        return jsonify({
            'step_record': step_record.to_dict(include_relations=True),
            'documents': [doc.to_dict() for doc in documents]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/types', methods=['GET'])
@require_auth()
def get_document_types():
    """Listar tipos de documentos comuns"""
    return jsonify({
        'document_types': [
            'Planta Topográfica',
            'Memorial Descritivo',
            'Parecer Jurídico',
            'Certidão Negativa',
            'Alvará de Construção',
            'Escritura',
            'Matrícula',
            'Projeto Aprovado',
            'ART - Anotação de Responsabilidade Técnica',
            'Foto do Imóvel',
            'Documento de Identificação',
            'Comprovante de Endereço',
            'Outros'
        ]
    }), 200

@documents_bp.route('/statistics', methods=['GET'])
@require_auth(['admin', 'manager'])
def get_document_statistics():
    """Obter estatísticas dos documentos"""
    try:
        # Total de documentos
        total_documents = Document.query.count()
        
        # Documentos por tipo
        type_stats = db.session.query(
            Document.document_type,
            db.func.count(Document.id).label('count')
        ).group_by(Document.document_type).all()
        
        # Tamanho total dos arquivos
        total_size = db.session.query(
            db.func.sum(Document.file_size)
        ).scalar() or 0
        
        return jsonify({
            'total_documents': total_documents,
            'total_size_bytes': total_size,
            'total_size_formatted': format_file_size(total_size),
            'documents_by_type': [
                {'type': stat.document_type or 'Não especificado', 'count': stat.count}
                for stat in type_stats
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def format_file_size(size_bytes):
    """Formatar tamanho do arquivo"""
    if not size_bytes:
        return "0 B"
    
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"

