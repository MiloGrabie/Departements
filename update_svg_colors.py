import pandas as pd
from bs4 import BeautifulSoup
import os
from datetime import datetime

def read_excel_data(excel_file):
    """Lit les données de l'Excel et retourne un dictionnaire des départements à colorer"""
    # Lire les données avec pandas
    df = pd.read_excel(excel_file)
    color_map = {}
    
    for idx, row in df.iterrows():
        # Vérifie si la colonne Couleur contient une valeur
        dep_id = str(row['dep'])  # Convertit en string pour être sûr
        color = str(row['Couleur']).strip()  # Récupère la valeur de la cellule et retire les espaces
        
        if color and color != 'nan':  # Vérifie si la couleur n'est pas vide ou 'nan'
            # Retire le # si présent
            color = color.lstrip('#')
            color_map[dep_id] = color
    
    return color_map

def update_svg_colors(svg_file, color_map, output_file=None):
    """Met à jour les couleurs dans le fichier SVG"""
    # Créer le dossier output s'il n'existe pas
    output_dir = "output"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Si aucun fichier de sortie n'est spécifié, créer un nom avec timestamp
    if output_file is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(output_dir, f"departements_colored_{timestamp}.svg")
    else:
        output_file = os.path.join(output_dir, output_file)
    
    # Lire le fichier SVG
    with open(svg_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'xml')
    
    # Pour chaque département dans notre mapping
    for dep_id, color in color_map.items():
        # Formater l'ID du département (ajouter un 0 devant si < 10)
        formatted_dep_id = dep_id
        if dep_id.isdigit() and int(dep_id) < 10:
            formatted_dep_id = f"0{dep_id}"
        
        # Trouver l'élément correspondant dans le SVG
        element = soup.find(id=f"dep_{formatted_dep_id}")
        if element:
            # Mettre à jour la couleur
            element['fill'] = f"#{color}"
    
    # Sauvegarder le nouveau SVG
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    
    return output_file

def main():
    # Chemins des fichiers
    excel_file = "Classeur1.xlsx"
    svg_file = "departements_chiffre_couleur.svg"
    
    # Lire les données de l'Excel
    print("Lecture des données de l'Excel...")
    color_map = read_excel_data(excel_file)
    
    # Mettre à jour le SVG
    print("Mise à jour du SVG...")
    output_file = update_svg_colors(svg_file, color_map)
    
    print(f"SVG mis à jour avec succès ! Fichier de sortie : {output_file}")

if __name__ == "__main__":
    main() 