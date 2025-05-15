from flask import Flask, session
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_session import Session
from extensions import mongo, jwt
from routes.usuarios import usuarios
from routes.ejercicios import ejercicios
from routes.dieta import dieta
from routes.google import google
import os
import certifi

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Configuración dinámica de la base de datos
MONGO_URI_LOCAL = "mongodb://root:example@localhost:27017/tfg?authSource=admin"
MONGO_URI_ATLAS = "mongodb+srv://victorquentar:vnh2002q@tfg.gi3cqgd.mongodb.net/tfg?retryWrites=true&w=majority&appName=tfg"

# Puedes usar una variable de entorno para elegir
use_atlas = os.environ.get('USE_ATLAS', 'true').lower() == 'true'
app.config["MONGO_URI"] = MONGO_URI_ATLAS if use_atlas else MONGO_URI_LOCAL

# Claves y configuraciones de seguridad
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'clave_secreta')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'clave_secreta')

# Configuración de sesiones
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = os.path.abspath('./flask_session')  # ruta válida
os.makedirs(app.config['SESSION_FILE_DIR'], exist_ok=True)

# Inicialización de extensiones
jwt = JWTManager(app)
mongo.init_app(app)
Session(app)

# Corrección para certificados SSL de MongoDB Atlas
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()

# Registrar Blueprints
app.register_blueprint(usuarios, url_prefix='/api/usuarios')
app.register_blueprint(ejercicios, url_prefix='/api/ejercicios')
app.register_blueprint(dieta, url_prefix='/api/dieta')
app.register_blueprint(google, url_prefix='/api/google')

from pymongo.errors import PyMongoError


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
