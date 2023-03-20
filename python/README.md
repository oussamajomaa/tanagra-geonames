Flask:
Flask est un micro framework open-source de développement web en Python. Il est classé comme microframework car il est très léger.

installation Flask: 
    $ pip install Flask 

SpaCy:
SpaCy est une bibliothèque logicielle Python de traitement automatique des langues. 
SpaCy permet d'effectuer les opérations d'analyse suivantes sur des textes dans plus de 50 langues:
    Tokenization ;
    Reconnaissance d'entités nommées.

Installation SpaCy:
    $ pip install -U pip setuptools wheel
    $ pip install -U spacy

Installation des modèles:
    modèle français:
    $ python3 -m spacy download fr_core_news_md
    modèle anglais:
    python3 -m spacy download en_core_web_md
    modèle allemand:
    python3 -m spacy download de_core_news_md


Werkzeug:
Werkzeug est une bibliothèque complète d'applications Web WSGI.
pip install -U Werkzeug

Nous allons utiliser la classe werkzeug.utils afin d'importer le module secure_filename qui va nous permettre de sauvegarder le fichier d'une façon sécurisée.

Glob
Glob est module qui renvoie une liste, potentiellement vide, de chemins correspondant au motif pathname, qui doit être une chaîne de caractères contenant la spécification du chemin. pathname peut être soit absolu (comme /usr/src/Python-1.5/Makefile) soit relatif (comme ../../Tools/*/*.gif), et contenir un caractère de remplacement de style shell. Les liens symboliques cassés sont aussi inclus dans les résultats (comme pour le shell).

Zipfile:
Ce module fournit des outils pour créer, écrire, ajouter des données à et lister un fichier ZIP. 


