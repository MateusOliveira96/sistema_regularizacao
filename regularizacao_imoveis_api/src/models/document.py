from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

db = SQLAlchemy()

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    step_record_id = db.Column(db.Integer, db.ForeignKey('step_records.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.BigInteger)
    file_type = db.Column(db.String(100))
    document_type = db.Column(db.String(100))
    description = db.Column(db.Text)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Document {self.filename}>'

    def get_file_size_formatted(self):
        """Retorna o tamanho do arquivo formatado em KB, MB, etc."""
        if not self.file_size:
            return None
            
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

    def get_file_extension(self):
        """Retorna a extensão do arquivo"""
        return os.path.splitext(self.filename)[1].lower()

    def is_image(self):
        """Verifica se o arquivo é uma imagem"""
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']
        return self.get_file_extension() in image_extensions

    def is_pdf(self):
        """Verifica se o arquivo é um PDF"""
        return self.get_file_extension() == '.pdf'

    def to_dict(self, include_relations=False):
        result = {
            'id': self.id,
            'step_record_id': self.step_record_id,
            'filename': self.filename,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'file_size_formatted': self.get_file_size_formatted(),
            'file_type': self.file_type,
            'file_extension': self.get_file_extension(),
            'document_type': self.document_type,
            'description': self.description,
            'uploaded_by': self.uploaded_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_image': self.is_image(),
            'is_pdf': self.is_pdf()
        }
        
        if include_relations:
            if self.uploader:
                result['uploader'] = self.uploader.to_dict()
                
        return result

