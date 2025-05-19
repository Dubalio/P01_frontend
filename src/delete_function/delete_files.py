import os
import shutil

def delete_files_and_folder(data_folder, json_file_path):

    if os.path.exists(data_folder) and os.path.isdir(data_folder):
        try:
            shutil.rmtree(data_folder)
            print(f" Carpeta eliminada: {data_folder}")
        except Exception as e:
            print(f"Error al eliminar la carpeta {data_folder}: {e}")
    else:
        print(f" La carpeta {data_folder} no existe o no es una carpeta.")


    if os.path.exists(json_file_path) and os.path.isfile(json_file_path):
        try:
            os.remove(json_file_path)
            print(f" Archivo JSON eliminado: {json_file_path}")
        except Exception as e:
            print(f" Error al eliminar el archivo {json_file_path}: {e}")
    else:
        print(f" El archivo {json_file_path} no existe.")