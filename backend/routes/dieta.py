from flask import Blueprint, jsonify,request
from utils.utilidades import serialize_document
from extensions import mongo, jwt
from datetime import datetime

dieta = Blueprint('dieta', __name__)

@dieta.route('/get_peso', methods=['GET'])
def get_peso():
    # Obtener el id del usuario desde los parámetros de la URL
    user_id = int(request.args.get('id'))
    
    usuario = mongo.db.usuarios.find_one({'id': user_id})
    peso = usuario['peso_inicial']
    if not peso:
        return jsonify({"message": "Usuario no encontrado."}), 404

    # Devuelve el peso del usuario encontrado
    return jsonify(peso), 200

@dieta.route('/calcular_calorias_basales', methods=['GET'])
def calcular_calorias_basales():
    user_id = int(request.args.get('id'))
    usuario = mongo.db.usuarios.find_one({'id': user_id})
    
    if usuario['sexo'] == 'hombre':
        calorias = (10*usuario['peso_inicial']) + (6.25*usuario['altura']) - (5*usuario['edad']) + 5
    else:
        calorias = (10*usuario['peso_inicial']) + (6.25*usuario['altura']) - (5*usuario['edad']) - 161

    return jsonify(calorias), 200  


@dieta.route('/calcular_macros', methods=['GET'])
def calcular_macros():
    user_id = int(request.args.get('id'))
    
    usuario = mongo.db.usuarios.find_one({'id': user_id})
    if not usuario:
        return jsonify({"message": "Usuario no encontrado."}), 404

    # Obtener datos del usuario
    peso = usuario['peso_inicial']
    nivel_actividad = usuario['nivel_actividad']
    if( nivel_actividad == 'muy_activo'):
        factor_actividad = 1.725
    elif (nivel_actividad == 'activo'):
        factor_actividad = 1.55
    elif (nivel_actividad == 'sedentario'):
        factor_actividad = 1.2

    calorias = ((10 * peso) + (6.25 * usuario['altura']) - (5 * usuario['edad']))* factor_actividad
    
    if usuario['sexo'] == 'hombre':
        calorias += 5
    else:
        calorias -= 161

    # Calcular macros
    proteina = 2 * peso
    grasa = peso
    objetivo = usuario['objetivo']

    if objetivo == 'Mantener':
        carbohidratos = (calorias - (17 * peso)) / 4
    elif objetivo == 'Ganar Masa Muscular':
        carbohidratos = ((calorias + 300) - (17 * peso)) / 4
        calorias += 300
    elif objetivo == 'Perder Grasa':
        carbohidratos = ((calorias - 300) - (17 * peso)) / 4
        calorias -= 300
    else:
        return jsonify({"message": "Objetivo no válido."}), 400

    return jsonify({
        "calorias": round(calorias),
        "proteina": round(proteina),
        "carbohidratos": round(carbohidratos),
        "grasa": round(grasa)
    }), 200

@dieta.route('/registrar_peso', methods=['POST'])
def registar_peso():
    data = request.get_json()
    user_id = int(data.get('id'))
    peso = float(data.get('peso'))
    fecha = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    ultimo_peso = mongo.db.registroPesos.find_one(sort=[("_id", -1)])
    mongo.db.registroPesos.insert_one({
        "id": ultimo_peso["id"] + 1,
        "id_usuario" : user_id,
        "peso": peso,
        "fecha": fecha
    })

    mongo.db.usuarios.update_one(
        {"id": user_id,},
        {"$set": {"peso_inicial": peso}}
    )
    return jsonify({"message": "Peso registrado exitosamente"}), 201

@dieta.route('/get_todos_pesos', methods=['GET'])
def get_todos_pesos():
    user_id = int(request.args.get('id'))
    todos_pesos = list(mongo.db.registroPesos.find({"id_usuario": user_id}))
    for peso in todos_pesos:
        peso["_id"] = str(peso["_id"])
    return jsonify({"pesos": todos_pesos}), 200