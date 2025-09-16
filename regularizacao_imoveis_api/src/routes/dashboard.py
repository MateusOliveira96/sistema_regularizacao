from flask import Blueprint, request, jsonify, session
from sqlalchemy import func, text
from src.models import db
from src.models.property import Property
from src.models.step_record import StepRecord
from src.models.regularization_step import RegularizationStep
from src.models.document import Document
from src.models.user import User

dashboard_bp = Blueprint('dashboard', __name__)

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

@dashboard_bp.route('/overview', methods=['GET'])
@require_auth()
def get_dashboard_overview():
    """Obter visão geral do dashboard"""
    try:
        # Estatísticas básicas de imóveis
        total_properties = Property.query.count()
        properties_in_progress = Property.query.filter_by(regularization_status='in_progress').count()
        properties_municipal_registered = Property.query.filter_by(regularization_status='municipal_registered').count()
        properties_registry_completed = Property.query.filter_by(regularization_status='registry_completed').count()
        properties_pending = Property.query.filter_by(regularization_status='pending').count()
        
        # Estatísticas de etapas
        total_step_records = StepRecord.query.count()
        active_steps = StepRecord.query.filter_by(status='in_progress').count()
        completed_steps = StepRecord.query.filter_by(status='completed').count()
        blocked_steps = StepRecord.query.filter_by(status='blocked').count()
        
        # Estatísticas de documentos
        total_documents = Document.query.count()
        
        # Estatísticas de usuários
        total_users = User.query.filter_by(active=True).count()
        
        return jsonify({
            'properties': {
                'total': total_properties,
                'pending': properties_pending,
                'in_progress': properties_in_progress,
                'municipal_registered': properties_municipal_registered,
                'registry_completed': properties_registry_completed
            },
            'steps': {
                'total': total_step_records,
                'active': active_steps,
                'completed': completed_steps,
                'blocked': blocked_steps
            },
            'documents': {
                'total': total_documents
            },
            'users': {
                'total': total_users
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/properties-by-status', methods=['GET'])
@require_auth()
def get_properties_by_status():
    """Obter distribuição de imóveis por status"""
    try:
        status_distribution = db.session.query(
            Property.regularization_status,
            func.count(Property.id).label('count')
        ).group_by(Property.regularization_status).all()
        
        # Mapear nomes amigáveis para os status
        status_labels = {
            'pending': 'Pendente',
            'in_progress': 'Em Progresso',
            'municipal_registered': 'Cadastrado no Município',
            'registry_completed': 'Regularizado no Cartório'
        }
        
        result = []
        for status, count in status_distribution:
            result.append({
                'status': status,
                'label': status_labels.get(status, status),
                'count': count
            })
        
        return jsonify({'properties_by_status': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/properties-by-neighborhood', methods=['GET'])
@require_auth()
def get_properties_by_neighborhood():
    """Obter distribuição de imóveis por bairro"""
    try:
        neighborhood_distribution = db.session.query(
            Property.address_neighborhood,
            func.count(Property.id).label('count')
        ).filter(Property.address_neighborhood.isnot(None))\
         .group_by(Property.address_neighborhood)\
         .order_by(func.count(Property.id).desc())\
         .limit(10).all()
        
        result = []
        for neighborhood, count in neighborhood_distribution:
            result.append({
                'neighborhood': neighborhood,
                'count': count
            })
        
        return jsonify({'properties_by_neighborhood': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/steps-progress', methods=['GET'])
@require_auth()
def get_steps_progress():
    """Obter progresso das etapas de regularização"""
    try:
        steps_progress = db.session.query(
            RegularizationStep.name,
            RegularizationStep.order_sequence,
            StepRecord.status,
            func.count(StepRecord.id).label('count')
        ).join(StepRecord)\
         .group_by(RegularizationStep.name, RegularizationStep.order_sequence, StepRecord.status)\
         .order_by(RegularizationStep.order_sequence)\
         .all()
        
        # Organizar dados por etapa
        steps_data = {}
        for step_name, order_seq, status, count in steps_progress:
            if step_name not in steps_data:
                steps_data[step_name] = {
                    'step_name': step_name,
                    'order_sequence': order_seq,
                    'not_started': 0,
                    'in_progress': 0,
                    'completed': 0,
                    'blocked': 0,
                    'total': 0
                }
            
            steps_data[step_name][status] = count
            steps_data[step_name]['total'] += count
        
        # Converter para lista ordenada
        result = list(steps_data.values())
        result.sort(key=lambda x: x['order_sequence'])
        
        return jsonify({'steps_progress': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/monthly-progress', methods=['GET'])
@require_auth()
def get_monthly_progress():
    """Obter progresso mensal de conclusão de etapas"""
    try:
        # Buscar etapas concluídas nos últimos 12 meses
        monthly_progress = db.session.query(
            func.date_trunc('month', StepRecord.end_date).label('month'),
            func.count(StepRecord.id).label('completed_steps')
        ).filter(
            StepRecord.status == 'completed',
            StepRecord.end_date.isnot(None),
            StepRecord.end_date >= func.current_date() - text("INTERVAL '12 months'")
        ).group_by(func.date_trunc('month', StepRecord.end_date))\
         .order_by(func.date_trunc('month', StepRecord.end_date))\
         .all()
        
        result = []
        for month, completed_steps in monthly_progress:
            result.append({
                'month': month.strftime('%Y-%m') if month else None,
                'completed_steps': completed_steps
            })
        
        return jsonify({'monthly_progress': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/overdue-steps', methods=['GET'])
@require_auth(['admin', 'manager'])
def get_overdue_steps():
    """Obter etapas em atraso"""
    try:
        from datetime import date, timedelta
        
        # Buscar etapas em andamento com data estimada de conclusão vencida
        overdue_query = db.session.query(
            StepRecord,
            RegularizationStep,
            Property
        ).join(RegularizationStep)\
         .join(Property)\
         .filter(
            StepRecord.status == 'in_progress',
            StepRecord.start_date.isnot(None),
            RegularizationStep.estimated_duration_days.isnot(None)
        ).all()
        
        overdue_steps = []
        today = date.today()
        
        for step_record, step, property_obj in overdue_query:
            expected_end = step_record.start_date + timedelta(days=step.estimated_duration_days)
            if today > expected_end:
                days_overdue = (today - expected_end).days
                overdue_steps.append({
                    'step_record_id': step_record.id,
                    'property_id': property_obj.id,
                    'property_code': property_obj.municipal_code,
                    'property_address': property_obj.get_full_address(),
                    'step_name': step.name,
                    'start_date': step_record.start_date.isoformat(),
                    'expected_end_date': expected_end.isoformat(),
                    'days_overdue': days_overdue,
                    'responsible_user_id': step_record.responsible_user_id
                })
        
        return jsonify({
            'overdue_steps': overdue_steps,
            'total_overdue': len(overdue_steps)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/recent-activities', methods=['GET'])
@require_auth()
def get_recent_activities():
    """Obter atividades recentes"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        # Buscar registros de etapas atualizados recentemente
        recent_updates = db.session.query(
            StepRecord,
            RegularizationStep,
            Property,
            User
        ).join(RegularizationStep)\
         .join(Property)\
         .outerjoin(User, StepRecord.responsible_user_id == User.id)\
         .order_by(StepRecord.updated_at.desc())\
         .limit(limit).all()
        
        activities = []
        for step_record, step, property_obj, user in recent_updates:
            activities.append({
                'id': step_record.id,
                'type': 'step_update',
                'property_code': property_obj.municipal_code,
                'property_address': property_obj.get_full_address(),
                'step_name': step.name,
                'status': step_record.status,
                'responsible_user': user.name if user else None,
                'updated_at': step_record.updated_at.isoformat()
            })
        
        return jsonify({'recent_activities': activities}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/performance-metrics', methods=['GET'])
@require_auth(['admin', 'manager'])
def get_performance_metrics():
    """Obter métricas de performance"""
    try:
        # Tempo médio de conclusão por etapa
        avg_duration_query = db.session.query(
            RegularizationStep.name,
            func.avg(
                func.extract('epoch', StepRecord.end_date - StepRecord.start_date) / 86400
            ).label('avg_duration_days')
        ).join(StepRecord)\
         .filter(
            StepRecord.status == 'completed',
            StepRecord.start_date.isnot(None),
            StepRecord.end_date.isnot(None)
        ).group_by(RegularizationStep.name)\
         .order_by(RegularizationStep.order_sequence)\
         .all()
        
        avg_durations = []
        for step_name, avg_days in avg_duration_query:
            avg_durations.append({
                'step_name': step_name,
                'avg_duration_days': round(float(avg_days), 1) if avg_days else 0
            })
        
        # Taxa de conclusão geral
        total_steps = StepRecord.query.count()
        completed_steps = StepRecord.query.filter_by(status='completed').count()
        completion_rate = (completed_steps / total_steps * 100) if total_steps > 0 else 0
        
        return jsonify({
            'avg_step_durations': avg_durations,
            'completion_rate': round(completion_rate, 2),
            'total_steps': total_steps,
            'completed_steps': completed_steps
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

