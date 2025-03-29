import PyPDF2
import os

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
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
    
    return text

def extract_from_all_pdfs_in_folder(folder_path):
    """
    Extracts text from all PDF files in a given folder.
    :param folder_path: Path to the folder containing PDF files
    :return: A dictionary with file names as keys and extracted text as values
    """
    extracted_texts = {}
    
    # Recorrer todos los archivos en la carpeta
    for filename in os.listdir(folder_path):
        if filename.endswith(".pdf"):  # Filtramos solo los archivos PDF
            pdf_path = os.path.join(folder_path, filename)
            print(f"Extracting text from: {filename}")
            extracted_text = extract_text_from_pdf(pdf_path)
            extracted_texts[filename] = extracted_text
    
    return extracted_texts

if __name__ == "__main__":
    folder_path = "../../data"  # Ruta de la carpeta donde están los PDFs
    extracted_texts = extract_from_all_pdfs_in_folder(folder_path)

    # Mostrar el texto extraído de cada PDF
    for filename, text in extracted_texts.items():
        print(f"\n--- Text extracted from {filename} ---")
        print(text)
