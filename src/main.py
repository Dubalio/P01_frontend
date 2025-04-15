from scrapers.scrap import get_pdf_links, save_pdf_links_to_json, get_current_date
from download_pdfs.download import descargar_pdfs_desde_json, preparar_rutas, obtener_fechas
from pdf_processing.pdf_extractor import extract_from_all_pdfs_in_folder
from delete_function.delete_files import delete_files_and_folder  # Importar la nueva función
import os

def main():
    # --- SCRAPING ---
    print("🔍 Iniciando scraping...")
    url = "https://www.diariooficial.interior.gob.cl/edicionelectronica/empresas_cooperativas.php?date={}&edition=44126".format(get_current_date())
    pdf_links = get_pdf_links(url)
    print (url)
    if pdf_links:
        save_pdf_links_to_json(pdf_links)
    else:
        print("❌ No se encontraron enlaces de PDF.")
        return  # Terminar si no hay enlaces

    # --- DESCARGA DE PDFs ---
    print("⬇️ Iniciando descarga de PDFs...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    fecha_archivo, fecha_carpeta = obtener_fechas()
    ruta_json, carpeta_destino = preparar_rutas(script_dir, fecha_archivo, fecha_carpeta)

    if not os.path.exists(ruta_json):
        print(f"❌ No se encontró el archivo {ruta_json}")
        return  # Terminar si no existe el archivo JSON con los enlaces
    else:
        descargar_pdfs_desde_json(ruta_json, carpeta_destino)

    # --- PROCESAMIENTO DE PDFs ---
    print("📄 Iniciando procesamiento de PDFs...")
    data_folder = os.path.abspath(os.path.join(script_dir, "..", "data"))  # Ajustar la ruta
    extracted_info = extract_from_all_pdfs_in_folder(data_folder)

    # Mostrar los datos extraídos
    for filename, info in extracted_info.items():
        print(f"\n--- Extraído de {filename} ---")
        print(f"Razón Social: {info['razon_social']}")
        print(f"Fundadores: {', '.join(info['fundadores'])}")
        print(f"Fecha: {info['fecha']}")

    # --- ELIMINAR ARCHIVOS Y CARPETAS ---
    print("🗑️ Eliminando archivos y carpetas...")
    fecha_carpeta_path = os.path.join(data_folder, fecha_carpeta)  # Ruta de la carpeta con la fecha
    delete_files_and_folder(fecha_carpeta_path, ruta_json)


if __name__ == "__main__":
    main()