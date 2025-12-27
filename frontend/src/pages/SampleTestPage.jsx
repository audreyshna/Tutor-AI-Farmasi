import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/SampleTestPage.css";
import HistoryPage from "./HistoryPage.jsx";

// Constants
const API_BASE_URL = "http://localhost:5000";
const METAL_LIMITS = {
  Fe: { name: "Besi (Fe)", limit: 0.3, icon: "bi-fire", gradient: "red-gradient" },
  Cu: { name: "Tembaga (Cu)", limit: 2.0, icon: "bi-droplet", gradient: "blue-gradient" }
};

export default function UjiKandunganPage() {
  // State management
  const [selectedMetal, setSelectedMetal] = useState(null);
  const [sampleName, setSampleName] = useState("");
  const [sampleDate, setSampleDate] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  // Auto-clear message after 3 seconds
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // Helper function to get user from localStorage
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  // Validate form inputs
  const validateInputs = () => {
    if (!imageFile || !sampleName || !sampleDate || !selectedMetal) {
      setMessage("⚠️ Lengkapi semua data dulu sebelum analisis.");
      return false;
    }
    return true;
  };

  // Handle sample analysis
  const handleAnalyze = async () => {
    if (!validateInputs()) return;

    const user = getUser();
    if (!user?.user_id) {
      setMessage("⚠️ User tidak valid. Silakan login ulang.");
      return;
    }

    const formData = new FormData();
    formData.append("sample_name", sampleName);
    formData.append("user_id", user.user_id);
    formData.append("test_date", new Date(sampleDate).toISOString().slice(0, 10));
    formData.append("metal_type", selectedMetal);
    formData.append("image", imageFile);

    try {
      const res = await axios.post(`${API_BASE_URL}/samples/analyze`, formData);
      const { rgb, concentration, status } = res.data;

      setResult({
        rgb: `RGB(${rgb.join(", ")})`,
        kadar: concentration,
        status: status === "AMAN" ? "Aman" : "Tidak Aman",
      });

      setMessage("✅ Analisis berhasil dilakukan");
    } catch (err) {
      console.error("ANALYZE ERROR:", err);
      setMessage("❌ Gagal melakukan analisis sample");
    }
  };

  // Handle upload results to backend
  const handleUpload = async () => {
    if (!result) {
      setMessage("⚠️ Lakukan analisis dulu sebelum upload sample.");
      return;
    }

    const user = getUser();
    if (!user?.user_id) {
      setMessage("⚠️ User tidak valid. Silakan login ulang.");
      return;
    }

    const formData = new FormData();
    formData.append("sample_name", sampleName);
    formData.append("user_id", user.user_id);
    formData.append("test_date", new Date(sampleDate).toISOString().slice(0, 10));
    formData.append("metal_type", selectedMetal);
    formData.append("concentration", result.kadar);
    formData.append("image", imageFile);

    try {
      const res = await axios.post(`${API_BASE_URL}/samples/save`, formData);
      setMessage("✅ " + (res.data?.message || "Data sample berhasil disimpan"));
    } catch (err) {
      console.error("UPLOAD ERROR:", err.response?.data || err);
      setMessage("❌ Gagal menyimpan data sample ke server.");
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedMetal(null);
    setResult(null);
    setImageFile(null);
    setImagePreview(null);
    setSampleName("");
    setSampleDate("");
    setMessage("");
  };

  // Render metal selection cards
  const renderMetalCard = (metalType) => {
    const metal = METAL_LIMITS[metalType];
    return (
      <div
        className={`card ${metalType === "Fe" ? "fe-card" : "cu-card"} text-center p-4 shadow-sm`}
        onClick={() => setSelectedMetal(metalType)}
        style={{ cursor: "pointer" }}
      >
        <div className={`${metalType === "Fe" ? "fe-icon" : "cu-icon"} ${metal.gradient}`}>
          <i className={`bi ${metal.icon} fs-3`}></i>
        </div>
        <h5 className="fw-semibold mb-2">{metal.name}</h5>
        <span className="badge bg-light text-dark mb-2">
          Batas Aman: {metal.limit} mg/L
        </span>
        <p className="text-muted small">
          Analisis RGB foto sampel larutan untuk mendeteksi kandungan {metalType}
        </p>
      </div>
    );
  };

  // Render guide card
  const renderGuideCard = () => (
    <div className="col-12">
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
  );

  // Render metal selection page
  const renderMetalSelection = () => (
    <>
      <h5 className="text-center fw-semibold mb-2 text-primary">
        Pilih Jenis Elemen untuk Diuji
      </h5>
      <p className="text-center text-muted mb-4">
        Pilih elemen yang ingin Anda uji kandungannya dalam larutan
      </p>
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          {renderMetalCard("Fe")}
        </div>
        <div className="col-md-6">
          {renderMetalCard("Cu")}
        </div>
      </div>
      <div className="row g-4 mb-0.5">
        {renderGuideCard()}
      </div>
      <HistoryPage />
    </>
  );

  // Render analysis form
  const renderAnalysisForm = () => (
    <div className="row g-4 mt-3">
      <div className={result ? "col-md-6" : "col-12"}>
        <div className="card glass-card shadow-sm">
          <div className="card-body">
            <button
              className="btn btn-outline-secondary btn-sm mb-3"
              onClick={handleReset}
            >
              ← Kembali
            </button>

            <h5 className="fw-semibold mb-3 text-center">
              Analisis Kandungan {METAL_LIMITS[selectedMetal].name}
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
              onChange={handleImageChange}
            />

            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={handleAnalyze}
              >
                Analisis Sample
              </button>
              {result && (
                <button
                  className="btn btn-success"
                  onClick={handleUpload}
                >
                  Simpan Hasil Analisis
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="col-md-6">
          <div className="card glass-card shadow-sm">
            <div className="card-body text-center">
              <h6 className="fw-semibold mb-3">Hasil Analisis</h6>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Sample Preview"
                  className="img-fluid rounded mb-3 border"
                  style={{ height: "250px", objectFit: "cover", width: "100%" }}
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
    </div>
  );

  // Render toast message
  const renderMessage = () => {
    if (!message) return null;

    const alertType = message.includes("✅")
      ? "alert-success"
      : message.includes("⚠️")
      ? "alert-warning"
      : "alert-danger";

    return (
      <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4" style={{ zIndex: 1050 }}>
        <div className={`alert ${alertType} shadow`}>
          {message}
        </div>
      </div>
    );
  };

  return (
    <div className="container py-4">
      {!selectedMetal ? renderMetalSelection() : renderAnalysisForm()}
      {renderMessage()}
    </div>
  );
}