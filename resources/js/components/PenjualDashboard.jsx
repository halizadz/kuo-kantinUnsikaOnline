import React, { useState, useEffect } from 'react';
import { 
  Store, Plus, Edit, Trash2, Menu as MenuIcon, Package, 
  MapPin, Users, TrendingUp, Clock, CheckCircle, XCircle,
  BarChart3, ShoppingBag, DollarSign, MoreVertical, ChefHat,
  ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';
import MenuManagement from './MenuManagement';

const PenjualDashboard = ({ user, API_BASE }) => {
  const [penjualMenus, setPenjualMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [stats, setStats] = useState({
    totalMenus: 0,
    availableMenus: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    monthlyRevenue: 0
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user.is_approved) {
      loadPenjualMenus();
      loadPenjualOrders();
      calculateStats();
    }
  }, [user]);

  useEffect(() => {
    calculateStats();
  }, [penjualMenus, orders]);

  const loadPenjualMenus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/penjual/menus`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setPenjualMenus(data.data || []);
      }
    } catch (error) {
      console.error('Error loading penjual menus:', error);
    }
  };

  const loadPenjualOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/penjual/orders`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setOrders(data.data.data || data.data || []);
      }
    } catch (error) {
      console.error('Error loading penjual orders:', error);
    }
  };

  const calculateStats = () => {
    const totalMenus = penjualMenus.length;
    const availableMenus = penjualMenus.filter(menu => menu.is_available).length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => 
      ['pending', 'processing'].includes(order.status)
    ).length;
    const completedOrders = orders.filter(order => 
      order.status === 'completed'
    ).length;
    
    const monthlyRevenue = orders
      .filter(order => order.status === 'completed')
      .reduce((total, order) => total + parseFloat(order.total_price || 0), 0);

    setStats({
      totalMenus,
      availableMenus,
      totalOrders,
      pendingOrders,
      completedOrders,
      monthlyRevenue
    });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/penjual/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        loadPenjualOrders();
      } else {
        alert('Gagal mengupdate status: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const deleteMenu = async (menuId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus menu ini?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/penjual/menus/${menuId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (data.success) {
        loadPenjualMenus();
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
    }
  };

  const getStatusText = (status, deliveryOption) => {
    const statusMap = {
      'pending': 'Menunggu Konfirmasi',
      'processing': 'Sedang Diproses',
      'ready': deliveryOption === 'delivery' ? 'Siap Diantar' : 'Siap Diambil',
      'on_delivery': 'Sedang Diantar',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan'
    };
    return statusMap[status] || status;
  };

  const getStatusOptions = (currentStatus, deliveryOption) => {
    const baseOptions = [
      { value: 'processing', label: 'Mulai Proses' },
      { value: 'ready', label: 'Siap' },
      { value: 'completed', label: 'Selesai' },
      { value: 'cancelled', label: 'Batalkan' }
    ];

    if (currentStatus === 'pending') {
      return baseOptions.filter(opt => 
        opt.value === 'processing' || opt.value === 'cancelled'
      );
    } else if (currentStatus === 'processing') {
      return baseOptions.filter(opt => 
        opt.value === 'ready' || opt.value === 'cancelled'
      );
    } else if (currentStatus === 'ready') {
      if (deliveryOption === 'delivery') {
        return [
          { value: 'on_delivery', label: 'Mulai Antar' },
          { value: 'completed', label: 'Selesai' }
        ];
      }
      return baseOptions.filter(opt => opt.value === 'completed');
    } else if (currentStatus === 'on_delivery') {
      return baseOptions.filter(opt => opt.value === 'completed');
    }

    return [];
  };

  if (user.role === 'penjual' && !user.is_approved) {
    return (
      <div className="approval-pending">
        <div className="container">
          <div className="empty-state text-center">
            <Store size={64} />
            <h3>Menunggu Approval Admin</h3>
            <p>Akun penjual Anda sedang menunggu persetujuan admin. Anda akan bisa mengelola menu setelah disetujui.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="penjual-dashboard">
      <div className="container">
        {/* Mobile Header */}
        <div className="mobile-dashboard-header">
          <div className="mobile-header-content">
            <h1>Dashboard Penjual</h1>
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
                className={`mobile-tab ${activeTab === 'menus' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('menus');
                  setIsMobileMenuOpen(false);
                }}
              >
                <MenuIcon size={18} />
                Kelola Menu
              </button>
              <button 
                className={`mobile-tab ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('orders');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Package size={18} />
                Pesanan ({stats.pendingOrders})
              </button>
              <button 
                className="mobile-tab btn-primary"
                onClick={() => {
                  setEditingMenu(null);
                  setIsMenuModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Plus size={18} />
                Tambah Menu
              </button>
            </div>
          )}
        </div>

        {/* Desktop Dashboard Header */}
        <div className="dashboard-header desktop-only">
          <div>
            <h1>Dashboard Penjual</h1>
            <p className="dashboard-subtitle">Kelola menu dan pesanan kantin Anda</p>
          </div>
          <div className="dashboard-tabs">
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={18} />
              Overview
            </button>
            <button 
              className={`tab-button ${activeTab === 'menus' ? 'active' : ''}`}
              onClick={() => setActiveTab('menus')}
            >
              <MenuIcon size={18} />
              Kelola Menu
            </button>
            <button 
              className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} />
              Pesanan ({stats.pendingOrders})
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingMenu(null);
                setIsMenuModalOpen(true);
              }}
            >
              <Plus size={18} />
              Tambah Menu
            </button>
          </div>
        </div>

        {/* Mobile Floating Action Button */}
        <div className="mobile-fab">
          <button 
            className="fab-btn"
            onClick={() => {
              setEditingMenu(null);
              setIsMenuModalOpen(true);
            }}
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            {/* Stats Grid - Enhanced */}
            <div className="stats-grid enhanced">
              <div className="stat-card glass">
                <div className="stat-header">
                  <div className="stat-icon primary">
                    <MenuIcon size={24} />
                  </div>
                  <TrendingUp size={16} className="stat-trend" />
                </div>
                <div className="stat-content">
                  <h3>Total Menu</h3>
                  <div className="stat-number">{stats.totalMenus}</div>
                  <p className="stat-description">Menu aktif di kantin Anda</p>
                </div>
              </div>
              
              <div className="stat-card glass">
                <div className="stat-header">
                  <div className="stat-icon success">
                    <CheckCircle size={24} />
                  </div>
                  <ArrowUpRight size={16} className="stat-trend" />
                </div>
                <div className="stat-content">
                  <h3>Menu Tersedia</h3>
                  <div className="stat-number">{stats.availableMenus}</div>
                  <p className="stat-description">Siap dipesan pelanggan</p>
                </div>
              </div>
              
              <div className="stat-card glass">
                <div className="stat-header">
                  <div className="stat-icon warning">
                    <ShoppingBag size={24} />
                  </div>
                  <TrendingUp size={16} className="stat-trend" />
                </div>
                <div className="stat-content">
                  <h3>Total Pesanan</h3>
                  <div className="stat-number">{stats.totalOrders}</div>
                  <p className="stat-description">Semua waktu</p>
                </div>
              </div>
              
              <div className="stat-card glass">
                <div className="stat-header">
                  <div className="stat-icon info">
                    <Clock size={24} />
                  </div>
                  <ArrowDownRight size={16} className="stat-trend" />
                </div>
                <div className="stat-content">
                  <h3>Pending</h3>
                  <div className="stat-number">{stats.pendingOrders}</div>
                  <p className="stat-description">Perlu diproses</p>
                </div>
              </div>

              <div className="stat-card glass">
                <div className="stat-header">
                  <div className="stat-icon success">
                    <CheckCircle size={24} />
                  </div>
                  <ArrowUpRight size={16} className="stat-trend" />
                </div>
                <div className="stat-content">
                  <h3>Selesai</h3>
                  <div className="stat-number">{stats.completedOrders}</div>
                  <p className="stat-description">Pesanan berhasil</p>
                </div>
              </div>

              <div className="stat-card glass">
                <div className="stat-header">
                  <div className="stat-icon primary">
                    <DollarSign size={24} />
                  </div>
                  <TrendingUp size={16} className="stat-trend" />
                </div>
                <div className="stat-content">
                  <h3>Pendapatan</h3>
                  <div className="stat-number">Rp {stats.monthlyRevenue.toLocaleString()}</div>
                  <p className="stat-description">Bulan ini</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
              <h2>Quick Actions</h2>
              <div className="quick-actions-grid">
                <button 
                  className="quick-action-card"
                  onClick={() => {
                    setEditingMenu(null);
                    setIsMenuModalOpen(true);
                  }}
                >
                  <div className="action-icon primary">
                    <Plus size={24} />
                  </div>
                  <h4>Tambah Menu Baru</h4>
                  <p>Buat menu makanan atau minuman baru</p>
                </button>

                <button 
                  className="quick-action-card"
                  onClick={() => setActiveTab('orders')}
                >
                  <div className="action-icon warning">
                    <Package size={24} />
                  </div>
                  <h4>Lihat Pesanan</h4>
                  <p>Kelola {stats.pendingOrders} pesanan pending</p>
                </button>

                <button 
                  className="quick-action-card"
                  onClick={() => setActiveTab('menus')}
                >
                  <div className="action-icon info">
                    <Eye size={24} />
                  </div>
                  <h4>Kelola Menu</h4>
                  <p>Edit atau hapus menu yang ada</p>
                </button>

                <div className="quick-action-card">
                  <div className="action-icon success">
                    <ChefHat size={24} />
                  </div>
                  <h4>Performance</h4>
                  <p>Analisis performa kantin Anda</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity-section">
              <div className="section-header">
                <h2>Aktivitas Terbaru</h2>
                <button className="btn btn-ghost">Lihat Semua</button>
              </div>
              <div className="activity-list">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="activity-item">
                    <div className="activity-icon">
                      <Package size={16} />
                    </div>
                    <div className="activity-content">
                      <p><strong>Pesanan #{order.order_number}</strong> dari {order.user?.name}</p>
                      <span className="activity-time">
                        {new Date(order.created_at).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className={`activity-status status-${order.status}`}>
                      {getStatusText(order.status, order.delivery_option)}
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="empty-activity">
                    <Package size={48} />
                    <p>Belum ada aktivitas pesanan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Menus Tab */}
        {activeTab === 'menus' && (
          <div className="dashboard-content">
            <div className="content-header">
              <div className="header-content">
                <h2>Kelola Menu</h2>
                <p>Kelola menu makanan dan minuman kantin Anda</p>
              </div>
              <div className="mobile-add-btn">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingMenu(null);
                    setIsMenuModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  Tambah
                </button>
              </div>
            </div>
            
            <div className="content-body">
              {penjualMenus.length === 0 ? (
                <div className="empty-state">
                  <MenuIcon size={48} />
                  <h3>Belum ada menu</h3>
                  <p>Tambahkan menu pertama Anda untuk memulai</p>
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={() => setIsMenuModalOpen(true)}
                  >
                    <Plus size={18} />
                    Tambah Menu Pertama
                  </button>
                </div>
              ) : (
                <div className="menus-grid">
                  {penjualMenus.map(menu => (
                    <div key={menu.id} className="menu-management-card glass">
                      <div className="menu-image-container">
                        <img 
                          src={menu.image_url || menu.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop"} 
                          alt={menu.name} 
                        />
                        <div className="menu-overlay">
                          <span className={`status-badge ${menu.is_available ? 'available' : 'unavailable'}`}>
                            {menu.is_available ? 'Tersedia' : 'Habis'}
                          </span>
                        </div>
                      </div>
                      <div className="menu-management-content">
                        <div className="menu-header">
                          <h4>{menu.name}</h4>
                          <p className="menu-description">{menu.description}</p>
                        </div>
                        
                        <div className="menu-management-meta">
                          <span className="price">Rp {Number(menu.price).toLocaleString()}</span>
                          <div className="menu-management-actions">
                            <button 
                              className="btn-edit"
                              onClick={() => {
                                setEditingMenu(menu);
                                setIsMenuModalOpen(true);
                              }}
                            >
                              <Edit size={16} />
                              <span className="action-text">Edit</span>
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => deleteMenu(menu.id)}
                            >
                              <Trash2 size={16} />
                              <span className="action-text">Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="dashboard-content">
            <div className="content-header">
              <div className="header-content">
                <h2>Pesanan Masuk</h2>
                <p>Kelola pesanan dari pelanggan</p>
              </div>
            </div>
            
            <div className="content-body">
              {orders.length === 0 ? (
                <div className="empty-state">
                  <Package size={48} />
                  <h3>Belum ada pesanan</h3>
                  <p>Pesanan dari pelanggan akan muncul di sini</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card glass">
                      <div className="order-header">
                        <div className="order-info">
                          <div className="order-number-mobile">
                            <h3>Order #{order.order_number}</h3>
                            <span className={`status-badge status-${order.status}`}>
                              {getStatusText(order.status, order.delivery_option)}
                            </span>
                          </div>
                          <p className="customer-info">
                            {order.user?.name} • {order.user?.phone}
                          </p>
                          <p className="order-date">
                            {new Date(order.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                        
                        <div className="order-status desktop-only">
                          <div className="delivery-method">
                            {order.delivery_option === 'delivery' ? (
                              <div className="delivery-info">
                                <MapPin size={14} />
                                <span>Diantar • {order.delivery_address}</span>
                              </div>
                            ) : (
                              <div className="delivery-info">
                                <Store size={14} />
                                <span>Ambil Sendiri</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="delivery-info-mobile">
                        {order.delivery_option === 'delivery' ? (
                          <div className="delivery-info">
                            <MapPin size={14} />
                            <span>Diantar ke {order.delivery_address}</span>
                          </div>
                        ) : (
                          <div className="delivery-info">
                            <Store size={14} />
                            <span>Ambil Sendiri</span>
                          </div>
                        )}
                      </div>

                      <div className="order-items">
                        {order.order_items?.map(item => (
                          <div key={item.id} className="order-item">
                            <img 
                              src={item.menu?.image_url || item.menu?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60&h=60&fit=crop"} 
                              alt={item.menu?.name}
                              className="item-image"
                            />
                            <div className="item-details">
                              <h4>{item.menu?.name}</h4>
                              <p>Rp {Number(item.price).toLocaleString()} × {item.quantity}</p>
                            </div>
                            <div className="item-total">
                              Rp {(item.price * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="order-notes">
                          <strong>Catatan Pelanggan:</strong>
                          <p>{order.notes}</p>
                        </div>
                      )}

                      <div className="order-footer">
                        <div className="order-total">
                          <strong>Total: Rp {Number(order.total_price).toLocaleString()}</strong>
                        </div>
                        
                        <div className="order-actions">
                          <select 
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                updateOrderStatus(order.id, e.target.value);
                              }
                            }}
                            className="status-select"
                          >
                            <option value="">Ubah Status</option>
                            {getStatusOptions(order.status, order.delivery_option).map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Menu Management Modal */}
      {isMenuModalOpen && (
        <MenuManagement 
          editingMenu={editingMenu}
          onClose={() => setIsMenuModalOpen(false)}
          loadPenjualMenus={loadPenjualMenus}
          API_BASE={API_BASE}
        />
      )}

      <style jsx>{`
        .penjual-dashboard {
          min-height: 100vh;
          background: var(--background);
          padding: 2rem 0;
        }

        .dashboard-subtitle {
          color: var(--text-secondary);
          margin-top: 0.5rem;
          font-size: 1rem;
        }

        /* Enhanced Stats Grid */
        .stats-grid.enhanced {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card.glass {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          padding: 1.5rem;
          border-radius: 16px;
          transition: all var(--transition-normal);
        }

        .stat-card.glass:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
          box-shadow: var(--shadow-lg);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.primary {
          background: var(--primary-gradient);
          box-shadow: var(--primary-glow);
        }

        .stat-icon.success {
          background: linear-gradient(135deg, var(--success), #22c55e);
          box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
        }

        .stat-icon.warning {
          background: linear-gradient(135deg, var(--warning), #f59e0b);
          box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);
        }

        .stat-icon.info {
          background: linear-gradient(135deg, var(--info), #3b82f6);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }

        .stat-trend {
          color: var(--text-muted);
        }

        .stat-content h3 {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .stat-description {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0;
        }

        /* Quick Actions */
        .quick-actions-section {
          margin-bottom: 3rem;
        }

        .quick-actions-section h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .quick-action-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-normal);
          border: none;
          color: inherit;
        }

        .quick-action-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
          box-shadow: var(--shadow-lg);
        }

        .action-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: white;
        }

        .action-icon.primary {
          background: var(--primary-gradient);
        }

        .action-icon.success {
          background: linear-gradient(135deg, var(--success), #22c55e);
        }

        .action-icon.warning {
          background: linear-gradient(135deg, var(--warning), #f59e0b);
        }

        .action-icon.info {
          background: linear-gradient(135deg, var(--info), #3b82f6);
        }

        .quick-action-card h4 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .quick-action-card p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        /* Recent Activity */
        .recent-activity-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .section-header h2 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.25rem;
        }

        .activity-list {
          padding: 1rem;
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
          background: var(--surface-light);
        }

        .activity-icon {
          width: 36px;
          height: 36px;
          background: var(--surface-light);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .activity-content {
          flex: 1;
        }

        .activity-content p {
          margin: 0 0 0.25rem 0;
          color: var(--text-primary);
        }

        .activity-time {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .activity-status {
          padding: 0.5rem 1rem;
          border-radius: 20px;
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

        .status-ready, .status-completed {
          background: rgba(34, 197, 94, 0.1);
          color: var(--success);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .status-cancelled {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .empty-activity {
          text-align: center;
          padding: 3rem 2rem;
          color: var(--text-secondary);
        }

        .empty-activity p {
          margin-top: 1rem;
        }

        /* Enhanced Menu Cards */
        .menu-image-container {
          position: relative;
          height: 160px;
          overflow: hidden;
        }

        .menu-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .menu-management-card:hover .menu-image-container img {
          transform: scale(1.05);
        }

        .menu-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.7));
          display: flex;
          align-items: flex-end;
          padding: 1rem;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
        }

        .status-badge.available {
          background: var(--success);
        }

        .status-badge.unavailable {
          background: var(--error);
        }

        .menu-header {
          margin-bottom: 1rem;
        }

        .menu-header h4 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .menu-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.4;
          margin: 0;
        }

        /* Mobile Responsive Styles */
        .mobile-dashboard-header {
          display: none;
        }
        
        .mobile-fab {
          display: none;
        }
        
        .mobile-add-btn {
          display: none;
        }
        
        .desktop-only {
          display: block;
        }
        
        .menu-header-mobile {
          display: none;
        }
        
        .delivery-info-mobile {
          display: none;
        }
        
        .order-number-mobile {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          
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
          
          .mobile-tab.btn-primary {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
            justify-content: center;
          }
          
          .stats-grid.enhanced {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          
          .stat-card.glass {
            padding: 1.25rem;
          }
          
          .stat-number {
            font-size: 1.5rem;
          }
          
          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
          
          .mobile-fab {
            display: block;
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 1000;
          }
          
          .fab-btn {
            width: 60px;
            height: 60px;
            background: var(--primary-gradient);
            border: none;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            box-shadow: var(--primary-glow);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all var(--transition-normal);
          }
          
          .fab-btn:hover {
            transform: scale(1.1);
          }
          
          .mobile-add-btn {
            display: block;
          }
          
          .menu-header-mobile {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
          }
          
          .delivery-info-mobile {
            display: block;
            margin-bottom: 1rem;
          }
          
          .delivery-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-secondary);
            font-size: 0.875rem;
          }
          
          .order-number-mobile {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
          }
          
          .order-number-mobile h3 {
            margin: 0;
            font-size: 1.1rem;
          }
          
          .action-text {
            display: none;
          }
          
          .menu-management-actions {
            gap: 0.5rem;
          }
          
          .btn-edit, .btn-delete {
            padding: 0.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid.enhanced {
            grid-template-columns: 1fr;
          }
          
          .penjual-dashboard {
            padding: 1rem 0;
          }
          
          .mobile-dashboard-header {
            padding: 1rem;
          }
          
          .mobile-header-content h1 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PenjualDashboard;