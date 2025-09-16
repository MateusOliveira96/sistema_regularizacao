import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.config import Config
from src.models import db

# Importar blueprints
from src.routes.auth import auth_bp
from src.routes.users import users_bp
from src.routes.properties import properties_bp
from src.routes.regularization_steps import steps_bp
from src.routes.step_records import step_records_bp
from src.routes.documents import documents_bp
from src.routes.dashboard import dashboard_bp

def create_app():
    app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
    
    # Configuração
    app.config.from_object(Config)
    Config.init_app(app)
    
    # CORS
    CORS(app, origins="*")
    
    # Inicializar banco de dados
    db.init_app(app)
    
    # Registrar blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(properties_bp, url_prefix='/api/properties')
    app.register_blueprint(steps_bp, url_prefix='/api/steps')
    app.register_blueprint(step_records_bp, url_prefix='/api/step-records')
    app.register_blueprint(documents_bp, url_prefix='/api/documents')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    
    # Criar tabelas
    with app.app_context():
        db.create_all()
    
    return app

app = create_app()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
