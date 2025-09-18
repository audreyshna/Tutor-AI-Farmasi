from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import pickle
from PIL import Image
import io

app = Flask(__name__)

# Load dummy ML model (contoh)
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    # Ambil gambar dari frontend
    file = request.files['image']
    img = Image.open(file.stream).convert('RGB')
    img = np.array(img)

    # Ambil ROI dari frontend
    roi_x = int(request.form['roi_x'])
    roi_y = int(request.form['roi_y'])
    roi_w = int(request.form['roi_w'])
    roi_h = int(request.form['roi_h'])

    roi = img[roi_y:roi_y+roi_h, roi_x:roi_x+roi_w]

    # Hitung RGB rata-rata
    R_mean = np.mean(roi[:,:,0])
    G_mean = np.mean(roi[:,:,1])
    B_mean = np.mean(roi[:,:,2])

    # Ambil fitur tambahan dari frontend
    t_min = float(request.form['t_min'])
    temp_c = float(request.form['temp_c'])
    # Untuk simplicity, categorical di-encode manual (contoh)
    light_type = int(request.form['light_type'])
    device_model = int(request.form['device_model'])
    iso = int(request.form['iso'])
    exposure = float(request.form['exposure'])
    wb_mode = int(request.form['wb_mode'])

    # Buat fitur vektor
    features = np.array([[R_mean, G_mean, B_mean, t_min, temp_c, light_type,
                          device_model, iso, exposure, wb_mode]])

    # Prediksi
    prediction = model.predict(features)[0]
    cu_ppm, fe_ppm = prediction

    return jsonify({
        "cu_ppm": float(cu_ppm),
        "fe_ppm": float(fe_ppm),
        "rgb": {"R": float(R_mean), "G": float(G_mean), "B": float(B_mean)}
    })

if __name__ == '__main__':
    app.run(debug=True)
