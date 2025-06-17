## Pasos para configurar el proyecto

### 1. Clonar el repositorio
Lo primero que debes hacer es **clonar** el repositorio del proyecto a tu computadora. Esto se hace con el siguiente comando:
```sh
git clone <URL DEL REPOSITORIO>

```
Reemplaza <URL DEL REPOSITORIO> con la URL de tu repositorio en GitHub.

2. Crear un entorno virtual
El entorno virtual es una manera de aislar las dependencias del proyecto para que no interfieran con otros proyectos que tengas en tu computadora.

Abre una terminal o consola en la carpeta donde clonaste el proyecto.

Crea un entorno virtual con este comando:

```sh
python -m venv venv_windows

```

Esto creará una carpeta llamada venv_windows, que contendrá todos los archivos y dependencias del entorno virtual.

3. Activar el entorno virtual
Una vez que hayas creado el entorno, necesitas activarlo para que el proyecto use las dependencias que instalaremos más adelante.

Si usas PowerShell (en Windows, vscode):

```sh
.\venv_windows\Scripts\Activate.ps1
```
![alt text](image.png)
Puedes revisar que esta activado en ambiente si se ve en verde (venv_windows)

4. Instalar las dependencias necesarias
Ahora que el entorno está activado, el siguiente paso es instalar todas las librerías que el proyecto necesita para funcionar.

Asegúrate de estar en la carpeta del proyecto (donde se encuentra el archivo requirements.txt).

Ejecuta el siguiente comando para instalar todas las dependencias:

```sh
pip install -r requirements.txt
```

Esto instalará BeautifulSoup y PyPDF2, que son las librerías necesarias para realizar el scraping y descargar los PDFs.

5. Activar .gitignore
El archivo .gitignore se utiliza para asegurarnos de que no subimos archivos innecesarios a GitHub. Esto incluye el entorno virtual (venv_windows) y archivos temporales. Si no está creado, por favor agrégalo a la raíz del proyecto con las siguientes líneas:

```sh
venv_windows/
__pycache__/
*.pyc
```


si utilizan nuevas librerias metanlas al arhivo de requiremnts.txt con el comando:
```sh
pip freeze > requirements.txt
```



#Smoke Tests – P01 

Este archivo documenta el propósito, configuración y ejecución de los **Smoke Tests** para el backend del proyecto **P01**. Los smoke tests permiten verificar que la API se esté ejecutando correctamente y que los endpoints principales respondan correctamente.


##Objetivos probados 

Asegurar que el servidor:

- Se levanta sin errores.
- Responde correctamente a rutas clave (por ejemplo, `/empresas`).
- Retorna un código **HTTP 200 OK** en sus operaciones básicas.




