from flask import Blueprint, request, jsonify, session
from src.models import db
from src.models.user import User

users_bp = Blueprint('users', __name__)

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

@users_bp.route('', methods=['GET'])
@require_auth(['admin', 'manager'])
def get_users():
    """Listar todos os usuários"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        role = request.args.get('role', '')
        
        query = User.query
        
        if search:
            query = query.filter(
                (User.name.ilike(f'%{search}%')) |
                (User.email.ilike(f'%{search}%'))
            )
        
        if role:
            query = query.filter(User.role == role)
        
        users = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in users.items],
            'total': users.total,
            'pages': users.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<int:user_id>', methods=['GET'])
@require_auth(['admin', 'manager'])
def get_user(user_id):
    """Obter usuário por ID"""
    try:
        user = User.query.get_or_404(user_id)
        return jsonify({'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('', methods=['POST'])
@require_auth(['admin'])
def create_user():
    """Criar novo usuário"""
    try:
        data = request.get_json()
        
        # Validações
        required_fields = ['name', 'email', 'password', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        if data['role'] not in ['admin', 'manager', 'operator']:
            return jsonify({'error': 'Papel inválido'}), 400
        
        if len(data['password']) < 6:
            return jsonify({'error': 'Senha deve ter pelo menos 6 caracteres'}), 400
        
        # Verificar se email já existe
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email já está em uso'}), 400
        
        # Criar usuário
        user = User(
            name=data['name'],
            email=data['email'],
            role=data['role'],
            active=data.get('active', True)
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<int:user_id>', methods=['PUT'])
@require_auth(['admin'])
def update_user(user_id):
    """Atualizar usuário"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Atualizar campos permitidos
        if 'name' in data:
            user.name = data['name']
        
        if 'email' in data:
            # Verificar se email já existe (exceto o próprio usuário)
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Email já está em uso'}), 400
            user.email = data['email']
        
        if 'role' in data:
            if data['role'] not in ['admin', 'manager', 'operator']:
                return jsonify({'error': 'Papel inválido'}), 400
            user.role = data['role']
        
        if 'active' in data:
            user.active = data['active']
        
        if 'password' in data and data['password']:
            if len(data['password']) < 6:
                return jsonify({'error': 'Senha deve ter pelo menos 6 caracteres'}), 400
            user.set_password(data['password'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Usuário atualizado com sucesso',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@require_auth(['admin'])
def delete_user(user_id):
    """Excluir usuário"""
    try:
        user = User.query.get_or_404(user_id)
        
        # Não permitir excluir o próprio usuário
        if user_id == session['user_id']:
            return jsonify({'error': 'Não é possível excluir o próprio usuário'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Usuário excluído com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/roles', methods=['GET'])
@require_auth(['admin', 'manager'])
def get_roles():
    """Listar papéis disponíveis"""
    return jsonify({
        'roles': [
            {'value': 'admin', 'label': 'Administrador'},
            {'value': 'manager', 'label': 'Gestor'},
            {'value': 'operator', 'label': 'Operador'}
        ]
    }), 200

