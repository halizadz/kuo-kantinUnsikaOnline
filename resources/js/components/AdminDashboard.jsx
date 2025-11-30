import React, { useState, useEffect } from "react";
import {
    GraduationCap,
    Store,
    Users,
    BarChart3,
    CheckCircle,
    XCircle,
    TrendingUp,
    DollarSign,
    Package,
    Clock,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Download,
    UserCheck,
    UserX,
    AlertCircle,
    Star,
    Edit,
    Mail,
    Phone,
    MapPin,
    ChevronRight,
    Calendar,
    Shield,
    BookOpen,
    Coffee,
    Utensils,
} from "lucide-react";
import ExportModal from "./ExportModal";

const AdminDashboard = ({ user, API_BASE }) => {
    const [adminData, setAdminData] = useState({
        users: [],
        pendingPenjual: [],
        mahasiswa: [],
        stats: null,
    });
    const [activeTab, setActiveTab] = useState("overview");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
        kantin_name: "",
    });
    const [exportModal, setExportModal] = useState({
        isOpen: false,
        type: null,
    });

    const [currentPage, setCurrentPage] = useState({
        penjual: 1,
        mahasiswa: 1,
        approvals: 1,
    });
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            const token = localStorage.getItem("token");

            const statsResponse = await fetch(`${API_BASE}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const statsData = await statsResponse.json();

            const usersResponse = await fetch(
                `${API_BASE}/admin/users?role=penjual`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const usersData = await usersResponse.json();

            const mahasiswaResponse = await fetch(
                `${API_BASE}/admin/users?role=mahasiswa`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const mahasiswaData = await mahasiswaResponse.json();

            if (statsData.success && usersData.success) {
                setAdminData({
                    stats: statsData.data,
                    pendingPenjual: usersData.data.data.filter(
                        (user) => !user.is_approved
                    ),
                    users: usersData.data.data,
                    mahasiswa: mahasiswaData.success
                        ? mahasiswaData.data.data
                        : [],
                });
            }
        } catch (error) {
            console.error("Error loading admin data:", error);
        }
    };

    const approvePenjual = async (penjualId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${API_BASE}/admin/penjual/${penjualId}/approve`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();
            if (data.success) {
                loadAdminData();
            }
        } catch (error) {
            console.error("Error approving penjual:", error);
        }
    };

    const rejectPenjual = async (penjualId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${API_BASE}/admin/penjual/${penjualId}/reject`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await response.json();
            if (data.success) {
                loadAdminData();
            }
        } catch (error) {
            console.error("Error rejecting penjual:", error);
        }
    };

    // PERBAIKI fungsi editUser - pastikan tidak ada null values
    const editUser = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            location: user.location || "",
            kantin_name: user.kantin_name || "",
            nim: user.nim || "", // Pastikan string kosong, bukan null
        });
    };

    // PERBAIKI updateUser function dengan data cleaning
    const updateUser = async () => {
        try {
            const token = localStorage.getItem("token");

            // Clean data - hapus field yang empty string
            const cleanedData = {};
            Object.keys(editForm).forEach((key) => {
                if (editForm[key] !== "" && editForm[key] !== null) {
                    cleanedData[key] = editForm[key];
                }
            });

            console.log("Sending data:", cleanedData); // Debug log

            const response = await fetch(
                `${API_BASE}/admin/users/${editingUser.id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(cleanedData),
                }
            );

            // Handle non-JSON responses
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Non-JSON response:", text);
                throw new Error("Server returned non-JSON response");
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || `HTTP error! status: ${response.status}`
                );
            }

            if (data.success) {
                setEditingUser(null);
                loadAdminData();
                alert("User berhasil diupdate!");
            } else {
                if (data.errors) {
                    const errorMessages = Object.values(data.errors)
                        .flat()
                        .join(", ");
                    alert(`Error: ${errorMessages}`);
                } else {
                    alert(data.message || "Gagal mengupdate user");
                }
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert(`Terjadi kesalahan saat mengupdate user: ${error.message}`);
        }
    };

    // fungsi deleteUser
    const deleteUser = async (userId, userName) => {
        if (
            !confirm(
                `Apakah Anda yakin ingin menghapus user "${userName}"? Tindakan ini tidak dapat dibatalkan.`
            )
        ) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                loadAdminData();
                alert("User berhasil dihapus!");
            } else {
                alert(data.message || "Gagal menghapus user");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Terjadi kesalahan saat menghapus user");
        }
    };

    const filteredUsers = adminData.users.filter((user) => {
        const matchesSearch =
            user.kantin_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "approved" && user.is_approved) ||
            (statusFilter === "pending" && !user.is_approved);
        return matchesSearch && matchesStatus;
    });

    const filteredMahasiswa = adminData.mahasiswa.filter((mahasiswa) => {
        return (
            mahasiswa.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mahasiswa.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mahasiswa.nim?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Fungsi pagination
    const paginate = (items, page, type) => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    };

    // Fungsi untuk mengganti halaman
    const handlePageChange = (page, type) => {
        setCurrentPage((prev) => ({
            ...prev,
            [type]: page,
        }));
    };

    // Data yang sudah difilter untuk approvals
    const filteredApprovals = adminData.pendingPenjual.filter(
        (penjual) =>
            penjual.kantin_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            penjual.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Hitung total halaman
    const totalPages = {
        penjual: Math.ceil(filteredUsers.length / itemsPerPage),
        mahasiswa: Math.ceil(filteredMahasiswa.length / itemsPerPage),
        approvals: Math.ceil(filteredApprovals.length / itemsPerPage),
    };

    // Data yang sudah dipaginasi
    const paginatedPenjual = paginate(
        filteredUsers,
        currentPage.penjual,
        "penjual"
    );
    const paginatedMahasiswa = paginate(
        filteredMahasiswa,
        currentPage.mahasiswa,
        "mahasiswa"
    );
    const paginatedApprovals = paginate(
        filteredApprovals,
        currentPage.approvals,
        "approvals"
    );

    return (
        <div className="admin-dashboard">
            <div className="container">
                {/* Desktop Dashboard Header */}
                <div className="dashboard-header desktop-only">
                    <div className="header-content">
                        <div className="header-main">
                            <div className="header-icon-container">
                                <Shield
                                    size={32}
                                    className="header-main-icon"
                                />
                            </div>
                            <div>
                                <h1>Dashboard Admin</h1>
                                <p className="header-subtitle">
                                    Kelola sistem Kantin Unska Online
                                </p>
                            </div>
                        </div>
                        <div className="header-stats">
                            <div className="header-stat">
                                <Users size={16} />
                                <span>
                                    {adminData.stats?.total_users || 0} Total
                                    Users
                                </span>
                            </div>
                            <div className="header-stat">
                                <Calendar size={16} />
                                <span>
                                    {new Date().toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs - Desktop */}
                <div className="navigation-tabs desktop-only">
                    <button
                        className={`nav-tab ${
                            activeTab === "overview" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("overview")}
                    >
                        <BarChart3 size={20} />
                        Overview
                    </button>
                    <button
                        className={`nav-tab ${
                            activeTab === "approvals" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("approvals")}
                    >
                        <UserCheck size={20} />
                        Approvals
                        {adminData.pendingPenjual.length > 0 && (
                            <span className="tab-badge">
                                {adminData.pendingPenjual.length}
                            </span>
                        )}
                    </button>
                    <button
                        className={`nav-tab ${
                            activeTab === "penjual" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("penjual")}
                    >
                        <Store size={20} />
                        Semua Penjual
                        <span className="tab-count">
                            {adminData.users.length}
                        </span>
                    </button>
                    <button
                        className={`nav-tab ${
                            activeTab === "mahasiswa" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("mahasiswa")}
                    >
                        <GraduationCap size={20} />
                        Semua Mahasiswa
                        <span className="tab-count">
                            {adminData.mahasiswa.length}
                        </span>
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && adminData.stats && (
                    <div className="overview-section">
                        {/* Welcome Card */}
                        <div className="welcome-card">
                            <div className="welcome-content">
                                <div className="welcome-text">
                                    <h2>Selamat Datang, Admin! 👋</h2>
                                    <p>
                                        Kelola sistem Kantin Unska Online dengan
                                        mudah dan efisien
                                    </p>
                                </div>
                                <div className="welcome-stats">
                                    <div className="welcome-stat">
                                        <strong>
                                            {adminData.stats.total_users || 0}
                                        </strong>
                                        <span>Total Pengguna</span>
                                    </div>
                                    <div className="welcome-stat">
                                        <strong>
                                            {adminData.pendingPenjual.length}
                                        </strong>
                                        <span>Menunggu Approval</span>
                                    </div>
                                </div>
                            </div>
                            <div className="welcome-graphic">
                                <Coffee size={48} className="graphic-icon" />
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="stats-grid-enhanced">
                            <div className="stat-card-enhanced primary">
                                <div className="stat-icon-enhanced">
                                    <GraduationCap size={32} />
                                </div>
                                <div className="stat-content-enhanced">
                                    <h3>Total Mahasiswa</h3>
                                    <div className="stat-number-enhanced">
                                        {adminData.stats.total_mahasiswa}
                                    </div>
                                    <div className="stat-trend positive">
                                        <TrendingUp size={16} />
                                        <span>+12% dari bulan lalu</span>
                                    </div>
                                </div>
                                <div className="stat-decoration"></div>
                            </div>

                            <div className="stat-card-enhanced secondary">
                                <div className="stat-icon-enhanced">
                                    <Store size={32} />
                                </div>
                                <div className="stat-content-enhanced">
                                    <h3>Total Penjual</h3>
                                    <div className="stat-number-enhanced">
                                        {adminData.stats.total_penjual}
                                    </div>
                                    <div className="stat-trend positive">
                                        <TrendingUp size={16} />
                                        <span>+5% dari bulan lalu</span>
                                    </div>
                                </div>
                                <div className="stat-decoration"></div>
                            </div>

                            <div className="stat-card-enhanced success">
                                <div className="stat-icon-enhanced">
                                    <Users size={32} />
                                </div>
                                <div className="stat-content-enhanced">
                                    <h3>Penjual Disetujui</h3>
                                    <div className="stat-number-enhanced">
                                        {adminData.stats.penjual_approved}
                                    </div>
                                    <div className="stat-subtitle">
                                        {Math.round(
                                            (adminData.stats.penjual_approved /
                                                adminData.stats.total_penjual) *
                                                100
                                        )}
                                        % dari total
                                    </div>
                                </div>
                                <div className="stat-decoration"></div>
                            </div>

                            <div className="stat-card-enhanced warning">
                                <div className="stat-icon-enhanced">
                                    <AlertCircle size={32} />
                                </div>
                                <div className="stat-content-enhanced">
                                    <h3>Menunggu Approval</h3>
                                    <div className="stat-number-enhanced">
                                        {adminData.stats.penjual_pending}
                                    </div>
                                    <div className="stat-subtitle urgent">
                                        Perlu tindakan segera
                                    </div>
                                </div>
                                <div className="stat-decoration"></div>
                            </div>

                            <div className="stat-card-enhanced info">
                                <div className="stat-icon-enhanced">
                                    <Star size={32} />
                                </div>
                                <div className="stat-content-enhanced">
                                    <h3>Rating Rata-rata</h3>
                                    <div className="stat-number-enhanced">
                                        {adminData.stats?.average_rating ||
                                            "0.0"}
                                    </div>
                                    <div className="stat-subtitle">
                                        Berdasarkan{" "}
                                        {adminData.stats?.total_ratings || 0}{" "}
                                        ulasan
                                    </div>
                                </div>
                                <div className="stat-decoration"></div>
                            </div>

                            <div className="stat-card-gradient">
                                <div className="gradient-content">
                                    <div className="gradient-icon">
                                        <Utensils size={32} />
                                    </div>
                                    <div className="gradient-text">
                                        <h3>Sistem Aktif</h3>
                                        <p>Semua fitur berjalan normal</p>
                                    </div>
                                    <div className="gradient-badge">
                                        <CheckCircle size={16} />
                                        Online
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions-section">
                            <div className="section-title-bar">
                                <h3>Quick Actions</h3>
                                <div className="title-decoration"></div>
                            </div>
                            <div className="quick-actions-grid">
                                <button
                                    className="quick-action-card"
                                    onClick={() => setActiveTab("approvals")}
                                >
                                    <div className="action-icon warning">
                                        <UserCheck size={24} />
                                    </div>
                                    <div className="action-content">
                                        <h4>Review Pendaftaran</h4>
                                        <p>
                                            Tinjau penjual yang menunggu
                                            approval
                                        </p>
                                        {adminData.pendingPenjual.length >
                                            0 && (
                                            <span className="action-badge">
                                                {
                                                    adminData.pendingPenjual
                                                        .length
                                                }{" "}
                                                pending
                                            </span>
                                        )}
                                    </div>
                                    <ChevronRight
                                        size={18}
                                        className="action-arrow"
                                    />
                                </button>

                                <button
                                    className="quick-action-card"
                                    onClick={() => setActiveTab("penjual")}
                                >
                                    <div className="action-icon primary">
                                        <Store size={24} />
                                    </div>
                                    <div className="action-content">
                                        <h4>Kelola Penjual</h4>
                                        <p>Lihat semua penjual terdaftar</p>
                                    </div>
                                    <ChevronRight
                                        size={18}
                                        className="action-arrow"
                                    />
                                </button>

                                <button
                                    className="quick-action-card"
                                    onClick={() => setActiveTab("mahasiswa")}
                                >
                                    <div className="action-icon secondary">
                                        <GraduationCap size={24} />
                                    </div>
                                    <div className="action-content">
                                        <h4>Kelola Mahasiswa</h4>
                                        <p>Lihat semua mahasiswa terdaftar</p>
                                    </div>
                                    <ChevronRight
                                        size={18}
                                        className="action-arrow"
                                    />
                                </button>

                                <button
                                    className="quick-action-card"
                                    onClick={() =>
                                        setExportModal({
                                            isOpen: true,
                                            type: "users",
                                        })
                                    }
                                >
                                    <div className="action-icon success">
                                        <Download size={24} />
                                    </div>
                                    <div className="action-content">
                                        <h4>Export Data</h4>
                                        <p>Download laporan sistem</p>
                                    </div>
                                    <ChevronRight
                                        size={18}
                                        className="action-arrow"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Pending Approvals Preview */}
                        {adminData.pendingPenjual.length > 0 && (
                            <div className="preview-section">
                                <div className="section-title-bar">
                                    <h3>Pendaftaran Baru Menunggu Review</h3>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() =>
                                            setActiveTab("approvals")
                                        }
                                    >
                                        Lihat Semua
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="preview-grid">
                                    {adminData.pendingPenjual
                                        .slice(0, 3)
                                        .map((penjual) => (
                                            <div
                                                key={penjual.id}
                                                className="preview-card"
                                            >
                                                <div className="preview-avatar">
                                                    <Store size={20} />
                                                </div>
                                                <div className="preview-content">
                                                    <h4>
                                                        {penjual.kantin_name}
                                                    </h4>
                                                    <p className="preview-owner">
                                                        Oleh: {penjual.name}
                                                    </p>
                                                    <p className="preview-location">
                                                        <MapPin size={14} />
                                                        {penjual.location}
                                                    </p>
                                                </div>
                                                <div className="preview-actions">
                                                    <button
                                                        className="btn-approve-sm"
                                                        onClick={() =>
                                                            approvePenjual(
                                                                penjual.id
                                                            )
                                                        }
                                                        title="Setujui"
                                                    >
                                                        <CheckCircle
                                                            size={16}
                                                        />
                                                    </button>
                                                    <button
                                                        className="btn-reject-sm"
                                                        onClick={() =>
                                                            rejectPenjual(
                                                                penjual.id
                                                            )
                                                        }
                                                        title="Tolak"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Activity */}
                        <div className="recent-activity">
                            <div className="section-title-bar">
                                <h3>Aktivitas Terbaru</h3>
                                <div className="title-decoration"></div>
                            </div>
                            <div className="activity-list">
                                <div className="activity-item">
                                    <div className="activity-icon success">
                                        <UserCheck size={16} />
                                    </div>
                                    <div className="activity-content">
                                        <p>
                                            Penjual baru "Kantin Sejahtera"
                                            mendaftar
                                        </p>
                                        <span className="activity-time">
                                            2 menit lalu
                                        </span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-icon primary">
                                        <GraduationCap size={16} />
                                    </div>
                                    <div className="activity-content">
                                        <p>5 mahasiswa baru terdaftar</p>
                                        <span className="activity-time">
                                            1 jam lalu
                                        </span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-icon info">
                                        <Star size={16} />
                                    </div>
                                    <div className="activity-content">
                                        <p>
                                            Rating sistem meningkat menjadi 4.8
                                        </p>
                                        <span className="activity-time">
                                            3 jam lalu
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Approvals Tab */}
                {activeTab === "approvals" && (
                    <div className="content-section">
                        <div className="section-header">
                            <div className="section-title">
                                <div className="title-icon">
                                    <UserCheck size={24} />
                                </div>
                                <div>
                                    <h2>Penjual Menunggu Approval</h2>
                                    <p className="section-description">
                                        Kelola pendaftaran penjual baru yang
                                        menunggu persetujuan
                                    </p>
                                </div>
                                <span className="section-count">
                                    {filteredApprovals.length} pending
                                </span>
                            </div>
                            <div className="section-actions">
                                <div className="search-box">
                                    <Search size={18} />
                                    <input
                                        type="text"
                                        placeholder="Cari penjual..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() =>
                                        setExportModal({
                                            isOpen: true,
                                            type: "users",
                                        })
                                    }
                                >
                                    <Download size={16} />
                                    Export
                                </button>
                            </div>
                        </div>

                        <div className="content-body">
                            {filteredApprovals.length === 0 ? (
                                <div className="empty-state enhanced">
                                    <div className="empty-icon">
                                        <CheckCircle size={64} />
                                    </div>
                                    <h3>
                                        Tidak ada penjual yang menunggu approval
                                    </h3>
                                    <p>
                                        Semua pendaftaran penjual telah diproses
                                    </p>
                                </div>
                            ) : (
                                <div className="approvals-grid">
                                    {paginatedApprovals.map((penjual) => (
                                        <div
                                            key={penjual.id}
                                            className="approval-card"
                                        >
                                            <div className="approval-header">
                                                <div className="kantin-avatar">
                                                    <Store size={24} />
                                                </div>
                                                <div className="kantin-info">
                                                    <h3>
                                                        {penjual.kantin_name}
                                                    </h3>
                                                    <p className="kantin-owner">
                                                        <UserCheck size={14} />
                                                        Pemilik: {penjual.name}
                                                    </p>
                                                </div>
                                                <span className="status-badge pending">
                                                    Menunggu Approval
                                                </span>
                                            </div>

                                            <div className="approval-details">
                                                <div className="detail-item">
                                                    <Mail size={16} />
                                                    <div>
                                                        <strong>Email:</strong>
                                                        <span>
                                                            {penjual.email}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="detail-item">
                                                    <MapPin size={16} />
                                                    <div>
                                                        <strong>Lokasi:</strong>
                                                        <span>
                                                            {penjual.location}
                                                        </span>
                                                    </div>
                                                </div>
                                                {penjual.phone && (
                                                    <div className="detail-item">
                                                        <Phone size={16} />
                                                        <div>
                                                            <strong>
                                                                Telepon:
                                                            </strong>
                                                            <span>
                                                                {penjual.phone}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="detail-item">
                                                    <Calendar size={16} />
                                                    <div>
                                                        <strong>
                                                            Tanggal Daftar:
                                                        </strong>
                                                        <span>
                                                            {new Date(
                                                                penjual.created_at
                                                            ).toLocaleDateString(
                                                                "id-ID"
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="approval-actions">
                                                <button
                                                    className="btn-approve"
                                                    onClick={() =>
                                                        approvePenjual(
                                                            penjual.id
                                                        )
                                                    }
                                                >
                                                    <CheckCircle size={18} />
                                                    Setujui Penjual
                                                </button>
                                                <button
                                                    className="btn-reject"
                                                    onClick={() =>
                                                        rejectPenjual(
                                                            penjual.id
                                                        )
                                                    }
                                                >
                                                    <XCircle size={18} />
                                                    Tolak Pendaftaran
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* All Penjual Tab */}
                {activeTab === "penjual" && (
                    <div className="content-section">
                        <div className="section-header">
                            <div className="section-title">
                                <div className="title-icon">
                                    <Store size={24} />
                                </div>
                                <div>
                                    <h2>Semua Penjual Terdaftar</h2>
                                    <p className="section-description">
                                        Kelola semua penjual yang terdaftar di
                                        sistem
                                    </p>
                                </div>
                                <span className="section-count">
                                    {filteredUsers.length} penjual
                                </span>
                            </div>
                            <div className="section-actions">
                                <div className="search-box">
                                    <Search size={18} />
                                    <input
                                        type="text"
                                        placeholder="Cari penjual..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                </div>
                                <select
                                    className="filter-select"
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="approved">Disetujui</option>
                                    <option value="pending">Pending</option>
                                </select>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() =>
                                        setExportModal({
                                            isOpen: true,
                                            type: "users",
                                        })
                                    }
                                >
                                    <Download size={16} />
                                    Export
                                </button>
                            </div>
                        </div>

                        <div className="content-body">
                            {filteredUsers.length === 0 ? (
                                <div className="empty-state enhanced">
                                    <div className="empty-icon">
                                        <Store size={64} />
                                    </div>
                                    <h3>
                                        {searchTerm || statusFilter !== "all"
                                            ? "Penjual tidak ditemukan"
                                            : "Belum ada penjual terdaftar"}
                                    </h3>
                                    <p>
                                        {searchTerm || statusFilter !== "all"
                                            ? "Coba dengan pencarian atau filter lain"
                                            : "Penjual yang mendaftar akan muncul di sini"}
                                    </p>
                                </div>
                            ) : (
                                <div className="users-table-enhanced">
                                    <div className="table-header">
                                        <div className="table-col">Kantin</div>
                                        <div className="table-col">Pemilik</div>
                                        <div className="table-col">Kontak</div>
                                        <div className="table-col">Lokasi</div>
                                        <div className="table-col">Status</div>
                                        <div className="table-col">Aksi</div>
                                    </div>

                                    <div className="table-body">
                                        {paginatedPenjual.map((penjual) => (
                                            <div
                                                key={penjual.id}
                                                className="table-row"
                                            >
                                                <div className="table-col">
                                                    <div className="kantin-name">
                                                        <Store size={16} />
                                                        {penjual.kantin_name}
                                                    </div>
                                                </div>

                                                <div className="table-col">
                                                    <div className="owner-name">
                                                        <Users size={16} />
                                                        {penjual.name}
                                                    </div>
                                                </div>

                                                <div className="table-col">
                                                    <div className="contact-email">
                                                        <Mail size={14} />
                                                        {penjual.email}
                                                    </div>
                                                    {penjual.phone && (
                                                        <div className="contact-phone">
                                                            <Phone size={14} />
                                                            {penjual.phone}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="table-col">
                                                    <div className="location-text">
                                                        <MapPin size={14} />
                                                        {penjual.location}
                                                    </div>
                                                </div>

                                                <div className="table-col">
                                                    <span
                                                        className={`status-badge ${
                                                            penjual.is_approved
                                                                ? "approved"
                                                                : "pending"
                                                        }`}
                                                    >
                                                        {penjual.is_approved
                                                            ? "Disetujui"
                                                            : "Pending"}
                                                    </span>
                                                </div>

                                                <div className="table-col">
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() =>
                                                                editUser(
                                                                    penjual
                                                                )
                                                            }
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            className="btn-icon btn-danger"
                                                            onClick={() =>
                                                                deleteUser(
                                                                    penjual.id,
                                                                    penjual.kantin_name
                                                                )
                                                            }
                                                            title="Hapus"
                                                        >
                                                            <XCircle
                                                                size={16}
                                                            />
                                                        </button>
                                                        {!penjual.is_approved && (
                                                            <button
                                                                className="btn-approve-sm"
                                                                onClick={() =>
                                                                    approvePenjual(
                                                                        penjual.id
                                                                    )
                                                                }
                                                                title="Setujui"
                                                            >
                                                                <CheckCircle
                                                                    size={16}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* All Mahasiswa Tab */}
                {activeTab === "mahasiswa" && (
                    <div className="content-section">
                        <div className="section-header">
                            <div className="section-title">
                                <div className="title-icon">
                                    <GraduationCap size={24} />
                                </div>
                                <div>
                                    <h2>Semua Mahasiswa Terdaftar</h2>
                                    <p className="section-description">
                                        Kelola semua mahasiswa yang terdaftar di
                                        sistem
                                    </p>
                                </div>
                                <span className="section-count">
                                    {filteredMahasiswa.length} mahasiswa
                                </span>
                            </div>
                            <div className="section-actions">
                                <div className="search-box">
                                    <Search size={18} />
                                    <input
                                        type="text"
                                        placeholder="Cari mahasiswa..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() =>
                                        setExportModal({
                                            isOpen: true,
                                            type: "users",
                                        })
                                    }
                                >
                                    <Download size={16} />
                                    Export
                                </button>
                            </div>
                        </div>

                        <div className="content-body">
                            {filteredMahasiswa.length === 0 ? (
                                <div className="empty-state enhanced">
                                    <div className="empty-icon">
                                        <GraduationCap size={64} />
                                    </div>
                                    <h3>
                                        {searchTerm
                                            ? "Mahasiswa tidak ditemukan"
                                            : "Belum ada mahasiswa terdaftar"}
                                    </h3>
                                    <p>
                                        {searchTerm
                                            ? "Coba dengan pencarian lain"
                                            : "Mahasiswa yang mendaftar akan muncul di sini"}
                                    </p>
                                </div>
                            ) : (
                                <div className="users-table-enhanced">
                                    <div className="table-header">
                                        <div className="table-col">Nama</div>
                                        <div className="table-col">NIM</div>
                                        <div className="table-col">Kontak</div>
                                        <div className="table-col">
                                            Fakultas
                                        </div>
                                        <div className="table-col">
                                            Tanggal Daftar
                                        </div>
                                        <div className="table-col">Aksi</div>
                                    </div>

                                    <div className="table-body">
                                        {paginatedMahasiswa.map((mahasiswa) => (
                                            <div
                                                key={mahasiswa.id}
                                                className="table-row"
                                            >
                                                <div className="table-col">
                                                    <div className="owner-name">
                                                        <Users size={16} />
                                                        {mahasiswa.name}
                                                    </div>
                                                </div>

                                                <div className="table-col">
                                                    <div className="nim-text">
                                                        <BookOpen size={16} />
                                                        {mahasiswa.nim ||
                                                            "Tidak ada NIM"}
                                                    </div>
                                                </div>

                                                <div className="table-col">
                                                    <div className="contact-email">
                                                        <Mail size={14} />
                                                        {mahasiswa.email}
                                                    </div>
                                                    {mahasiswa.phone && (
                                                        <div className="contact-phone">
                                                            <Phone size={14} />
                                                            {mahasiswa.phone}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="table-col">
                                                    <div className="location-text">
                                                        <GraduationCap
                                                            size={14}
                                                        />
                                                        {mahasiswa.fakultas ||
                                                            "Tidak ada fakultas"}
                                                    </div>
                                                </div>

                                                <div className="table-col">
                                                    <div className="date-text">
                                                        <Calendar size={14} />
                                                        {new Date(
                                                            mahasiswa.created_at
                                                        ).toLocaleDateString(
                                                            "id-ID"
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="table-col">
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() =>
                                                                editUser(
                                                                    mahasiswa
                                                                )
                                                            }
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            className="btn-icon btn-danger"
                                                            onClick={() =>
                                                                deleteUser(
                                                                    mahasiswa.id,
                                                                    mahasiswa.name
                                                                )
                                                            }
                                                            title="Hapus"
                                                        >
                                                            <XCircle
                                                                size={16}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Edit User Modal - PERBAIKI form handling */}
                {editingUser && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>
                                    Edit{" "}
                                    {editingUser.role === "penjual"
                                        ? "Penjual"
                                        : "Mahasiswa"}
                                </h3>
                                <button
                                    className="modal-close"
                                    onClick={() => setEditingUser(null)}
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>
                                        Nama{" "}
                                        {editingUser.role === "penjual"
                                            ? "Pemilik"
                                            : "Lengkap"}
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="Masukkan nama"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                email: e.target.value,
                                            })
                                        }
                                        placeholder="Masukkan email"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Telepon</label>
                                    <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                phone: e.target.value,
                                            })
                                        }
                                        placeholder="Masukkan nomor telepon"
                                        required
                                    />
                                </div>

                                {/* Field khusus untuk penjual */}
                                {editingUser.role === "penjual" && (
                                    <>
                                        <div className="form-group">
                                            <label>Nama Kantin</label>
                                            <input
                                                type="text"
                                                value={
                                                    editForm.kantin_name || ""
                                                }
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        kantin_name:
                                                            e.target.value ||
                                                            null,
                                                    })
                                                }
                                                placeholder="Masukkan nama kantin"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Lokasi Kantin</label>
                                            <input
                                                type="text"
                                                value={editForm.location || ""}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        location:
                                                            e.target.value ||
                                                            null,
                                                    })
                                                }
                                                placeholder="Masukkan lokasi kantin"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Field khusus untuk mahasiswa */}
                                {editingUser.role === "mahasiswa" && (
                                    <div className="form-group">
                                        <label>NIM</label>
                                        <input
                                            type="text"
                                            value={editForm.nim || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    nim: e.target.value || null,
                                                })
                                            }
                                            placeholder="Masukkan NIM"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setEditingUser(null)}
                                >
                                    Batal
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={updateUser}
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Export Modal */}
                {exportModal.isOpen && (
                    <ExportModal
                        isOpen={exportModal.isOpen}
                        onClose={() =>
                            setExportModal({ isOpen: false, type: null })
                        }
                        exportType={exportModal.type}
                        user={user}
                        API_BASE={API_BASE}
                    />
                )}

                {/* Pagination Component */}
                {((activeTab === "penjual" && filteredUsers.length > 0) ||
                    (activeTab === "mahasiswa" &&
                        filteredMahasiswa.length > 0) ||
                    (activeTab === "approvals" &&
                        adminData.pendingPenjual.length > 0)) && (
                    <div className="pagination-section">
                        <div className="pagination-controls">
                            <div className="pagination-info">
                                Menampilkan {itemsPerPage} item per halaman
                            </div>

                            <div className="pagination-buttons">
                                <button
                                    className={`pagination-btn ${
                                        currentPage[activeTab] === 1
                                            ? "disabled"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handlePageChange(
                                            currentPage[activeTab] - 1,
                                            activeTab
                                        )
                                    }
                                    disabled={currentPage[activeTab] === 1}
                                >
                                    Sebelumnya
                                </button>

                                <div className="pagination-numbers">
                                    {[...Array(totalPages[activeTab])].map(
                                        (_, index) => (
                                            <button
                                                key={index + 1}
                                                className={`pagination-number ${
                                                    currentPage[activeTab] ===
                                                    index + 1
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handlePageChange(
                                                        index + 1,
                                                        activeTab
                                                    )
                                                }
                                            >
                                                {index + 1}
                                            </button>
                                        )
                                    )}
                                </div>

                                <button
                                    className={`pagination-btn ${
                                        currentPage[activeTab] ===
                                        totalPages[activeTab]
                                            ? "disabled"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handlePageChange(
                                            currentPage[activeTab] + 1,
                                            activeTab
                                        )
                                    }
                                    disabled={
                                        currentPage[activeTab] ===
                                        totalPages[activeTab]
                                    }
                                >
                                    Selanjutnya
                                </button>
                            </div>

                            <div className="items-per-page">
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage((prev) => ({
                                            ...prev,
                                            [activeTab]: 1,
                                        }));
                                    }}
                                    className="items-per-page-select"
                                >
                                    <option value={5}>5 per halaman</option>
                                    <option value={10}>10 per halaman</option>
                                    <option value={20}>20 per halaman</option>
                                    <option value={50}>50 per halaman</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .admin-dashboard {
                    min-height: 100vh;
                    background: var(--background);
                    padding: 2rem 0;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                /* Header Styles */
                .dashboard-header {
                    background: transparent;
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    color: white;
                    box-shadow: var(--shadow);
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-main {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .header-icon-container {
                    width: 60px;
                    height: 60px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                }

                .header-main-icon {
                    color: white;
                }

                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .header-icon {
                    color: var(--primary);
                }

                .header-subtitle {
                    color: rgba(255, 255, 255, 0.9);
                    margin-top: 0.25rem;
                }

                .header-stats {
                    display: flex;
                    gap: 2rem;
                }

                .header-stat {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: transparent;
                }

                /* Navigation Tabs */
                .navigation-tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                    padding: 0.5rem;
                    background: var(--surface-light);
                    border-radius: 12px;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--border);
                    overflow-x: auto;
                    white-space: nowrap;
                }

                .nav-tab {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    background: transparent;
                    border: 1px solid transparent;
                    border-radius: 8px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all var(--transition-normal);
                    font-size: 0.9rem;
                    font-weight: 500;
                    flex-shrink: 0;
                }

                .nav-tab:hover {
                    background: var(--surface);
                    border-color: var(--border);
                    color: var(--text-primary);
                }

                .nav-tab.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                    box-shadow: var(--shadow-sm);
                }

                .tab-badge {
                    background: var(--warning);
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    min-width: 20px;
                    text-align: center;
                }

                .tab-count {
                    background: var(--surface-light);
                    color: var(--text-secondary);
                    padding: 0.25rem 0.5rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                /* Welcome Card */
                .welcome-card {
                    background: var(--primary-gradient);
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: var(--shadow);
                }

                .welcome-content {
                    flex: 1;
                }

                .welcome-text h2 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .welcome-text p {
                    margin: 0;
                    opacity: 0.9;
                }

                .welcome-stats {
                    display: flex;
                    gap: 2rem;
                    margin-top: 1.5rem;
                }

                .welcome-stat {
                    text-align: center;
                }

                .welcome-stat strong {
                    display: block;
                    font-size: 2rem;
                    font-weight: 800;
                    margin-bottom: 0.25rem;
                }

                .welcome-stat span {
                    font-size: 0.875rem;
                    opacity: 0.8;
                }

                .welcome-graphic {
                    opacity: 0.8;
                }

                .graphic-icon {
                    animation: float 3s ease-in-out infinite;
                }

                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                /* Enhanced Stats Grid */
                .stats-grid-enhanced {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .stat-card-enhanced {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all var(--transition-normal);
                    position: relative;
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                }

                .stat-card-enhanced:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                }

                .stat-card-enhanced::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                }

                .stat-card-enhanced.primary::before {
                    background: var(--primary);
                }
                .stat-card-enhanced.secondary::before {
                    background: var(--secondary);
                }
                .stat-card-enhanced.success::before {
                    background: var(--success);
                }
                .stat-card-enhanced.warning::before {
                    background: var(--warning);
                }
                .stat-card-enhanced.info::before {
                    background: var(--info);
                }

                .stat-icon-enhanced {
                    width: 60px;
                    height: 60px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                .stat-card-enhanced.primary .stat-icon-enhanced {
                    background: var(--primary);
                }
                .stat-card-enhanced.secondary .stat-icon-enhanced {
                    background: var(--secondary);
                }
                .stat-card-enhanced.success .stat-icon-enhanced {
                    background: var(--success);
                }
                .stat-card-enhanced.warning .stat-icon-enhanced {
                    background: var(--warning);
                }
                .stat-card-enhanced.info .stat-icon-enhanced {
                    background: var(--info);
                }

                .stat-content-enhanced {
                    flex: 1;
                }

                .stat-content-enhanced h3 {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-number-enhanced {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    line-height: 1;
                    margin-bottom: 0.5rem;
                }

                .stat-trend {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                }

                .stat-trend.positive {
                    color: var(--success);
                }

                .stat-subtitle {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                }

                .stat-subtitle.urgent {
                    color: var(--warning);
                    font-weight: 600;
                }

                .stat-decoration {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(
                        135deg,
                        rgba(255, 255, 255, 0.1) 0%,
                        rgba(255, 255, 255, 0) 100%
                    );
                    border-radius: 50%;
                }

                .stat-card-gradient {
                    background: var(--primary-gradient);
                    border-radius: 16px;
                    padding: 1.5rem;
                    color: white;
                    grid-column: 1 / -1;
                    box-shadow: var(--shadow);
                }

                .gradient-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .gradient-icon {
                    opacity: 0.8;
                }

                .gradient-text h3 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.25rem;
                }

                .gradient-text p {
                    margin: 0;
                    opacity: 0.8;
                }

                .gradient-badge {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    backdrop-filter: blur(10px);
                }

                /* Section Titles */
                .section-title-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    position: relative;
                }

                .section-title-bar h3 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: 1.25rem;
                    font-weight: 700;
                }

                .title-decoration {
                    position: absolute;
                    bottom: -8px;
                    left: 0;
                    width: 40px;
                    height: 3px;
                    background: var(--primary);
                    border-radius: 2px;
                }

                /* Quick Actions */
                .quick-actions-section {
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--border);
                }

                .quick-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .quick-action-card {
                    background: var(--background);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    transition: all var(--transition-normal);
                    border: none;
                    text-align: left;
                    position: relative;
                }

                .quick-action-card:hover {
                    transform: translateY(-2px);
                    border-color: var(--primary);
                    box-shadow: var(--shadow);
                }

                .action-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                .action-icon.primary {
                    background: var(--primary);
                }
                .action-icon.success {
                    background: var(--success);
                }
                .action-icon.warning {
                    background: var(--warning);
                }
                .action-icon.secondary {
                    background: var(--secondary);
                }

                .action-content {
                    flex: 1;
                }

                .action-content h4 {
                    margin: 0 0 0.25rem 0;
                    color: var(--text-primary);
                    font-size: 1rem;
                    font-weight: 600;
                }

                .action-content p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                }

                .action-badge {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: var(--warning);
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .action-arrow {
                    color: var(--text-muted);
                    transition: transform var(--transition-normal);
                }

                .quick-action-card:hover .action-arrow {
                    transform: translateX(3px);
                    color: var(--primary);
                }

                /* Preview Section */
                .preview-section {
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--border);
                }

                .preview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1rem;
                }

                .preview-card {
                    background: var(--background);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all var(--transition-normal);
                }

                .preview-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow);
                }

                .preview-avatar {
                    width: 50px;
                    height: 50px;
                    background: var(--primary);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                .preview-content {
                    flex: 1;
                }

                .preview-content h4 {
                    margin: 0 0 0.5rem 0;
                    color: var(--text-primary);
                    font-size: 1rem;
                }

                .preview-owner {
                    margin: 0 0 0.25rem 0;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .preview-location {
                    margin: 0;
                    color: var(--text-muted);
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .preview-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                /* Recent Activity */
                .recent-activity {
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 2rem;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--border);
                }

                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .activity-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    border-radius: 8px;
                    transition: all var(--transition-normal);
                }

                .activity-item:hover {
                    background: var(--background);
                }

                .activity-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                .activity-icon.success {
                    background: var(--success);
                }
                .activity-icon.primary {
                    background: var(--primary);
                }
                .activity-icon.info {
                    background: var(--info);
                }

                .activity-content {
                    flex: 1;
                }

                .activity-content p {
                    margin: 0 0 0.25rem 0;
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .activity-time {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                }

                /* Content Sections */
                .content-section {
                    background: var(--surface);
                    border-radius: 16px;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--border);
                    overflow: hidden;
                }

                .section-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid var(--border);
                    background: var(--background);
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .title-icon {
                    width: 50px;
                    height: 50px;
                    background: var(--primary);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .section-title h2 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: 1.5rem;
                }

                .section-description {
                    margin: 0.25rem 0 0 0;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                }

                .section-count {
                    background: var(--primary);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    font-weight: 700;
                    margin-left: auto;
                }

                .section-actions {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .search-box {
                    position: relative;
                    min-width: 250px;
                }

                .search-box input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 2.5rem;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    background: var(--surface);
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    transition: all var(--transition-normal);
                }

                .search-box input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .search-box svg {
                    position: absolute;
                    left: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }

                .filter-select {
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    background: var(--surface);
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all var(--transition-normal);
                }

                .filter-select:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                /* Content Body */
                .content-body {
                    padding: 2rem;
                }

                /* Empty State */
                .empty-state.enhanced {
                    text-align: center;
                    padding: 3rem 2rem;
                }

                .empty-icon {
                    width: 80px;
                    height: 80px;
                    background: var(--surface-light);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    color: var(--text-muted);
                }

                .empty-state h3 {
                    margin: 0 0 0.5rem 0;
                    color: var(--text-primary);
                }

                .empty-state p {
                    margin: 0;
                    color: var(--text-secondary);
                }

                /* Approvals Grid */
                .approvals-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 1.5rem;
                }

                .approval-card {
                    background: var(--background);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 1.5rem;
                    transition: all var(--transition-normal);
                    box-shadow: var(--shadow-sm);
                }

                .approval-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                }

                .approval-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .kantin-avatar {
                    width: 50px;
                    height: 50px;
                    background: var(--primary);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .kantin-info {
                    flex: 1;
                }

                .kantin-info h3 {
                    margin: 0 0 0.25rem 0;
                    color: var(--text-primary);
                    font-size: 1.25rem;
                }

                .kantin-owner {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .status-badge {
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .status-badge.pending {
                    background: rgba(255, 165, 0, 0.1);
                    color: var(--warning);
                    border: 1px solid rgba(255, 165, 0, 0.2);
                }

                .status-badge.approved {
                    background: rgba(34, 197, 94, 0.1);
                    color: var(--success);
                    border: 1px solid rgba(34, 197, 94, 0.2);
                }

                .approval-details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .detail-item svg {
                    color: var(--text-muted);
                    flex-shrink: 0;
                }

                .detail-item div {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .detail-item strong {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .detail-item span {
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .approval-actions {
                    display: flex;
                    gap: 1rem;
                }

                .btn-approve,
                .btn-reject {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 1rem 1.5rem;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all var(--transition-normal);
                }

                .btn-approve {
                    background: var(--success);
                    color: white;
                }

                .btn-approve:hover {
                    background: #059669;
                    transform: translateY(-2px);
                    box-shadow: var(--shadow);
                }

                .btn-reject {
                    background: var(--error);
                    color: white;
                }

                .btn-reject:hover {
                    background: #b91c1c;
                    transform: translateY(-2px);
                    box-shadow: var(--shadow);
                }

                .btn-approve-sm,
                .btn-reject-sm {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.75rem;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all var(--transition-normal);
                }

                .btn-approve-sm {
                    background: var(--success);
                    color: white;
                }

                .btn-approve-sm:hover {
                    background: #047857;
                    transform: scale(1.1);
                }

                .btn-reject-sm {
                    background: var(--error);
                    color: white;
                }

                .btn-reject-sm:hover {
                    background: #b91c1c;
                    transform: scale(1.1);
                }

                /* Enhanced Users Table */
                .users-table-enhanced {
                    background: var(--background);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                }

                .table-header {
                    display: grid;
                    grid-template-columns: 2fr 1.5fr 1.5fr 1.5fr 1fr 0.5fr;
                    gap: 1rem;
                    padding: 1.5rem;
                    background: var(--surface-light);
                    border-bottom: 1px solid var(--border);
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .table-body {
                    display: flex;
                    flex-direction: column;
                }

                .table-row {
                    display: grid;
                    grid-template-columns: 2fr 1.5fr 1.5fr 1.5fr 1fr 0.5fr;
                    gap: 1rem;
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border);
                    transition: all var(--transition-normal);
                }

                .table-row:hover {
                    background: var(--surface-light);
                }

                .table-row:last-child {
                    border-bottom: none;
                }

                .table-col {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .kantin-name,
                .owner-name,
                .nim-text {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .contact-email,
                .contact-phone,
                .location-text,
                .date-text {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-secondary);
                }

                .contact-email svg,
                .contact-phone svg,
                .location-text svg,
                .date-text svg {
                    color: var(--text-muted);
                    flex-shrink: 0;
                }

                .action-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.5rem;
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all var(--transition-normal);
                }

                .btn-icon:hover {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }

                /* Buttons */
                .btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all var(--transition-normal);
                    font-size: 0.875rem;
                }

                .btn-outline {
                    background: transparent;
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                }

                .btn-outline:hover {
                    background: var(--surface-light);
                    border-color: var(--primary);
                    color: var(--primary);
                }

                .btn-primary {
                    background: var(--primary);
                    color: white;
                }

                .btn-primary:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow: var(--shadow);
                }

                .btn-sm {
                    padding: 0.5rem 1rem;
                    font-size: 0.75rem;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .modal-content {
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 2rem;
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow-xl);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border);
                }

                .modal-header h3 {
                    margin: 0;
                    color: var(--text-primary);
                }

                .modal-close {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 6px;
                    transition: all var(--transition-normal);
                }

                .modal-close:hover {
                    background: var(--surface-light);
                    color: var(--text-primary);
                }

                .modal-body {
                    margin-bottom: 2rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                    font-weight: 600;
                }

                .form-group input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    background: var(--background);
                    color: var(--text-primary);
                    font-size: 1rem;
                    transition: all var(--transition-normal);
                }

                .form-group input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                }

                /* Pagination Styles */
                .pagination-section {
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--border);
                }

                .pagination-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .pagination-info {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                }

                .pagination-buttons {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .pagination-btn {
                    padding: 0.5rem 1rem;
                    border: 1px solid var(--border);
                    background: var(--surface);
                    color: var(--text-primary);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all var(--transition-normal);
                    font-size: 0.875rem;
                }

                .pagination-btn:hover:not(.disabled) {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }

                .pagination-btn.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .pagination-numbers {
                    display: flex;
                    gap: 0.25rem;
                }

                .pagination-number {
                    width: 2rem;
                    height: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--border);
                    background: var(--surface);
                    color: var(--text-primary);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all var(--transition-normal);
                    font-size: 0.875rem;
                }

                .pagination-number:hover {
                    background: var(--surface-light);
                    border-color: var(--primary);
                }

                .pagination-number.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }

                .items-per-page-select {
                    padding: 0.5rem;
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    background: var(--surface);
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    cursor: pointer;
                }

                /* Mobile Responsive untuk Pagination */
                @media (max-width: 768px) {
                    .pagination-controls {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .pagination-buttons {
                        order: 1;
                    }

                    .pagination-info {
                        order: 2;
                    }

                    .items-per-page {
                        order: 3;
                    }

                    .pagination-numbers {
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .mobile-dashboard-header {
                        display: block;
                        background: var(--surface);
                        border-radius: 16px;
                        padding: 1.5rem;
                        margin-bottom: 1.5rem;
                        border: 1px solid var(--border);
                        box-shadow: var(--shadow-sm);
                    }

                    .mobile-header-content {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .mobile-header-content h1 {
                        font-size: 1.5rem;
                        margin: 0;
                    }

                    .mobile-menu-btn {
                        background: var(--surface-light);
                        border: 1px solid var(--border);
                        border-radius: 10px;
                        padding: 0.75rem;
                        color: var(--text-primary);
                        cursor: pointer;
                    }

                    .mobile-tabs-menu {
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                        margin-top: 1rem;
                        padding-top: 1rem;
                        border-top: 1px solid var(--border);
                    }

                    .mobile-tab {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 1rem;
                        background: var(--surface-light);
                        border: 1px solid var(--border);
                        border-radius: 10px;
                        color: var(--text-primary);
                        cursor: pointer;
                        transition: all var(--transition-normal);
                        font-size: 0.9rem;
                    }

                    .mobile-tab.active {
                        background: var(--primary);
                        color: white;
                        border-color: var(--primary);
                    }

                    .desktop-only {
                        display: none !important;
                    }

                    .stats-grid-enhanced {
                        grid-template-columns: 1fr;
                    }

                    .stat-card-enhanced {
                        padding: 1.5rem;
                    }

                    .stat-number-enhanced {
                        font-size: 2rem;
                    }

                    .quick-actions-grid {
                        grid-template-columns: 1fr;
                    }

                    .approvals-grid {
                        grid-template-columns: 1fr;
                    }

                    .approval-card {
                        padding: 1.5rem;
                    }

                    .approval-details {
                        grid-template-columns: 1fr;
                    }

                    .approval-actions {
                        flex-direction: column;
                    }

                    .users-table-enhanced {
                        overflow-x: auto;
                    }

                    .table-header,
                    .table-row {
                        grid-template-columns: 200px 150px 150px 150px 100px 80px;
                        min-width: 830px;
                    }

                    .preview-grid {
                        grid-template-columns: 1fr;
                    }

                    .preview-card {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }

                    .preview-actions {
                        align-self: flex-end;
                    }

                    .modal-content {
                        margin: 1rem;
                        padding: 1.5rem;
                    }

                    .modal-actions {
                        flex-direction: column;
                    }

                    .section-header {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: flex-start;
                    }

                    .section-actions {
                        width: 100%;
                    }

                    .search-box {
                        min-width: 100%;
                    }

                    .header-content {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: flex-start;
                    }

                    .header-stats {
                        flex-direction: column;
                        gap: 0.5rem;
                        align-items: flex-start;
                        width: 100%;
                        padding-top: 1rem;
                        border-top: 1px solid rgba(255, 255, 255, 0.2);
                    }

                    .welcome-card {
                        flex-direction: column;
                        gap: 1.5rem;
                        text-align: center;
                    }

                    .welcome-stats {
                        justify-content: center;
                    }

                    .gradient-content {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                }

                @media (max-width: 480px) {
                    .mobile-header-content h1 {
                        font-size: 1.25rem;
                    }

                    .stat-card-enhanced {
                        padding: 1.25rem;
                        flex-direction: column;
                        text-align: center;
                        gap: 1rem;
                    }

                    .stat-icon-enhanced {
                        width: 50px;
                        height: 50px;
                    }

                    .quick-actions-section,
                    .preview-section {
                        padding: 1.5rem;
                    }

                    .section-actions {
                        flex-direction: column;
                    }

                    .search-box {
                        min-width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
