import React, { useEffect, useState } from "react";
import axios from "axios";

export default function HistoryPage() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const res = await axios.get("http://localhost:5000/samples");
        setSamples(res.data);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSamples();
  }, []);

  return (
    <div className="container py-4">
      <div
        className="card glass-card mx-auto shadow-sm"
        style={{ maxWidth: "900px" }}
      >
        <div className="card-body text-center">
          <h5 className="fw-semibold mb-3 text-primary">
            🧪 Riwayat Analisis Sample
          </h5>


          {loading ? (
            <p className="text-muted">Mengambil data...</p>
          ) : samples.length === 0 ? (
            <p className="text-muted">Belum ada riwayat analisis tersimpan.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Foto Sample</th>
                    <th>Nama Sample</th>
                    <th>Jenis Logam</th>
                    <th>Konsentrasi (mg/L)</th>
                    <th>Tanggal Uji</th>
                  </tr>
                </thead>
                <tbody>
                  {samples.map((s, index) => (
                    <tr key={s.sample_id}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          src={`http://localhost:5000${s.image_path}`}
                          alt={s.sample_name}
                          style={{
                            width: "80px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "5px",
                          }}
                        />
                      </td>
                      <td>{s.sample_name}</td>
                      <td>{s.metal_type}</td>
                      <td>{s.concentration}</td>
                      <td>{new Date(s.test_date).toLocaleDateString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
