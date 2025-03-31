import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

# URL de la página web donde están los enlaces a los PDFs
URL = "https://www.diariooficial.cl/publicaciones"

# Obtener la fecha actual
fecha_hoy = datetime.now().strftime("%d-%m-%Y")

# Realizar la petición HTTP a la página
response = requests.get(URL)
if response.status_code != 200:
    print("Error al acceder a la página.")
    exit()

# Parsear el contenido HTML
soup = BeautifulSoup(response.text, "html.parser")

# Encontrar los enlaces a los archivos PDF
pdf_links = []
for link in soup.find_all("a", href=True):
    if link["href"].endswith(".pdf"):
        pdf_links.append(link["href"])

# Guardar los enlaces en un archivo JSON
filename = f"pdf_links_{fecha_hoy}.json"
with open(filename, "w", encoding="utf-8") as f:
    json.dump(pdf_links, f, indent=4)

print(f"Enlaces guardados en {filename}")
