# app.py
import re
import os
import io
import time
import joblib
import colorsys
from typing import Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import numpy as np
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, MetaData
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fastapi-app")

# ---------------------------
# CONFIG
# ---------------------------
# Models folder (adjust jika perlu)
POSSIBLE_MODEL_PATHS = ["models/model_fe.pkl", "models/model_cu.pkl", "/mnt/data/model_fe.pkl", "/mnt/data/model_cu.pkl"]
FE_MODEL_PATH = os.environ.get("FE_MODEL_PATH", "models/model_fe.pkl")
CU_MODEL_PATH = os.environ.get("CU_MODEL_PATH", "models/model_cu.pkl")

# Upload directory (sesuaikan dengan request: backend/uploads/samples)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "samples")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Database URL - set via env var. Contoh:
# mysql+pymysql://username:password@localhost:3306/your_db
DATABASE_URL = os.environ.get("DATABASE_URL", "mysql+pymysql://root:password@localhost:3306/your_db")

# ---------------------------
# DATABASE SETUP (SQLAlchemy)
# ---------------------------
Base = declarative_base()
metadata = MetaData()

class Sample(Base):
    __tablename__ = "samples"
    sample_id = Column(Integer, primary_key=True, autoincrement=True)
    sample_name = Column(String(255))
    user_id = Column(Integer)
    test_date = Column(Date)
    metal_type = Column(String(32))
    concentration = Column(Float, nullable=True)
    image_path = Column(String(512))

# engine and session
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)

# create table if not exists
Base.metadata.create_all(bind=engine)

# ---------------------------
# FASTAPI APP
# ---------------------------
app = FastAPI(title="Logam Predictor API (FE/CU)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def secure_filename(filename: str) -> str:
    filename = filename.strip().replace(" ", "_")
    filename = re.sub(r"[^A-Za-z0-9._-]", "", filename)
    return filename

# ---------------------------
# MODEL LOADING
# ---------------------------
def load_pkg(path):
    if not os.path.exists(path):
        logger.warning(f"Model not found at {path}")
        return None
    try:
        pkg = joblib.load(path)
        logger.info(f"Loaded model from {path}; feature_cols={pkg.get('feature_columns')}")
        return pkg
    except Exception as e:
        logger.exception(f"Failed to load model {path}: {e}")
        return None

fe_model_pkg = load_pkg(FE_MODEL_PATH)
cu_model_pkg = load_pkg(CU_MODEL_PATH)

# Try fallback /mnt/data if not found
if fe_model_pkg is None and os.path.exists("/mnt/data/model_fe.pkl"):
    fe_model_pkg = load_pkg("/mnt/data/model_fe.pkl")
if cu_model_pkg is None and os.path.exists("/mnt/data/model_cu.pkl"):
    cu_model_pkg = load_pkg("/mnt/data/model_cu.pkl")

# ---------------------------
# HELPERS: image -> RGB / features -> predict
# ---------------------------
def extract_rgb_bytes(file_bytes: bytes, sample_size: int = 50):
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    w, h = img.size
    cx, cy = w // 2, int(h * 0.75)
    half = sample_size // 2
    left = max(0, cx - half)
    upper = max(0, cy - half)
    right = min(w, cx + half)
    lower = min(h, cy + half)
    crop = img.crop((left, upper, right, lower))
    arr = np.array(crop)
    if arr.size == 0:
        raise ValueError("Cropped image area empty")
    mean_rgb = arr.reshape(-1, 3).mean(axis=0)
    return [int(mean_rgb[0]), int(mean_rgb[1]), int(mean_rgb[2])]

def rgb_to_hsv_scaled(r, g, b):
    # colorsys uses 0..1 for each channel; returns h:0..1 => convert to degrees for h if needed
    rn, gn, bn = r/255.0, g/255.0, b/255.0
    h, s, v = colorsys.rgb_to_hsv(rn, gn, bn)
    # return h in degrees (0..360) and s,v in 0..1
    return h * 360.0, s, v

def build_feature_dict_from_rgb(rgb):
    r, g, b = rgb
    total = r + g + b if (r + g + b) != 0 else 1.0
    r_norm = r / total
    g_norm = g / total
    b_norm = b / total
    r_g_ratio = r / (g + 1)
    r_b_ratio = r / (b + 1)
    g_b_ratio = g / (b + 1)
    h, s, v = rgb_to_hsv_scaled(r, g, b)

    feat = {
        "mean_r": float(r),
        "mean_g": float(g),
        "mean_b": float(b),
        "r": float(r),
        "g": float(g),
        "b": float(b),
        "r_norm": float(r_norm),
        "g_norm": float(g_norm),
        "b_norm": float(b_norm),
        "r_g_ratio": float(r_g_ratio),
        "r_b_ratio": float(r_b_ratio),
        "g_b_ratio": float(g_b_ratio),
        "h": float(h),
        "s": float(s),
        "v": float(v),
    }
    return feat

def predict_with_pkg(pkg: Dict[str, Any], input_features: Dict[str, float]):
    """
    pkg: dict with keys pipeline, feature_columns
    input_features: dict of many possible features -> we'll pull required ones by name
    """
    pipeline = pkg.get("pipeline")
    feature_cols = pkg.get("feature_columns", [])
    if pipeline is None:
        raise RuntimeError("Model pipeline missing in package")

    X = []
    missing = []
    for f in feature_cols:
        if f not in input_features:
            missing.append(f)
        else:
            X.append(float(input_features[f]))
    if missing:
        raise ValueError(f"Missing feature(s) for model: {missing}")
    X_arr = np.array(X).reshape(1, -1)
    pred = pipeline.predict(X_arr)[0]
    return float(pred), feature_cols

def evaluate_safety(conc: float, test_type: str):
    thresholds = {
        'tembaga': 2.0,
        'besi': 0.3,
        'fe': 0.3,
        'cu': 2.0
    }
    thr = thresholds.get(test_type.lower(), 1.0)
    return "AMAN" if conc <= thr else "TIDAK AMAN"

# ---------------------------
# ROUTES
# ---------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "fe_model_loaded": fe_model_pkg is not None,
        "cu_model_loaded": cu_model_pkg is not None
    }

@app.post("/api/predict")
async def api_predict(
    file: UploadFile = File(...),
    test_type: str = Form(...)
):
    """
    Endpoint yang dipanggil frontend React:
    - file: image file
    - test_type: 'besi' or 'tembaga' (frontend already sends 'besi' or 'tembaga')
    returns JSON: { rgb: [...], concentration_mg_per_L: x.xx, status: "AMAN"/"TIDAK AMAN" }
    """
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File kosong")

    try:
        rgb = extract_rgb_bytes(content)
    except Exception as e:
        logger.exception("Failed extracting rgb")
        raise HTTPException(status_code=400, detail=f"Error processing image: {e}")

    feat_dict = build_feature_dict_from_rgb(rgb)
    test_type_l = test_type.lower()

    if test_type_l in ("besi", "fe"):
        if fe_model_pkg is None:
            raise HTTPException(status_code=500, detail="FE model not available")
        try:
            pred, used_feats = predict_with_pkg(fe_model_pkg, feat_dict)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif test_type_l in ("tembaga", "cu"):
        if cu_model_pkg is None:
            raise HTTPException(status_code=500, detail="CU model not available")
        try:
            pred, used_feats = predict_with_pkg(cu_model_pkg, feat_dict)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        raise HTTPException(status_code=400, detail="test_type must be 'besi' or 'tembaga'")

    status = evaluate_safety(pred, test_type_l)

    return {
        "rgb": rgb,
        "concentration_mg_per_L": round(float(pred), 4),
        "status": status
    }

@app.post("/samples/upload")
async def upload_sample(
    sample_name: str = Form(...),
    user_id: int = Form(...),
    test_date: str = Form(...),  # ISO format yyyy-mm-dd
    metal_type: str = Form(...),
    concentration: Optional[float] = Form(None),
    image: UploadFile = File(...)
):
    """
    Menyimpan file ke UPLOAD_DIR dan menambah record ke DB.
    Sesuai frontend yang mengirim:
      sample_name, user_id, test_date, metal_type, concentration, image
    """
    # Simpan file
    content = await image.read()
    if not content:
        raise HTTPException(status_code=400, detail="File kosong")

    filename = secure_filename(image.filename)
    prefix = str(int(time.time()))
    safe_name = f"{prefix}_{filename}"
    save_path = os.path.join(UPLOAD_DIR, safe_name)

    try:
        with open(save_path, "wb") as f:
            f.write(content)
    except Exception as e:
        logger.exception("Failed saving uploaded file")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    # Simpan metadata ke DB
    try:
        # parse date
        dt = datetime.strptime(test_date, "%Y-%m-%d").date()
    except Exception:
        dt = datetime.utcnow().date()

    db = SessionLocal()
    try:
        new_sample = Sample(
            sample_name=sample_name,
            user_id=user_id,
            test_date=dt,
            metal_type=metal_type,
            concentration=float(concentration) if concentration is not None else None,
            image_path=os.path.relpath(save_path, BASE_DIR)
        )
        db.add(new_sample)
        db.commit()
        db.refresh(new_sample)
        sample_id = new_sample.sample_id
    except Exception as e:
        db.rollback()
        logger.exception("DB insert failed")
        raise HTTPException(status_code=500, detail=f"DB insert failed: {e}")
    finally:
        db.close()

    return {"message": "Sample berhasil diupload", "sample_id": sample_id, "image_path": new_sample.image_path}