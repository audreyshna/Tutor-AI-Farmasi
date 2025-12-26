import { useState, useEffect } from "react";
import { FileText, Download, Edit, Trash2, Calendar } from 'lucide-react';
import '../styles/DosenPage.css';

export default function DosenPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [materiList, setMateriList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [editMateri, setEditMateri] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const rawUser = JSON.parse(localStorage.getItem("user") || "{}");

  const user = {
    ...rawUser,
    user_id: rawUser.user_id ?? rawUser.id,
  };
  
  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/materials/user/${user.user_id}`);
      if (!response.ok) throw new Error('Failed to fetch materials');
      const data = await response.json();
      setMateriList(data);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setMessage("❌ Gagal memuat history materi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.user_id) {
      fetchMaterials();
    }
  }, [user.user_id]);

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
      const formData = new FormData();
      formData.append("title", title);
      formData.append("user_id", user.user_id);
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/materials/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setMessage("✅ " + data.message);
      setTitle("");
      setFile(null);
      
      const input = document.getElementById("file-upload");
      if (input) input.value = "";

      fetchMaterials();
    } catch (err) {
      console.error(err);
      setMessage("❌ Gagal mengupload materi.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`http://localhost:5000/materials/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      setMessage("✅ Materi berhasil dihapus.");
      setDeleteId(null);
      fetchMaterials();
    } catch (err) {
      console.error(err);
      setMessage("❌ Gagal menghapus materi.");
    }
  };

  const handleEdit = (materi) => {
    setEditMateri(materi);
    setEditTitle(materi.title);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setMessage("⚠️ Judul materi tidak boleh kosong!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/materials/${editMateri.material_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editTitle }),
      });

      if (!response.ok) throw new Error('Update failed');

      setMessage("✅ Materi berhasil diperbarui.");
      setEditMateri(null);
      setEditTitle("");
      fetchMaterials();
    } catch (err) {
      console.error(err);
      setMessage("❌ Gagal memperbarui materi.");
    }
  };

  const handleDownload = (m) => {
    window.open(`http://localhost:5000/uploads/${m.file_path}`, '_blank');
    setMessage(`📥 Mengunduh: ${m.file_path}`);
  };

  const formatDate = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="container">
      {/* Upload Card */}
      <div className="card">
        <h2 className="card-title">Upload Materi PDF</h2>
        <p className="card-subtitle">
          Dosen dapat mengunggah materi pembelajaran dalam format PDF. File akan disimpan di server.
        </p>

        {message && (
          <div className={`alert ${message.includes("✅") ? "success" : message.includes("❌") ? "error" : "info"}`}>
            {message}
          </div>
        )}

        <div className="form-group">
          <label className="label">Judul Materi</label>
          <input
            type="text"
            className="input"
            placeholder="Masukkan judul materi"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
          />
        </div>

        <div className="form-group">
          <label className="label">Pilih File (PDF)</label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            className="input"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="btn-primary"
        >
          {isUploading ? "Mengunggah..." : "Upload"}
        </button>
      </div>

      {/* History Card */}
      <div className="card">
        <h2 className="card-title">History Materi</h2>
        <p className="card-subtitle">Daftar materi yang telah diupload</p>

        {isLoading ? (
          <div className="empty-state">
            <div className="spinner"></div>
            Memuat data...
          </div>
        ) : materiList.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} style={{ opacity: 0.3 }} />
            <p>Belum ada materi yang diupload</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal Upload</th>
                  <th>Judul Materi</th>
                  <th>File</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {materiList.map((m) => (
                  <tr key={m.material_id}>
                    <td>
                      <div className="flex-center">
                        <Calendar size={16} />
                        <span>{formatDate(m.uploaded_at)}</span>
                      </div>
                    </td>
                    <td className="font-medium">{m.title}</td>
                    <td>
                      <span className="badge">
                        <FileText size={12} />
                        {m.file_path}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button className="btn-icon" onClick={() => handleDownload(m)}>
                          <Download size={16} />
                        </button>
                        <button className="btn-icon" onClick={() => handleEdit(m)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn-icon danger" onClick={() => setDeleteId(m.material_id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modul */}
      {deleteId && (
        <div className="modul-overlay" onClick={() => setDeleteId(null)}>
          <div className="modul" onClick={(e) => e.stopPropagation()}>
            <h3 className="modul-title">Hapus Materi?</h3>
            <p className="modul-text">
              Apakah Anda yakin ingin menghapus materi ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="modul-footer">
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>
                Batal
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modul */}
      {editMateri && (
        <div className="modul-overlay" onClick={() => setEditMateri(null)}>
          <div className="modul" onClick={(e) => e.stopPropagation()}>
            <h3 className="modul-title">Edit Materi</h3>
            
            <div className="form-group">
              <label className="label">Judul Materi</label>
              <input
                type="text"
                className="input"
                placeholder="Masukkan judul materi"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div className="info-box">
              <div className="flex-center">
                <FileText size={14} />
                <span>File: {editMateri.file_path}</span>
              </div>
              <div className="flex-center">
                <Calendar size={14} />
                <span>Upload: {formatDate(editMateri.uploaded_at)}</span>
              </div>
            </div>

            <div className="modul-footer">
              <button className="btn-secondary" onClick={() => setEditMateri(null)}>
                Batal
              </button>
              <button className="btn-primary" onClick={handleSaveEdit}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}