# pip3 install geopy

# Difference
# from spacy.lang.fr.examples import sentences
# from spacy import displacy 


import en_core_web_md
nlp = en_core_web_md.load()


# ###
 
import os
from flask import Flask, flash, request, redirect, url_for,render_template,abort
from werkzeug.utils import secure_filename
import glob
import zipfile
from flask_cors import CORS, cross_origin
import json
 
app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
 
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024
app.config['UPLOAD_EXTENSIONS'] = ['.txt', '.zip']
app.config['UPLOAD_PATH'] = 'uploads'
 
 
@app.route('/text')
def index():
    results = []
    latlng=[]
    text = request.args.get('text')
    model = request.args.get('model')
    

    wikitext = nlp(text)
    # print(displacy.render(wikitext, style="ent"))
    for word in wikitext.ents:
        # print(word.text, word.start_char, word.end_char, word.label_)
        item = {
            'city':word.text,
            'label':word.label_
        }
        # print(word.label_, word.text)
        if word.label_ == "LOC":
            results.append(item)          
 
    return json.dumps(results)

   
 
if __name__ == '__main__':
    # app.run(debug=True)
    # app.run('0.0.0.0',debug=True, ssl_context=('cert.pem','key.pem'))

    app.run(port=5001,debug=True)
    # from waitress import serve
    # serve(app, host="0.0.0.0", port=5000)
    # app.run(debug=True)
 

