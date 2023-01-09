import requests
import base64

# Téléchargement de l'image à partir du lien
image_url = str(input("Insérer le lien d'une image à convertir en base 64 => "))
response = requests.get(image_url)
image_content = response.content

# Conversion de l'image en code Base64
image_base64 = base64.b64encode(image_content).decode('utf-8')

# Affiche le résultat
print(image_base64)