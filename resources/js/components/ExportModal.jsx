// components/ExportModal.jsx
import React, { useState, useEffect } from 'react';
import { Download, FileText, X, Eye, Loader } from 'lucide-react';

const ExportModal = ({ isOpen, onClose, exportType, user, API_BASE }) => {
  const [filters, setFilters] = useState({});
  const [previewData, setPreviewData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Reset state ketika modal dibuka/ditutup
  useEffect(() => {
    if (isOpen) {
      setFilters({});
      setPreviewData([]);
    }
  }, [isOpen]);

  // Filter options berdasarkan export type
  const getFilterOptions = () => {
    const baseOptions = {
      users: [
        { name: 'role', label: 'Role', type: 'select', options: [
          { value: 'all', label: 'Semua Role' },
          { value: 'mahasiswa', label: 'Mahasiswa' },
          { value: 'penjual', label: 'Penjual' },
          { value: 'admin', label: 'Admin' }
        ]},
        { name: 'search', label: 'Pencarian', type: 'text', placeholder: 'Cari nama, email...' }
      ],
      orders: [
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'all', label: 'Semua Status' },
          { value: 'pending', label: 'Pending' },
          { value: 'processing', label: 'Processing' },
          { value: 'ready', label: 'Ready' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
        ]},
        { name: 'date_from', label: 'Dari Tanggal', type: 'date' },
        { name: 'date_to', label: 'Sampai Tanggal', type: 'date' }
      ],
      menus: [
        { name: 'category', label: 'Kategori', type: 'select', options: [
          { value: 'all', label: 'Semua Kategori' },
          { value: 'main', label: 'Makanan Utama' },
          { value: 'snack', label: 'Snack' },
          { value: 'drink', label: 'Minuman' },
          { value: 'dessert', label: 'Dessert' }
        ]},
        { name: 'is_available', label: 'Ketersediaan', type: 'select', options: [
          { value: 'all', label: 'Semua' },
          { value: 'true', label: 'Tersedia' },
          { value: 'false', label: 'Habis' }
        ]}
      ],
      ratings: [
        { name: 'min_rating', label: 'Rating Minimal', type: 'select', options: [
          { value: '', label: 'Semua Rating' },
          { value: '4', label: '4 Bintang ke atas' },
          { value: '3', label: '3 Bintang ke atas' },
          { value: '2', label: '2 Bintang ke atas' },
          { value: '1', label: '1 Bintang ke atas' }
        ]}
      ]
    };

    return baseOptions[exportType] || [];
  };

  // Preview data sebelum export
  const handlePreview = async () => {
    setIsPreviewLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      // Tambahkan filter ke query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value);
        }
      });

      let endpoint = '';
      switch (exportType) {
        case 'users':
          endpoint = `${API_BASE}/admin/users?${queryParams}&limit=5`;
          break;
        case 'orders':
          endpoint = user?.role === 'admin' 
            ? `${API_BASE}/admin/orders?${queryParams}&limit=5`
            : `${API_BASE}/penjual/orders?${queryParams}&limit=5`;
          break;
        case 'menus':
          endpoint = user?.role === 'admin'
            ? `${API_BASE}/admin/menus?${queryParams}&limit=5`
            : `${API_BASE}/penjual/menus?${queryParams}&limit=5`;
          break;
        case 'ratings':
          endpoint = user?.role === 'admin'
            ? `${API_BASE}/admin/ratings?${queryParams}&limit=5`
            : `${API_BASE}/penjual/ratings?${queryParams}&limit=5`;
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setPreviewData(data.data.data || data.data || []);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      setPreviewData([]);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Download export file
  const handleExport = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      // Tambahkan filter ke query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value);
        }
      });

      let endpoint = '';
      switch (exportType) {
        case 'users':
          endpoint = `${API_BASE}/admin/export/users?${queryParams}`;
          break;
        case 'orders':
          endpoint = user?.role === 'admin'
            ? `${API_BASE}/admin/export/orders?${queryParams}`
            : `${API_BASE}/penjual/export/orders?${queryParams}`;
          break;
        case 'menus':
          endpoint = user?.role === 'admin'
            ? `${API_BASE}/admin/export/menus?${queryParams}`
            : `${API_BASE}/penjual/export/menus?${queryParams}`;
          break;
        case 'ratings':
          endpoint = user?.role === 'admin'
            ? `${API_BASE}/admin/export/ratings?${queryParams}`
            : `${API_BASE}/penjual/export/ratings?${queryParams}`;
          break;
        default:
          return;
      }

      // Download file
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // Dapatkan filename dari header response atau buat default
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `${exportType}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch) filename = filenameMatch[1];
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        onClose(); // Tutup modal setelah berhasil export
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render preview data berdasarkan type
  const renderPreviewData = () => {
    if (previewData.length === 0) {
      return (
        <div className="empty-preview">
          <FileText size={48} />
          <p>Tidak ada data untuk ditampilkan</p>
        </div>
      );
    }

    switch (exportType) {
      case 'users':
        return previewData.map((user) => (
          <div key={user.id} className="preview-item">
            <div className="preview-row">
              <span className="preview-label">Nama:</span>
              <span className="preview-value">{user.name}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Email:</span>
              <span className="preview-value">{user.email}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Role:</span>
              <span className="preview-value">{user.role}</span>
            </div>
            {user.kantin_name && (
              <div className="preview-row">
                <span className="preview-label">Kantin:</span>
                <span className="preview-value">{user.kantin_name}</span>
              </div>
            )}
          </div>
        ));

      case 'orders':
        return previewData.map((order) => (
          <div key={order.id} className="preview-item">
            <div className="preview-row">
              <span className="preview-label">Order #:</span>
              <span className="preview-value">{order.order_number}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Customer:</span>
              <span className="preview-value">{order.user?.name}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Total:</span>
              <span className="preview-value">Rp {Number(order.total_price).toLocaleString()}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Status:</span>
              <span className={`status-badge status-${order.status}`}>
                {order.status}
              </span>
            </div>
          </div>
        ));

      case 'menus':
        return previewData.map((menu) => (
          <div key={menu.id} className="preview-item">
            <div className="preview-row">
              <span className="preview-label">Nama Menu:</span>
              <span className="preview-value">{menu.name}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Harga:</span>
              <span className="preview-value">Rp {Number(menu.price).toLocaleString()}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Kategori:</span>
              <span className="preview-value">{menu.category}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Status:</span>
              <span className={`status-badge ${menu.is_available ? 'available' : 'unavailable'}`}>
                {menu.is_available ? 'Tersedia' : 'Habis'}
              </span>
            </div>
          </div>
        ));

      case 'ratings':
        return previewData.map((rating) => (
          <div key={rating.id} className="preview-item">
            <div className="preview-row">
              <span className="preview-label">User:</span>
              <span className="preview-value">{rating.user?.name}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Menu:</span>
              <span className="preview-value">{rating.menu?.name}</span>
            </div>
            <div className="preview-row">
              <span className="preview-label">Rating:</span>
              <span className="preview-value">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      color: i < rating.rating ? '#ffc107' : '#e4e5e9',
                      marginRight: '2px'
                    }}
                  >
                    ★
                  </span>
                ))}
                ({rating.rating}/5)
              </span>
            </div>
            {rating.review && (
              <div className="preview-row">
                <span className="preview-label">Review:</span>
                <span className="preview-value">"{rating.review}"</span>
              </div>
            )}
          </div>
        ));

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const filterOptions = getFilterOptions();
  const exportTitles = {
    users: 'Export Data Users',
    orders: 'Export Data Orders',
    menus: 'Export Data Menus',
    ratings: 'Export Data Ratings'
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content export-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Download size={24} />
            <h3>{exportTitles[exportType]}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Filter Section */}
          {filterOptions.length > 0 && (
            <div className="filters-section">
              <h4>Filter Data</h4>
              <div className="filters-grid">
                {filterOptions.map((filter) => (
                  <div key={filter.name} className="filter-group">
                    <label>{filter.label}</label>
                    {filter.type === 'select' ? (
                      <select
                        value={filters[filter.name] || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          [filter.name]: e.target.value
                        }))}
                      >
                        {filter.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={filter.type}
                        value={filters[filter.name] || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          [filter.name]: e.target.value
                        }))}
                        placeholder={filter.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Section */}
          <div className="preview-section">
            <div className="preview-header">
              <h4>Preview Data</h4>
              <button 
                className="btn btn-outline btn-sm"
                onClick={handlePreview}
                disabled={isPreviewLoading}
              >
                {isPreviewLoading ? (
                  <Loader size={16} className="spin" />
                ) : (
                  <Eye size={16} />
                )}
                {isPreviewLoading ? 'Loading...' : 'Preview Data'}
              </button>
            </div>
            
            <div className="preview-content">
              {isPreviewLoading ? (
                <div className="loading-preview">
                  <Loader size={32} className="spin" />
                  <p>Memuat preview data...</p>
                </div>
              ) : (
                <div className="preview-list">
                  {renderPreviewData()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>
            Batal
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleExport}
            disabled={isLoading || previewData.length === 0}
          >
            {isLoading ? (
              <Loader size={16} className="spin" />
            ) : (
              <Download size={16} />
            )}
            {isLoading ? 'Mengekspor...' : 'Download Excel'}
          </button>
        </div>
      </div>

      <style jsx>{`
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

        .export-modal {
          background: var(--surface);
          border-radius: 16px;
          padding: 2rem;
          width: 100%;
          max-width: 600px;
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

        .modal-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-title h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.25rem;
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

        .filters-section {
          margin-bottom: 2rem;
        }

        .filters-section h4 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.875rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .filter-group select,
        .filter-group input {
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--background);
          color: var(--text-primary);
          font-size: 0.875rem;
          transition: all var(--transition-normal);
        }

        .filter-group select:focus,
        .filter-group input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .preview-section {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: var(--surface-light);
          border-bottom: 1px solid var(--border);
        }

        .preview-header h4 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .preview-content {
          padding: 1.5rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .loading-preview,
        .empty-preview {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
        }

        .preview-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .preview-item {
          padding: 1rem;
          background: var(--surface-light);
          border-radius: 8px;
          border: 1px solid var(--border-light);
        }

        .preview-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .preview-row:last-child {
          margin-bottom: 0;
        }

        .preview-label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .preview-value {
          color: var(--text-secondary);
          font-size: 0.875rem;
          text-align: right;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-pending {
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .status-processing {
          background: rgba(59, 130, 246, 0.1);
          color: var(--info);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .status-completed {
          background: rgba(34, 197, 94, 0.1);
          color: var(--success);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .status-cancelled {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .available {
          background: rgba(34, 197, 94, 0.1);
          color: var(--success);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .unavailable {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

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

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-primary);
        }

        .btn-outline:hover:not(:disabled) {
          background: var(--surface-light);
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .export-modal {
            margin: 1rem;
            padding: 1.5rem;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .preview-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .modal-actions {
            flex-direction: column;
          }

          .preview-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .preview-value {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default ExportModal;