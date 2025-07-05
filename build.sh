#!/bin/bash
# build.sh

# Salir si hay errores
set -e

# Construir el frontend Angular
cd frontend
npm install
ng build --configuration=production --output-path=../backend/static
cd ..

# Instalar dependencias del backend
cd backend
pip install -r requirements.txt
