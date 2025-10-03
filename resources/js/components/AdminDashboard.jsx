import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Store, Users, BarChart3, CheckCircle, 
  XCircle, TrendingUp, DollarSign, Package, Clock,
  Search, Filter, MoreVertical, Eye, Download,
  UserCheck, UserX, AlertCircle
} from 'lucide-react';

const AdminDashboard = ({ user, API_BASE }) => {
  const [adminData, setAdminData] = useState({
    users: [],
    pendingPenjual: [],
    stats: null
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const statsResponse = await fetch(`${API_BASE}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const statsData = await statsResponse.json();
      
      const usersResponse = await fetch(`${API_BASE}/admin/users?role=penjual`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const usersData = await usersResponse.json();
      
      if (statsData.success && usersData.success) {
        setAdminData({
          stats: statsData.data,
          pendingPenjual: usersData.data.data.filter(user => !user.is_approved),
          users: usersData.data.data
        });
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const approvePenjual = async (penjualId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/penjual/${penjualId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        loadAdminData();
      }
    } catch (error) {
      console.error('Error approving penjual:', error);
    }
  };

  const rejectPenjual = async (penjualId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/penjual/${penjualId}/reject`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (data.success) {
        loadAdminData();
      }
    } catch (error) {
      console.error('Error rejecting penjual:', error);
    }
  };

  // Filter users based on search and status
  const filteredUsers = adminData.users.filter(user => {
    const matchesSearch = user.kantin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'approved' && user.is_approved) ||
                         (statusFilter === 'pending' && !user.is_approved);
    return matchesSearch && matchesStatus;
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <MoreVertical size={24} />
            </button>
          </div>
          
          {isMobileMenuOpen && (
            <div className="mobile-tabs-menu">
              <button 
                className={`mobile-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('overview');
                  setIsMobileMenuOpen(false);
                }}
              >
                <BarChart3 size={18} />
                Overview
              </button>
              <button 
                className={`mobile-tab ${activeTab === 'approvals' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('approvals');
                  setIsMobileMenuOpen(false);
                }}
              >
                <UserCheck size={18} />
                Approvals ({adminData.pendingPenjual.length})
              </button>
              <button 
                className={`mobile-tab ${activeTab === 'penjual' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('penjual');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Store size={18} />
                Semua Penjual
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

        {/* Navigation Tabs */}


        {/* Overview Tab */}
        {activeTab === 'overview' && adminData.stats && (
          <div className="overview-section">
            {/* Stats Grid */}
            <div className="stats-grid-enhanced">
              <div className="stat-card-enhanced primary">
                <div className="stat-icon-enhanced">
                  <GraduationCap size={32} />
                </div>
                <div className="stat-content-enhanced">
                  <h3>Total Mahasiswa</h3>
                  <div className="stat-number-enhanced">{adminData.stats.total_mahasiswa}</div>
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
                  <div className="stat-number-enhanced">{adminData.stats.total_penjual}</div>
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
                  <div className="stat-number-enhanced">{adminData.stats.penjual_approved}</div>
                  <div className="stat-subtitle">
                    {Math.round((adminData.stats.penjual_approved / adminData.stats.total_penjual) * 100)}% dari total
                  </div>
                </div>
              </div>
              
              <div className="stat-card-enhanced warning">
                <div className="stat-icon-enhanced">
                  <AlertCircle size={32} />
                </div>
                <div className="stat-content-enhanced">
                  <h3>Menunggu Approval</h3>
                  <div className="stat-number-enhanced">{adminData.stats.penjual_pending}</div>
                  <div className="stat-subtitle urgent">
                    Perlu tindakan segera
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
                  onClick={() => setActiveTab('approvals')}
                >
                  <div className="action-icon warning">
                    <UserCheck size={24} />
                  </div>
                  <div className="action-content">
                    <h4>Review Pendaftaran</h4>
                    <p>Tinjau penjual yang menunggu approval</p>
                    {adminData.pendingPenjual.length > 0 && (
                      <span className="action-badge">{adminData.pendingPenjual.length} pending</span>
                    )}
                  </div>
                </button>
                
                <button 
                  className="quick-action-card"
                  onClick={() => setActiveTab('penjual')}
                >
                  <div className="action-icon primary">
                    <Store size={24} />
                  </div>
                  <div className="action-content">
                    <h4>Kelola Penjual</h4>
                    <p>Lihat semua penjual terdaftar</p>
                  </div>
                </button>
                
                <button 
                  className="quick-action-card"
                  onClick={() => {
                    // Export functionality
                    alert('Fitur export laporan akan segera hadir!');
                  }}
                >
                  <div className="action-icon success">
                    <Download size={24} />
                  </div>
                  <div className="action-content">
                    <h4>Export Laporan</h4>
                    <p>Download data statistik</p>
                  </div>
                </button>
                
                <button 
                  className="quick-action-card"
                  onClick={() => {
                    // Analytics functionality
                    alert('Fitur analytics akan segera hadir!');
                  }}
                >
                  <div className="action-icon info">
                    <BarChart3 size={24} />
                  </div>
                  <div className="action-content">
                    <h4>Analytics</h4>
                    <p>Lihat analisis mendalam</p>
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
                    onClick={() => setActiveTab('approvals')}
                  >
                    Lihat Semua
                  </button>
                </div>
                <div className="preview-grid">
                  {adminData.pendingPenjual.slice(0, 3).map(penjual => (
                    <div key={penjual.id} className="preview-card">
                      <div className="preview-content">
                        <h4>{penjual.kantin_name}</h4>
                        <p className="preview-owner">Oleh: {penjual.name}</p>
                        <p className="preview-location">{penjual.location}</p>
                      </div>
                      <div className="preview-actions">
                        <button 
                          className="btn-approve-sm"
                          onClick={() => approvePenjual(penjual.id)}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          className="btn-reject-sm"
                          onClick={() => rejectPenjual(penjual.id)}
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
        {activeTab === 'approvals' && (
          <div className="content-section">
            <div className="section-header">
              <div className="section-title">
                <UserCheck size={24} />
                <h2>Penjual Menunggu Approval</h2>
                <span className="section-count">{adminData.pendingPenjual.length} pending</span>
              </div>
              <div className="section-actions">
                <div className="search-box">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Cari penjual..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="content-body">
              <div className="approvals-grid">
                {adminData.pendingPenjual.filter(penjual => 
                  penjual.kantin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  penjual.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(penjual => (
                  <div key={penjual.id} className="approval-card">
                    <div className="approval-header">
                      <div className="kantin-avatar">
                        <Store size={24} />
                      </div>
                      <div className="kantin-info">
                        <h3>{penjual.kantin_name}</h3>
                        <p className="kantin-owner">Pemilik: {penjual.name}</p>
                      </div>
                      <span className="status-badge pending">Menunggu Approval</span>
                    </div>
                    
                    <div className="approval-details">
                      <div className="detail-item">
                        <strong>Email:</strong>
                        <span>{penjual.email}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Lokasi:</strong>
                        <span>{penjual.location}</span>
                      </div>
                      {penjual.phone && (
                        <div className="detail-item">
                          <strong>Telepon:</strong>
                          <span>{penjual.phone}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <strong>Tanggal Daftar:</strong>
                        <span>{new Date(penjual.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                    
                    <div className="approval-actions">
                      <button 
                        className="btn-approve"
                        onClick={() => approvePenjual(penjual.id)}
                      >
                        <CheckCircle size={18} />
                        Setujui Penjual
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => rejectPenjual(penjual.id)}
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
                    <h3>Tidak ada penjual yang menunggu approval</h3>
                    <p>Semua pendaftaran penjual telah diproses</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Penjual Tab */}
        {activeTab === 'penjual' && (
          <div className="content-section">
            <div className="section-header">
              <div className="section-title">
                <Store size={24} />
                <h2>Semua Penjual Terdaftar</h2>
                <span className="section-count">{filteredUsers.length} penjual</span>
              </div>
              <div className="section-actions">
                <div className="search-box">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Cari penjual..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                  <h3>{searchTerm || statusFilter !== 'all' ? 'Penjual tidak ditemukan' : 'Belum ada penjual terdaftar'}</h3>
                  <p>
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Coba dengan pencarian atau filter lain' 
                      : 'Penjual yang mendaftar akan muncul di sini'
                    }
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
                    {filteredUsers.map(penjual => (
                      <div key={penjual.id} className="table-row">
                        <div className="table-col">
                          <div className="kantin-name">{penjual.kantin_name}</div>
                        </div>
                        
                        <div className="table-col">
                          <div className="owner-name">{penjual.name}</div>
                        </div>
                        
                        <div className="table-col">
                          <div className="contact-email">{penjual.email}</div>
                          {penjual.phone && (
                            <div className="contact-phone">{penjual.phone}</div>
                          )}
                        </div>
                        
                        <div className="table-col">
                          <div className="location-text">{penjual.location}</div>
                        </div>
                        
                        <div className="table-col">
                          <span className={`status-badge ${penjual.is_approved ? 'approved' : 'pending'}`}>
                            {penjual.is_approved ? 'Disetujui' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="table-col">
                          <div className="action-buttons">
                            <button 
                              className="btn-icon"
                              onClick={() => {
                                // View details
                                alert(`Detail penjual: ${penjual.kantin_name}`);
                              }}
                            >
                              <Eye size={16} />
                            </button>
                            {!penjual.is_approved && (
                              <button 
                                className="btn-approve-sm"
                                onClick={() => approvePenjual(penjual.id)}
                              >
                                <CheckCircle size={16} />
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
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: var(--background);
          padding: 2rem 0;
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
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .stat-card-enhanced.primary::before { background: var(--primary); }
        .stat-card-enhanced.secondary::before { background: var(--secondary); }
        .stat-card-enhanced.success::before { background: var(--success); }
        .stat-card-enhanced.warning::before { background: var(--warning); }

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

        .stat-card-enhanced.primary .stat-icon-enhanced { background: var(--primary); }
        .stat-card-enhanced.secondary .stat-icon-enhanced { background: var(--secondary); }
        .stat-card-enhanced.success .stat-icon-enhanced { background: var(--success); }
        .stat-card-enhanced.warning .stat-icon-enhanced { background: var(--warning); }

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

        .action-icon.primary { background: var(--primary); }
        .action-icon.success { background: var(--success); }
        .action-icon.warning { background: var(--warning); }
        .action-icon.info { background: var(--info); }

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

        .btn-approve, .btn-reject {
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

        .btn-approve-sm, .btn-reject-sm {
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