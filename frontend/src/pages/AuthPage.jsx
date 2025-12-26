import { useState } from "react";
import { TestTube, Eye, EyeOff } from 'lucide-react';

// Styles object
const styles = {
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
  },
  inputFocus: {
    borderColor: '#6366f1',
    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    marginBottom: '8px',
  },
  button: {
    width: '100%',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonPrimary: {
    backgroundColor: '#6366f1',
    color: 'white',
  },
  buttonPrimaryHover: {
    backgroundColor: '#4f46e5',
  },
  alert: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    fontSize: '14px',
    marginBottom: '20px',
  },
};

// Input Component
function Input({ type = 'text', style = {}, onFocus, onBlur, ...props }) {
  const [focused, setFocused] = useState(false);
  
  return (
    <input
      type={type}
      style={{
        ...styles.input,
        ...(focused ? styles.inputFocus : {}),
        ...style,
      }}
      onFocus={(e) => {
        setFocused(true);
        if (onFocus) onFocus(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        if (onBlur) onBlur(e);
      }}
      {...props}
    />
  );
}

// Label Component
function Label({ children, ...props }) {
  return (
    <label style={styles.label} {...props}>
      {children}
    </label>
  );
}

// Button Component
function Button({ children, disabled, style = {}, ...props }) {
  const [hover, setHover] = useState(false);
  
  return (
    <button
      style={{
        ...styles.button,
        ...styles.buttonPrimary,
        ...(hover && !disabled ? styles.buttonPrimaryHover : {}),
        ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
        ...style,
      }}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    >
      {children}
    </button>
  );
}

// Alert Component
function Alert({ children }) {
  return <div style={styles.alert}>{children}</div>;
}

// Static Sidebar Component (tidak akan re-render)
function Sidebar() {
  return (
    <div style={{
      display: 'none',
      width: '50%',
      backgroundColor: '#6366f1',
      padding: '48px',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
    }} className="auth-sidebar">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <TestTube style={{ width: '40px', height: '40px', color: 'white' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>AI Tutor Farmasi</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', maxWidth: '400px' }}>
          Intelligent Tutoring System untuk pembelajaran titrasi dan analisis kandungan larutan
        </p>
      </div>

      <div style={{
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid rgba(99, 102, 241, 0.3)',
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>Fitur Unggulan</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '16px', color: 'rgba(255,255,255,0.9)' }}>
            <span style={{ color: 'white', marginTop: '2px' }}>✓</span>
            <span>Chatbot AI dengan knowledge base lengkap tentang titrasi</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '16px', color: 'rgba(255,255,255,0.9)' }}>
            <span style={{ color: 'white', marginTop: '2px' }}>✓</span>
            <span>Sistem pengujian kandungan besi/tembaga dalam larutan</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'start', gap: '12px', color: 'rgba(255,255,255,0.9)' }}>
            <span style={{ color: 'white', marginTop: '2px' }}>✓</span>
            <span>History pengujian dengan export ke Excel/CSV</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Login Form Content
function LoginForm({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
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
        onLogin(data.user);
      } else {
        setError(data.message || "Login gagal");
      }
    }
    catch {
      setError("Gagal menyambungkan ke server");
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Selamat Datang Kembali</h2>
        <p style={{ color: '#6b7280', margin: 0 }}>Masuk ke akun AI Tutor Farmasi Anda</p>
      </div>

      <div>
        {error && <Alert>{error}</Alert>}

        <div style={{ marginBottom: '20px' }}>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Masukkan username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Label style={{ marginBottom: 0 }}>Password</Label>
          </div>
          <div style={{ position: 'relative' }}>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              style={{ paddingRight: '48px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Memproses...' : 'Masuk'}
        </Button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              style={{
                color: '#6366f1',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                textDecoration: 'none',
              }}
            >
              Daftar sekarang
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

// Register Form Content
function RegisterForm({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!username || !password || !confirmPassword) {
      setError("Semua field harus diisi!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi tidak sama!");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
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
    <>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Buat Akun Baru</h2>
        <p style={{ color: '#6b7280', margin: 0 }}>Daftar untuk menggunakan AI Tutor Farmasi</p>
      </div>

      <div>
        {error && <Alert>{error}</Alert>}

        <div style={{ marginBottom: '20px' }}>
          <Label>Username</Label>
          <Input
            type="text"
            placeholder="Masukkan username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Label>Password</Label>
          <div style={{ position: 'relative' }}>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              style={{ paddingRight: '48px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Label>Konfirmasi Password</Label>
          <div style={{ position: 'relative' }}>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Masukkan ulang password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              style={{ paddingRight: '48px' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Memproses...' : 'Daftar'}
        </Button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={{
                color: '#6366f1',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Masuk di sini
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

// Main AuthPage Component
export default function AuthPage({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Static Sidebar - Tidak akan re-render */}
      <Sidebar />

      {/* Right Side - Content yang berubah */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#f9fafb',
      }}>
        <div style={{ width: '100%', maxWidth: '448px' }}>
          {/* Mobile Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }} className="mobile-logo">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              <TestTube style={{ width: '40px', height: '40px', color: '#6366f1' }} />
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>AI Tutor Farmasi</h1>
            </div>
          </div>

          {/* Form Content - Conditional Rendering */}
          {isRegistering ? (
            <RegisterForm 
              onRegister={() => setIsRegistering(false)} 
              onSwitchToLogin={() => setIsRegistering(false)} 
            />
          ) : (
            <LoginForm 
              onLogin={onLoginSuccess} 
              onSwitchToRegister={() => setIsRegistering(true)} 
            />
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .auth-sidebar {
            display: flex !important;
          }
          .mobile-logo {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}