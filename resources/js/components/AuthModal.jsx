import React, { useState } from 'react';
import { 
  Eye, EyeOff, GraduationCap, Store, X, Facebook,
  Mail, Lock, User as UserIcon, Phone, MapPin, Camera
} from 'lucide-react';

const AuthModal = ({ authModal, setAuthModal, setUser, API_BASE }) => {
  const [activeAuthTab, setActiveAuthTab] = useState(authModal === 'login' ? 'login' : 'register');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'mahasiswa',
    nim: '',
    kantin_name: '',
    location: '',
    kantin_photo: null
  });

  const registerUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        body: userData,
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const loginUser = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (activeAuthTab === 'login') {
      const result = await loginUser({
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        setUser(result.data.user);
        setAuthModal(null);
      } else {
        alert(result.message);
      }
    } else {
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('email', formData.email);
      dataToSend.append('phone', formData.phone);
      dataToSend.append('password', formData.password);
      dataToSend.append('password_confirmation', formData.password_confirmation);
      dataToSend.append('role', formData.role);

      if (formData.role === 'mahasiswa') {
        dataToSend.append('nim', formData.nim);
      } else if (formData.role === 'penjual') {
        dataToSend.append('kantin_name', formData.kantin_name);
        dataToSend.append('location', formData.location);
        if (formData.kantin_photo) {
          dataToSend.append('kantin_photo', formData.kantin_photo);
        }
      }

      const result = await registerUser(dataToSend);
      
      if (result.success) {
        if (formData.role === 'mahasiswa') {
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('user', JSON.stringify(result.data.user));
          setUser(result.data.user);
          setAuthModal(null);
          alert('Registrasi mahasiswa berhasil!');
        } else {
          alert('Registrasi penjual berhasil! Menunggu approval admin.');
          setAuthModal(null);
        }
      } else {
        alert(result.errors ? Object.values(result.errors).join(', ') : result.message);
      }
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      kantin_photo: e.target.files[0]
    });
  };

  const switchAuthTab = (tab) => {
    setActiveAuthTab(tab);
    setFormData({ 
      name: '', email: '', phone: '', password: '', password_confirmation: '',
      role: 'mahasiswa', nim: '', kantin_name: '', location: '', kantin_photo: null
    });
  };

  return (
    <div className="auth-overlay" onClick={() => setAuthModal(null)}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <div className="auth-header">
          <button 
            className="auth-close"
            onClick={() => setAuthModal(null)}
          >
            <X size={20} />
          </button>
          <div className="auth-logo">
            <div className="logo-icon">🍽️</div>
          </div>
          <h2>
            {activeAuthTab === 'login' ? 'Selamat Datang Kembali' : 'Daftar Akun Baru'}
          </h2>
          <p>
            {activeAuthTab === 'login' 
              ? 'Masuk untuk melanjutkan pesanan Anda' 
              : 'Bergabung dengan KantinKampus sekarang'
            }
          </p>
        </div>

        <div className="auth-body">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeAuthTab === 'login' ? 'active' : ''}`}
              onClick={() => switchAuthTab('login')}
            >
              Masuk
            </button>
            <button
              className={`auth-tab ${activeAuthTab === 'register' ? 'active' : ''}`}
              onClick={() => switchAuthTab('register')}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {activeAuthTab === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Pilih Role</label>
                  <div className="role-selection">
                    <label className="role-option">
                      <input
                        type="radio"
                        name="role"
                        value="mahasiswa"
                        checked={formData.role === 'mahasiswa'}
                        onChange={handleInputChange}
                      />
                      <div className="role-content">
                        <div className="role-icon">
                          <GraduationCap size={24} />
                        </div>
                        <span>Mahasiswa</span>
                        <small>Pesan makanan dari kantin kampus</small>
                      </div>
                    </label>
                    <label className="role-option">
                      <input
                        type="radio"
                        name="role"
                        value="penjual"
                        checked={formData.role === 'penjual'}
                        onChange={handleInputChange}
                      />
                      <div className="role-content">
                        <div className="role-icon">
                          <Store size={24} />
                        </div>
                        <span>Penjual</span>
                        <small>Kelola kantin dan menu makanan</small>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <UserIcon size={18} />
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {activeAuthTab === 'register' && (
              <div className="form-group">
                <label className="form-label">
                  <Phone size={18} />
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            {activeAuthTab === 'register' && formData.role === 'mahasiswa' && (
              <div className="form-group">
                <label className="form-label">
                  <GraduationCap size={18} />
                  NIM
                </label>
                <input
                  type="text"
                  name="nim"
                  className="form-input"
                  placeholder="Masukkan NIM"
                  value={formData.nim}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            {activeAuthTab === 'register' && formData.role === 'penjual' && (
              <>
                <div className="form-group">
                  <label className="form-label">
                    <Store size={18} />
                    Nama Kantin
                  </label>
                  <input
                    type="text"
                    name="kantin_name"
                    className="form-input"
                    placeholder="Nama kantin Anda"
                    value={formData.kantin_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={18} />
                    Lokasi Kantin
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    placeholder="Lokasi kantin di kampus"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Camera size={18} />
                    Foto Kantin
                  </label>
                  <div className="file-upload">
                    <input
                      type="file"
                      name="kantin_photo"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    <div className="file-upload-label">
                      <Camera size={20} />
                      <span>Unggah Foto Kantin</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">
                <Lock size={18} />
                Password
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-input"
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {activeAuthTab === 'register' && (
              <div className="form-group">
                <label className="form-label">
                  <Lock size={18} />
                  Konfirmasi Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password_confirmation"
                  className="form-input"
                  placeholder="Konfirmasi password"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            {activeAuthTab === 'login' && (
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  Ingat saya
                </label>
                <a href="#" className="forgot-password">
                  Lupa password?
                </a>
              </div>
            )}

            <button 
              type="submit" 
              className={`btn-auth ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                activeAuthTab === 'login' ? 'Masuk' : 'Daftar'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Atau lanjutkan dengan</span>
          </div>

          <div className="social-auth">
            <button className="btn-social btn-google">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="btn-social btn-facebook">
              <Facebook size={18} />
              Facebook
            </button>
          </div>

          <div className="auth-footer">
            {activeAuthTab === 'login' ? (
              <p>
                Belum punya akun?
                <a 
                  className="auth-link" 
                  onClick={() => switchAuthTab('register')}
                >
                  Daftar sekarang
                </a>
              </p>
            ) : (
              <p>
                Sudah punya akun?
                <a 
                  className="auth-link" 
                  onClick={() => switchAuthTab('login')}
                >
                  Masuk di sini
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;