"""
train_model.py

Usage:
  python train_model.py --fe_csv /path/to/Fe.csv --cu_csv /path/to/Cu.csv --out_dir models

This script:
- Loads CSVs for Fe and Cu datasets
- Attempts to detect feature columns (RGB / absorbance / numeric)
- Trains a regression model (RandomForest) inside a sklearn Pipeline (StandardScaler + RF)
- Saves models to models/fe_model.pkl and models/cu_model.pkl
"""

import argparse
import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

COMMON_TARGET_NAMES = [
    "concentration", "kadar", "value", "ppm", "mg/L", "mg_per_l", "target", "y", "label"
]

COMMON_FEATURES = [
    "r", "g", "b", "R", "G", "B", "red", "green", "blue",
    "absorbance", "abs", "a", "intensity"
]

def detect_target_column(df, prefer_name=None):
    # If prefer_name provided, try to find it (case-insensitive)
    if prefer_name:
        for c in df.columns:
            if c.lower().find(prefer_name.lower()) >= 0:
                return c
    # Search common names
    for t in COMMON_TARGET_NAMES:
        for c in df.columns:
            if c.lower() == t.lower() or c.lower().find(t.lower()) >= 0:
                return c
    # fallback: if there's a single numeric column that's obviously target (heuristic)
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if len(numeric_cols) >= 2:
        # assume the last numeric column is target
        return numeric_cols[-1]
    elif len(numeric_cols) == 1:
        return numeric_cols[0]
    return None

def detect_feature_columns(df, target_col):
    # try common feature names
    found = []
    for f in COMMON_FEATURES:
        for c in df.columns:
            if c.lower() == f.lower() or c.lower().find(f.lower()) >= 0:
                if c != target_col:
                    found.append(c)
    # remove duplicates preserving order
    found = list(dict.fromkeys(found))
    if found:
        return found
    # else fallback: use all numeric columns except target
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    features = [c for c in numeric_cols if c != target_col]
    return features

def train_and_save(csv_path, out_path, metal_hint=None):
    print(f"Loading {csv_path} ...")
    df = pd.read_csv(csv_path)
    print(f"Columns: {df.columns.tolist()}")
    target_col = detect_target_column(df, prefer_name=metal_hint)
    if target_col is None:
        raise RuntimeError("Tidak dapat mendeteksi kolom target. Silakan cek CSV Anda.")
    print(f"Detected target column: {target_col}")
    feature_cols = detect_feature_columns(df, target_col)
    if not feature_cols:
        raise RuntimeError("Tidak ada fitur numeric yang dideteksi untuk training.")
    print(f"Using features: {feature_cols}")

    X = df[feature_cols].astype(float)
    y = df[target_col].astype(float)

    # simple train-test split for quick metrics
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("rf", RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1))
    ])

    print("Training model...")
    pipeline.fit(X_train, y_train)

    print("Evaluating...")
    preds = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    print(f"MAE: {mae:.4f}, R2: {r2:.4f}")

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    joblib.dump({
        "pipeline": pipeline,
        "feature_columns": feature_cols,
        "target_column": target_col,
        "metrics": {"mae": mae, "r2": r2}
    }, out_path)
    print(f"Saved model to {out_path}")

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--fe_csv", default="/mnt/data/Data Base - Logam Fe.csv", help="CSV for Fe")
    p.add_argument("--cu_csv", default="/mnt/data/Data Base - Logam Cu.csv", help="CSV for Cu")
    p.add_argument("--out_dir", default="models", help="Output directory for models")
    args = p.parse_args()

    train_and_save(args.fe_csv, os.path.join(args.out_dir, "fe_model.pkl"), metal_hint="fe")
    train_and_save(args.cu_csv, os.path.join(args.out_dir, "cu_model.pkl"), metal_hint="cu")
    print("All done.")

if __name__ == "__main__":
    main()
