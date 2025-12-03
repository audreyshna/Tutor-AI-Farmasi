import React, { useState } from "react";
import axios from "axios";

export default function UjiKandunganPage() {
  const [selectedMetal, setSelectedMetal] = useState(null);
  const [sampleName, setSampleName] = useState("");
  const [sampleDate, setSampleDate] = useState("");
  const [imageFile, setImageFile] = useState(null); // simpan file asli
  const [imagePreview, setImagePreview] = useState(null); // untuk ditampilkan
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  // fungsi buat simulasi analisis dummy (nanti bisa diganti model beneran)
  const handleAnalyze = () => {
    if (!imageFile || !sampleName || !sampleDate || !selectedMetal) {
      setMessage("⚠️ Lengkapi semua data dulu sebelum analisis.");
      return;
    }

    const fakeKadar = (Math.random() * 2).toFixed(3);
    const fakeRGB = "RGB(93,147,167)";
    const fakeStatus = parseFloat(fakeKadar) < (selectedMetal === "Fe" ? 0.3 : 2.0) ? "Aman" : "Tidak Aman";

    setResult({
      rgb: fakeRGB,
      kadar: fakeKadar,
      status: fakeStatus,
    });

    setMessage("");
  };

  // fungsi buat upload hasil + gambar ke backend
  const handleUpload = async () => {
    if (!result) {
      setMessage("⚠️ Lakukan analisis dulu sebelum upload sample.");
      return;
    }

    const formData = new FormData();
    formData.append("sample_name", sampleName);
    formData.append("user_id", 1); // sementara, nanti otomatis dari login
    const formattedDate = new Date(sampleDate).toISOString().slice(0, 10);
    formData.append("test_date", formattedDate);
    formData.append("metal_type", selectedMetal);
    formData.append("concentration", result.kadar);
    formData.append("image", imageFile);

    try {
      const res = await axios.post("http://localhost:5000/samples/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ " + res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("❌ Gagal menyimpan data sample ke server.");
    }
  };

  return (
    <div className="container py-4">
      {!selectedMetal ? (
        <>
          <h5 className="text-center fw-semibold mb-2 text-primary">
            Pilih Jenis Elemen untuk Diuji
          </h5>
          <p className="text-center text-muted mb-4">
            Pilih elemen yang ingin Anda uji kandungannya dalam larutan
          </p>
          <div className="row justify-content-center g-4">
            <div className="col-md-5">
              <div
                className="card fe-card text-center p-4 shadow-sm"
                onClick={() => setSelectedMetal("Fe")}
                style={{ cursor: "pointer" }}
              >
                <div className="fe-icon red-gradient">
                  <i className="bi bi-fire fs-3"></i>
                </div>
                <h5 className="fw-semibold mb-2">Besi (Fe)</h5>
                <span className="badge bg-light text-dark mb-2">
                  Batas Aman: 0.3 mg/L
                </span>
                <p className="text-muted small">
                  Analisis RGB foto sampel larutan untuk mendeteksi kandungan Fe
                </p>
              </div>
            </div>
            <div className="col-md-5">
              <div
                className="card cu-card text-center p-4 shadow-sm"
                onClick={() => setSelectedMetal("Cu")}
                style={{ cursor: "pointer" }}
              >
                <div className="cu-icon blue-gradient">
                  <i className="bi bi-droplet fs-3"></i>
                </div>
                <h5 className="fw-semibold mb-2">Tembaga (Cu)</h5>
                <span className="badge bg-light text-dark mb-2">
                  Batas Aman: 2.0 mg/L
                </span>
                <p className="text-muted small">
                  Analisis RGB foto sampel larutan untuk mendeteksi kandungan Cu
                </p>
              </div>
            </div>
            <div className="col-10">
              <div className="card guide-card text-start p-4 shadow-sm">
                <h6 className="fw-bold text-primary mb-2">📋 Cara Pengujian:</h6>
                <ul className="small mb-0">
                  <li>Pilih elemen (Besi atau Tembaga)</li>
                  <li>Upload foto larutan sample</li>
                  <li>Masukkan nama & tanggal sample</li>
                  <li>Klik tombol "Analisis Sample"</li>
                  <li>Lalu simpan hasil ke database dengan "Simpan Hasil Analisis"</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="row justify-content-center g-4 mt-3">
          <div className="col-md-6">
            <div className="card glass-card shadow-sm">
              <div className="card-body">
                <button
                  className="btn btn-outline-secondary btn-sm mb-3"
                  onClick={() => {
                    setSelectedMetal(null);
                    setResult(null);
                    setImageFile(null);
                    setImagePreview(null);
                    setMessage("");
                  }}
                >
                  ← Kembali
                </button>

                <h5 className="fw-semibold mb-3 text-center">
                  Analisis Kandungan {selectedMetal === "Fe" ? "Besi (Fe)" : "Tembaga (Cu)"}
                </h5>

                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Nama Sample"
                  value={sampleName}
                  onChange={(e) => setSampleName(e.target.value)}
                />
                <input
                  type="date"
                  className="form-control mb-3"
                  value={sampleDate}
                  onChange={(e) => setSampleDate(e.target.value)}
                />
                <input
                  type="file"
                  className="form-control mb-3"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }}
                />

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary flex-fill"
                    onClick={handleAnalyze}
                  >
                    Analisis Sample
                  </button>
                  <button
                    className="btn btn-success flex-fill"
                    onClick={handleUpload}
                    disabled={!result}
                  >
                    Simpan Hasil Analisis
                  </button>
                </div>
              </div>
            </div>
          </div>

          {result && (
            <div className="col-md-5">
              <div className="card glass-card shadow-sm">
                <div className="card-body text-center">
                  <h6 className="fw-semibold mb-3">Hasil Analisis</h6>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Sample Preview"
                      className="img-fluid rounded mb-3 border"
                      style={{
                        height: "250px",
                        objectFit: "cover",
                        width: "100%",
                      }}
                    />
                  )}
                  <p className="mb-1 small text-muted">{result.rgb}</p>
                  <h5
                    className={`fw-bold ${
                      result.status === "Aman" ? "text-success" : "text-danger"
                    }`}
                  >
                    {result.status}
                  </h5>
                  <p className="small">
                    Kandungan {selectedMetal}: {result.kadar} mg/L
                  </p>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="col-10 text-center mt-2">
              <p
                className={`fw-semibold ${
                  message.includes("✅")
                    ? "text-success"
                    : message.includes("⚠️")
                    ? "text-warning"
                    : "text-danger"
                }`}
              >
                {message}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
