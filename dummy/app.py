from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import pickle
from PIL import Image
import io

app = Flask(__name__)

# Load dummy ML model
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    # Ambil gambar
    file = request.files['image']
    img = Image.open(file.stream).convert('RGB')
    img = np.array(img)

    # ROI otomatis (di tengah gambar, 50% ukuran)
    h, w, _ = img.shape
    roi_w, roi_h = int(w*0.5), int(h*0.5)
    roi_x, roi_y = w//4, h//4
    roi = img[roi_y:roi_y+roi_h, roi_x:roi_x+roi_w]

    # Hitung RGB rata-rata
    R_mean = np.mean(roi[:,:,0])
    G_mean = np.mean(roi[:,:,1])
    B_mean = np.mean(roi[:,:,2])

    # Default metadata
    t_min = 5
    temp_c = 25
    light_type = 0
    device_model = 0
    iso = 100
    exposure = 0.0
    wb_mode = 0

    # Fitur untuk model
    features = np.array([[R_mean, G_mean, B_mean, t_min, temp_c,
                          light_type, device_model, iso, exposure, wb_mode]])

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
