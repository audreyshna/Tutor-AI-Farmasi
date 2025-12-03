import numpy as np
from sklearn.linear_model import LinearRegression
import pickle

# Dummy training data
X_dummy = np.array([
    [120, 100, 90, 5, 25, 0, 0, 100, 0.0, 0],
    [130, 110, 100, 5, 25, 0, 0, 100, 0.0, 0],
    [140, 120, 110, 5, 25, 0, 0, 100, 0.0, 0],
    [150, 130, 120, 5, 25, 0, 0, 100, 0.0, 0],
    [160, 140, 130, 5, 25, 0, 0, 100, 0.0, 0],
    [170, 150, 140, 5, 25, 0, 0, 100, 0.0, 0],
    [180, 160, 150, 5, 25, 0, 0, 100, 0.0, 0],
    [190, 170, 160, 5, 25, 0, 0, 100, 0.0, 0],
    [200, 180, 170, 5, 25, 0, 0, 100, 0.0, 0],
    [210, 190, 180, 5, 25, 0, 0, 100, 0.0, 0],
])

y_dummy = np.array([
    [5.0, 2.0],
    [5.5, 2.2],
    [6.0, 2.4],
    [6.5, 2.6],
    [7.0, 2.8],
    [7.5, 3.0],
    [8.0, 3.2],
    [8.5, 3.4],
    [9.0, 3.6],
    [9.5, 3.8],
])

model = LinearRegression()
model.fit(X_dummy, y_dummy)

# Simpan model
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("Dummy model berhasil dibuat")
