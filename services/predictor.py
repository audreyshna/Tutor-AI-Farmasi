import os
import io
import joblib
import colorsys
import numpy as np
import pandas as pd
from PIL import Image

# ---------------------------
# CONFIG
# ---------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
MODEL_DIR = os.path.join(PROJECT_ROOT, "backend", "models")

FE_MODEL_PATH = os.environ.get(
    "FE_MODEL_PATH",
    os.path.join(MODEL_DIR, "model_fe.pkl")
)

CU_MODEL_PATH = os.environ.get(
    "CU_MODEL_PATH",
    os.path.join(MODEL_DIR, "model_cu.pkl")
)

# ==========================
# LOAD MODEL
# ==========================
def load_model(path):
    if not os.path.exists(path):
        return None
    return joblib.load(path)

fe_model = load_model(FE_MODEL_PATH)
cu_model = load_model(CU_MODEL_PATH)

# ==========================
# IMAGE PROCESSING
# ==========================
def extract_rgb_bytes(file_bytes: bytes, sample_size: int = 50):
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    w, h = img.size
    cx, cy = w // 2, int(h * 0.75)
    half = sample_size // 2

    crop = img.crop((
        max(0, cx - half),
        max(0, cy - half),
        min(w, cx + half),
        min(h, cy + half)
    ))

    arr = np.array(crop)
    mean_rgb = arr.reshape(-1, 3).mean(axis=0)
    return [int(mean_rgb[0]), int(mean_rgb[1]), int(mean_rgb[2])]

def rgb_to_hsv_scaled(r, g, b):
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
    return h * 360, s, v

def build_feature_vector(rgb, test_type: str):
    r, g, b = rgb
    total = r + g + b or 1

    if test_type.lower() in ("besi", "fe"):
        # 9 fitur FE
        features = {
            'mean_r': r,
            'mean_g': g,
            'mean_b': b,
            'r_norm': r / total,
            'g_norm': g / total,
            'b_norm': b / total,
            'r_g_ratio': r / (g + 1),
            'r_b_ratio': r / (b + 1),
            'g_b_ratio': g / (b + 1)
        }
    else:
        # 12 fitur CU
        h, s, v = rgb_to_hsv_scaled(r, g, b)
        features = {
            'r': r,
            'g': g,
            'b': b,
            'r_norm': r / total,
            'g_norm': g / total,
            'b_norm': b / total,
            'r_g_ratio': r / (g + 1),
            'r_b_ratio': r / (b + 1),
            'g_b_ratio': g / (b + 1),
            'h': h,
            's': s,
            'v': v
        }
    return features

# ==========================
# PREDICT
# ==========================
def predict_with_model(model, features: dict):
    # Ubah ke DataFrame agar sesuai dengan saat training
    X = pd.DataFrame([features])
    return float(model.predict(X)[0])

def predict_concentration(image_bytes: bytes, test_type: str):
    rgb = extract_rgb_bytes(image_bytes)
    features_vector = build_feature_vector(rgb, test_type)

    if test_type.lower() in ("besi", "fe"):
        model = fe_model
    else:
        model = cu_model

    if model is None:
        raise ValueError(f"Model untuk {test_type} belum tersedia!")

    pred = predict_with_model(model, features_vector)

    return {
        "rgb": rgb,
        "concentration": round(pred, 4),
        "status": "AMAN" if pred <= (0.3 if test_type.lower() in ("besi", "fe") else 2.0) else "TIDAK AMAN"
    }
