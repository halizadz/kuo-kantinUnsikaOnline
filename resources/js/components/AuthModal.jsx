import React, { useState } from "react";
import {
    Eye,
    EyeOff,
    GraduationCap,
    Store,
    X,
    Facebook,
    Mail,
    Lock,
    User as UserIcon,
    Phone,
    MapPin,
    Camera,
    Upload,
} from "lucide-react";

const AuthModal = ({ authModal, setAuthModal, setUser, API_BASE }) => {
    const [activeAuthTab, setActiveAuthTab] = useState(
        authModal === "login" ? "login" : "register"
    );
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
        role: "mahasiswa",
        nim: "",
        kantin_name: "",
        location: "",
        kantin_photo: null,
    });

    // State untuk preview gambar
    const [photoPreview, setPhotoPreview] = useState(null);

    // Validasi form
    const validateForm = () => {
        const errors = {};

        if (activeAuthTab === "register") {
            if (!formData.name.trim()) errors.name = "Nama lengkap harus diisi";
            if (!formData.phone.trim())
                errors.phone = "Nomor telepon harus diisi";
            if (formData.role === "mahasiswa" && !formData.nim.trim())
                errors.nim = "NIM harus diisi";
            if (formData.role === "penjual") {
                if (!formData.kantin_name.trim())
                    errors.kantin_name = "Nama kantin harus diisi";
                if (!formData.location.trim())
                    errors.location = "Lokasi kantin harus diisi";
            }
        }

        if (!formData.email.trim()) {
            errors.email = "Email harus diisi";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Format email tidak valid";
        }

        if (!formData.password) {
            errors.password = "Password harus diisi";
        } else if (formData.password.length < 6) {
            errors.password = "Password minimal 6 karakter";
        }

        if (
            activeAuthTab === "register" &&
            formData.password !== formData.password_confirmation
        ) {
            errors.password_confirmation = "Konfirmasi password tidak cocok";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const registerUser = async (userData) => {
        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: "POST",
                body: userData,
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Network error" };
        }
    };

    const loginUser = async (credentials) => {
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Network error" };
        }
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setFormErrors({});

        if (activeAuthTab === "login") {
            const result = await loginUser({
                email: formData.email,
                password: formData.password,
            });

            if (result.success) {
                localStorage.setItem("token", result.data.token);
                localStorage.setItem("user", JSON.stringify(result.data.user));
                setUser(result.data.user);
                setAuthModal(null);
            } else {
                alert(result.message || "Login gagal. Silakan coba lagi.");
            }
        } else {
            const dataToSend = new FormData();
            dataToSend.append("name", formData.name);
            dataToSend.append("email", formData.email);
            dataToSend.append("phone", formData.phone);
            dataToSend.append("password", formData.password);
            dataToSend.append(
                "password_confirmation",
                formData.password_confirmation
            );
            dataToSend.append("role", formData.role);

            if (formData.role === "mahasiswa") {
                dataToSend.append("nim", formData.nim);
            } else if (formData.role === "penjual") {
                dataToSend.append("kantin_name", formData.kantin_name);
                dataToSend.append("location", formData.location);
                if (formData.kantin_photo) {
                    dataToSend.append("kantin_photo", formData.kantin_photo);
                }
            }

            const result = await registerUser(dataToSend);

            if (result.success) {
                if (formData.role === "mahasiswa") {
                    localStorage.setItem("token", result.data.token);
                    localStorage.setItem(
                        "user",
                        JSON.stringify(result.data.user)
                    );
                    setUser(result.data.user);
                    setAuthModal(null);
                    alert("Registrasi mahasiswa berhasil!");
                } else {
                    alert(
                        "Registrasi penjual berhasil! Menunggu approval admin."
                    );
                    setAuthModal(null);
                }
            } else {
                const errorMessage = result.errors
                    ? Object.values(result.errors).join(", ")
                    : result.message;
                alert(errorMessage || "Registrasi gagal. Silakan coba lagi.");
            }
        }
        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        // Hapus error saat user mulai mengetik
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: "",
            });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi tipe file
            if (!file.type.startsWith("image/")) {
                alert("Harap pilih file gambar yang valid");
                return;
            }

            // Validasi ukuran file (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("Ukuran file maksimal 5MB");
                return;
            }

            setFormData({
                ...formData,
                kantin_photo: file,
            });

            // Buat preview gambar
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setFormData({
            ...formData,
            kantin_photo: null,
        });
        setPhotoPreview(null);
    };

    const switchAuthTab = (tab) => {
        setActiveAuthTab(tab);
        setFormErrors({});
        setFormData({
            name: "",
            email: "",
            phone: "",
            password: "",
            password_confirmation: "",
            role: "mahasiswa",
            nim: "",
            kantin_name: "",
            location: "",
            kantin_photo: null,
        });
        setPhotoPreview(null);
    };

    const getFileName = (file) => {
        return file ? file.name : "Belum ada file dipilih";
    };

    return (
        <div className="auth-overlay" onClick={() => setAuthModal(null)}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <div className="auth-header">
                    <button
                        className="auth-close"
                        onClick={() => setAuthModal(null)}
                        aria-label="Tutup modal"
                    >
                        <X size={20} />
                    </button>
                    <div className="auth-logo">
                        <div className="logo-icon">🍽️</div>
                    </div>
                    <h2>
                        {activeAuthTab === "login"
                            ? "Selamat Datang Kembali"
                            : "Daftar Akun Baru"}
                    </h2>
                    <p>
                        {activeAuthTab === "login"
                            ? "Masuk untuk melanjutkan pesanan Anda"
                            : "Bergabung dengan KantinKampus sekarang"}
                    </p>
                </div>

                <div className="auth-body">
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${
                                activeAuthTab === "login" ? "active" : ""
                            }`}
                            onClick={() => switchAuthTab("login")}
                        >
                            Masuk
                        </button>
                        <button
                            className={`auth-tab ${
                                activeAuthTab === "register" ? "active" : ""
                            }`}
                            onClick={() => switchAuthTab("register")}
                        >
                            Daftar
                        </button>
                    </div>

                    <form
                        onSubmit={handleAuthSubmit}
                        className="auth-form"
                        noValidate
                    >
                        {activeAuthTab === "register" && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">
                                        Pilih Role
                                    </label>
                                    <div className="role-selection">
                                        <label className="role-option">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="mahasiswa"
                                                checked={
                                                    formData.role ===
                                                    "mahasiswa"
                                                }
                                                onChange={handleInputChange}
                                            />
                                            <div className="role-content">
                                                <div className="role-icon">
                                                    <GraduationCap size={24} />
                                                </div>
                                                <span>Mahasiswa</span>
                                                <small>
                                                    Pesan makanan dari kantin
                                                    kampus
                                                </small>
                                            </div>
                                        </label>
                                        <label className="role-option">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="penjual"
                                                checked={
                                                    formData.role === "penjual"
                                                }
                                                onChange={handleInputChange}
                                            />
                                            <div className="role-content">
                                                <div className="role-icon">
                                                    <Store size={24} />
                                                </div>
                                                <span>Penjual</span>
                                                <small>
                                                    Kelola kantin dan menu
                                                    makanan
                                                </small>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <UserIcon size={18} />
                                        Nama Lengkap
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        className={`form-input ${
                                            formErrors.name ? "error" : ""
                                        }`}
                                        placeholder="Masukkan nama lengkap"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {formErrors.name && (
                                        <div className="error-message">
                                            {formErrors.name}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label className="form-label">
                                <Mail size={18} />
                                Email
                                <span className="required">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                className={`form-input ${
                                    formErrors.email ? "error" : ""
                                }`}
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                            {formErrors.email && (
                                <div className="error-message">
                                    {formErrors.email}
                                </div>
                            )}
                        </div>

                        {activeAuthTab === "register" && (
                            <div className="form-group">
                                <label className="form-label">
                                    <Phone size={18} />
                                    Nomor Telepon
                                    <span className="required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className={`form-input ${
                                        formErrors.phone ? "error" : ""
                                    }`}
                                    placeholder="08xxxxxxxxxx"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.phone && (
                                    <div className="error-message">
                                        {formErrors.phone}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeAuthTab === "register" &&
                            formData.role === "mahasiswa" && (
                                <div className="form-group">
                                    <label className="form-label">
                                        <GraduationCap size={18} />
                                        NIM
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nim"
                                        className={`form-input ${
                                            formErrors.nim ? "error" : ""
                                        }`}
                                        placeholder="Masukkan NIM"
                                        value={formData.nim}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {formErrors.nim && (
                                        <div className="error-message">
                                            {formErrors.nim}
                                        </div>
                                    )}
                                </div>
                            )}

                        {activeAuthTab === "register" &&
                            formData.role === "penjual" && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <Store size={18} />
                                            Nama Kantin
                                            <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="kantin_name"
                                            className={`form-input ${
                                                formErrors.kantin_name
                                                    ? "error"
                                                    : ""
                                            }`}
                                            placeholder="Nama kantin Anda"
                                            value={formData.kantin_name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {formErrors.kantin_name && (
                                            <div className="error-message">
                                                {formErrors.kantin_name}
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <MapPin size={18} />
                                            Lokasi Kantin
                                            <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            className={`form-input ${
                                                formErrors.location
                                                    ? "error"
                                                    : ""
                                            }`}
                                            placeholder="Lokasi kantin di kampus"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {formErrors.location && (
                                            <div className="error-message">
                                                {formErrors.location}
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <Camera size={18} />
                                            Foto Kantin
                                            <small className="optional">
                                                (Opsional)
                                            </small>
                                        </label>
                                        
                                        {/* Preview Gambar */}
                                        {photoPreview && (
                                            <div className="photo-preview">
                                                <img 
                                                    src={photoPreview} 
                                                    alt="Preview foto kantin" 
                                                    className="preview-image"
                                                />
                                                <button
                                                    type="button"
                                                    className="remove-photo-btn"
                                                    onClick={handleRemovePhoto}
                                                    aria-label="Hapus foto"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Uploader File */}
                                        <div className="file-upload-container">
                                            <input
                                                type="file"
                                                name="kantin_photo"
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="hidden-input"
                                                id="kantin_photo"
                                            />
                                            <label 
                                                htmlFor="kantin_photo" 
                                                className="file-upload-label"
                                            >
                                                <div className="file-upload-content">
                                                    <Upload size={24} />
                                                    <div className="file-upload-text">
                                                        <span className="file-upload-title">
                                                            {formData.kantin_photo 
                                                                ? "Ganti Foto Kantin" 
                                                                : "Unggah Foto Kantin"
                                                            }
                                                        </span>
                                                        <span className="file-upload-subtitle">
                                                            {formData.kantin_photo 
                                                                ? getFileName(formData.kantin_photo)
                                                                : "Klik untuk memilih file"
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                        
                                        <div className="file-info">
                                            <small>
                                                Format: JPG, PNG, GIF (Maks. 5MB)
                                            </small>
                                        </div>
                                    </div>
                                </>
                            )}

                        <div className="form-group">
                            <label className="form-label">
                                <Lock size={18} />
                                Password
                                <span className="required">*</span>
                            </label>
                            <div className="password-input">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className={`form-input ${
                                        formErrors.password ? "error" : ""
                                    }`}
                                    placeholder="Masukkan password (min. 6 karakter)"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Sembunyikan password"
                                            : "Tampilkan password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                            {formErrors.password && (
                                <div className="error-message">
                                    {formErrors.password}
                                </div>
                            )}
                        </div>

                        {activeAuthTab === "register" && (
                            <div className="form-group">
                                <label className="form-label">
                                    <Lock size={18} />
                                    Konfirmasi Password
                                    <span className="required">*</span>
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password_confirmation"
                                    className={`form-input ${
                                        formErrors.password_confirmation
                                            ? "error"
                                            : ""
                                    }`}
                                    placeholder="Konfirmasi password"
                                    value={formData.password_confirmation}
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.password_confirmation && (
                                    <div className="error-message">
                                        {formErrors.password_confirmation}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeAuthTab === "login" && (
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
                            className={`btn-auth ${isLoading ? "loading" : ""}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="spinner"></div>
                            ) : activeAuthTab === "login" ? (
                                "Masuk"
                            ) : (
                                "Daftar"
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>Atau lanjutkan dengan</span>
                    </div>

                    <div className="social-auth">
                        <button type="button" className="btn-social btn-google">
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            className="btn-social btn-facebook"
                        >
                            <Facebook size={18} />
                            Facebook
                        </button>
                    </div>

                    <div className="auth-footer">
                        {activeAuthTab === "login" ? (
                            <p>
                                Belum punya akun?{" "}
                                <a
                                    className="auth-link"
                                    onClick={() => switchAuthTab("register")}
                                >
                                    Daftar sekarang
                                </a>
                            </p>
                        ) : (
                            <p>
                                Sudah punya akun?{" "}
                                <a
                                    className="auth-link"
                                    onClick={() => switchAuthTab("login")}
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