#!/bin/bash
set -e

echo "📦 Instalando dependencias Angular..."
cd frontend
npm install

echo "🏗️ Compilando Angular..."
npx ng build --configuration=production --output-path=../backend/static
cd ..

echo "🐍 Instalando dependencias de Flask..."
pip install -r backend/requirements.txt
