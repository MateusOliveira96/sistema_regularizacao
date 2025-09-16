from flask_sqlalchemy import SQLAlchemy
from geoalchemy2 import Geometry

db = SQLAlchemy()

# Importar todos os modelos aqui para garantir que sejam registrados
from .user import User
from .property import Property
from .regularization_step import RegularizationStep
from .step_record import StepRecord
from .document import Document

