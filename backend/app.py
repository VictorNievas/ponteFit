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

# Configuración de la conexión a MongoDB
app.config["MONGO_URI"] = "mongodb://root:example@localhost:27017/tfg?authSource=admin"
app.config['JWT_SECRET_KEY'] = 'clave_secreta'
app.config['SECRET_KEY'] = 'clave_secreta'

jwt = JWTManager(app)
mongo.init_app(app)

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()
app.config['SECRET_KEY'] = 'tu_clave_secreta'  # Cambia esto por una clave secreta segura
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = '/path/to/sessions'
Session(app)


# Registrar Blueprints
app.register_blueprint(usuarios, url_prefix='/api/usuarios')
app.register_blueprint(ejercicios, url_prefix='/api/ejercicios')
app.register_blueprint(dieta, url_prefix='/api/dieta')
app.register_blueprint(google, url_prefix='/api/google')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
