# Локальный сервер для теста: python serve.py
# Потом в Owlbear: профиль -> Add Extension -> http://localhost:8000/manifest.json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

print("Сервер на http://localhost:8000  (Ctrl+C чтобы остановить)")
ThreadingHTTPServer(("127.0.0.1", 8000), Handler).serve_forever()
