from scrapers.scrap import get_pdf_links, save_pdf_links_to_json, get_current_date
from download_pdfs.download import descargar_pdfs_desde_json, preparar_rutas, obtener_fechas
from pdf_processing.pdf_extractor import extract_from_all_pdfs_in_folder
from delete_function.delete_files import delete_files_and_folder
import os
import json
import sys
from pymongo import MongoClient
import dotenv

# Cargar variables de entorno
dotenv.load_dotenv()

# Obtener argumentos (si se proporcionó una fecha específica)
fecha_especificada = sys.argv[1] if len(sys.argv) > 1 else None

def main():
    # Conectar a MongoDB
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = MongoClient(mongo_uri)
    db = client[os.getenv("DB_NAME", "tuBaseDeDatos")]
    documents_collection = db["documents"]  # Colección separada para documentos
    
    # --- SCRAPING ---
    print("[BUSQUEDA] Iniciando scraping...")
    url = "https://www.diariooficial.interior.gob.cl/edicionelectronica/empresas_cooperativas.php?date={}&edition=44147".format(get_current_date())
    pdf_links = get_pdf_links(url)
    print(url)
    if pdf_links:
        save_pdf_links_to_json(pdf_links)
    else:
        print("[ERROR] No se encontraron enlaces de PDF.")
        return {"success": False, "message": "No se encontraron enlaces PDF"}

    # --- DESCARGA DE PDFs ---
    print("[DESCARGA] Iniciando descarga de PDFs...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    fecha_archivo, fecha_carpeta = obtener_fechas()
    
    # Si se especificó una fecha como argumento, usarla en lugar de la fecha actual
    if fecha_especificada:
        fecha_carpeta = fecha_especificada
        print(f"Usando fecha especificada: {fecha_carpeta}")
    
    ruta_json, carpeta_destino = preparar_rutas(script_dir, fecha_archivo, fecha_carpeta)

    if not os.path.exists(ruta_json):
        print(f"[ERROR] No se encontró el archivo {ruta_json}")
        return {"success": False, "message": "No se encontró el archivo JSON con enlaces"}
    else:
        descargar_pdfs_desde_json(ruta_json, carpeta_destino)

    # --- PROCESAMIENTO DE PDFs ---
    print("[PROCESO] Iniciando procesamiento de PDFs...")
    data_folder = os.path.abspath(os.path.join(script_dir, "..", "data"))  # Ajustar la ruta
    
    # Pasar la colección de MongoDB a la función de extracción
    result = extract_from_all_pdfs_in_folder(data_folder, documents_collection)

    # --- ELIMINAR ARCHIVOS Y CARPETAS ---
    print("[LIMPIEZA] Eliminando archivos y carpetas...")
    fecha_carpeta_path = os.path.join(data_folder, fecha_carpeta)
    delete_files_and_folder(fecha_carpeta_path, ruta_json)

    return {
        "success": True,
        "procesados": result["procesados"],
        "saltados": result["saltados"],
        "fecha": fecha_carpeta
    }

if __name__ == "__main__":
    result = main()
    # Imprimir el resultado como JSON para que lo capture Node.js
    print(json.dumps(result))