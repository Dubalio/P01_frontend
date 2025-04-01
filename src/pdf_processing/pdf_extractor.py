import PyPDF2
import os
import re
import json  # Importar módulo para manejar JSON

def extract_text_from_pdf(pdf_path):
    """
    Extracts text from a PDF file.
    :param pdf_path: Path to the PDF file
    :return: Extracted text as a string
    """
    text = ""
    try:
        with open(pdf_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
    
    return text

def extract_company_info(text):
    """
    Extracts company name and RUT from text.
    :param text: Extracted text from a PDF
    :return: Dictionary with company name, RUT, and founders' names
    """
    # Buscar la razón social (primer texto entre comillas dobles o tipográficas, incluso con saltos de línea)
    company_match = re.search(r'[“"]([^”"]+)[”"]', text, re.DOTALL)
    company_name = company_match.group(1).strip().replace("\n", " ") if company_match else "No encontrado"

    # Buscar nombres de fundadores (Don o Doña seguido de palabras que comienzan con mayúscula)
    founders = re.findall(r'\b(?:don|doña)\s+((?:[A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+|$)){1,4})', text, re.IGNORECASE)

    # Normalizar nombres eliminando espacios extra y duplicados
    normalized_founders = set()
    unique_founders = []
    for founder in founders:
        # Convertir a minúsculas y eliminar espacios adicionales
        normalized_name = " ".join(founder.split()).lower()
        if normalized_name not in normalized_founders:
            normalized_founders.add(normalized_name)
            unique_founders.append(normalized_name)

    return {
        "razon_social": company_name,
        "fundadores": unique_founders if unique_founders else ["No encontrado"]
    }

def extract_from_all_pdfs_in_folder(folder_path):
    """
    Extracts company info from all PDF files in a given folder and saves it to a JSON file.
    If the JSON file already exists, it appends new information for PDFs that haven't been processed yet.
    :param folder_path: Path to the folder containing PDF files
    :return: A dictionary with file names as keys and extracted info as values
    """
    extracted_info = {}
    output_path = os.path.join(folder_path, "extracted_info.json")

    # Verificar si el archivo JSON ya existe y cargar su contenido
    if os.path.exists(output_path):
        try:
            with open(output_path, "r", encoding="utf-8") as json_file:
                extracted_info = json.load(json_file)
                print(f"Archivo JSON existente cargado desde {output_path}")
        except Exception as e:
            print(f"Error al cargar el archivo JSON existente: {e}")

    # Procesar solo los archivos PDF que no estén en el JSON
    for filename in os.listdir(folder_path):
        if filename.endswith(".pdf") and filename not in extracted_info:
            pdf_path = os.path.join(folder_path, filename)
            print(f"Processing: {filename}")
            extracted_text = extract_text_from_pdf(pdf_path)
            company_info = extract_company_info(extracted_text)
            extracted_info[filename] = company_info

    # Guardar la información actualizada en el archivo JSON
    try:
        with open(output_path, "w", encoding="utf-8") as json_file:
            json.dump(extracted_info, json_file, ensure_ascii=False, indent=4)
        print(f"Información actualizada guardada en {output_path}")
    except Exception as e:
        print(f"Error al guardar la información en JSON: {e}")
    
    return extracted_info

if __name__ == "__main__":
    folder_path = "../../data"  # Cambia esta ruta según donde tengas los PDFs
    extracted_info = extract_from_all_pdfs_in_folder(folder_path)

    # Mostrar los datos extraídos
    for filename, info in extracted_info.items():
        print(f"\n--- Extraido de {filename} ---")
        print(f"Razón Social: {info['razon_social']}")
        print(f"Fundadores: {', '.join(info['fundadores'])}")
