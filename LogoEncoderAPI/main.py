import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

import base64
import requests

def image_to_base64(url):
    image = requests.get(url).content
    return base64.b64encode(image).decode()

# Chemin absolu vers le fichier JSON des données d'URL de logo et de SIRET
LOGO_SIRET_JSON = 'LogoEncoderAPI/encoded_logo.json'

def logo_siret_exists(siret):
    """Vérifie si un siret existe déjà dans la liste des données d'URL de logo et de SIRET"""
    with open(LOGO_SIRET_JSON, 'r') as f:
        logo_siret_data = json.load(f)
    for data in logo_siret_data:
        if data['siret'] == siret:
            return True
    return False

@app.route('/logo/add', methods=['GET'])
def add_logo_siret():
    """Ajoute des données d'URL de logo et de SIRET à la liste"""
    logo_url = request.args.get('logo_url')
    siret = request.args.get('siret')
    if logo_siret_exists(siret):
        return jsonify({'error': 'SIRET already exists'})
    new_data = {"logo_url": image_to_base64(logo_url), "siret": siret}
    with open(LOGO_SIRET_JSON, 'r') as f:
        logo_siret_data = json.load(f)
    logo_siret_data.append(new_data)
    with open(LOGO_SIRET_JSON, 'w') as f:
        json.dump(logo_siret_data, f)
    return jsonify(new_data)

@app.route('/logo/remove', methods=['GET'])
def remove_logo_siret():
    """Supprime des données d'URL de logo et de SIRET de la liste"""
    siret = request.args.get('siret')
    with open(LOGO_SIRET_JSON, 'r') as f:
        logo_siret_data = json.load(f)
    for i, data in enumerate(logo_siret_data):
        if data['siret'] == siret:
            del logo_siret_data[i]
            break
    with open(LOGO_SIRET_JSON, 'w') as f:
        json.dump(json.dump(logo_siret_data, f))
    return jsonify({'status': 'success'})

@app.route('/api/logo_encoder')
def get_encoded_logo():
    # Récupération du paramètre GET "siret" de l'URL
    siret = request.args.get("siret")
    if os.path.exists(LOGO_SIRET_JSON):
        with open(LOGO_SIRET_JSON, 'r', encoding='utf-8') as f:
            encoded_logo_data = json.load(f)
        if siret:
            for item in encoded_logo_data:
                if item['siret'] == siret:
                    return jsonify(item['logo_url'])
            else:
                return jsonify({'error': 'SIRET not found'})
        return jsonify(encoded_logo_data)
    else:
        return jsonify({'error': 'File not found'})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=9000)