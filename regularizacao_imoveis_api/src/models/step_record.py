from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class StepRecord(db.Model):
    __tablename__ = 'step_records'
    
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    step_id = db.Column(db.Integer, db.ForeignKey('regularization_steps.id'), nullable=False)
    status = db.Column(db.String(50), default='not_started')
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    responsible_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    observations = db.Column(db.Text)
    completion_percentage = db.Column(db.Integer, default=0)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    documents = db.relationship('Document', backref='step_record', lazy='dynamic', cascade='all, delete-orphan')
    
    # Constraint única para evitar duplicação de etapa por imóvel
    __table_args__ = (db.UniqueConstraint('property_id', 'step_id', name='unique_property_step'),)

    def __repr__(self):
        return f'<StepRecord Property:{self.property_id} Step:{self.step_id}>'

    def get_duration_days(self):
        """Calcula a duração em dias se ambas as datas estiverem definidas"""
        if self.start_date and self.end_date:
            return (self.end_date - self.start_date).days
        return None

    def is_overdue(self):
        """Verifica se a etapa está atrasada baseado na duração estimada"""
        if self.start_date and self.step and self.step.estimated_duration_days:
            from datetime import date
            expected_end = self.start_date + timedelta(days=self.step.estimated_duration_days)
            return date.today() > expected_end and self.status != 'completed'
        return False

    def to_dict(self, include_relations=False):
        result = {
            'id': self.id,
            'property_id': self.property_id,
            'step_id': self.step_id,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'responsible_user_id': self.responsible_user_id,
            'observations': self.observations,
            'completion_percentage': self.completion_percentage,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'duration_days': self.get_duration_days()
        }
        
        if include_relations:
            if self.step:
                result['step'] = self.step.to_dict()
            if self.responsible_user:
                result['responsible_user'] = self.responsible_user.to_dict()
            if self.creator_user:
                result['creator_user'] = self.creator_user.to_dict()
                
        return result

