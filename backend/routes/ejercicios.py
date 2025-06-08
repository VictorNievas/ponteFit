from flask import Blueprint, jsonify, request
from utils.utilidades import serialize_document
from extensions import mongo, jwt

ejercicios = Blueprint('ejercicios', __name__)

@ejercicios.route('/get_ejercicios', methods=['GET'])
def get_ejercicios():
    try:
        data = list(mongo.db.ejercicios.find())
        serialized_data = [serialize_document(doc) for doc in data]
        return jsonify(serialized_data)
    except Exception as e:
        return jsonify(error=str(e)), 500
    

@ejercicios.route('/get_ejercicio', methods=['GET'])
def get_ejercicio():
    try:
        id = int(request.args.get('id'))
        ejercicio = mongo.db.ejercicios.find_one({"id": id})
        serialized_data = serialize_document(ejercicio)
        return jsonify(serialized_data)
    except Exception as e:
        return jsonify(error=str(e)), 500


@ejercicios.route('/crear_rutina', methods=['POST'])
def crear_rutina():
    data = request.get_json()
    user_id = int(data.get('id'))
    nombre = str(data.get('nombre'))
    descripcion = str(data.get('descripcion'))
    ejercicios_raw = data.get('ejercicios')

    # Normalizamos a una lista de ejercicios válida
    if isinstance(ejercicios_raw, list):
        ejercicios = ejercicios_raw
    elif isinstance(ejercicios_raw, dict):
        ejercicios = [ejercicios_raw]
    else:
        ejercicios = []

    ultima_rutina = mongo.db.rutinas.find_one(sort=[("_id", -1)])
    mongo.db.rutinas.insert_one({
        "id": ultima_rutina["id"] + 1,
        "nombre": nombre,
        "id_usuario": user_id,
        "descripcion": descripcion,
        "ejercicios": ejercicios
    })

    return jsonify({"message": "Rutina creada correctamente"}), 201

@ejercicios.route('/anadir_ejercicio_rutina', methods=['POST'])
def anadir_ejercicio_rutina():
    data = request.get_json()
    rutina_id = int(data.get('id_rutina'))
    ejercicio_id = int(data.get('id_ejercicio'))
    series = int(data.get('series'))

    mongo.db.rutinas.update_one(
        {"id": rutina_id},
        {"$push": {"ejercicios": {"id_ejercicio": ejercicio_id,"series": series}}}
    )

    return jsonify({"message": "Ejercicio aniadido a la rutina correctamente"}), 201

@ejercicios.route('get_rutinas', methods=['GET'])
def get_rutinas():
    user_id = int(request.args.get('id'))

    rutinas = list(mongo.db.rutinas.find({'id_usuario' : user_id}))
    datos = [serialize_document(doc) for doc in rutinas]

    return jsonify(datos)

@ejercicios.route('get_rutina', methods=['GET'])
def get_rutina():
    rutina_id = int(request.args.get('id'))

    rutina = mongo.db.rutinas.find_one({'id': rutina_id})
    datos = serialize_document(rutina)

    return jsonify(datos)

@ejercicios.route('actualizar_rutina', methods=['POST'])
def actualizar_rutina():
    data = request.get_json()
    rutina_id = int(data.get('id'))
    rutina = data.get('rutina')    

    mongo.db.rutinas.update_one(
        {"id": rutina_id},
        {"$set": {"nombre": rutina['nombre'], "ejercicios": rutina['ejercicios']}} 
    )

    return jsonify({"message": "Rutina editada correctamente"}), 201

@ejercicios.route('guardar_sesion', methods=['POST'])
def guardar_sesion():
    data = request.get_json()
    sesion = data.get('sesion')
    user_id = int(sesion.get('id_usuario'))
    rutina_id = int(sesion.get('id_rutina'))
    publico = bool(sesion.get('public'))
    fecha = str(sesion.get('fecha'))
    ejercicios = sesion.get('ejercicios')
    pesoLevantado = float(sesion.get('pesoLevantado'))

    ultima_sesion = mongo.db.sesiones.find_one(sort=[("_id", -1)])
    mongo.db.sesiones.insert_one({
        "id": ultima_sesion["id"] + 1,
        "id_usuario": user_id,
        "id_rutina": rutina_id,
        "fecha": fecha,
        "ejercicios": ejercicios,
        "publico": publico,
        "pesoLevantado": pesoLevantado,
        "comentarios": []
    })

    return jsonify({"message": "Sesion guardada correctamente"}), 201

@ejercicios.route('get_ultima_sesion', methods=['GET'])
def get_ultima_sesion():
    user_id = int(request.args.get('id'))
    rutina_id = int(request.args.get('rutina_id'))

    sesion = mongo.db.sesiones.find_one({'id_usuario': user_id, 'id_rutina': rutina_id}, sort=[("_id", -1)])
    datos = serialize_document(sesion)
    return jsonify(datos)


# A partir de aqui no estan anadidas al frontend
@ejercicios.route('get_mis_sesiones', methods=['GET'])
def get_mis_sesiones():
    user_id = int(request.args.get('id'))

    sesiones = list(mongo.db.sesiones.find({'id_usuario' : user_id}))
    datos = [serialize_document(doc) for doc in sesiones]

    return jsonify(datos)

@ejercicios.route('get_sesiones', methods=['GET'])
def get_sesiones():
    sesiones = list(mongo.db.sesiones.find({}))
    datos = [serialize_document(doc) for doc in sesiones]
    return jsonify(datos)

@ejercicios.route('get_sesiones_publicas', methods=['GET'])
def get_sesiones_publicas():
    sesiones = list(mongo.db.sesiones.find({'publico': True}))
    datos = [serialize_document(doc) for doc in sesiones]
    return jsonify(datos)

@ejercicios.route('get_sesiones_rutina', methods=['GET'])
def get_sesiones_rutina():
    user_id = int(request.args.get('id'))
    rutina_id = int(request.args.get('rutina_id'))
    sesiones = list(mongo.db.sesiones.find({'id_usuario': user_id, 'id_rutina': rutina_id}))
    datos = [serialize_document(doc) for doc in sesiones]
    return jsonify(datos)

@ejercicios.route('anadir_record', methods=['POST'])
def anadir_record():
    user_id = int(request.json.get('id_usuario'))
    ejercicio_id = int(request.json.get('id_ejercicio'))
    objetivo = float(request.json.get('objetivo'))

    ultimo_record = mongo.db.records.find_one(sort=[("_id", -1)])

    mongo.db.records.insert_one({
        "id": ultimo_record["id"] + 1,
        "id_usuario": user_id,
        "id_ejercicio": ejercicio_id,
        "objetivo": objetivo
    })
    return jsonify({"message": "Record anadido correctamente"}), 201

@ejercicios.route('get_record', methods=['GET'])
def get_record():
    user_id = int(request.args.get('id_usuario'))
    ejercicio_id = int(request.args.get('id_ejercicio'))
    record = mongo.db.records.find_one({'id_usuario': user_id, 'id_ejercicio': ejercicio_id})
    datos = serialize_document(record)
    return jsonify(datos)

@ejercicios.route('actualizar_record', methods=['POST'])
def actualizar_record():
    data = request.get_json()
    user_id = int(data.get('id_usuario'))
    ejercicio_id = int(data.get('id_ejercicio'))
    objetivo = float(data.get('objetivo'))

    mongo.db.records.update_one(
        {"id_usuario": user_id , "id_ejercicio": ejercicio_id},
        {"$set": {"objetivo": objetivo}}
    )

    return jsonify({"message": "Record actualizado correctamente"}), 201

@ejercicios.route('/anadir_comentario', methods=['POST'])
def anadir_comentario():
    data = request.get_json()
    
    # Obtener los datos del JSON
    user_id = int(data.get('id_usuario'))
    sesion_id = int(data.get('id_sesion'))
    comentario = str(data.get('comentario'))

    # Realizar la actualización en la colección 'sesiones'
    mongo.db.sesiones.update_one(
        {"id": sesion_id},  # Filtro: Buscar la sesión con el ID
        {"$push": {"comentarios": {"id_usuario": user_id, "comentario": comentario}}}  # Añadir el comentario
    )

    # Respuesta de éxito
    return jsonify({"message": "Comentario añadido correctamente"}), 201

@ejercicios.route('/get_registro_ejercicio', methods=['GET'])
def get_registros_ejercicio():
    usuario_id = request.args.get('id_usuario')
    ejercicio_id = request.args.get('id_ejercicio')

    if not usuario_id or not ejercicio_id:
        return jsonify({'error': 'Faltan parámetros usuario_id o ejercicio_id'}), 400

    try:
        usuario_id = int(usuario_id)
        ejercicio_id = int(ejercicio_id)
    except ValueError:
        return jsonify({'error': 'Parámetros deben ser enteros'}), 400

    try:
        sesiones = mongo.db.sesiones.find({
            "id_usuario": usuario_id,
            "ejercicios.id_ejercicio": ejercicio_id
        })

        mejores_series = []

        for sesion in sesiones:
            mejor_serie = None
            max_peso_x_reps = 0
            fecha = sesion.get("fecha")
            sesion_id = sesion.get("id")

            for ejercicio in sesion.get("ejercicios", []):
                if ejercicio.get("id_ejercicio") == ejercicio_id:
                    for serie in ejercicio.get("series", []):
                        peso = serie.get("peso", 0)
                        repeticiones = serie.get("repeticiones", 0)

                        # Aseguramos que peso y repeticiones sean int o float
                        if isinstance(peso, dict):
                            # Por si acaso viene {'$numberInt': '96'} o similar
                            peso = int(next(iter(peso.values())))
                        if isinstance(repeticiones, dict):
                            repeticiones = int(next(iter(repeticiones.values())))

                        valor = peso * repeticiones

                        if valor > max_peso_x_reps:
                            max_peso_x_reps = valor
                            mejor_serie = {
                                "sesion_id": int(sesion_id),
                                "fecha": fecha,
                                "peso": peso,
                                "repeticiones": repeticiones,
                                "valor": valor
                            }

            if mejor_serie:
                mejores_series.append(mejor_serie)

        return jsonify(mejores_series), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
