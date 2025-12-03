//AuthPage.jsx
import { useState } from "react";

  function Login({ onLogin, onSwitchToRegister }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");

      if (!username || !password) {
        setError("Username dan password harus diisi!");
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("user", JSON.stringify(data.user));
          alert("Login berhasil!");
          onLogin(data.user);
        } else {
          setError(data.message || "Login gagal");
        }
      } catch {
        setError("Gagal menyambungkan ke server");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="card shadow p-4" style={{ width: "400px" }}>
          <div className="text-center mb-3">
            <h4 className="fw-semibold text-primary">Login</h4>
            <p className="text-muted mb-0">Masuk ke akun AI Tutor Farmasi Anda</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Masuk"}
            </button>

            <div className="text-center mt-3">
              <small className="text-muted">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="btn btn-link p-0 text-primary text-decoration-none"
                >
                  Daftar sekarang
                </button>
              </small>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function Register({ onRegister, onSwitchToLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("mahasiswa");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");

      if (!username || !password || !confirmPassword) {
        setError("Semua field harus diisi!");
        return;
      }

      if (password !== confirmPassword) {
        setError("Password dan konfirmasi tidak sama!");
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, role }),
        });

        const data = await res.json();
        if (res.ok) {
          alert("Registrasi berhasil!");
          onRegister();
        } else {
          setError(data.message || "Registrasi gagal");
        }
      } catch {
        setError("Gagal menyambungkan ke server");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="card shadow p-4" style={{ width: "400px" }}>
          <div className="text-center mb-3">
            <h4 className="fw-semibold text-primary">Buat Akun Baru</h4>
            <p className="text-muted mb-0">Daftar untuk menggunakan AI Tutor Farmasi</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Konfirmasi Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Masukkan ulang password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Daftar"}
            </button>

            <div className="text-center mt-3">
              <small className="text-muted">
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="btn btn-link p-0 text-primary text-decoration-none"
                >
                  Masuk di sini
                </button>
              </small>
            </div>
          </form>
        </div>
      </div>
    );
  }

  export default function AuthPage({ onLoginSuccess }) {
    const [isRegistering, setIsRegistering] = useState(false);

    return isRegistering ? (
      <Register onRegister={() => setIsRegistering(false)} onSwitchToLogin={() => setIsRegistering(false)} />
    ) : (
      <Login onLogin={onLoginSuccess} onSwitchToRegister={() => setIsRegistering(true)} />
    );
  }
