import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/logo_encoder')
def get_data():
    # Récupération du paramètre GET "name" de l'URL
    siret = request.args.get("siret")
    
    with open('LogoEncoderAPI/data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Si le paramètre "name" a été spécifié, on filtre les données en conséquence
    if siret:
        data = data[siret]
    
    return jsonify(data)

if __name__ == '__main__':
    app.run(port=9000)