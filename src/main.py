import os
from scrapers.scrap import get_pdf_links, save_pdf_links_to_json, get_current_date
from download_pdfs.download import obtener_fechas, preparar_rutas, descargar_pdfs_desde_json
from pdf_processing.pdf_extractor import extract_from_all_pdfs_in_folder

def main():
    # --- Paso 1: Scraping ---
    print("🔍 Iniciando scraping para obtener enlaces de PDFs...")
    url = "https://www.diariooficial.interior.gob.cl/edicionelectronica/empresas_cooperativas.php?date={}&edition=44113".format(get_current_date())
    pdf_links = get_pdf_links(url)

    if not pdf_links:
        print("❌ No se encontraron enlaces de PDF. Finalizando ejecución.")
        return

    save_pdf_links_to_json(pdf_links)
    print("✅ Scraping completado.\n")

    # --- Paso 2: Descargar PDFs ---
    print("📥 Iniciando descarga de PDFs...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    fecha_archivo, fecha_carpeta = obtener_fechas()
    ruta_json, carpeta_destino = preparar_rutas(script_dir, fecha_archivo, fecha_carpeta)

    if not os.path.exists(ruta_json):
        print(f"❌ No se encontró el archivo {ruta_json}. Finalizando ejecución.")
        return

    descargar_pdfs_desde_json(ruta_json, carpeta_destino)
    print("✅ Descarga de PDFs completada.\n")

    # --- Paso 3: Extraer información de PDFs ---
    print("📄 Iniciando extracción de información de PDFs...")
    extract_from_all_pdfs_in_folder(os.path.abspath(os.path.join(script_dir, "..", "data")))
    print("✅ Extracción de información completada.")

if __name__ == "__main__":
    main()