import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import os

# Función para obtener la fecha actual
def get_current_date():
    return datetime.now().strftime('%d-%m-%Y')

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