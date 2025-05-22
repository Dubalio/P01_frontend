from scrapers.scrap import get_pdf_links, save_pdf_links_to_json, get_current_date, calculate_edition_number
from download_pdfs.download import descargar_pdfs_desde_json, preparar_rutas, obtener_fechas
from pdf_processing.pdf_extractor import extract_from_all_pdfs_in_folder
from delete_function.delete_files import delete_files_and_folder
import os
import json
import sys
from pymongo import MongoClient
import dotenv

dotenv.load_dotenv()


fecha_especificada = sys.argv[1] if len(sys.argv) > 1 else None

def main():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = MongoClient(mongo_uri)
    db = client[os.getenv("DB_NAME", "tuBaseDeDatos")]
    documents_collection = db["documents"]

    print("[BUSQUEDA] Iniciando scraping...")
    current_date = get_current_date()
    edition_number = calculate_edition_number(reference_date_str="20-05-2025", reference_edition=44153, target_date_str=current_date)
    url = "https://www.diariooficial.interior.gob.cl/edicionelectronica/empresas_cooperativas.php?date={}&edition={}".format(current_date, edition_number)
    pdf_links = get_pdf_links(url)
    print(f"URL: {url} (Edición: {edition_number})")
    if pdf_links:
        save_pdf_links_to_json(pdf_links)
    else:
        print("[ERROR] No se encontraron enlaces de PDF.")
        return {"success": False, "message": "No se encontraron enlaces PDF"}


    print("[DESCARGA] Iniciando descarga de PDFs...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    fecha_archivo, fecha_carpeta = obtener_fechas()

    if fecha_especificada:
        fecha_carpeta = fecha_especificada
        print(f"Usando fecha especificada: {fecha_carpeta}")
    
    ruta_json, carpeta_destino = preparar_rutas(script_dir, fecha_archivo, fecha_carpeta)

    if not os.path.exists(ruta_json):
        print(f"[ERROR] No se encontró el archivo {ruta_json}")
        return {"success": False, "message": "No se encontró el archivo JSON con enlaces"}
    else:
        descargar_pdfs_desde_json(ruta_json, carpeta_destino)

    print("[PROCESO] Iniciando procesamiento de PDFs...")
    data_folder = os.path.abspath(os.path.join(script_dir, "..", "data")) 
    

    result = extract_from_all_pdfs_in_folder(data_folder, documents_collection)


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
    print(json.dumps(result))