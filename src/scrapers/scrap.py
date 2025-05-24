import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime, timedelta
import os

# Función para obtener la fecha actual
def get_current_date():
    return datetime.now().strftime('%d-%m-%Y')

# Función para calcular el número de edición basado en una fecha de referencia
def calculate_edition_number(reference_date_str="20-05-2025", reference_edition=44152, target_date_str=None):
    """
    Calcula el número de edición basado en una fecha de referencia.
    
    Args:
        reference_date_str: Fecha de referencia en formato DD-MM-YYYY
        reference_edition: Número de edición para la fecha de referencia
        target_date_str: Fecha objetivo en formato DD-MM-YYYY (si es None, se usa la fecha actual)
    
    Returns:
        Número de edición para la fecha objetivo
    """
    if target_date_str is None:
        target_date_str = get_current_date()
    
    # Convertir las fechas de string a objetos datetime
    reference_date = datetime.strptime(reference_date_str, '%d-%m-%Y')
    target_date = datetime.strptime(target_date_str, '%d-%m-%Y')
    
    # Calcular la diferencia en días
    day_difference = (target_date - reference_date).days
    
    # Calcular el nuevo número de edición
    new_edition = reference_edition + day_difference
    
    return new_edition

# Función para extraer los enlaces de los PDFs
def get_pdf_links(url):
    try:
        # Hacer la solicitud HTTP a la página web
        response = requests.get(url)
        response.raise_for_status()  # Lanza un error si la respuesta no es 200 (OK)
    except requests.RequestException as e:
        print(f"Error al acceder a la página: {e}")
        return []
    
    # Parsear la página con BeautifulSoup
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Buscar todos los enlaces de tipo PDF
    pdf_links = []
    for a_tag in soup.find_all('a', href=True):
        if a_tag['href'].endswith('.pdf'):
            pdf_links.append(a_tag['href'])
    
    return pdf_links

# Función para guardar los enlaces en un archivo JSON
def save_pdf_links_to_json(pdf_links):
    # Excluir el primer y el último enlace
    filtered_links = pdf_links[1:-1]  # Excluye el primer y último elemento de la lista
    
    # Obtener la fecha actual
    date = get_current_date()
    
    # Construir la ruta absoluta para guardar el archivo JSON en la carpeta src
    script_dir = os.path.dirname(os.path.abspath(__file__))  # Directorio actual del script
    src_dir = os.path.abspath(os.path.join(script_dir, ".."))  # Subir un nivel para llegar a src
    file_name = os.path.join(src_dir, f"pdf_links_{date}.json")
    
    # Guardar los enlaces en un archivo JSON
    with open(file_name, 'w') as json_file:
        json.dump(filtered_links, json_file, indent=4)
    
    print(f"Los enlaces se han guardado en {file_name}")

if __name__ == "__main__":
    # URL de la página web desde donde extraer los enlaces
    url = "https://www.diariooficial.interior.gob.cl/edicionelectronica/empresas_cooperativas.php?date={}&edition=44120".format(get_current_date())
    
    # Obtener los enlaces de los PDFs
    pdf_links = get_pdf_links(url)
    
    # Guardar los enlaces en el archivo JSON si se han encontrado enlaces
    if pdf_links:
        save_pdf_links_to_json(pdf_links)
    else:
        print("No se encontraron enlaces de PDF.")