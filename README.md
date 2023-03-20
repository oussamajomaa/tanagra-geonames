# Tanagra
Une interface qui envoie un texte ou un/des fichier(s) texte à une API.
L'API va analyser le texte et extraire les entités nommées (les lieux) et renvoie une liste des lieux trouvés dans le texte. Cette liste sera analyser sur Geonames (une base de données géographiques gratuite) https://www.geonames.org/ pour récupérer les coordonnées de chaque lieu et le cartographier sur une carte.

## Modèle de langage
On utilise SpaCy https://spacy.io/models (bibliothèque logicielle Python de traitement automatique des langues) et ses modèls suivants:
* Modèls français:
  * fr_core_news_md
  * fr_core_news_md
  * fr_core_news_lg
 
* Modèls allemands:
  * de_core_news_sm
  * de_core_news_md
  * de_core_news_lg

* Modèl anglais:
  * en_core_web_md

 ## API
**install flask**
pip3 install flask

**install flask-cors**
pip3 install -U flask-cors


**install pip3**
sudo apt install python3-pip

**install spacy**
pip install -U pip setuptools wheel
pip3 install -U spacy


**install french model**
python3 -m spacy download fr_core_news_sm
python3 -m spacy download fr_core_news_md
python3 -m spacy download fr_core_news_lg

**install english model**
python3 -m spacy download en_core_web_md

**install greek model**
python3 -m spacy download el_core_news_md

**install dutch model**
python3 -m spacy download nl_core_news_md

**install spanish model**
python3 -m spacy download es_core_news_md

**install grman model**
python3 -m spacy download de_core_news_sm
python3 -m spacy download de_core_news_md
python3 -m spacy download de_core_news_lg
