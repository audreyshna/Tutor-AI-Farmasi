import pandas as pd
import joblib
import numpy as np
from sklearn.metrics import mean_absolute_error, r2_score

DATASET_FE = "dataset/Data Set - Fe.csv"
DATASET_CU = "dataset/TEMBAGA.csv"

MODEL_FE = "models/model_fe.pkl"
MODEL_CU = "models/model_cu.pkl"


# ======================================================
# EVALUASI FE (9 FITUR RGB)
# ======================================================
def evaluate_model_fe():
    print("\n🔍 Evaluasi model FE (RGB)")

    df = pd.read_csv(DATASET_FE)
    df.columns = df.columns.str.strip().str.lower()

    target_col = [c for c in df.columns if "kons" in c or "adar" in c][0]

    df = df[['mean_r','mean_g','mean_b', target_col]].dropna()
    df[target_col] = df[target_col].astype(str).str.replace(",", ".", regex=False).astype(float)

    total = df[['mean_r','mean_g','mean_b']].sum(axis=1)
    df['r_norm'] = df['mean_r'] / total
    df['g_norm'] = df['mean_g'] / total
    df['b_norm'] = df['mean_b'] / total

    df['r_g_ratio'] = df['mean_r'] / (df['mean_g'] + 1)
    df['r_b_ratio'] = df['mean_r'] / (df['mean_b'] + 1)
    df['g_b_ratio'] = df['mean_g'] / (df['mean_b'] + 1)

    feature_cols = [
        'mean_r','mean_g','mean_b',
        'r_norm','g_norm','b_norm',
        'r_g_ratio','r_b_ratio','g_b_ratio'
    ]

    X = df[feature_cols]
    y = df[target_col]

    model = joblib.load(MODEL_FE)
    y_pred = model.predict(X)

    print(f"✅ MAE  : {mean_absolute_error(y, y_pred):.4f}")
    print(f"✅ R²   : {r2_score(y, y_pred):.4f}")


# ======================================================
# EVALUASI CU (FITUR MENYESUAIKAN MODEL)
# ======================================================
def evaluate_model_cu():
    print("\n🔍 Evaluasi model CU (FITUR MENYESUAIKAN MODEL TRAINING)")

    df = pd.read_csv(DATASET_CU)
    df.columns = df.columns.str.strip().str.lower()

    target_col = [c for c in df.columns if "kons" in c or "adar" in c][0]
    df[target_col] = df[target_col].astype(str).str.replace(",", ".", regex=False).astype(float)

    # LOAD MODEL
    model = joblib.load(MODEL_CU)

    # FITUR YANG DIPAKAI MODEL SAAT TRAINING
    used_features = model.feature_names_in_

    # FILTER DATASET SESUAI FITUR MODEL
    df_eval = df[list(used_features) + [target_col]].dropna()

    X = df_eval[list(used_features)]
    y = df_eval[target_col]

    y_pred = model.predict(X)

    print(f"🟦 Fitur evaluasi CU: {list(used_features)}")
    print(f"✅ MAE  : {mean_absolute_error(y, y_pred):.4f}")
    print(f"✅ R²   : {r2_score(y, y_pred):.4f}")


if __name__ == "__main__":
    evaluate_model_fe()
    evaluate_model_cu()
