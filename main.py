import logging
import threading
from contextlib import redirect_stdout
from io import StringIO

import webview
from waitress import serve

from server import find_free_port, server

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


if __name__ == "__main__":
    port = find_free_port()
    server_thread = threading.Thread(
        target=lambda: serve(server, host="127.0.0.1", port=port)
    )
    server_thread.daemon = True
    server_thread.start()

    stream = StringIO()
    with redirect_stdout(stream):
        window = webview.create_window(
            "Calculadora de Vigas", server, width=1280, height=800
        )
        webview.start()
