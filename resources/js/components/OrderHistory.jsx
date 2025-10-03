import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Truck, Package, XCircle, MapPin, Store } from 'lucide-react';

const OrderHistory = ({ user, API_BASE }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
  }, [user]);

  const loadUserOrders = async () => {
    try {
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
        return <Clock size={20} color="#f59e0b" />;
      case 'processing':
        return <Package size={20} color="#3b82f6" />;
      case 'ready':
        return <CheckCircle size={20} color="#10b981" />;
      case 'on_delivery':
        return <Truck size={20} color="#8b5cf6" />;
      case 'completed':
        return <CheckCircle size={20} color="#10b981" />;
      case 'cancelled':
        return <XCircle size={20} color="#ef4444" />;
      default:
        return <Clock size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'on_delivery': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status, deliveryOption) => {
    const statusMap = {
      'pending': 'Menunggu Konfirmasi',
      'processing': 'Sedang Diproses',
      'ready': deliveryOption === 'delivery' ? 'Sedang Diantar' : 'Siap Diambil',
      'on_delivery': 'Sedang Diantar',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <p>Memuat riwayat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history">
      <div className="container">
        <div className="page-header">
          <h2>Riwayat Pesanan</h2>
          <p>Lihat status dan riwayat pesanan Anda</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <Package size={64} />
            <p>Belum ada pesanan</p>
            <p className="text-muted">Pesanan yang Anda buat akan muncul di sini</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.order_number}</h3>
                    <p className="order-kantin">
                      <Store size={16} />
                      {order.penjual?.kantin_name}
                    </p>
                    <p className="order-date">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="order-status">
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status, order.delivery_option)}
                    </span>
                    <div className="delivery-method">
                      {order.delivery_option === 'delivery' ? (
                        <div className="delivery-info">
                          <MapPin size={14} />
                          <span>Diantar</span>
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
                        src={item.menu?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60&h=60&fit=crop"} 
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

                {order.delivery_option === 'delivery' && order.delivery_address && (
                  <div className="delivery-address-section">
                    <strong>
                      <MapPin size={16} />
                      Alamat Pengantaran:
                    </strong>
                    <p>{order.delivery_address}</p>
                  </div>
                )}

                {order.notes && (
                  <div className="order-notes">
                    <strong>Catatan:</strong>
                    <p>{order.notes}</p>
                  </div>
                )}

                <div className="order-footer">
                  <div className="order-total">
                    <strong>Total: Rp {Number(order.total_price).toLocaleString()}</strong>
                  </div>
                  
                  {order.estimated_time && (
                    <div className="estimated-time">
                      <Clock size={14} />
                      <span>
                        Estimasi: {new Date(order.estimated_time).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;