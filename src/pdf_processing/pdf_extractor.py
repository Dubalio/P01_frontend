import PyPDF2
import re
import os
from datetime import datetime

def extract_text_from_pdf(pdf_path):

    text = ""
    try:
        with open(pdf_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
    
    return text

def extract_company_info(text):

    company_patterns = [
        r'[""]([^""]+)[""]',  
        r'"([^"]+)"',          
        r'sociedad\s+(?:de responsabilidad limitada)?\s*[""]?([^""".,]+)(?:limitada|ltda\.?)[""]?',  
        r'(?:empresa|compañía|sociedad)\s+[""]?([^""".,]+)(?:limitada|ltda\.?)[""]?',  
        r'[""]?([^""".,]+?)(?:limitada|ltda\.?)[""]?',  
    ]
    
    company_name = "No encontrado"
    

    for pattern in company_patterns:
        company_match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if company_match:
            company_name = company_match.group(1).strip().replace("\n", " ")
            break

    founders = re.findall(r'\b(?:don|doña)\s+((?:[A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+|$)){1,4})', text, re.IGNORECASE)

    normalized_founders = set()
    unique_founders = []
    for founder in founders:
        normalized_name = " ".join(founder.split()).lower()
        if normalized_name not in normalized_founders:
            normalized_founders.add(normalized_name)
            unique_founders.append(founder.strip())

    return {
        "razon_social": company_name,
        "fundadores": unique_founders if unique_founders else ["No encontrado"]
    }

def extract_from_all_pdfs_in_folder(folder_path, mongo_collection):

    processed_count = 0
    skipped_count = 0
    

    for subfolder in os.listdir(folder_path):
        subfolder_path = os.path.join(folder_path, subfolder)
        if os.path.isdir(subfolder_path) and re.match(r"\d{4}-\d{2}-\d{2}", subfolder):
            print(f"Procesando carpeta: {subfolder}")
            
            for filename in os.listdir(subfolder_path):
                if filename.endswith(".pdf"):
                    pdf_path = os.path.join(subfolder_path, filename)
                    print(f"Procesando: {filename}")
                    

                    extracted_text = extract_text_from_pdf(pdf_path)
                    company_info = extract_company_info(extracted_text)
                    
        
                    if company_info["razon_social"] == "No encontrado":
                        print(f"Saltando {filename} (razón social no encontrada)")
                        skipped_count += 1
                        continue
                    

                    valid_founders = [f for f in company_info["fundadores"] if f != "No encontrado"]
                    if not valid_founders:
                        print(f"Saltando {filename} (no se encontraron fundadores)")
                        skipped_count += 1
                        continue
                    

                    existing_company = mongo_collection.find_one({"razon_social": company_info["razon_social"]})
                    if existing_company:
                        print(f"Saltando {filename} (razón social ya existe en la base de datos)")
                        skipped_count += 1
                        continue
                    

                    document = {
                        "razon_social": company_info["razon_social"],
                        "fundadores": valid_founders,  
                        "fecha": subfolder,
                        "created_at": datetime.now()
                    }
                    

                    try:
                        mongo_collection.insert_one(document)
                        processed_count += 1
                        print(f"Guardado en MongoDB: {company_info['razon_social']}")
                    except Exception as e:
                        print(f"Error guardando {filename} en MongoDB: {e}")
    
    print(f"\nResumen: {processed_count} documentos procesados, {skipped_count} saltados")
    return {"procesados": processed_count, "saltados": skipped_count}

