from flask import Blueprint, request, jsonify, session
from geoalchemy2.functions import ST_AsGeoJSON, ST_GeomFromText, ST_SetSRID
from src.models import db
from src.models.property import Property
from src.models.step_record import StepRecord
from src.models.regularization_step import RegularizationStep

properties_bp = Blueprint('properties', __name__)

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

@properties_bp.route('', methods=['GET'])
@require_auth()
def get_properties():
    """Listar todos os imóveis"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        neighborhood = request.args.get('neighborhood', '')
        include_geometry = request.args.get('include_geometry', 'false').lower() == 'true'
        
        query = Property.query
        
        if search:
            query = query.filter(
                (Property.municipal_code.ilike(f'%{search}%')) |
                (Property.address_street.ilike(f'%{search}%')) |
                (Property.current_owner.ilike(f'%{search}%'))
            )
        
        if status:
            query = query.filter(Property.regularization_status == status)
        
        if neighborhood:
            query = query.filter(Property.address_neighborhood.ilike(f'%{neighborhood}%'))
        
        properties = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'properties': [prop.to_dict(include_geometry=include_geometry) for prop in properties.items],
            'total': properties.total,
            'pages': properties.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@properties_bp.route('/<int:property_id>', methods=['GET'])
@require_auth()
def get_property(property_id):
    """Obter imóvel por ID"""
    try:
        property_obj = Property.query.get_or_404(property_id)
        include_geometry = request.args.get('include_geometry', 'true').lower() == 'true'
        
        return jsonify({'property': property_obj.to_dict(include_geometry=include_geometry)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@properties_bp.route('', methods=['POST'])
@require_auth(['admin', 'manager', 'operator'])
def create_property():
    """Criar novo imóvel"""
    try:
        data = request.get_json()
        
        # Validações
        required_fields = ['address_street']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Verificar se código municipal já existe
        if data.get('municipal_code'):
            if Property.query.filter_by(municipal_code=data['municipal_code']).first():
                return jsonify({'error': 'Código municipal já está em uso'}), 400
        
        # Criar imóvel
        property_obj = Property(
            municipal_code=data.get('municipal_code'),
            registry_number=data.get('registry_number'),
            address_street=data['address_street'],
            address_number=data.get('address_number'),
            address_neighborhood=data.get('address_neighborhood'),
            address_city=data.get('address_city', 'Mogi Mirim'),
            address_zipcode=data.get('address_zipcode'),
            area_total=data.get('area_total'),
            area_built=data.get('area_built'),
            property_type=data.get('property_type'),
            current_use=data.get('current_use'),
            current_owner=data.get('current_owner'),
            regularization_status=data.get('regularization_status', 'pending'),
            description=data.get('description'),
            created_by=session['user_id']
        )
        
        # Adicionar geometria se fornecida
        if data.get('latitude') and data.get('longitude'):
            property_obj.geometry = ST_SetSRID(
                ST_GeomFromText(f"POINT({data['longitude']} {data['latitude']})"), 
                4326
            )
        
        db.session.add(property_obj)
        db.session.flush()  # Para obter o ID
        
        # Criar registros de etapas padrão
        steps = RegularizationStep.query.filter_by(active=True).order_by(RegularizationStep.order_sequence).all()
        for step in steps:
            step_record = StepRecord(
                property_id=property_obj.id,
                step_id=step.id,
                created_by=session['user_id']
            )
            db.session.add(step_record)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Imóvel criado com sucesso',
            'property': property_obj.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@properties_bp.route('/<int:property_id>', methods=['PUT'])
@require_auth(['admin', 'manager', 'operator'])
def update_property(property_id):
    """Atualizar imóvel"""
    try:
        property_obj = Property.query.get_or_404(property_id)
        data = request.get_json()
        
        # Atualizar campos permitidos
        updatable_fields = [
            'municipal_code', 'registry_number', 'address_street', 'address_number',
            'address_neighborhood', 'address_city', 'address_zipcode', 'area_total',
            'area_built', 'property_type', 'current_use', 'current_owner',
            'regularization_status', 'description'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(property_obj, field, data[field])
        
        # Verificar código municipal único
        if 'municipal_code' in data and data['municipal_code']:
            existing = Property.query.filter_by(municipal_code=data['municipal_code']).first()
            if existing and existing.id != property_id:
                return jsonify({'error': 'Código municipal já está em uso'}), 400
        
        # Atualizar geometria se fornecida
        if data.get('latitude') and data.get('longitude'):
            property_obj.geometry = ST_SetSRID(
                ST_GeomFromText(f"POINT({data['longitude']} {data['latitude']})"), 
                4326
            )
        
        db.session.commit()
        
        return jsonify({
            'message': 'Imóvel atualizado com sucesso',
            'property': property_obj.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@properties_bp.route('/<int:property_id>', methods=['DELETE'])
@require_auth(['admin', 'manager'])
def delete_property(property_id):
    """Excluir imóvel"""
    try:
        property_obj = Property.query.get_or_404(property_id)
        
        db.session.delete(property_obj)
        db.session.commit()
        
        return jsonify({'message': 'Imóvel excluído com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@properties_bp.route('/status-options', methods=['GET'])
@require_auth()
def get_status_options():
    """Listar opções de status de regularização"""
    return jsonify({
        'status_options': [
            {'value': 'pending', 'label': 'Pendente'},
            {'value': 'in_progress', 'label': 'Em Progresso'},
            {'value': 'municipal_registered', 'label': 'Cadastrado no Município'},
            {'value': 'registry_completed', 'label': 'Regularizado no Cartório'}
        ]
    }), 200

@properties_bp.route('/neighborhoods', methods=['GET'])
@require_auth()
def get_neighborhoods():
    """Listar bairros únicos dos imóveis"""
    try:
        neighborhoods = db.session.query(Property.address_neighborhood)\
            .filter(Property.address_neighborhood.isnot(None))\
            .distinct()\
            .order_by(Property.address_neighborhood)\
            .all()
        
        return jsonify({
            'neighborhoods': [n[0] for n in neighborhoods if n[0]]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@properties_bp.route('/<int:property_id>/progress', methods=['GET'])
@require_auth()
def get_property_progress(property_id):
    """Obter progresso das etapas de um imóvel"""
    try:
        property_obj = Property.query.get_or_404(property_id)
        
        step_records = StepRecord.query\
            .join(RegularizationStep)\
            .filter(StepRecord.property_id == property_id)\
            .order_by(RegularizationStep.order_sequence)\
            .all()
        
        progress_data = []
        for record in step_records:
            progress_data.append(record.to_dict(include_relations=True))
        
        # Calcular estatísticas gerais
        total_steps = len(step_records)
        completed_steps = len([r for r in step_records if r.status == 'completed'])
        completion_percentage = (completed_steps / total_steps * 100) if total_steps > 0 else 0
        
        return jsonify({
            'property': property_obj.to_dict(),
            'steps': progress_data,
            'summary': {
                'total_steps': total_steps,
                'completed_steps': completed_steps,
                'completion_percentage': round(completion_percentage, 2)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

