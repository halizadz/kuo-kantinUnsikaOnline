import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, X, Plus, Minus, ArrowRight, 
  MapPin, Store, Package, Trash2, Clock,
  Truck, Wallet, Shield
} from 'lucide-react';

const CartSidebar = ({ cart, setCart, isCartOpen, setIsCartOpen, user, setUser, API_BASE }) => {
  const [deliveryOption, setDeliveryOption] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      fetch(`${API_BASE}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data.user);
        }
      });
    }
  }, []);

  const updateQuantity = (menuId, amount) => {
    setCart(prev => 
      prev.map(item => 
        item.id === menuId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (menuId) => {
    setCart(prev => prev.filter(item => item.id !== menuId));
  };

  const clearCart = () => {
    if (cart.length > 0 && confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
      setCart([]);
    }
  };

  const groupedCart = cart.reduce((acc, item) => {
    const penjualId = item.penjual_id;
    if (!acc[penjualId]) {
      acc[penjualId] = {
        kantin_name: item.penjual?.kantin_name || 'Kantin',
        items: []
      };
    }
    acc[penjualId].items.push(item);
    return acc;
  }, {});

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = deliveryOption === 'delivery' ? 0 : 0; // Gratis ongkir
  const finalTotal = totalPrice + deliveryFee;

  const handleCheckout = async () => {
    if (!user) {
      alert("Silakan login untuk melanjutkan pemesanan.");
      return;
    }

    if (cart.length === 0) {
      alert("Keranjang Anda kosong.");
      return;
    }

    if (deliveryOption === 'delivery' && !deliveryAddress.trim()) {
      alert("Silakan masukkan alamat pengantaran.");
      return;
    }

    if (!confirm(`Total pesanan Anda Rp ${finalTotal.toLocaleString()}. Lanjutkan?`)) {
      return;
    }

    setIsCheckingOut(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const orderData = {
        items: cart.map(item => ({
          menu_id: parseInt(item.id),
          quantity: parseInt(item.quantity)
        })),
        delivery_option: deliveryOption,
        delivery_address: deliveryOption === 'delivery' ? deliveryAddress : '',
        notes: notes || ''
      };

      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Show success toast
        const event = new CustomEvent('showToast', {
          detail: { 
            message: `Pesanan berhasil! Nomor: ${result.data.map(o => o.order_number).join(', ')}`, 
            type: 'success' 
          }
        });
        window.dispatchEvent(event);
        
        setCart([]);
        setDeliveryOption('pickup');
        setDeliveryAddress('');
        setNotes('');
        setIsCartOpen(false);
      } else {
        const errorMsg = result.errors 
          ? Object.values(result.errors).flat().join('\n')
          : result.message;
        alert('❌ Gagal membuat pesanan:\n' + errorMsg);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('❌ Terjadi kesalahan saat checkout: ' + error.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div 
      className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
      onClick={() => setIsCartOpen(false)}
    >
      <div 
        className="cart-sidebar" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title">
            <div className="title-content">
              <ShoppingCart size={24} />
              <h3>Keranjang Belanja</h3>
              {totalItems > 0 && (
                <span className="cart-count">{totalItems} item</span>
              )}
            </div>
            {cart.length > 0 && (
              <button 
                className="btn-clear-cart"
                onClick={clearCart}
              >
                Kosongkan
              </button>
            )}
          </div>
          <button 
            className="close-cart"
            onClick={() => setIsCartOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">
                <Package size={64} />
              </div>
              <h4>Keranjang Kosong</h4>
              <p>Belum ada item di keranjang belanja Anda</p>
              <button 
                className="btn btn-primary"
                onClick={() => setIsCartOpen(false)}
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <>
              {/* Delivery Options */}
              <div className="delivery-section">
                <h4 className="section-title">
                  <Truck size={20} />
                  Pilihan Pengantaran
                </h4>
                
                <div className="delivery-options">
                  <label className={`delivery-option ${deliveryOption === 'pickup' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      value="pickup" 
                      checked={deliveryOption === 'pickup'}
                      onChange={(e) => setDeliveryOption(e.target.value)}
                    />
                    <div className="option-content">
                      <Store size={20} />
                      <div className="option-text">
                        <span className="option-title">Ambil Sendiri</span>
                        <span className="option-subtitle">Datang ke kantin</span>
                      </div>
                    </div>
                  </label>
                  
                  <label className={`delivery-option ${deliveryOption === 'delivery' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      value="delivery" 
                      checked={deliveryOption === 'delivery'}
                      onChange={(e) => setDeliveryOption(e.target.value)}
                    />
                    <div className="option-content">
                      <MapPin size={20} />
                      <div className="option-text">
                        <span className="option-title">Diantar</span>
                        <span className="option-subtitle">Gratis ongkir</span>
                      </div>
                    </div>
                  </label>
                </div>

                {deliveryOption === 'delivery' && (
                  <div className="delivery-address">
                    <label>Alamat Pengantaran</label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Masukkan alamat lengkap pengantaran..."
                      rows="3"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="notes-section">
                <label>Catatan untuk penjual (opsional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Jangan terlalu pedas, tambah kantong plastik, dll."
                  rows="2"
                />
              </div>

              {/* Cart Items */}
              <div className="cart-items-section">
                <h4 className="section-title">Item Pesanan</h4>
                {Object.entries(groupedCart).map(([penjualId, group]) => (
                  <div key={penjualId} className="kantin-group">
                    <div className="kantin-header">
                      <Store size={16} />
                      <span>{group.kantin_name}</span>
                    </div>
                    <div className="cart-items">
                      {group.items.map(item => (
                        <div key={item.id} className="cart-item">
                          <img 
                            src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop"} 
                            alt={item.name}
                            className="item-image"
                          />
                          <div className="item-details">
                            <h5 className="item-name">{item.name}</h5>
                            <p className="item-price">Rp {Number(item.price).toLocaleString()}</p>
                            <div className="quantity-controls">
                              <button 
                                className="quantity-btn"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="quantity">{item.quantity}</span>
                              <button 
                                className="quantity-btn"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="item-actions">
                            <span className="item-total">
                              Rp {(item.price * item.quantity).toLocaleString()}
                            </span>
                            <button 
                              className="remove-btn"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal ({totalItems} item)</span>
                <span>Rp {totalPrice.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Biaya Pengantaran</span>
                <span className="free">Gratis</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-total">
                <span>Total Pembayaran</span>
                <span className="total-price">Rp {finalTotal.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="delivery-info">
              <Clock size={16} />
              <span>
                Estimasi: {deliveryOption === 'delivery' ? '20-30 menit' : '10-15 menit'}
              </span>
            </div>

            <div className="security-info">
              <Shield size={14} />
              <span>Pembayaran aman dan terenkripsi</span>
            </div>
            
            <button 
              className={`checkout-btn ${isCheckingOut ? 'loading' : ''}`}
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <>
                  <div className="spinner"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <Wallet size={20} />
                  <span>Lanjutkan ke Pembayaran</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;