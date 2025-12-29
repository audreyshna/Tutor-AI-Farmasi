import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

DATA_FOLDER = "dataset"
OUTPUT_FOLDER = "models"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def preprocess_and_train_cu(file_path):
    print("\n=== Training model CU (HSV otomatis) ===")

    # Baca CSV
    df = pd.read_csv(file_path, encoding="utf-8-sig")
    df.columns = df.columns.str.strip().str.lower()

    # Cari kolom target otomatis ('kons' atau 'adar')
    target_col = [c for c in df.columns if "kons" in c or "adar" in c][0]

    # Pastikan target float
    df[target_col] = (
        df[target_col].astype(str)
        .str.replace(",", ".", regex=False)
        .astype(float)
    )

    # Daftar fitur HSV yang *mungkin ada*
    hsv_candidates = ["h", "s", "v"]

    # Cek fitur mana yang tersedia
    hsv_features = [c for c in hsv_candidates if c in df.columns]

    if len(hsv_features) == 0:
        raise ValueError("❌ ERROR: Tidak ada fitur H, S, atau V dalam dataset CU!")

    print(f"🟦 Fitur HSV terdeteksi: {hsv_features}")

    # OPTIONAL: Tambahkan fitur RGB jika ada
    optional_rgb = ["mean_r", "mean_g", "mean_b"]
    optional_rgb = [c for c in optional_rgb if c in df.columns]

    # Gabungkan semua fitur
    feature_cols = hsv_features + optional_rgb

    # Buang baris kosong pada fitur atau target
    df = df[feature_cols + [target_col]].dropna()

    X = df[feature_cols]
    y = df[target_col]

    # Split Train/Test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42
    )

    # Train Model
    model = RandomForestRegressor(n_estimators=350, random_state=42)
    model.fit(X_train, y_train)

    # Evaluasi
    y_pred = model.predict(X_test)
    print(f"✅ MAE : {mean_absolute_error(y_test, y_pred):.4f}")
    print(f"✅ R²  : {r2_score(y_test, y_pred):.4f}")

    # Simpan Model
    save_path = os.path.join(OUTPUT_FOLDER, "model_cu.pkl")
    joblib.dump(model, save_path)

    print(f"💾 Model disimpan sebagai {save_path}")

if __name__ == "__main__":
    preprocess_and_train_cu(os.path.join(DATA_FOLDER, "TEMBAGA.csv"))