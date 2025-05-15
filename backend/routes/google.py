from flask import Blueprint, jsonify, request, redirect, session
from flask_session import Session
from flask_jwt_extended import jwt_required,get_jwt
from google_auth_oauthlib.flow import Flow
import os
import requests
from datetime import datetime
import certifi
from flask_cors import cross_origin
from datetime import datetime, timedelta
from dotenv import load_dotenv
# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Asegura que se permita el transporte inseguro (HTTP en lugar de HTTPS)
#os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
#os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()

# Crear Blueprint para Google
google = Blueprint('google', __name__)

# Configuración de Google OAuth2
ARCHIVO_CLIENT_SECRET = os.getenv("ARCHIVO_CLIENT_SECRET")  # Ruta al archivo client_secret.json
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")  # ID del cliente de Google
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")  # Secreto del cliente de Google
GOOGLE_REDIRECT_URI = "http://localhost:5000/api/google/callback"
SCOPES = os.getenv("SCOPES")  # Alcances de Google Fit


# Ruta absoluta para el archivo client_secret.json
ruta_absoluta = os.path.join(os.path.dirname(__file__), ARCHIVO_CLIENT_SECRET)

# Ruta para iniciar el proceso de autenticación con Google Fit
@google.route('/google_fit_auth')
def google_fit_auth():
    state = request.args.get('state')  # Obtener state desde el frontend
    if not state:
        return "Error: falta el parámetro state", 400

    flow = Flow.from_client_secrets_file(
        ruta_absoluta,
        scopes=SCOPES,
        redirect_uri=GOOGLE_REDIRECT_URI,
        state=state  # Pasar el state generado por el frontend
    )
    auth_url, _ = flow.authorization_url()
    return redirect(auth_url)

@google.route('/callback')
def google_fit_callback():
    state_enviado = request.args.get('state')
    
    flow = Flow.from_client_secrets_file(
        ruta_absoluta,
        scopes=SCOPES,
        redirect_uri=GOOGLE_REDIRECT_URI,
        state=state_enviado  # Usar el state recibido en la respuesta
    )
    flow.fetch_token(authorization_response=request.url)

    # Guardar tokens en la sesión o base de datos
    session['google_token'] = flow.credentials.token
    session['google_refresh_token'] = flow.credentials.refresh_token

    return """
        <script>
            if (window.opener) {
                window.opener.postMessage("google_auth_success", "*");
                window.close();
            } else {
                window.location.href = "http://localhost:4200/mi_perfil";
            }
        </script>
    """

# Ruta para obtener los datos de Google Fit
@google.route('/google_fit_data', methods=['GET'])
@jwt_required()
def get_google_fit_data():
    if 'google_token' not in session:
        return jsonify({"error": "Usuario no autenticado con Google Fit"}), 401

    google_token = session['google_token']
    headers = {"Authorization": f"Bearer {google_token}"}
    
    url_aggregate = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate"
    start_of_today = datetime.combine(datetime.today(), datetime.min.time())
    end_of_today = start_of_today + timedelta(days=1)
    
    body = {
        "aggregateBy": [
            {"dataTypeName": "com.google.step_count.delta"},
            {"dataTypeName": "com.google.calories.expended"},
            {"dataTypeName": "com.google.distance.delta"},
            {"dataTypeName": "com.google.active_minutes"}
        ],
        "bucketByTime": {"durationMillis": 86400000},
        "startTimeMillis": int(start_of_today.timestamp() * 1000),
        "endTimeMillis": int(end_of_today.timestamp() * 1000)
    }
    
    response_aggregate = requests.post(url_aggregate, json=body, headers=headers)
    url_profile = "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos"
    response_profile = requests.get(url_profile, headers=headers)
    
    if response_aggregate.status_code == 401:
        new_token = refresh_google_token(session['google_refresh_token'])
        if new_token:
            session['google_token'] = new_token
            headers["Authorization"] = f"Bearer {new_token}"
            response_aggregate = requests.post(url_aggregate, json=body, headers=headers)
            response_profile = requests.get(url_profile, headers=headers)
        else:
            return jsonify({"error": "Error al refrescar el token de Google Fit"}), 401
    
    if response_aggregate.status_code == 200 and response_profile.status_code == 200:
        aggregate_data = response_aggregate.json()
        profile_data = response_profile.json()

        # Obtener datos con manejo de errores y conversiones necesarias
        steps = aggregate_data.get("bucket", [{}])[0].get("dataset", [{}])[0].get("point", [{}])[0].get("value", [{}])[0].get("intVal", 0)
        calories = int(aggregate_data.get("bucket", [{}])[0].get("dataset", [{}])[1].get("point", [{}])[0].get("value", [{}])[0].get("fpVal", 0))  # Sin decimales
        distance_m = aggregate_data.get("bucket", [{}])[0].get("dataset", [{}])[2].get("point", [{}])[0].get("value", [{}])[0].get("fpVal", 0)
        distance_km = round(distance_m / 1000, 2)  # Convertir metros a km con 2 decimales
        active_minutes = aggregate_data.get("bucket", [{}])[0].get("dataset", [{}])[3].get("point", [{}])[0].get("value", [{}])[0].get("intVal", 0)

        print(steps, calories, distance_km, active_minutes)  # Debug

        name = profile_data.get("names", [{}])[0].get("displayName", "Desconocido")
        photo_url = profile_data.get("photos", [{}])[0].get("url", "")
        email = profile_data.get("emailAddresses", [{}])[0].get("value", "")

        return jsonify({
            "steps": steps,
            "calories": calories,
            "distance": distance_km,
            "active_minutes": active_minutes,
            "profile": {
                "name": name,
                "email": email,
                "photoUrl": photo_url
            }
        }), 200
    else:
        return jsonify({
            "error": "Error al obtener datos de Google Fit",
            "details": response_aggregate.json() if response_aggregate.status_code != 200 else response_profile.json()
        }), response_aggregate.status_code if response_aggregate.status_code != 200 else response_profile.status_code

# Función para refrescar el token de acceso de Google
def refresh_google_token(refresh_token):
    """Refresca el token de acceso de Google"""
    url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    response = requests.post(url, data=data)
    if response.status_code == 200:
        return response.json().get("access_token")
    return None