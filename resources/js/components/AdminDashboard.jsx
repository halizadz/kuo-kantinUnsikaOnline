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
} from "lucide-react";

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

            // TAMBAHAN: Load data mahasiswa
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

    // TAMBAHAN: Fungsi edit user
    const editUser = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            location: user.location || "",
            kantin_name: user.kantin_name || "",
        });
    };

    // TAMBAHAN: Fungsi update user
    const updateUser = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${API_BASE}/admin/users/${editingUser.id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(editForm),
                }
            );

            const data = await response.json();
            if (data.success) {
                setEditingUser(null);
                loadAdminData();
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    // Filter users based on search and status
    const filteredUsers = adminData.users.filter((user) => {
        const matchesSearch =
            user.kantin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "approved" && user.is_approved) ||
            (statusFilter === "pending" && !user.is_approved);
        return matchesSearch && matchesStatus;
    });

    // TAMBAHAN: Filter mahasiswa berdasarkan pencarian
    const filteredMahasiswa = adminData.mahasiswa.filter((mahasiswa) => {
        return (
            mahasiswa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mahasiswa.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mahasiswa.nim?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="admin-dashboard">
            <div className="container">
                {/* Mobile Header */}
                <div className="mobile-dashboard-header">
                    <div className="mobile-header-content">
                        <h1>Dashboard Admin</h1>
                        <button
                            className="mobile-menu-btn"
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                        >
                            <MoreVertical size={24} />
                        </button>
                    </div>

                    {isMobileMenuOpen && (
                        <div className="mobile-tabs-menu">
                            <button
                                className={`mobile-tab ${
                                    activeTab === "overview" ? "active" : ""
                                }`}
                                onClick={() => {
                                    setActiveTab("overview");
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                <BarChart3 size={18} />
                                Overview
                            </button>
                            <button
                                className={`mobile-tab ${
                                    activeTab === "approvals" ? "active" : ""
                                }`}
                                onClick={() => {
                                    setActiveTab("approvals");
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                <UserCheck size={18} />
                                Approvals ({adminData.pendingPenjual.length})
                            </button>
                            <button
                                className={`mobile-tab ${
                                    activeTab === "penjual" ? "active" : ""
                                }`}
                                onClick={() => {
                                    setActiveTab("penjual");
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                <Store size={18} />
                                Semua Penjual
                            </button>
                            {/* TAMBAHAN: Tab Mahasiswa */}
                            <button
                                className={`mobile-tab ${
                                    activeTab === "mahasiswa" ? "active" : ""
                                }`}
                                onClick={() => {
                                    setActiveTab("mahasiswa");
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                <GraduationCap size={18} />
                                Semua Mahasiswa
                            </button>
                        </div>
                    )}
                </div>

                {/* Desktop Dashboard Header */}
                <div className="dashboard-header desktop-only">
                    <div className="header-content">
                        <div>
                            <h1>Dashboard Admin</h1>
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
                        <BarChart3 size={18} />
                        Overview
                    </button>
                    <button
                        className={`nav-tab ${
                            activeTab === "approvals" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("approvals")}
                    >
                        <UserCheck size={18} />
                        Approvals ({adminData.pendingPenjual.length})
                    </button>
                    <button
                        className={`nav-tab ${
                            activeTab === "penjual" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("penjual")}
                    >
                        <Store size={18} />
                        Semua Penjual
                    </button>
                    {/* TAMBAHAN: Tab Mahasiswa */}
                    <button
                        className={`nav-tab ${
                            activeTab === "mahasiswa" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("mahasiswa")}
                    >
                        <GraduationCap size={18} />
                        Semua Mahasiswa ({adminData.mahasiswa.length})
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && adminData.stats && (
                    <div className="overview-section">
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
                            </div>

                            {/* TAMBAHAN: Card Rating */}
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
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions-section">
                            <h3>Quick Actions</h3>
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
                                </button>

                                {/* TAMBAHAN: Quick Action untuk Mahasiswa */}
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
                                </button>
                            </div>
                        </div>

                        {/* Pending Approvals Preview */}
                        {adminData.pendingPenjual.length > 0 && (
                            <div className="preview-section">
                                <div className="preview-header">
                                    <h3>Pendaftaran Baru Menunggu Review</h3>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() =>
                                            setActiveTab("approvals")
                                        }
                                    >
                                        Lihat Semua
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
                                                <div className="preview-content">
                                                    <h4>
                                                        {penjual.kantin_name}
                                                    </h4>
                                                    <p className="preview-owner">
                                                        Oleh: {penjual.name}
                                                    </p>
                                                    <p className="preview-location">
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
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Approvals Tab */}
                {activeTab === "approvals" && (
                    <div className="content-section">
                        <div className="section-header">
                            <div className="section-title">
                                <UserCheck size={24} />
                                <h2>Penjual Menunggu Approval</h2>
                                <span className="section-count">
                                    {adminData.pendingPenjual.length} pending
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
                            </div>
                        </div>

                        <div className="content-body">
                            <div className="approvals-grid">
                                {adminData.pendingPenjual
                                    .filter(
                                        (penjual) =>
                                            penjual.kantin_name
                                                .toLowerCase()
                                                .includes(
                                                    searchTerm.toLowerCase()
                                                ) ||
                                            penjual.name
                                                .toLowerCase()
                                                .includes(
                                                    searchTerm.toLowerCase()
                                                )
                                    )
                                    .map((penjual) => (
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
                                                        Pemilik: {penjual.name}
                                                    </p>
                                                </div>
                                                <span className="status-badge pending">
                                                    Menunggu Approval
                                                </span>
                                            </div>

                                            <div className="approval-details">
                                                <div className="detail-item">
                                                    <strong>Email:</strong>
                                                    <span>{penjual.email}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <strong>Lokasi:</strong>
                                                    <span>
                                                        {penjual.location}
                                                    </span>
                                                </div>
                                                {penjual.phone && (
                                                    <div className="detail-item">
                                                        <strong>
                                                            Telepon:
                                                        </strong>
                                                        <span>
                                                            {penjual.phone}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="detail-item">
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

                                {adminData.pendingPenjual.length === 0 && (
                                    <div className="empty-state">
                                        <CheckCircle size={48} />
                                        <h3>
                                            Tidak ada penjual yang menunggu
                                            approval
                                        </h3>
                                        <p>
                                            Semua pendaftaran penjual telah
                                            diproses
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* All Penjual Tab */}
                {activeTab === "penjual" && (
                    <div className="content-section">
                        <div className="section-header">
                            <div className="section-title">
                                <Store size={24} />
                                <h2>Semua Penjual Terdaftar</h2>
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
                            </div>
                        </div>

                        <div className="content-body">
                            {filteredUsers.length === 0 ? (
                                <div className="empty-state">
                                    <Store size={48} />
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
                                        {filteredUsers.map((penjual) => (
                                            <div
                                                key={penjual.id}
                                                className="table-row"
                                            >
                                                <div className="table-col">
                                                    <div className="kantin-name">
                                                        {penjual.kantin_name}
                                                    </div>
                                                </div>

                                                <div className="table-col">
                                                    <div className="owner-name">
                                                        {penjual.name}
                                                    </div>
                                                </div>

                                                <div className="table-col">
                                                    <div className="contact-email">
                                                        {penjual.email}
                                                    </div>
                                                    {penjual.phone && (
                                                        <div className="contact-phone">
                                                            {penjual.phone}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="table-col">
                                                    <div className="location-text">
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
                                                            onClick={() => {
                                                                // View details
                                                                alert(
                                                                    `Detail penjual: ${penjual.kantin_name}`
                                                                );
                                                            }}
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() =>
                                                                editUser(
                                                                    penjual
                                                                )
                                                            }
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        {!penjual.is_approved && (
                                                            <button
                                                                className="btn-approve-sm"
                                                                onClick={() =>
                                                                    approvePenjual(
                                                                        penjual.id
                                                                    )
                                                                }
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

                {/* TAMBAHAN: All Mahasiswa Tab */}
                {activeTab === "mahasiswa" && (
                    <div className="content-section">
                        <div className="section-header">
                            <div className="section-title">
                                <GraduationCap size={24} />
                                <h2>Semua Mahasiswa Terdaftar</h2>
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
                            </div>
                        </div>

                        <div className="content-body">
                            {filteredMahasiswa.length === 0 ? (
                                <div className="empty-state">
                                    <GraduationCap size={48} />
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
                                        {filteredMahasiswa.map((mahasiswa) => (
                                            <div
                                                key={mahasiswa.id}
                                                className="table-row"
                                            >
                                                <div className="table-col">
                                                    <div className="owner-name">
                                                        {mahasiswa.name}
                                                    </div>
                                                </div>

                                                <div className="table-col">
                                                    <div className="nim-text">
                                                        {mahasiswa.nim ||
                                                            "Tidak ada NIM"}
                                                    </div>
                                                </div>

                                                <div className="table-col">
                                                    <div className="contact-email">
                                                        {mahasiswa.email}
                                                    </div>
                                                    {mahasiswa.phone && (
                                                        <div className="contact-phone">
                                                            {mahasiswa.phone}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="table-col">
                                                    <div className="location-text">
                                                        {mahasiswa.fakultas ||
                                                            "Tidak ada fakultas"}
                                                    </div>
                                                </div>

                                                <div className="table-col">
                                                    <div className="date-text">
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
                                                        >
                                                            <Edit size={16} />
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

                {/* TAMBAHAN: Edit User Modal */}
                {editingUser && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>
                                    Edit{" "}
                                    {editingUser.kantin_name
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
                                        {editingUser.kantin_name
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
                                    />
                                </div>
                                {editingUser.kantin_name && (
                                    <>
                                        <div className="form-group">
                                            <label>Nama Kantin</label>
                                            <input
                                                type="text"
                                                value={editForm.kantin_name}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        kantin_name:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Lokasi Kantin</label>
                                            <input
                                                type="text"
                                                value={editForm.location}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        location:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </>
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
            </div>

            <style jsx>{`
                .admin-dashboard {
                    min-height: 100vh;
                    background: var(--background);
                    padding: 2rem 0;
                }

                /* Navigation Tabs */
                .navigation-tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                    padding: 0.5rem;
                    background: var(--surface-light);
                    border: 1px solid var(--border);
                    border-radius: 12px;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
                /* Mobile Header */
                .mobile-dashboard-header {
                    display: none;
                }

                .desktop-only {
                    display: block;
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
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    transition: all var(--transition-normal);
                    position: relative;
                    overflow: hidden;
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

                .stat-card-enhanced:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                }

                .stat-icon-enhanced {
                    width: 64px;
                    height: 64px;
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
                    font-size: 2.5rem;
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

                /* Quick Actions */
                .quick-actions-section {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                }

                .quick-actions-section h3 {
                    margin-bottom: 1.5rem;
                    color: var(--text-primary);
                    font-size: 1.25rem;
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
                    width: 48px;
                    height: 48px;
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
                .action-icon.info {
                    background: var(--info);
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

                /* Preview Section */
                .preview-section {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 2rem;
                }

                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .preview-header h3 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: 1.25rem;
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
                    justify-content: space-between;
                    align-items: center;
                    transition: all var(--transition-normal);
                }

                .preview-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
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
                }

                .preview-location {
                    margin: 0;
                    color: var(--text-muted);
                    font-size: 0.875rem;
                }

                .preview-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                /* Approvals Grid */
                .approvals-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 1.5rem;
                }

                .approval-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 2rem;
                    transition: all var(--transition-normal);
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
                    background: var(--primary-gradient);
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
                }

                .btn-reject {
                    background: var(--error);
                    color: white;
                }

                .btn-reject:hover {
                    background: #dc2626;
                    transform: translateY(-2px);
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
                    background: #059669;
                    transform: scale(1.1);
                }

                .btn-reject-sm {
                    background: var(--error);
                    color: white;
                }

                .btn-reject-sm:hover {
                    background: #dc2626;
                    transform: scale(1.1);
                }

                /* Enhanced Users Table */
                .users-table-enhanced {
                    background: var(--background);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
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

                .kantin-name {
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .owner-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .nim-text {
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .contact-email {
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .contact-phone {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                }

                .location-text {
                    color: var(--text-secondary);
                }

                .date-text {
                    color: var(--text-muted);
                    font-size: 0.875rem;
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

                /* TAMBAHAN: Modal Styles */
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

                .btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all var(--transition-normal);
                }

                .btn-outline {
                    background: transparent;
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                }

                .btn-outline:hover {
                    background: var(--surface-light);
                }

                .btn-primary {
                    background: var(--primary);
                    color: white;
                }

                .btn-primary:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                }

                .btn-sm {
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
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
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
