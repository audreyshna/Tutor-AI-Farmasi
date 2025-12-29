import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

DATA_FOLDER = "dataset"
OUTPUT_FOLDER = "models"

# Buat folder model jika belum ada
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def preprocess_and_train(file_path, metal_type):
    print(f"\n=== Training model untuk logam {metal_type.upper()} (9 fitur RGB) ===")

    # Baca CSV
    df = pd.read_csv(file_path, encoding="utf-8-sig")

    # Normalisasi nama kolom
    df.columns = df.columns.str.strip().str.lower()

    # Cari kolom target otomatis (yang mengandung kata 'kons' atau 'adar')
    target_col = [c for c in df.columns if "kons" in c or "adar" in c][0]

    # Ambil kolom RGB + target
    df = df[['mean_r', 'mean_g', 'mean_b', target_col]].dropna()

    # Normalisasi target ke float
    df[target_col] = (
        df[target_col]
        .astype(str)
        .str.replace(",", ".", regex=False)
        .astype(float)
    )

    # Normalisasi RGB
    total = df[['mean_r', 'mean_g', 'mean_b']].sum(axis=1)
    df['r_norm'] = df['mean_r'] / total
    df['g_norm'] = df['mean_g'] / total
    df['b_norm'] = df['mean_b'] / total

    # Rasio warna
    df['r_g_ratio'] = df['mean_r'] / (df['mean_g'] + 1)
    df['r_b_ratio'] = df['mean_r'] / (df['mean_b'] + 1)
    df['g_b_ratio'] = df['mean_g'] / (df['mean_b'] + 1)

    # Fitur dan target
    feature_cols = [
        'mean_r', 'mean_g', 'mean_b',
        'r_norm', 'g_norm', 'b_norm',
        'r_g_ratio', 'r_b_ratio', 'g_b_ratio'
    ]

    X = df[feature_cols]
    y = df[target_col]

    # Split train-test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42
    )

    # Training model
    model = RandomForestRegressor(n_estimators=350, random_state=42)
    model.fit(X_train, y_train)

    # Evaluasi
    y_pred = model.predict(X_test)

    print(f"✅ MAE : {mean_absolute_error(y_test, y_pred):.4f}")
    print(f"✅ R²  : {r2_score(y_test, y_pred):.4f}")

    # Simpan model
    save_path = os.path.join(OUTPUT_FOLDER, f"model_{metal_type.lower()}.pkl")
    joblib.dump(model, save_path)

    print(f"💾 Model disimpan ke: {save_path}")

    return save_path

if __name__ == "__main__":
    preprocess_and_train(os.path.join(DATA_FOLDER, "Data Set - Fe.csv"), "Fe")