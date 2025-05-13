import os
import json
import requests
from datetime import datetime

def obtener_fechas():
    hoy = datetime.now()
    return hoy.strftime("%d-%m-%Y"), hoy.strftime("%Y-%m-%d")

def preparar_rutas(script_dir, fecha_archivo, fecha_carpeta):
    # Obtener la ruta absoluta de la carpeta base (P01)
    base_dir = os.path.abspath(os.path.join(script_dir, ".."))
    
    # Construir la ruta del archivo JSON en src/
    ruta_json = os.path.join(base_dir, "src", f"pdf_links_{fecha_archivo}.json")
    
    # Construir la carpeta destino en data/<fecha>
    carpeta_destino = os.path.join(base_dir, "data", fecha_carpeta)
    os.makedirs(carpeta_destino, exist_ok=True)
    
    return ruta_json, carpeta_destino


def mostrar_archivos_en_scrapers(script_dir):
    scrapers_path = os.path.abspath(os.path.join(script_dir, "..", "scrapers"))
    print(f" Archivos en scrapers/: {os.listdir(scrapers_path)}")

def descargar_pdfs_desde_json(ruta_json, carpeta_destino):
    with open(ruta_json, "r", encoding="utf-8") as file:
        links = json.load(file)

    for i, url in enumerate(links):
        try:
            response = requests.get(url)
            response.raise_for_status()
            nombre_pdf = os.path.join(carpeta_destino, f"archivo_{i+1}.pdf")
            with open(nombre_pdf, "wb") as f:
                f.write(response.content)
            print(f" Descargado: {nombre_pdf}")
        except Exception as e:
            print(f" Error al descargar {url}: {e}")


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    fecha_archivo, fecha_carpeta = obtener_fechas()
    ruta_json, carpeta_destino = preparar_rutas(script_dir, fecha_archivo, fecha_carpeta)

    print(f" Buscando archivo: {ruta_json}")
    mostrar_archivos_en_scrapers(script_dir)

    if not os.path.exists(ruta_json):
        print(f" No se encontró el archivo {ruta_json}")
    else:
        descargar_pdfs_desde_json(ruta_json, carpeta_destino)
