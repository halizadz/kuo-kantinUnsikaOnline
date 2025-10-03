import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, Truck, Package, XCircle, 
  MapPin, Store, Calendar, Filter, Search,
  Star, Download, Eye, RefreshCw
} from 'lucide-react';

const OrderHistory = ({ user, API_BASE }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
  }, [user]);

  const loadUserOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/user/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setOrders(data.data.data || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} className="status-icon pending" />;
      case 'processing':
        return <Package size={20} className="status-icon processing" />;
      case 'ready':
        return <CheckCircle size={20} className="status-icon ready" />;
      case 'on_delivery':
        return <Truck size={20} className="status-icon delivery" />;
      case 'completed':
        return <CheckCircle size={20} className="status-icon completed" />;
      case 'cancelled':
        return <XCircle size={20} className="status-icon cancelled" />;
      default:
        return <Clock size={20} className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-warning';
      case 'processing': return 'status-info';
      case 'ready': return 'status-success';
      case 'on_delivery': return 'status-primary';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-error';
      default: return 'status-default';
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

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.penjual?.kantin_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleReorder = (order) => {
    // Implement reorder functionality
    console.log('Reorder:', order);
    alert('Fitur reorder akan segera hadir!');
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  if (loading) {
    return (
      <div className="order-history loading">
        <div className="loading-spinner"></div>
        <p>Memuat riwayat pesanan...</p>
      </div>
    );
  }

  return (
    <div className="order-history">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="gradient-text">Riwayat Pesanan</h1>
            <p>Lihat dan kelola semua pesanan Anda</p>
          </div>
          
          <button 
            className="btn btn-secondary"
            onClick={loadUserOrders}
            disabled={loading}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="order-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Cari nomor pesanan atau nama kantin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              Semua
            </button>
            <button
              className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-tab ${filterStatus === 'processing' ? 'active' : ''}`}
              onClick={() => setFilterStatus('processing')}
            >
              Diproses
            </button>
            <button
              className={`filter-tab ${filterStatus === 'ready' ? 'active' : ''}`}
              onClick={() => setFilterStatus('ready')}
            >
              Siap
            </button>
            <button
              className={`filter-tab ${filterStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              Selesai
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">
              <Package size={64} />
            </div>
            <h3>
              {searchTerm || filterStatus !== 'all' 
                ? 'Tidak ada pesanan yang sesuai' 
                : 'Belum ada pesanan'
              }
            </h3>
            <p>
              {searchTerm 
                ? 'Coba gunakan kata kunci lain' 
                : filterStatus !== 'all'
                ? `Tidak ada pesanan dengan status ${filterStatus}`
                : 'Mulai pesan makanan favorit Anda dari kantin kampus'
              }
            </p>
            {(searchTerm || filterStatus !== 'all') && (
              <button 
                className="btn btn-primary mt-3"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
              >
                Tampilkan Semua Pesanan
              </button>
            )}
          </div>
        ) : (
          <div className="orders-container">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <div className="order-number">
                      <h4>#{order.order_number}</h4>
                      <span className={`order-status ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status, order.delivery_option)}
                      </span>
                    </div>
                    
                    <div className="order-meta">
                      <div className="meta-item">
                        <Calendar size={16} />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                      <div className="meta-item">
                        <Store size={16} />
                        <span>{order.penjual?.kantin_name || 'Kantin'}</span>
                      </div>
                      <div className="meta-item">
                        <MapPin size={16} />
                        <span>
                          {order.delivery_option === 'delivery' 
                            ? `Diantar` 
                            : 'Ambil Sendiri'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="order-total">
                    <span className="total-label">Total</span>
                    <span className="total-amount">
                      Rp {Number(order.total_price || calculateTotal(order.order_items || [])).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="order-items">
                  <h5>Item Pesanan:</h5>
                  <div className="items-list">
                    {(order.order_items || []).map(item => (
                      <div key={item.id} className="order-item">
                        <img 
                          src={item.menu?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60&h=60&fit=crop"} 
                          alt={item.menu?.name}
                          className="item-image"
                        />
                        <div className="item-details">
                          <span className="item-name">{item.menu?.name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                        </div>
                        <span className="item-price">
                          Rp {Number(item.price).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                {order.delivery_option === 'delivery' && order.delivery_address && (
                  <div className="delivery-address-section">
                    <div className="address-header">
                      <MapPin size={16} />
                      <strong>Alamat Pengantaran:</strong>
                    </div>
                    <p>{order.delivery_address}</p>
                  </div>
                )}

                {/* Notes */}
                {order.notes && (
                  <div className="order-notes">
                    <strong>Catatan:</strong>
                    <p>{order.notes}</p>
                  </div>
                )}

                {/* Order Actions */}
                <div className="order-actions">
                  {order.status === 'completed' && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleReorder(order)}
                    >
                      <RefreshCw size={16} />
                      Pesan Lagi
                    </button>
                  )}
                  
                  {order.status === 'pending' && (
                    <button className="btn btn-secondary btn-sm">
                      Batalkan Pesanan
                    </button>
                  )}
                  
                  {order.status === 'ready' && order.delivery_option === 'pickup' && (
                    <button className="btn btn-primary btn-sm">
                      Konfirmasi Pengambilan
                    </button>
                  )}

                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye size={16} />
                    Lihat Detail
                  </button>

                  <button className="btn btn-ghost btn-sm">
                    <Download size={16} />
                    Invoice
                  </button>
                </div>

                {/* Rating Prompt for Completed Orders */}
                {order.status === 'completed' && !order.is_rated && (
                  <div className="rating-prompt">
                    <div className="rating-prompt-content">
                      <Star size={20} />
                      <div>
                        <strong>Beri Penilaian</strong>
                        <p>Bagaimana pengalaman pesanan Anda?</p>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm">
                      Beri Rating
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="modal-overlay">
            <div className="modal order-details-modal">
              <div className="modal-header">
                <h3>Detail Pesanan #{selectedOrder.order_number}</h3>
                <button 
                  className="modal-close"
                  onClick={() => setSelectedOrder(null)}
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="modal-body">
                {/* Add detailed order information here */}
                <p>Fitur detail pesanan akan segera hadir!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;