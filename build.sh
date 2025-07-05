#!/bin/bash
set -e

echo "📦 Instalando dependencias Angular..."
cd frontend
npm install
npm install -g @angular/cli  # <- aquí se instala globalmente
ng build --configuration=production --output-path=../backend/static
cd ..

echo "🐍 Instalando dependencias de Flask..."
pip install -r backend/requirements.txt
