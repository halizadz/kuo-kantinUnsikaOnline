import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, ArrowRight, MapPin, Store } from 'lucide-react';

const CartSidebar = ({ cart, setCart, isCartOpen, setIsCartOpen, user, setUser, API_BASE }) => {
  const [deliveryOption, setDeliveryOption] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
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
        } else {
          console.error('User not authenticated');
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

  const groupedCart = cart.reduce((acc, item) => {
    const penjualId = item.penjual_id;
    if (!acc[penjualId]) {
      acc[penjualId] = {
        kantin_name: item.penjual.kantin_name,
        items: []
      };
    }
    acc[penjualId].items.push(item);
    return acc;
  }, {});

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!user) {
      alert("Silakan login untuk melanjutkan pemesanan.");
      return;
    }

    if (cart.length === 0) {
      alert("Keranjang Anda kosong.");
      return;
    }

    // Validasi alamat untuk pengantaran
    if (deliveryOption === 'delivery' && !deliveryAddress.trim()) {
      alert("Silakan masukkan alamat pengantaran.");
      return;
    }

    if (!confirm(`Total pesanan Anda Rp ${totalPrice.toLocaleString()}. Lanjutkan?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // PERBAIKAN PENTING: Kirim string kosong jika pickup, bukan null
      const orderData = {
        items: cart.map(item => ({
          menu_id: parseInt(item.id),
          quantity: parseInt(item.quantity)
        })),
        delivery_option: deliveryOption,
        delivery_address: deliveryOption === 'delivery' ? deliveryAddress : '', // String kosong, BUKAN null
        notes: notes || '' // String kosong, BUKAN null
      };

      console.log('Sending order data:', orderData);

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
      
      console.log('Order response:', result);

      if (result.success) {
        alert('Pesanan berhasil dibuat!\n\nNomor Pesanan:\n' + 
              result.data.map(o => o.order_number).join('\n'));
        setCart([]);
        setDeliveryOption('pickup');
        setDeliveryAddress('');
        setNotes('');
        setIsCartOpen(false);
      } else {
        const errorMsg = result.errors 
          ? Object.values(result.errors).flat().join('\n')
          : result.message;
        alert('Gagal membuat pesanan:\n' + errorMsg);
        console.error('Order error details:', result);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Terjadi kesalahan saat checkout: ' + error.message);
    }
  };

  return (
    <div 
      className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
      onClick={() => setIsCartOpen(false)}
    >
      <div 
        className={`cart-sidebar ${isCartOpen ? 'open' : ''}`} 
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <div className="cart-header" style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Keranjang Anda</h3>
          <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        
        <div className="cart-items" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
              <ShoppingCart size={48} color="#ccc" />
              <p style={{ color: '#666' }}>Keranjang belanja masih kosong</p>
            </div>
          ) : (
            <>
              {/* Delivery Options */}
              <div className="delivery-section" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '0.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={20} />
                  Pilihan Pengantaran
                </h4>
                
                <div className="delivery-options" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      value="pickup" 
                      checked={deliveryOption === 'pickup'}
                      onChange={(e) => setDeliveryOption(e.target.value)}
                    />
                    <Store size={16} />
                    Ambil Sendiri
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      value="delivery" 
                      checked={deliveryOption === 'delivery'}
                      onChange={(e) => setDeliveryOption(e.target.value)}
                    />
                    <MapPin size={16} />
                    Diantar
                  </label>
                </div>

                {deliveryOption === 'delivery' && (
                  <div className="delivery-address" style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Alamat Pengantaran:
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Masukkan alamat lengkap pengantaran..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '0.5rem',
                        resize: 'vertical',
                        minHeight: '80px'
                      }}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="notes-section" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Catatan untuk penjual (opsional):
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Jangan terlalu pedas, tambah kantong plastik, dll."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '0.5rem',
                    resize: 'vertical',
                    minHeight: '60px'
                  }}
                />
              </div>

              {/* Cart Items */}
              {Object.values(groupedCart).map((group, index) => (
                <div key={index} className="kantin-group" style={{ marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>
                    Pesanan dari: <strong>{group.kantin_name}</strong>
                  </h4>
                  {group.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <img 
                        src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"} 
                        alt={item.name} 
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.5rem' }}
                      />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h5 style={{ margin: 0, fontSize: '1rem' }}>{item.name}</h5>
                          <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={16} color="#999" />
                          </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <div className="quantity-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
                            <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer' }}><Minus size={14} /></button>
                            <span style={{ padding: '0 0.5rem', fontWeight: 'bold' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer' }}><Plus size={14} /></button>
                          </div>
                          <span style={{ fontWeight: '600' }}>
                            Rp {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="cart-footer" style={{ padding: '1.5rem', borderTop: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem' }}>
              <strong>Total Harga:</strong>
              <strong>Rp {totalPrice.toLocaleString()}</strong>
            </div>
            
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
              <strong>Metode: </strong>
              {deliveryOption === 'delivery' ? 'Diantar' : 'Ambil Sendiri'}
              {deliveryOption === 'delivery' && deliveryAddress && (
                <div style={{ marginTop: '0.25rem' }}>
                  <strong>Alamat: </strong>
                  {deliveryAddress}
                </div>
              )}
            </div>
            
            <button 
              onClick={handleCheckout}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: 'white',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Lanjutkan ke Pembayaran <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;