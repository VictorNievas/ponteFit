from flask import Blueprint, jsonify, request,session
from flask_jwt_extended import create_access_token, jwt_required
import bcrypt
from datetime import datetime

from extensions import mongo, jwt

usuarios = Blueprint('usuarios', __name__)

@usuarios.route('/registro', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('nombre')
    password = data.get('password')
    email = data.get('email')
    altura = data.get('altura')
    nivel_actividad = data.get('nivel_actividad')
    peso_inicial = data.get('peso_inicial')
    edad = data.get('edad')
    objetivo = data.get('objetivo')
    sexo = data.get('sexo')

    if mongo.db.usuarios.find_one({'username': username}):
        return jsonify({'msg': 'El nombre de usuario ya existe'}), 409  # 409 Conflict

    if not username or not password:
        return jsonify({"error": "Faltan datos"}), 400
    ultimo_usuario = mongo.db.usuarios.find_one(sort=[("_id", -1)])
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    mongo.db.usuarios.insert_one({
        "id": ultimo_usuario["id"] + 1,
        "username": username,
        "password": hashed_password,
        "email": email,
        "altura": altura,
        "nivel_actividad": nivel_actividad,
        "peso_inicial": peso_inicial,
        "edad": edad,
        "objetivo": objetivo,
        "sexo": sexo
    })
    fecha = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    ultimo_peso = mongo.db.registroPesos.find_one(sort=[("_id", -1)])
    mongo.db.registroPesos.insert_one({
        "id": ultimo_peso["id"] + 1,
        "id_usuario" : ultimo_usuario["id"] + 1,
        "peso": peso_inicial,
        "fecha" : fecha
    })

    return jsonify({"message": "Usuario registrado exitosamente"}), 201

@usuarios.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = mongo.db.usuarios.find_one({"username": username})

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        token = create_access_token(identity=str(user['_id']))
        return jsonify({"token": token,"user_id": user['id']}), 200

    return jsonify({"error": "Credenciales incorrectas"}), 401

#id del cliente: 620112728938-2l0gjdiu997416je57vtggggn1elo1sj.apps.googleusercontent.com
@usuarios.route('/get_usuario', methods=['GET'])
def get_usuario():
    user_id = int(request.args.get('id'))
    user = mongo.db.usuarios.find_one({'id': user_id})
    if user:
        return jsonify({"username": user['username'], "email": user['email'], "altura": user['altura'], "nivel_actividad": user['nivel_actividad'], "peso": user['peso_inicial'], "edad": user['edad'], "objetivo": user['objetivo'], "sexo": user['sexo']}), 200
    return jsonify({"error": "Usuario no encontrado"}), 404

@usuarios.route('/editar_usuario', methods=['PUT'])
def editar_usuario():
    data = request.get_json()
    user_id = int(request.args.get('id'))
    username = data.get('username')
    email = data.get('email')
    altura = data.get('altura')
    nivel_actividad = data.get('nivel_actividad')
    peso_inicial = data.get('peso_inicial')
    edad = data.get('edad')
    objetivo = data.get('objetivo')
    sexo = data.get('sexo')

    mongo.db.usuarios.update_one(
        {'id': user_id},
        {'$set': {'username': username,
                  'email': email,
                  'altura': altura,
                  'nivel_actividad': nivel_actividad,
                  'peso_inicial': peso_inicial,
                  'edad': edad,
                  'objetivo': objetivo,
                  'sexo': sexo
                  },
        }
    )
    return jsonify({"message": "Usuario actualizado con éxito"}), 200


@usuarios.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    return jsonify({"message": "Acceso permitido"}), 200
