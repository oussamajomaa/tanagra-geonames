# Difference
# from spacy.lang.fr.examples import sentences
# import fr_core_news_sm
# import fr_core_news_md
# # import fr_core_news_lg

# import en_core_web_md

# import de_core_news_sm
# import de_core_news_md
# import de_core_news_lg
#nlp = fr_core_news_md.load()
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
    results = []
    print(request.args.get('text'))
    model = request.args.get('model')
    print(model)
    if model:
        result = get_model(model)
        nlp = result['nlp']
        label = result["label"]
        
    else:
        import fr_core_news_md
        nlp = fr_core_news_md.load()
        label = 'LOC'

    wikitext = nlp(request.args.get('text'))
    for word in wikitext.ents:
        item = {
            'city':word.text,
            'label':word.label_
        }
        if word.label_ == label:
            results.append(item)
 
    return json.dumps(results)



def get_model(model):
    if model == 'french_sm':
        import fr_core_news_sm
        nlp = fr_core_news_sm.load()
        label = 'LOC'
        result = {"nlp":nlp,"label":label}
    if model == 'french_md':
        import fr_core_news_md
        nlp = fr_core_news_md.load()
        label = 'LOC'
        result = {"nlp":nlp,"label":label}
    if model == 'french_lg':
        import fr_core_news_lg
        nlp = fr_core_news_lg.load()
        label = 'LOC'
        result = {"nlp":nlp,"label":label}
    if model == 'english_md':
        import en_core_web_md
        nlp = en_core_web_md.load()
        label = 'GPE'
        result = {"nlp":nlp,"label":label}
    if model == 'german_sm':
        import de_core_news_sm
        nlp = de_core_news_sm.load()
        label = 'LOC'
        result = {"nlp":nlp,"label":label}
    if model == 'german_md':
        import de_core_news_md
        nlp = de_core_news_md.load()
        label = 'LOC'
        result = {"nlp":nlp,"label":label}
    if model == 'german_lg':
        import de_core_news_lg
        nlp = de_core_news_lg.load()
        label = 'LOC'
        result = {"nlp":nlp,"label":label}
    return result

@app.route('/file', methods=['POST'])
def process():
    model = request.args.get('model')
    print(model)
    if model:
        result = get_model(model)
        nlp = result['nlp']
        label = result["label"]
        
    else:
        import fr_core_news_md
        nlp = fr_core_news_md.load()
        label = 'LOC'
    # Get the base of path
    baseUrl = os.path.dirname(os.path.abspath(__file__))
    # Delete existing files
    files = glob.glob(baseUrl+"/uploads/*")
    for f in files:
        os.remove(f) 
       
    uploaded_file = request.files['file']
    filename = secure_filename(uploaded_file.filename)
    if filename != '':
        file_ext = os.path.splitext(filename)[1]
        if file_ext not in app.config['UPLOAD_EXTENSIONS']:
            abort(400)
       
        # save file to folder
        uploaded_file.save(os.path.join(app.config['UPLOAD_PATH'], filename))
 
        # Test if a zip file and extract all in uploads folder
        if file_ext == ".zip":
            print("file_ext ******** " + file_ext)
            with zipfile.ZipFile(baseUrl+"/uploads/"+filename, 'r') as zip_ref:
                zip_ref.extractall(baseUrl+"/uploads/")
           
            # Assign extracted files in variable array
            extractedFiles = glob.glob(baseUrl+"/uploads/*.txt")
            print("extracted files " + str(extractedFiles))
            results = []
            for extractedFile in extractedFiles:
                f = open(extractedFile, "r")
                contents = f.readlines()
 
                # Lire la première ligne du texte et récupérer la date en ignorant la case sensitive

                fileDate = 1900
                title = extractedFile.split('/')[-1].split('.')[0]
                if len(contents)>0:
                    if 'date' in contents[0]:
                        if len(contents[0].split(':')) == 2:
                            if len(contents[0].split(':')[1]) > 1:
                                fileDate = contents[0].split(':')[1].strip()
                                
                
                if len(contents)>1:
                    if 'title' in contents[1]:
                        if len(contents[1].split(':')) == 2:
                            if len(contents[1].split(':')[1]) > 1:
                                title = contents[1].split(':')[1].strip()
 
                contents = " ".join(contents)
                wikitext = nlp(contents)
                print(fileDate)
                for word in wikitext.ents:
                    item = {
                        'fileDate':fileDate,
                        'fileName':title,
                        'city':word.text,
                        'label':word.label_
                    }
                   
                    if word.label_ == label:
                        results.append(item)
       
        if file_ext == ".txt":
            f = open(baseUrl+"/uploads/"+filename, "r")
            print(baseUrl)
            contents = f.readlines()
 
             # Lire la première ligne du texte et récupérer la date en ignorant la case sensitive
            fileDate = 1900
            title = filename
            print(contents)
            if len(contents)>0:
                if 'date' in contents[0]:
                    if len(contents[0].split(':')) == 2:
                        if len(contents[0].split(':')[1]) > 1:
                            fileDate = contents[0].split(':')[1].strip()
            
            if len(contents)>1:
                if 'title' in contents[1]:
                    if len(contents[1].split(':')) == 2:
                        if len(contents[1].split(':')[1])>1:
                            title = contents[1].split(':')[1].strip()
           
            contents = " ".join(contents)
            results = []
            wikitext = nlp(contents)
            for word in wikitext.ents:
                item = {
                    'fileDate':fileDate,
                    'fileName':title,
                    'city':word.text,
                    'label':word.label_
                }
 
                if word.label_ == label:
                    results.append(item)

    return json.dumps(results)
   

   
 
if __name__ == '__main__':
    #app.run('0.0.0.0',debug=True, port=5000, ssl_context=('cert.pem','key.pem'))
    app.run('0.0.0.0',debug=True)
    #app.run(debug=True)
    #from waitress import serve
    #serve(app, host="0.0.0.0", port=5000)
