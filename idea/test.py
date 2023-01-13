import json
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import openai
import os

app = Flask(__name__)

import openai
openai.api_key = "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"

# openai_api = openai.api_key("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")

@app.route('/companies', methods=['GET'])
def companies():
    with open('companies.json', 'r') as f:
        companies = json.load(f)
    return jsonify(companies)

@app.route('/companies/add', methods=['GET', 'POST'])
def add_company():
    if request.method == 'GET':
        name = request.args.get('name')
        address = request.args.get('address')
        phone = request.args.get('phone')
        coords = request.args.get('coords')
        siret = request.args.get('siret')
        new_company = {"company": {"name": name, "address": address, "phone": phone, "coords": coords, "siret": siret}}
        with open('companies.json', 'r') as f:
            companies = json.load(f)
        companies.append(new_company)
        with open('companies.json', 'w') as f:
            json.dump(companies, f)
        return jsonify(new_company)
    else:
        #Téléchargement des fichiers
        file = request.files['file']
        file.save(f'{siret}.pdf')
        #Résumé du contenu du rapport de stage
        with open(f'{siret}.pdf', 'rb') as f:
            data = f.read() 
            response = openai.Completion.create(
                engine="text-davinci-002",
                prompt=(f"Résumé du contenu du rapport de stage pour {name} avec le SIRET {siret} : "),
                max_tokens=150,
                n=1,
                stop=None,
                temperature=0.5,
                stream=data,
            )
            summary = response["choices"][0]["text"].strip()
            print(summary)
        return jsonify({'status': 'success', 'summary': summary})

@app.route('/companies/remove', methods=['GET'])
def remove_company():
    siret = request.args.get('siret')
    with open('companies.json', 'r') as f:
        companies = json.load(f)
    for i, company in enumerate(companies):
        if company['company']['siret'] == siret:
            os.remove(f'{siret}.pdf') #suppression dufichier PDF associé à l'entreprise
            del companies[i]
        break
    with open('companies.json', 'w') as f:
        json.dump(companies, f)
    return jsonify({'status': 'success'})

@app.route('/companies/download/<siret>', methods=['GET'])
def download_report(siret):
    try:
        return send_file(f'{siret}.pdf', as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'file not found'})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=7500)