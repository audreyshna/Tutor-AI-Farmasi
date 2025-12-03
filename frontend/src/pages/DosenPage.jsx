import { useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function DosenPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type !== "application/pdf") {
      setMessage("❌ Hanya file PDF yang diperbolehkan!");
      setFile(null);
      return;
    }
    setFile(selected);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!title || !file) {
      setMessage("⚠️ Judul dan file wajib diisi!");
      return;
    }

    try {
      setIsUploading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const formData = new FormData();
      formData.append("title", title);
      formData.append("user_id", user?.user_id);
      formData.append("file", file);

      const res = await axios.post("http://localhost:5000/materials/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(" " + res.data.message);
      setTitle("");
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Gagal mengupload materi.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="app-bg min-vh-100 d-flex flex-column">
      <main className="container flex-grow-1 my-5">
        <div className="card shadow-sm p-4 border-0">
          <h4 className="fw-semibold text-primary mb-3">Upload Materi PDF</h4>
          <p className="text-muted small mb-4">
            Dosen dapat mengunggah materi pembelajaran dalam format PDF. File akan disimpan di server.
          </p>

          {message && (
            <div
              className={`alert ${
                message.includes("✅") ? "alert-success" : "alert-danger"
              } py-2`}
            >
              {message}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label fw-medium">Judul Materi</label>
            <input
              type="text"
              className="form-control"
              placeholder="Masukkan judul materi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Pilih File (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              className="form-control"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          <button
            onClick={handleUpload}
            className="btn btn-primary w-100"
            disabled={isUploading}
          >
            {isUploading ? "Mengunggah..." : "Upload"}
          </button>
        </div>
      </main>
    </div>
  );
}
