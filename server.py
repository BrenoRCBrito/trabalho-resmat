import logging
import os
import socket
import sys

from flask import Flask, jsonify, render_template, request
from waitress import serve

import app as app

logger = logging.getLogger(__name__)

static_dir = ""
templates_dir = ""

if hasattr(sys, "_MEIPASS"):
    # If running in a PyInstaller bundle, set the paths to the bundled resources
    base_path = sys._MEIPASS  # Path to the temporary folder where the .exe is extracted
    templates_dir = os.path.join(base_path, "templates")
    static_dir = os.path.join(base_path, "static")
else:
    # If running as a regular Python script
    templates_dir = "templates"
    static_dir = "static"

server = Flask(__name__, static_folder=static_dir, template_folder=templates_dir)
server.config["SEND_FILE_MAX_AGE_DEFAULT"] = 1  # disable caching


def start_server():
    port = find_free_port()
    # Use waitress instead of app.run for production
    serve(app, host="127.0.0.1", port=port)
    return port


def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("localhost", 0))
        return s.getsockname()[1]


@server.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-store"
    return response


@server.route("/")
def index():
    return render_template("index.html")


@server.route("/calculate-beam", methods=["POST"])
def calculate_beam():
    logging.warning(templates_dir)
    logging.warning(static_dir)
    data = request.get_json()
    logging.info(data)
    beam = app.BeamJSON(**data)

    logging.info(repr(beam))
    try:
        return jsonify(app.calculate(beam))
    except Exception as e:
        logging.error(e)
        return jsonify(repr(e)), 400
