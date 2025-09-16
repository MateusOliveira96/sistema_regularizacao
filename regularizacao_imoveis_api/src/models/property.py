from flask_sqlalchemy import SQLAlchemy
from geoalchemy2 import Geometry
from datetime import datetime

db = SQLAlchemy()

class Property(db.Model):
    __tablename__ = 'properties'
    
    id = db.Column(db.Integer, primary_key=True)
    municipal_code = db.Column(db.String(50), unique=True)
    registry_number = db.Column(db.String(100))
    address_street = db.Column(db.String(255), nullable=False)
    address_number = db.Column(db.String(20))
    address_neighborhood = db.Column(db.String(100))
    address_city = db.Column(db.String(100), default='Mogi Mirim')
    address_zipcode = db.Column(db.String(10))
    area_total = db.Column(db.Numeric(10, 2))
    area_built = db.Column(db.Numeric(10, 2))
    property_type = db.Column(db.String(100))
    current_use = db.Column(db.Text)
    current_owner = db.Column(db.String(255))
    regularization_status = db.Column(db.String(50), default='pending')
    description = db.Column(db.Text)
    geometry = db.Column(Geometry('POINT', srid=4326))
    polygon_geometry = db.Column(Geometry('POLYGON', srid=4326))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    step_records = db.relationship('StepRecord', backref='property', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Property {self.municipal_code}>'

    def get_full_address(self):
        """Retorna o endereço completo formatado"""
        address_parts = [self.address_street]
        if self.address_number:
            address_parts.append(self.address_number)
        if self.address_neighborhood:
            address_parts.append(self.address_neighborhood)
        if self.address_city:
            address_parts.append(self.address_city)
        return ', '.join(address_parts)

    def get_coordinates(self):
        """Retorna as coordenadas como dicionário"""
        if self.geometry:
            # Assumindo que geometry é um ponto
            return {
                'latitude': self.geometry.data.get('coordinates', [None, None])[1],
                'longitude': self.geometry.data.get('coordinates', [None, None])[0]
            }
        return None

    def to_dict(self, include_geometry=False):
        result = {
            'id': self.id,
            'municipal_code': self.municipal_code,
            'registry_number': self.registry_number,
            'address_street': self.address_street,
            'address_number': self.address_number,
            'address_neighborhood': self.address_neighborhood,
            'address_city': self.address_city,
            'address_zipcode': self.address_zipcode,
            'full_address': self.get_full_address(),
            'area_total': float(self.area_total) if self.area_total else None,
            'area_built': float(self.area_built) if self.area_built else None,
            'property_type': self.property_type,
            'current_use': self.current_use,
            'current_owner': self.current_owner,
            'regularization_status': self.regularization_status,
            'description': self.description,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_geometry:
            result['coordinates'] = self.get_coordinates()
            
        return result

