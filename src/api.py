from flask import Flask, jsonify
import os
import json

app = Flask(__name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), '../../data/extracted_info.json')