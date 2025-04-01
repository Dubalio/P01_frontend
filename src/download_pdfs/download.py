import os
import json
import requests
from datetime import datetime

# Obtener ruta base del script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construir la ruta al archivo JSON (está en ../scrapers/)
fecha_archivo = datetime.now().strftime("%d-%m-%Y")
nombre_archivo = os.path.join(script_dir, "..", "scrapers", f"pdf_links_{fecha_archivo}.json")
nombre_archivo = os.path.abspath(nombre_archivo)

# Crear carpeta de salida en data/YYYY-MM-DD
fecha_carpeta = datetime.now().strftime("%Y-%m-%d")
carpeta_destino = os.path.join(script_dir, "..", "..", "data", fecha_carpeta)
carpeta_destino = os.path.abspath(carpeta_destino)
os.makedirs(carpeta_destino, exist_ok=True)

# DEBUG: Mostrar ruta y archivos encontrados
scrapers_path = os.path.abspath(os.path.join(script_dir, "..", "scrapers"))
print(f"🔍 Buscando archivo: {nombre_archivo}")
print(f"📁 Archivos en scrapers/: {os.listdir(scrapers_path)}")

# Verificar existencia del archivo
if not os.path.exists(nombre_archivo):
    print(f"❌ No se encontró el archivo {nombre_archivo}")
    exit()

# Leer el JSON
with open(nombre_archivo, "r", encoding="utf-8") as file:
    links = json.load(file)

# Descargar PDFs
for i, url in enumerate(links):
    try:
        response = requests.get(url)
        response.raise_for_status()
        nombre_pdf = os.path.join(carpeta_destino, f"archivo_{i+1}.pdf")
        with open(nombre_pdf, "wb") as f:
            f.write(response.content)
        print(f"✅ Descargado: {nombre_pdf}")
    except Exception as e:
        print(f"⚠️ Error al descargar {url}: {e}")
