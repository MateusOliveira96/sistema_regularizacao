import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'uploads'
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 16777216))  # 16MB default
    
    # Criar diretório de upload se não existir
    @staticmethod
    def init_app(app):
        upload_path = os.path.join(os.path.dirname(app.instance_path), app.config['UPLOAD_FOLDER'])
        os.makedirs(upload_path, exist_ok=True)
        os.makedirs(os.path.join(upload_path, 'documents'), exist_ok=True)

