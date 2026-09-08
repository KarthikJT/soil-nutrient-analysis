from flask import Flask, jsonify, request
import pickle
from flask_cors import CORS
import numpy as np
import cv2
from PIL import Image
import base64

Pmodel = pickle.load(open('Pclassifier.pkl', 'rb'))
pHmodel = pickle.load(open('pHclassifier.pkl', 'rb'))
OMmodel = pickle.load(open('OMclassifier.pkl', 'rb'))
ECmodel = pickle.load(open('ECclassifier.pkl', 'rb'))

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Serving service to mobile application with api to respond to image with analysis"

@app.route('/predict', methods=['POST', 'GET'])
def predict():
    if request.method == "POST":
        inputImage = request.form.get('inputImage')
        nparr = np.frombuffer(base64.b64decode(inputImage), np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        print(image.shape)

        blue_channel = image[:, :, 0]
        green_channel = image[:, :, 1]
        red_channel = image[:, :, 2]
        temp = ((np.median(green_channel) + np.median(blue_channel)) + np.median(red_channel))
        temp = np.nanmean(temp)
        Presult = float(Pmodel.predict([[temp]]))
        pHreuslt = float(pHmodel.predict([[temp]]))
        OMresult = float(OMmodel.predict([[temp]]))
        ECresult = float(ECmodel.predict([[temp]]))

        result = {'P': Presult, 'pH': pHreuslt, 'OM': OMresult, 'EC': ECresult}
        return jsonify(result)
    else:
        return "API is running to handle android application requests"


@app.route('/api/analyse-soil', methods=['POST'])
def analyse_soil():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    crop = request.form.get('crop', 'Unknown')

    filebytes = file.read()
    nparr = np.frombuffer(filebytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        return jsonify({'error': 'Could not decode image'}), 400

    blue_channel = image[:, :, 0]
    green_channel = image[:, :, 1]
    red_channel = image[:, :, 2]
    temp = (np.median(green_channel) + np.median(blue_channel)) + np.median(red_channel)
    temp = np.nanmean(temp)

    Presult = float(Pmodel.predict([[temp]]))
    pHresult = float(pHmodel.predict([[temp]]))
    OMresult = float(OMmodel.predict([[temp]]))
    ECresult = float(ECmodel.predict([[temp]]))

    return jsonify({
        'nutrients': {
            'N': None,
            'P': round(Presult, 2),
            'K': None
        },
        'soilProperties': {
            'pH': round(pHresult, 2),
            'OM': round(OMresult, 2),
            'EC': round(ECresult, 2)
        },
        'crop': crop
    })


if __name__ == '__main__':
    app.run(debug=True)
