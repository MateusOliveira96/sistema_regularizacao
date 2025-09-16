from flask import Blueprint, request, jsonify, session
from src.models import db
from src.models.regularization_step import RegularizationStep

steps_bp = Blueprint('regularization_steps', __name__)

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

@steps_bp.route('', methods=['GET'])
@require_auth()
def get_steps():
    """Listar todas as etapas de regularização"""
    try:
        active_only = request.args.get('active_only', 'false').lower() == 'true'
        
        query = RegularizationStep.query
        
        if active_only:
            query = query.filter(RegularizationStep.active == True)
        
        steps = query.order_by(RegularizationStep.order_sequence).all()
        
        return jsonify({
            'steps': [step.to_dict() for step in steps]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@steps_bp.route('/<int:step_id>', methods=['GET'])
@require_auth()
def get_step(step_id):
    """Obter etapa por ID"""
    try:
        step = RegularizationStep.query.get_or_404(step_id)
        return jsonify({'step': step.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@steps_bp.route('', methods=['POST'])
@require_auth(['admin', 'manager'])
def create_step():
    """Criar nova etapa de regularização"""
    try:
        data = request.get_json()
        
        # Validações
        required_fields = ['name', 'order_sequence']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Verificar se a ordem já existe
        existing_step = RegularizationStep.query.filter_by(order_sequence=data['order_sequence']).first()
        if existing_step:
            return jsonify({'error': 'Já existe uma etapa com esta ordem sequencial'}), 400
        
        # Criar etapa
        step = RegularizationStep(
            name=data['name'],
            description=data.get('description'),
            order_sequence=data['order_sequence'],
            estimated_duration_days=data.get('estimated_duration_days'),
            required_documents=data.get('required_documents'),
            active=data.get('active', True)
        )
        
        db.session.add(step)
        db.session.commit()
        
        return jsonify({
            'message': 'Etapa criada com sucesso',
            'step': step.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@steps_bp.route('/<int:step_id>', methods=['PUT'])
@require_auth(['admin', 'manager'])
def update_step(step_id):
    """Atualizar etapa de regularização"""
    try:
        step = RegularizationStep.query.get_or_404(step_id)
        data = request.get_json()
        
        # Atualizar campos permitidos
        updatable_fields = [
            'name', 'description', 'order_sequence', 'estimated_duration_days',
            'required_documents', 'active'
        ]
        
        for field in updatable_fields:
            if field in data:
                # Verificar ordem sequencial única
                if field == 'order_sequence':
                    existing = RegularizationStep.query.filter_by(order_sequence=data[field]).first()
                    if existing and existing.id != step_id:
                        return jsonify({'error': 'Já existe uma etapa com esta ordem sequencial'}), 400
                
                setattr(step, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Etapa atualizada com sucesso',
            'step': step.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@steps_bp.route('/<int:step_id>', methods=['DELETE'])
@require_auth(['admin'])
def delete_step(step_id):
    """Excluir etapa de regularização"""
    try:
        step = RegularizationStep.query.get_or_404(step_id)
        
        # Verificar se a etapa tem registros associados
        if step.step_records.count() > 0:
            return jsonify({
                'error': 'Não é possível excluir etapa que possui registros associados'
            }), 400
        
        db.session.delete(step)
        db.session.commit()
        
        return jsonify({'message': 'Etapa excluída com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@steps_bp.route('/reorder', methods=['POST'])
@require_auth(['admin', 'manager'])
def reorder_steps():
    """Reordenar etapas de regularização"""
    try:
        data = request.get_json()
        
        if not data.get('step_orders'):
            return jsonify({'error': 'Lista de ordenação é obrigatória'}), 400
        
        # Validar se todos os IDs existem
        step_ids = [item['id'] for item in data['step_orders']]
        steps = RegularizationStep.query.filter(RegularizationStep.id.in_(step_ids)).all()
        
        if len(steps) != len(step_ids):
            return jsonify({'error': 'Algumas etapas não foram encontradas'}), 404
        
        # Atualizar ordem sequencial
        for item in data['step_orders']:
            step = next(s for s in steps if s.id == item['id'])
            step.order_sequence = item['order_sequence']
        
        db.session.commit()
        
        return jsonify({'message': 'Etapas reordenadas com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

