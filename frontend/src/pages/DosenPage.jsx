import { useState, useEffect } from "react";
import { FileText, Download, Edit, Trash2, Calendar } from "lucide-react";
import "../styles/DosenPage.css";

export default function DosenPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [materiList, setMateriList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // popup states
  const [deleteId, setDeleteId] = useState(null);
  const [editMateri, setEditMateri] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const rawUser = JSON.parse(localStorage.getItem("user") || "{}");
  const user = { ...rawUser, user_id: rawUser.user_id ?? rawUser.id };

  // FETCH
  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `http://localhost:5000/materials/user/${user.user_id}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMateriList(data);
    } catch {
      setMessage("❌ Gagal memuat history materi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.user_id) fetchMaterials();
  }, [user.user_id]);

  // UPLOAD
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type !== "application/pdf") {
      setMessage("*Hanya file PDF yang diperbolehkan!");
      setFile(null);
      return;
    }
    setFile(selected);
    setMessage("");
  };

  const handleUpload = async () => {
    setIsUploading(true);

    if (!title || !file) {
      setMessage("Judul dan file wajib diisi!");
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("user_id", user.user_id);
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/materials/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setMessage(data.message);
      setTitle("");
      setFile(null);

      const input = document.getElementById("file-upload");
      if (input) input.value = "";

      fetchMaterials();
    } catch (err) {
      console.error(err);
      setMessage("Gagal mengupload materi.");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Materi
  const handleDelete = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/materials/${deleteId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error();

      setDeleteId(null);
      fetchMaterials();
    } catch {
      setDeleteId(null);
    }
  };

  // Edit Materi
  const handleEdit = (materi) => {
    setEditMateri(materi);
    setEditTitle(materi.title);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;

    try {
      await fetch(
        `http://localhost:5000/materials/${editMateri.material_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editTitle,
            user_id: user.user_id,
          }),
        }
      );

      setEditMateri(null);
      setEditTitle("");
      fetchMaterials();
    } catch (err) {
      console.error(err);
    }
  };

  // Download Materi
  const handleDownload = (m) => {
    window.open(`http://localhost:5000/${m.file_path}`, "_blank");
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="container">
      {/* Upload */}
      <div className="card">
        <h2 className="card-title">Upload Materi PDF</h2>
        <p className="card-subtitle">
          Dosen dapat mengunggah materi pembelajaran dalam format PDF.
        </p>

        {message && (
          <div
            className={`alert ${
              message.includes("✅")
                ? "success"
                : message.includes("❌")
                ? "error"
                : "info"
            }`}
          >
            {message}
          </div>
        )}

        <div className="form-group">
          <label className="label">Judul Materi</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="label">File PDF</label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            className="input"
            onChange={handleFileChange}
          />
        </div>

        <button onClick={handleUpload} className="btn-primary">
          Upload
        </button>
      </div>

      {/* History */}
      <div className="card">
        <h2 className="card-title">History Materi</h2>

        {isLoading ? (
          <div className="empty-state">Memuat data...</div>
        ) : materiList.length === 0 ? (
          <div className="empty-state">Belum ada materi</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Judul</th>
                <th>File</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {materiList.map((m) => (
                <tr key={m.material_id}>
                  <td>{formatDate(m.uploaded_at)}</td>
                  <td>{m.title}</td>
                  <td>{m.file_path}</td>
                  <td>
                    <div className="btn-group">
                      <button
                        className="btn-icon"
                        onClick={() => handleDownload(m)}
                      >
                        <Download size={16} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(m)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => setDeleteId(m.material_id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Popup */}
      {deleteId && (
        <div className="modul-overlay">
          <div className="modul">
            <h3 className="modul-title">Hapus Materi?</h3>
            <p className="modul-text">
              Materi yang dihapus tidak dapat dikembalikan.
            </p>
            <div className="modul-footer">
              <button
                className="btn-secondary"
                onClick={() => setDeleteId(null)}
              >
                Batal
              </button>
              <button
                className="btn-danger"
                onClick={() => handleDelete(deleteId)}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Popup */}
      {editMateri && (
        <div className="modul-overlay">
          <div className="modul">
            <h3 className="modul-title">Edit Materi</h3>
            <div className="form-group">
              <label className="label">Judul Materi</label>
              <input
                className="input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="modul-footer">
              <button
                className="btn-secondary"
                onClick={() => setEditMateri(null)}
              >
                Batal
              </button>
              <button className="btn-save" onClick={handleSaveEdit}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
