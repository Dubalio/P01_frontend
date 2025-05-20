from flask import Flask, jsonify
import os
import json

app = Flask(__name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), '../../data/extracted_info.json')

@app.route('/api/empresas', methods=['GET'])
def get_all_data():
    if not os.path.exists(DATA_PATH):
        return jsonify({"error": "Archivo de datos no encontrado."}), 404

    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    return jsonify(data)

@app.route('/api/empresa/<string:filename>', methods=['GET'])
def get_empresa_by_filename(filename):
    if not os.path.exists(DATA_PATH):
        return jsonify({"error": "Archivo de datos no encontrado."}), 404

    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    empresa = data.get(filename)
    if not empresa:
        return jsonify({"error": "Empresa no encontrada."}), 404

    return jsonify(empresa)

if __name__ == '__main__':
    app.run(debug=True)