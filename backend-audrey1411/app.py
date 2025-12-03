"""
FastAPI app for predicting Fe and Cu concentrations.
Assumes models are saved as models/fe_model.pkl and models/cu_model.pkl
Each file contains a dict with keys: pipeline, feature_columns, target_column
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
FE_MODEL_PATH = os.path.join(MODEL_DIR, "fe_model.pkl")
CU_MODEL_PATH = os.path.join(MODEL_DIR, "cu_model.pkl")

def load_model(path):
    if not os.path.exists(path):
        return None
    return joblib.load(path)

fe_model_pkg = load_model(FE_MODEL_PATH)
cu_model_pkg = load_model(CU_MODEL_PATH)

app = FastAPI(title="Logam Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for production, restrict origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    """
    features: a dict containing feature_name -> numeric_value
    Example:
      {"features": {"r": 123, "g": 80, "b": 45}}
    """
    features: Dict[str, float]

class PredictResponse(BaseModel):
    metal: str
    predicted_concentration: float
    units: Optional[str] = None
    used_features: Dict[str, float]
    metrics: Optional[Dict] = None

@app.get("/health")
def health():
    return {
        "status": "ok",
        "fe_model_loaded": fe_model_pkg is not None,
        "cu_model_loaded": cu_model_pkg is not None
    }

def predict_with_pkg(pkg, input_features: Dict[str, float]):
    pipeline = pkg["pipeline"]
    feature_cols = pkg["feature_columns"]

    # Build X in correct order; missing features -> error
    X = []
    for f in feature_cols:
        if f not in input_features:
            raise ValueError(f"Missing feature '{f}' - required features: {feature_cols}")
        X.append(float(input_features[f]))
    X_arr = np.array(X).reshape(1, -1)
    pred = pipeline.predict(X_arr)[0]
    return float(pred), feature_cols

@app.post("/predict/{metal}", response_model=PredictResponse)
def predict(metal: str, req: PredictRequest):
    metal = metal.lower()
    if metal not in ("fe", "cu"):
        raise HTTPException(status_code=400, detail="metal must be 'fe' or 'cu'")

    pkg = fe_model_pkg if metal == "fe" else cu_model_pkg
    if pkg is None:
        raise HTTPException(status_code=500, detail=f"{metal.upper()} model not available. Train first.")

    try:
        pred, used_features = predict_with_pkg(pkg, req.features)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    resp = {
        "metal": metal.upper(),
        "predicted_concentration": pred,
        "units": "unknown",
        "used_features": {k: req.features[k] for k in used_features},
        "metrics": pkg.get("metrics")
    }
    return resp
