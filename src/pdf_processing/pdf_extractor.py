import PyPDF2
import os
import re

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

    # Buscar nombres de fundadores (Don o Doña en cualquier combinación de mayúsculas/minúsculas seguido de palabras con mayúscula)
    founders = re.findall(r'\b(?:don|doña)\s+([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+){1,4})', text, re.IGNORECASE)
    
    # Normalizar nombres eliminando espacios extra, sin hacerlos minúsculas para evitar colisiones
    normalized_founders = set()
    unique_founders = []
    for founder in founders:
        # Convertir a una forma estándar sin perder distinción entre nombres distintos
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
    Extracts company info from all PDF files in a given folder.
    :param folder_path: Path to the folder containing PDF files
    :return: A dictionary with file names as keys and extracted info as values
    """
    extracted_info = {}

    for filename in os.listdir(folder_path):
        if filename.endswith(".pdf"):
            pdf_path = os.path.join(folder_path, filename)
            print(f"Processing: {filename}")
            extracted_text = extract_text_from_pdf(pdf_path)
            company_info = extract_company_info(extracted_text)
            extracted_info[filename] = company_info
    
    return extracted_info

if __name__ == "__main__":
    folder_path = "../../data"  # Cambia esta ruta según donde tengas los PDFs
    extracted_info = extract_from_all_pdfs_in_folder(folder_path)

    # Mostrar los datos extraídos
    for filename, info in extracted_info.items():
        print(f"\n--- Extraido de {filename} ---")
        print(f"Razón Social: {info['razon_social']}")
        print(f"Fundadores: {', '.join(info['fundadores'])}")
