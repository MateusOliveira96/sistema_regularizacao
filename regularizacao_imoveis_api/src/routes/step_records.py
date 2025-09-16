from flask import Blueprint, request, jsonify, session
from datetime import datetime, date
from src.models import db
from src.models.step_record import StepRecord
from src.models.property import Property
from src.models.regularization_step import RegularizationStep

step_records_bp = Blueprint('step_records', __name__)

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

@step_records_bp.route('', methods=['GET'])
@require_auth()
def get_step_records():
    """Listar registros de etapas"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        property_id = request.args.get('property_id', type=int)
        step_id = request.args.get('step_id', type=int)
        status = request.args.get('status')
        responsible_user_id = request.args.get('responsible_user_id', type=int)
        
        query = StepRecord.query
        
        if property_id:
            query = query.filter(StepRecord.property_id == property_id)
        
        if step_id:
            query = query.filter(StepRecord.step_id == step_id)
        
        if status:
            query = query.filter(StepRecord.status == status)
        
        if responsible_user_id:
            query = query.filter(StepRecord.responsible_user_id == responsible_user_id)
        
        # Ordenar por propriedade e ordem da etapa
        query = query.join(RegularizationStep).order_by(
            StepRecord.property_id, 
            RegularizationStep.order_sequence
        )
        
        step_records = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'step_records': [record.to_dict(include_relations=True) for record in step_records.items],
            'total': step_records.total,
            'pages': step_records.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@step_records_bp.route('/<int:record_id>', methods=['GET'])
@require_auth()
def get_step_record(record_id):
    """Obter registro de etapa por ID"""
    try:
        record = StepRecord.query.get_or_404(record_id)
        return jsonify({'step_record': record.to_dict(include_relations=True)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@step_records_bp.route('/<int:record_id>', methods=['PUT'])
@require_auth(['admin', 'manager', 'operator'])
def update_step_record(record_id):
    """Atualizar registro de etapa"""
    try:
        record = StepRecord.query.get_or_404(record_id)
        data = request.get_json()
        
        # Atualizar campos permitidos
        if 'status' in data:
            if data['status'] not in ['not_started', 'in_progress', 'completed', 'blocked']:
                return jsonify({'error': 'Status inválido'}), 400
            record.status = data['status']
            
            # Se status mudou para 'in_progress' e não tem data de início, definir hoje
            if data['status'] == 'in_progress' and not record.start_date:
                record.start_date = date.today()
            
            # Se status mudou para 'completed' e não tem data de fim, definir hoje
            if data['status'] == 'completed' and not record.end_date:
                record.end_date = date.today()
                record.completion_percentage = 100
        
        if 'start_date' in data:
            if data['start_date']:
                record.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            else:
                record.start_date = None
        
        if 'end_date' in data:
            if data['end_date']:
                record.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
            else:
                record.end_date = None
        
        if 'responsible_user_id' in data:
            record.responsible_user_id = data['responsible_user_id']
        
        if 'observations' in data:
            record.observations = data['observations']
        
        if 'completion_percentage' in data:
            percentage = data['completion_percentage']
            if 0 <= percentage <= 100:
                record.completion_percentage = percentage
            else:
                return jsonify({'error': 'Percentual deve estar entre 0 e 100'}), 400
        
        # Validar datas
        if record.start_date and record.end_date and record.start_date > record.end_date:
            return jsonify({'error': 'Data de início não pode ser posterior à data de fim'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Registro de etapa atualizado com sucesso',
            'step_record': record.to_dict(include_relations=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@step_records_bp.route('/property/<int:property_id>', methods=['GET'])
@require_auth()
def get_property_step_records(property_id):
    """Obter todos os registros de etapas de um imóvel"""
    try:
        # Verificar se o imóvel existe
        property_obj = Property.query.get_or_404(property_id)
        
        records = StepRecord.query\
            .join(RegularizationStep)\
            .filter(StepRecord.property_id == property_id)\
            .order_by(RegularizationStep.order_sequence)\
            .all()
        
        return jsonify({
            'property': property_obj.to_dict(),
            'step_records': [record.to_dict(include_relations=True) for record in records]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@step_records_bp.route('/status-options', methods=['GET'])
@require_auth()
def get_status_options():
    """Listar opções de status de etapas"""
    return jsonify({
        'status_options': [
            {'value': 'not_started', 'label': 'Não Iniciada'},
            {'value': 'in_progress', 'label': 'Em Andamento'},
            {'value': 'completed', 'label': 'Concluída'},
            {'value': 'blocked', 'label': 'Bloqueada'}
        ]
    }), 200

@step_records_bp.route('/overdue', methods=['GET'])
@require_auth(['admin', 'manager'])
def get_overdue_records():
    """Listar registros de etapas em atraso"""
    try:
        # Buscar registros em andamento que passaram da data estimada
        from datetime import timedelta
        
        overdue_records = []
        
        records = StepRecord.query\
            .join(RegularizationStep)\
            .filter(StepRecord.status == 'in_progress')\
            .filter(StepRecord.start_date.isnot(None))\
            .filter(RegularizationStep.estimated_duration_days.isnot(None))\
            .all()
        
        today = date.today()
        
        for record in records:
            expected_end = record.start_date + timedelta(days=record.step.estimated_duration_days)
            if today > expected_end:
                record_dict = record.to_dict(include_relations=True)
                record_dict['expected_end_date'] = expected_end.isoformat()
                record_dict['days_overdue'] = (today - expected_end).days
                overdue_records.append(record_dict)
        
        return jsonify({
            'overdue_records': overdue_records,
            'total_overdue': len(overdue_records)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@step_records_bp.route('/statistics', methods=['GET'])
@require_auth(['admin', 'manager'])
def get_step_statistics():
    """Obter estatísticas dos registros de etapas"""
    try:
        # Estatísticas por status
        status_stats = db.session.query(
            StepRecord.status,
            db.func.count(StepRecord.id).label('count')
        ).group_by(StepRecord.status).all()
        
        # Estatísticas por etapa
        step_stats = db.session.query(
            RegularizationStep.name,
            StepRecord.status,
            db.func.count(StepRecord.id).label('count')
        ).join(StepRecord)\
         .group_by(RegularizationStep.name, StepRecord.status)\
         .order_by(RegularizationStep.order_sequence)\
         .all()
        
        return jsonify({
            'status_statistics': [
                {'status': stat.status, 'count': stat.count}
                for stat in status_stats
            ],
            'step_statistics': [
                {'step_name': stat.name, 'status': stat.status, 'count': stat.count}
                for stat in step_stats
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

