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
    normalized_text = re.sub(r'\s+', ' ', text).strip()
    
    # Mantener solo patrones que buscan entre comillas
    company_patterns = [
        r'[""]([^""]+?)[""]',       # Comillas curvas dobles (rectas y curvas)
        r'"([^"]+?)"',              # Comillas rectas dobles
        r"['']([^'']+?)['']",       # Comillas curvas simples
        r"'([^']+?)'",              # Comillas rectas simples
        r'«([^»]+?)»',               # Comillas latinas/angulares
        r'“([^”]+?)”',               # Comillas angulares
        r'‘([^’]+?)’'            # Comillas angulares simples
    ]
    
    company_name = "No encontrado"
    
    for pattern in company_patterns:
        company_matches = re.findall(pattern, normalized_text, re.IGNORECASE | re.DOTALL)
        if company_matches:
            # Verificar cada coincidencia hasta encontrar una que no sea demasiado larga
            for match in company_matches:
                candidate = match.strip().replace("\n", " ")
                # Contar palabras (dividiendo por espacios)
                word_count = len(candidate.split())
                
                # Verificar si la razón social no es demasiado larga
                if word_count <= 50:
                    company_name = candidate
                    break
                else:
                    print(f"Ignorando razón social demasiado larga ({word_count} palabras): {candidate[:50]}...")
            
            # Si encontramos al menos una razón social válida, salimos del bucle de patrones
            if company_name != "No encontrado":
                break

    # Búsqueda de fundadores sigue igual
    founders = re.findall(r'\b(?:don|doña)\s+((?:[A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+|$)){1,4})', text, re.IGNORECASE)

    # Mejor detección de duplicados para el caso de hermanos
    normalized_founders = set()
    unique_founders = []
    
    for founder in founders:
        # AQUÍ ESTÁ EL CAMBIO: Limpiar saltos de línea primero
        clean_founder = re.sub(r'\n+', ' ', founder)  # Cambiar \n por espacio
        clean_founder = re.sub(r'\s+', ' ', clean_founder).strip()  # Normalizar espacios
        
        # Normaliza eliminando espacios extras y convirtiendo a minúsculas
        normalized_name = " ".join(clean_founder.split()).lower()
        
        # Parse nombre en componentes
        name_parts = normalized_name.split()
        
        # Si el nombre es muy corto, no podemos analizarlo bien
        if len(name_parts) <= 1:
            if normalized_name not in normalized_founders:
                normalized_founders.add(normalized_name)
                unique_founders.append(clean_founder)  # Usar el nombre limpio
            continue
        
        # Asumimos que el primer componente es el nombre
        first_name = name_parts[0]
        
        # Verificamos si ya existe un fundador con el mismo nombre
        duplicate = False
        for existing in normalized_founders:
            existing_parts = existing.split()
            if len(existing_parts) <= 1:
                continue
                
            # Si el nombre de pila es igual, verificamos si son la misma persona
            if existing_parts[0] == first_name:
                # Solo consideramos duplicado si tienen más del 80% de coincidencia en apellidos
                remaining_existing = set(existing_parts[1:])
                remaining_new = set(name_parts[1:])
                
                # Si todos los apellidos coinciden o uno está contenido en el otro completamente
                if remaining_existing == remaining_new or \
                   remaining_existing.issubset(remaining_new) or \
                   remaining_new.issubset(remaining_existing):
                    duplicate = True
                    break
        
        if not duplicate:
            normalized_founders.add(normalized_name)
            unique_founders.append(clean_founder)  # Usar el nombre limpio

    return {
        "razon_social": company_name,
        "fundadores": unique_founders if unique_founders else ["No encontrado"]
    }

def extract_from_all_pdfs_in_folder(folder_path, mongo_collection):

    processed_count = 0
    skipped_count = 0
    all_documents = []  # Lista para almacenar documentos para JSON

    for subfolder in os.listdir(folder_path):
        subfolder_path = os.path.join(folder_path, subfolder)
        if os.path.isdir(subfolder_path) and re.match(r"\d{4}-\d{2}-\d{2}", subfolder):
            print(f"Procesando carpeta: {subfolder}")
            
            # Ordenar los archivos por el número en su nombre
            pdf_files = sorted(
                [f for f in os.listdir(subfolder_path) if f.endswith(".pdf")],
                key=lambda x: int(re.search(r'(\d+)', x).group(1)) if re.search(r'(\d+)', x) else float('inf')
            )
            
            for filename in pdf_files:
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

