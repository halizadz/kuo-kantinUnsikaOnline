import React, { useState, useEffect } from 'react';
import { Store, Plus, Edit, Trash2, Menu as MenuIcon, Package, MapPin } from 'lucide-react';
import MenuManagement from './MenuManagement';

const PenjualDashboard = ({ user, API_BASE }) => {
  const [penjualMenus, setPenjualMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('menus'); // 'menus' atau 'orders'
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);

  useEffect(() => {
    const testAuth = async () => {
      const token = localStorage.getItem('token');
      
      try {
        const meResponse = await fetch(`${API_BASE}/me`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
        });
        
        const meData = await meResponse.json();
        console.log('=== /me response ===');
        
        if (meData.success) {
          console.log('User role:', meData.data.user.role);
          console.log('Is approved:', meData.data.user.is_approved);
        }
      } catch (error) {
        console.error('/me test error:', error);
      }
    };
    
    testAuth();
    
    if (user.is_approved) {
      loadPenjualMenus();
      loadPenjualOrders();
    }
  }, [user]); 

// File: PenjualDashboard.jsx - PERBAIKI BAGIAN INI:

// PERBAIKI loadPenjualMenus function:
const loadPenjualMenus = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('🔄 Loading penjual menus...');
    
    const response = await fetch(`${API_BASE}/penjual/menus`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
    });
    
    console.log('📊 Menu response status:', response.status);
    
    if (response.status === 403) {
      const errorData = await response.json();
      console.error('❌ Access denied:', errorData);
      alert(`Akses ditolak: ${errorData.message}`);
      return;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Menu response data:', data);
    
    if (data.success) {
      setPenjualMenus(data.data || []);
      console.log(`✅ Loaded ${data.data?.length || 0} menus`);
    } else {
      console.error('❌ API returned error:', data.message);
      alert('Gagal memuat menu: ' + data.message);
    }
  } catch (error) {
    console.error('❌ Error loading penjual menus:', error);
    alert('Error loading menus: ' + error.message);
  }
};
const loadPenjualOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Loading penjual orders...');
    
    const response = await fetch(`${API_BASE}/penjual/orders`, { // HAPUS /api/
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
    });
    
    console.log('Orders response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Orders response data:', data);
    
    if (data.success) {
      // Handle pagination data structure
      setOrders(data.data.data || data.data || []);
    } else {
      console.error('API returned error:', data.message);
      alert('Gagal memuat pesanan: ' + data.message);
    }
  } catch (error) {
    console.error('Error loading penjual orders:', error);
    alert('Error loading orders: ' + error.message);
  }
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
        alert('Status pesanan berhasil diupdate!');
        loadPenjualOrders();
      } else {
        alert('Gagal mengupdate status: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusOptions = (currentStatus, deliveryOption) => {
    const baseOptions = [
      { value: 'processing', label: 'Mulai Proses' },
      { value: 'ready', label: 'Siap' },
      { value: 'completed', label: 'Selesai' },
      { value: 'cancelled', label: 'Batalkan' }
    ];

    // Filter berdasarkan status saat ini
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
        alert('Menu berhasil dihapus!');
        loadPenjualMenus();
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
    }
  };

  if (user.role === 'penjual' && !user.is_approved) {
    return (
      <div className="approval-pending">
        <div className="container">
          <div className="approval-message">
            <Store size={48} />
            <h2>Menunggu Approval Admin</h2>
            <p>Akun penjual Anda sedang menunggu persetujuan admin. Anda akan bisa mengelola menu setelah disetujui.</p>
          </div>
        </div>
      </div>
    );
  }

//   // Tambahkan di dalam component PenjualDashboard, sebelum return
// const testRoute = async () => {
//   const token = localStorage.getItem('token');
//   try {
//     const response = await fetch(`${API_BASE}/debug/penjual-test`, {
//       headers: { 
//         'Authorization': `Bearer ${token}`,
//         'Accept': 'application/json'
//       },
//     });
//     const data = await response.json();
//     console.log('Test route response:', data);
//     alert(JSON.stringify(data, null, 2));
//   } catch (error) {
//     console.error('Test route error:', error);
//   }
// };

  return (
    <div className="penjual-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h2>Dashboard Penjual - {user.kantin_name}</h2>
          <div className="dashboard-tabs">
            <button 
              className={`tab-button ${activeTab === 'menus' ? 'active' : ''}`}
              onClick={() => setActiveTab('menus')}
            >
              Kelola Menu
            </button>
            <button 
              className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Pesanan Masuk ({orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length})
            </button>
            <button 
              className="btn-primary"
              onClick={() => {
                setEditingMenu(null);
                setIsMenuModalOpen(true);
              }}
            >
              <Plus size={20} />
              Tambah Menu
            </button>
          </div>
        </div>
        {/* <button onClick={testRoute} style={{position: 'fixed', top: 10, right: 10, zIndex: 9999}}>
  TEST ROUTE
</button> */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Menu</h3>
            <span className="stat-number">{penjualMenus.length}</span>
          </div>
          <div className="stat-card">
            <h3>Menu Tersedia</h3>
            <span className="stat-number">
              {penjualMenus.filter(menu => menu.is_available).length}
            </span>
          </div>
          <div className="stat-card">
            <h3>Rating Rata-rata</h3>
            <span className="stat-number">
              {penjualMenus.length > 0 
                ? (penjualMenus.reduce((acc, menu) => acc + (menu.rating || 0), 0) / penjualMenus.length).toFixed(1)
                : '0.0'
              }
            </span>
          </div>
        </div>

        {activeTab === 'menus' ? (
          <div className="menus-section">
            <h3>Daftar Menu</h3>
            <div className="menus-grid">
              {penjualMenus.map(menu => (
                <div key={menu.id} className="menu-management-card">
                  <img 
                    src={menu.image_url || menu.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop"} 
                    alt={menu.name} 
                  />
                  <div className="menu-management-content">
                    <h4>{menu.name}</h4>
                    <p>{menu.description}</p>
                    <div className="menu-management-meta">
                      <span className="price">Rp {Number(menu.price).toLocaleString()}</span>
                      <span className={`status ${menu.is_available ? 'available' : 'unavailable'}`}>
                        {menu.is_available ? 'Tersedia' : 'Habis'}
                      </span>
                    </div>
                    <div className="menu-management-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => {
                          setEditingMenu(menu);
                          setIsMenuModalOpen(true);
                        }}
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => deleteMenu(menu.id)}
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {penjualMenus.length === 0 && (
                <div className="empty-state">
                  <MenuIcon size={48} />
                  <p>Belum ada menu. Tambahkan menu pertama Anda!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="orders-management">
            <div className="orders-stats">
              <div className="stat-card">
                <h3>Pesanan Baru</h3>
                <span className="stat-number">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              </div>
              <div className="stat-card">
                <h3>Sedang Diproses</h3>
                <span className="stat-number">
                  {orders.filter(o => o.status === 'processing').length}
                </span>
              </div>
              <div className="stat-card">
                <h3>Siap Diantar/Ambil</h3>
                <span className="stat-number">
                  {orders.filter(o => o.status === 'ready' || o.status === 'on_delivery').length}
                </span>
              </div>
            </div>

            <div className="orders-list">
              {orders.length === 0 ? (
                <div className="empty-state">
                  <Package size={48} />
                  <p>Belum ada pesanan</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h3>Order #{order.order_number}</h3>
                        <p className="customer-info">
                          {order.user?.name} • {order.user?.phone}
                        </p>
                        <p className="order-date">
                          {new Date(order.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                      
                      <div className="order-status">
                        <span className={`status-badge status-${order.status}`}>
                          {getStatusText(order.status, order.delivery_option)}
                        </span>
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
                ))
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
    </div>
  );
};

export default PenjualDashboard;