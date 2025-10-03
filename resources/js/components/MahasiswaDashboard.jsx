import React, { useState, useEffect } from 'react';
import { 
  Store, MapPin, Star, Clock, ChevronRight, Plus, 
  Search, ArrowLeft, ShoppingCart, Heart, Truck, 
  Shield, Zap, Users, Sparkles, Filter, X, Crown,
  Menu
} from 'lucide-react';

const MahasiswaDashboard = ({ user, cart, setCart, API_BASE }) => {
  const [kantinList, setKantinList] = useState([]);
  const [selectedKantin, setSelectedKantin] = useState(null);
  const [kantinMenus, setKantinMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredKantin, setFeaturedKantin] = useState([]);
  const [showAllKantin, setShowAllKantin] = useState(false);
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [menuFilter, setMenuFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadKantinList();
  }, []);

  const loadKantinList = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/penjual`);
      const data = await response.json();
      
      if (data.success) {
        const approvedPenjual = data.data.data;
        setKantinList(approvedPenjual);
        // Set featured kantin (first 3 for example)
        setFeaturedKantin(approvedPenjual.slice(0, 3));
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
    
    // Show success feedback
    const event = new CustomEvent('showToast', {
      detail: { message: `${menu.name} ditambahkan ke keranjang!`, type: 'success' }
    });
    window.dispatchEvent(event);
  };

  const filteredKantin = kantinList.filter(kantin => 
    kantin.kantin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (kantin.location && kantin.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredMenus = kantinMenus.filter(menu => {
    const matchesSearch = menu.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
                         menu.description.toLowerCase().includes(menuSearchTerm.toLowerCase());
    
    const matchesFilter = 
      menuFilter === 'all' ? true :
      menuFilter === 'available' ? menu.is_available :
      menuFilter === 'popular' ? menu.is_popular : true;
    
    return matchesSearch && matchesFilter;
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE.replace('/api', '')}/storage/${imagePath}`;
  };

  // Tampilan detail kantin
  if (selectedKantin) {
    return (
      <div className="kantin-detail-page">
        {/* Mobile Header */}
        <div className="mobile-dashboard-header">
          
          
          {mobileMenuOpen && (
            <div className="mobile-tabs-menu">
              <button className="mobile-tab" onClick={() => setSelectedKantin(null)}>
                <ArrowLeft size={18} />
                Kembali ke Kantin
              </button>
              <button className="mobile-tab">
                <ShoppingCart size={18} />
                Keranjang ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})
              </button>
            </div>
          )}
        </div>

        <div className="container desktop-only">
          <button 
            onClick={() => setSelectedKantin(null)}
            className="back-button"
          >
            <ArrowLeft size={20} />
            Kembali ke Daftar Kantin
          </button>
        </div>

        <div className="kantin-hero">
          <div className="kantin-hero-content">
            <div className="kantin-image">
              <img 
                src={getImageUrl(selectedKantin.kantin_image)} 
                alt={selectedKantin.kantin_name}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';
                }}
              />
            </div>
            <div className="kantin-info">
              <h1 className="desktop-only">{selectedKantin.kantin_name}</h1>
              <p className="kantin-location">
                <MapPin size={18} />
                {selectedKantin.location || 'Lokasi tidak tersedia'}
              </p>
              <p className="kantin-owner">
                <Users size={16} />
                Pemilik: {selectedKantin.name}
              </p>
              <div className="kantin-stats">
                <div className="stat">
                  <Star size={16} fill="currentColor" />
                  <span>4.8 • 150+ rating</span>
                </div>
                <div className="stat">
                  <Clock size={16} />
                  <span>15-20 menit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="menu-controls">
          <div className="menu-header desktop-only">
            <h2>Menu Tersedia</h2>
            <div className="menu-filters">
              <div className="search-bar menu-search">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Cari menu..."
                  value={menuSearchTerm}
                  onChange={(e) => setMenuSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${menuFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setMenuFilter('all')}
                >
                  Semua
                </button>
                <button 
                  className={`filter-btn ${menuFilter === 'available' ? 'active' : ''}`}
                  onClick={() => setMenuFilter('available')}
                >
                  Tersedia
                </button>
                <button 
                  className={`filter-btn ${menuFilter === 'popular' ? 'active' : ''}`}
                  onClick={() => setMenuFilter('popular')}
                >
                  <Sparkles size={14} />
                  Populer
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu Header */}
          
          
          {cart.length > 0 && (
            <div className="cart-indicator">
              <ShoppingCart size={20} />
              <span className="cart-count">
                {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
              </span>
            </div>
          )}
        </div>
        
        {filteredMenus.length === 0 ? (
          <div className="empty-state">
            <Store size={64} />
            <h3>
              {menuSearchTerm || menuFilter !== 'all' 
                ? 'Menu tidak ditemukan' 
                : 'Belum ada menu tersedia'
              }
            </h3>
            <p>
              {menuSearchTerm 
                ? 'Coba gunakan kata kunci lain' 
                : 'Kantin ini sedang mempersiapkan menu yang lezat untuk Anda'
              }
            </p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredMenus.map(menu => (
              <div key={menu.id} className="menu-card">
                <div className="menu-card-header">
                  <img 
                    src={getImageUrl(menu.image)} 
                    alt={menu.name}
                  />
                  <div className="menu-badges">
                    {menu.is_popular && (
                      <div className="popular-badge">
                        <Crown size={12} />
                        Populer
                      </div>
                    )}
                    {!menu.is_available && (
                      <div className="unavailable-overlay">
                        <span>Habis</span>
                      </div>
                    )}
                  </div>
                  <button className="favorite-btn">
                    <Heart size={18} />
                  </button>
                </div>
                
                <div className="menu-card-content">
                  <h3>{menu.name}</h3>
                  <p className="menu-description">{menu.description || 'Menu lezat dari kantin kami'}</p>
                  
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
                      {!menu.is_available ? 'Habis' : 'Pesan'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile FAB for Cart */}
        {cart.length > 0 && (
          <div className="mobile-fab">
            <button className="fab-btn">
              <ShoppingCart size={24} />
              <span className="cart-count-bubble">
                {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
              </span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Tampilan utama - Daftar Kantin dengan Nomor
  return (
    <div className="mahasiswa-dashboard">

      {/* Hero Section */}
      <section className="hero desktop-only">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Nikmati Makanan Kantin Kampus dengan Cara Modern</h1>
              <p>Pesan makanan favoritmu tanpa antri. Cepat, praktis, dan pastinya enak!</p>
              
              <div className="hero-stats">
                <div className="stat">
                  <strong>{kantinList.length}+</strong>
                  <span>Kantin Aktif</span>
                </div>
                <div className="stat">
                  <strong>500+</strong>
                  <span>Menu Variatif</span>
                </div>
                <div className="stat">
                  <strong>15min</strong>
                  <span>Rata-rata Pengiriman</span>
                </div>
              </div>
            </div>
            
            <div className="hero-image">
              <img 
                src="/kuo.jpg" 
                alt="Delicious Food" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* All Kantin Section dengan Nomor */}
      <section className="all-kantin">
        <div className="container">
          <div className="section-header desktop-only">
            <div className="section-title-wrapper">
              <div className="title-icon">
                <Store size={24} />
              </div>
              <div>
                <h2 className="gradient-text">Daftar Kantin Kampus</h2>
                <p className="text-secondary">Temukan kantin favorit Anda di kampus</p>
              </div>
            </div>
            
            <div className="search-bar">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Cari kantin atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>



          {loading ? (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>Memuat daftar kantin...</p>
            </div>
          ) : filteredKantin.length === 0 ? (
            <div className="empty-state">
              <Store size={64} />
              <h3>{searchTerm ? 'Kantin tidak ditemukan' : 'Belum ada kantin yang terdaftar'}</h3>
              <p>
                {searchTerm 
                  ? 'Coba gunakan kata kunci lain' 
                  : 'Silakan coba lagi nanti'
                }
              </p>
            </div>
          ) : (
            <div className="kantin-list-numbered">
              {filteredKantin.map((kantin, index) => (
                <div 
                  key={kantin.id}
                  className="kantin-card-numbered"
                  onClick={() => selectKantin(kantin)}
                >
                  <div className="kantin-number">
                    #{index + 1}
                  </div>
                  
                  <div className="kantin-image">
                    <img 
                      src={getImageUrl(kantin.kantin_image)} 
                      alt={kantin.kantin_name}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=150&fit=crop';
                      }}
                    />
                  </div>
                  
                  <div className="kantin-content">
                    <div className="kantin-header">
                      <h3>{kantin.kantin_name}</h3>
                      <div className="kantin-status">
                        <div className="status-dot online"></div>
                        <span>Buka</span>
                      </div>
                    </div>
                    
                    <div className="kantin-info">
                      <div className="info-item">
                        <MapPin size={14} />
                        <span>{kantin.location || 'Lokasi tidak tersedia'}</span>
                      </div>
                      <div className="info-item">
                        <Users size={14} />
                        <span>Pemilik: {kantin.name}</span>
                      </div>
                    </div>

                    <div className="kantin-stats">
                      <div className="stat">
                        <Star size={14} fill="currentColor" />
                        <span>4.5</span>
                      </div>
                      <div className="stat">
                        <Clock size={14} />
                        <span>15m</span>
                      </div>
                      <div className="stat">
                        <Truck size={14} />
                        <span>Gratis</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="kantin-arrow">
                    <ChevronRight size={20} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

  
    </div>
  );
};

export default MahasiswaDashboard;