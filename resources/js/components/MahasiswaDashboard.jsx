import React, { useState, useEffect } from 'react';
import { Store, MapPin, Star, Clock, ChevronRight, Plus, Search, ArrowLeft, ShoppingCart, Heart, Truck, Shield } from 'lucide-react';

const MahasiswaDashboard = ({ user, cart, setCart, API_BASE }) => {
  const [kantinList, setKantinList] = useState([]);
  const [selectedKantin, setSelectedKantin] = useState(null);
  const [kantinMenus, setKantinMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadKantinList();
  }, []);

const loadKantinList = async () => {
  try {
    setLoading(true);
    // GANTI INI - dari endpoint admin ke public
    const response = await fetch(`${API_BASE}/penjual`);
    const data = await response.json();
    
    if (data.success) {
      const approvedPenjual = data.data.data; // Sudah difilter approved di backend
      setKantinList(approvedPenjual);
    }
  } catch (error) {
    console.error('Error loading kantin:', error);
  } finally {
    setLoading(false);
  }
};

  const loadKantinMenus = async (penjualId) => {
    try {
      const response = await fetch(`${API_BASE}/menus?penjual_id=${penjualId}`);
      const data = await response.json();
      
      if (data.success) {
        setKantinMenus(data.data.data || []);
      }
    } catch (error) {
      console.error('Error loading kantin menus:', error);
      setKantinMenus([]);
    }
  };

  const selectKantin = (kantin) => {
    setSelectedKantin(kantin);
    loadKantinMenus(kantin.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (menu) => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk memesan');
      return;
    }
    
    setCart(prev => {
      const existingItem = prev.find(item => item.id === menu.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === menu.id 
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...menu, quantity: 1 }];
    });
    
    alert(`${menu.name} ditambahkan ke keranjang!`);
  };

  const filteredKantin = kantinList.filter(kantin => 
    kantin.kantin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (kantin.location && kantin.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper untuk format image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE.replace('/api', '')}/storage/${imagePath}`;
  };

  // Tampilan detail kantin dengan menu (untuk pemesanan)
  if (selectedKantin) {
    return (
      <div className="kantin-detail-page">
        <div className="container">
          <button 
            onClick={() => setSelectedKantin(null)}
            className="back-button"
          >
            <ArrowLeft size={20} />
            Kembali ke Daftar Kantin
          </button>

          <div className="kantin-hero">
            <div className="kantin-hero-content">
              <div className="kantin-icon">
                <Store size={48} />
              </div>
              <div className="kantin-info">
                <h1>{selectedKantin.kantin_name}</h1>
                <p className="kantin-location">
                  <MapPin size={18} />
                  {selectedKantin.location || 'Lokasi tidak tersedia'}
                </p>
                <p className="kantin-owner">
                  Pemilik: {selectedKantin.name}
                </p>
              </div>
            </div>
          </div>

          <div className="menu-header">
            <h2>Menu Tersedia</h2>
            {cart.length > 0 && (
              <div className="cart-indicator">
                <ShoppingCart size={20} />
                {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} item
              </div>
            )}
          </div>
          
          {kantinMenus.length === 0 ? (
            <div className="empty-state">
              <Store size={64} />
              <p>Belum ada menu tersedia di kantin ini</p>
            </div>
          ) : (
            <div className="menu-grid">
              {kantinMenus.map(menu => (
                <div key={menu.id} className="menu-card">
                  <div className="menu-card-header">
                    <img 
                      src={getImageUrl(menu.image)} 
                      alt={menu.name}
                    />
                    {menu.is_popular && <div className="popular-badge">🔥 Populer</div>}
                    {!menu.is_available && (
                      <div className="unavailable-overlay">
                        Habis
                      </div>
                    )}
                    <button className="favorite-btn">
                      <Heart size={18} />
                    </button>
                  </div>
                  
                  <div className="menu-card-content">
                    <h3>{menu.name}</h3>
                    <p>{menu.description}</p>
                    
                    <div className="menu-meta">
                      <div className="rating">
                        <Star size={16} fill="currentColor" />
                        <span>{menu.rating || '4.5'}</span>
                      </div>
                      <div className="prep-time">
                        <Clock size={16} />
                        <span>{menu.prep_time || 15} menit</span>
                      </div>
                    </div>
                    
                    <div className="menu-card-footer">
                      <span className="price">
                        Rp {Number(menu.price).toLocaleString('id-ID')}
                      </span>
                      <button 
                        className={`add-to-cart-btn ${!menu.is_available ? 'disabled' : ''}`}
                        onClick={() => addToCart(menu)}
                        disabled={!menu.is_available}
                      >
                        <Plus size={18} />
                        Pesan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Tampilan daftar kantin (halaman utama)
  return (
    <div className="kantin-list-page">
            {/* Hero Section */}
            <section className="hero">
              <div className="container">
                <div className="hero-content">
                  <div className="hero-text">
                    <h2>Nikmati Makanan Kantin Kampus dengan Cara Modern</h2>
                    <p>Pesan makanan favoritmu tanpa antri. Cepat, praktis, dan pastinya enak!</p>
                    <div className="hero-stats">
                      <div className="stat">
                        <strong>500+</strong>
                        <span>Menu Variatif</span>
                      </div>
                      <div className="stat">
                        <strong>4.9</strong>
                        <span>Rating</span>
                      </div>
                      <div className="stat">
                        <strong>15min</strong>
                        <span>Rata-rata Pengiriman</span>
                      </div>
                    </div>
                  </div>
                  <div className="hero-image">
                    <img 
                      src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop" 
                      alt="Delicious Food" 
                    />
                  </div>
                </div>
              </div>
            </section>
      
            {/* Features */}
            <section className="features">
              <div className="container">
                <div className="features-grid">
                  <div className="feature-card">
                    <Truck size={48} />
                    <h3>Gratis Ongkir</h3>
                    <p>Gratis pengiriman untuk seluruh kampus</p>
                  </div>
                  <div className="feature-card">
                    <Clock size={48} />
                    <h3>15 Menit</h3>
                    <p>Pesanan sampai dalam 15 menit</p>
                  </div>
                  <div className="feature-card">
                    <Shield size={48} />
                    <h3>Terjamin</h3>
                    <p>Kualitas makanan terjamin</p>
                  </div>
                  <div className="feature-card">
                    <Star size={48} />
                    <h3>4.9 Rating</h3>
                    <p>Dari 2000+ ulasan</p>
                  </div>
                </div>
              </div>
            </section>

      {/* Kantin List */}
      <div className="container">
        {loading ? (
          <div className="loading">
            <p>Memuat daftar kantin...</p>
          </div>
        ) : filteredKantin.length === 0 ? (
          <div className="empty-state">
            <Store size={64} />
            <p>{searchTerm ? 'Kantin tidak ditemukan' : 'Belum ada kantin yang terdaftar'}</p>
          </div>
        ) : (
          <div className="kantin-grid">
            {filteredKantin.map(kantin => (
              <div 
                key={kantin.id}
                className="kantin-card"
                onClick={() => selectKantin(kantin)}
              >
                <div className="kantin-card-header">
                  <div className="kantin-icon-small">
                    <Store size={36} />
                  </div>
                  <h3>{kantin.kantin_name}</h3>
                </div>

                <div className="kantin-card-content">
                  <div className="kantin-location-info">
                    <MapPin size={18} />
                    <span>{kantin.location || 'Lokasi tidak tersedia'}</span>
                  </div>

                  <div className="kantin-card-footer">
                    <div className="kantin-owner-info">
                      <p className="owner-label">Pemilik</p>
                      <p className="owner-name">{kantin.name}</p>
                    </div>
                    <div className="view-menu-btn">
                      Lihat Menu
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MahasiswaDashboard;