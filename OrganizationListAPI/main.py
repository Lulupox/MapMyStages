import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/companies', methods=['GET'])
def companies():
    with open('OrganizationListAPI/companies.json', 'r') as f:
        companies = json.load(f)
    return jsonify(companies)

@app.route('/companies/add', methods=['GET'])
def add_company():
    name = request.args.get('name')
    address = request.args.get('address')
    phone = request.args.get('phone')
    coords = request.args.get('coords')
    siret = request.args.get('siret')
    new_company = {"company": {"name": name, "address": address, "phone": phone, "coords": coords, "siret": siret}}
    with open('OrganizationListAPI/companies.json', 'r') as f:
        companies = json.load(f)
    companies.append(new_company)
    with open('OrganizationListAPI/companies.json', 'w') as f:
        json.dump(companies, f)
    return jsonify(new_company)

@app.route('/companies/remove', methods=['GET'])
def remove_company():
    siret = request.args.get('siret')
    with open('OrganizationListAPI/companies.json', 'r') as f:
        companies = json.load(f)
    for i, company in enumerate(companies):
        if company['company']['siret'] == siret:
            del companies[i]
            break
    with open('OrganizationListAPI/companies.json', 'w') as f:
        json.dump(companies, f)
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000)