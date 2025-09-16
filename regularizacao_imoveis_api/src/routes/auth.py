from flask import Blueprint, request, jsonify, session
from src.models import db
from src.models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint para login de usuários"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        if not user.active:
            return jsonify({'error': 'Usuário inativo'}), 401
        
        # Armazenar informações do usuário na sessão
        session['user_id'] = user.id
        session['user_role'] = user.role
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Endpoint para logout de usuários"""
    try:
        session.clear()
        return jsonify({'message': 'Logout realizado com sucesso'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Endpoint para obter informações do usuário logado"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Usuário não autenticado'}), 401
        
        user = User.query.get(session['user_id'])
        if not user or not user.active:
            session.clear()
            return jsonify({'error': 'Usuário não encontrado ou inativo'}), 401
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    """Endpoint para alterar senha do usuário logado"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Usuário não autenticado'}), 401
        
        data = request.get_json()
        
        if not data or not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Senha atual e nova senha são obrigatórias'}), 400
        
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Senha atual incorreta'}), 400
        
        if len(data['new_password']) < 6:
            return jsonify({'error': 'Nova senha deve ter pelo menos 6 caracteres'}), 400
        
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Senha alterada com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

