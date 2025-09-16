from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class RegularizationStep(db.Model):
    __tablename__ = 'regularization_steps'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    order_sequence = db.Column(db.Integer, nullable=False)
    estimated_duration_days = db.Column(db.Integer)
    required_documents = db.Column(db.Text)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    step_records = db.relationship('StepRecord', backref='step', lazy='dynamic')

    def __repr__(self):
        return f'<RegularizationStep {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'order_sequence': self.order_sequence,
            'estimated_duration_days': self.estimated_duration_days,
            'required_documents': self.required_documents,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

