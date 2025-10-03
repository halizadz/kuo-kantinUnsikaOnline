import React from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Store, 
  GraduationCap, 
  Settings,
  LogOut,
  Home,
  History // ✅ Tambahkan import History
} from 'lucide-react';

const Header = ({ 
  user, 
  searchTerm, 
  setSearchTerm, 
  openAuthModal, 
  logoutUser, 
  cart, 
  setIsCartOpen,
  activePage, // ✅ Tambahkan
  setActivePage // ✅ Tambahkan
}) => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo Section */}
          <div className="logo">
            <div className="logo-icon">🍽️</div>
            <div>
              <h1>KantinKampus</h1>
              <p>Food Delivery</p>
            </div>
          </div>

          {/* Navigation untuk Mahasiswa */}
          {(!user || user.role === 'mahasiswa') && (
            <div className="header-center">
              <div className="nav-buttons">
                <button 
                  className={`nav-button ${activePage === 'home' ? 'active' : ''}`}
                  onClick={() => setActivePage('home')}
                >
                  <Home size={20} />
                  Beranda
                </button>
                <button 
                  className={`nav-button ${activePage === 'order-history' ? 'active' : ''}`}
                  onClick={() => setActivePage('order-history')}
                >
                  <History size={20} />
                  Riwayat Pesanan
                </button>
              </div>
              
              {/* Search bar */}
              <div className="search-bar">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Cari makanan atau minuman..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Search bar untuk guest (tanpa user) */}
          {!user && (
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Cari makanan atau minuman..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          <div className="header-actions">
            {user ? (
              <div className="user-section">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    <div className="user-status"></div>
                  </div>
                  
                  <div className="user-details">
                    <div className="user-name">{user.name}</div>
                    <div className={`user-role ${user.role}`}>
                      {user.role === 'mahasiswa' ? 'Mahasiswa' : 
                       user.role === 'penjual' ? 'Penjual' : 'Admin'}
                      {user.role === 'penjual' && !user.is_approved && ' (Pending)'}
                    </div>
                  </div>
                </div>
                
                <button className="btn-logout-header" onClick={logoutUser}>
                  <LogOut size={16} />
                  <span>Keluar</span>
                </button>

                {/* Cart hanya untuk mahasiswa */}
                {user.role === 'mahasiswa' && (
                  <button 
                    className="cart-btn"
                    onClick={() => setIsCartOpen(true)}
                  >
                    <ShoppingCart size={20} />
                    {cart.length > 0 && (
                      <span className="cart-badge">{cart.length}</span>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <>
                <button 
                  className="btn-login"
                  onClick={() => openAuthModal('login')}
                >
                  <User size={20} />
                  <span>Masuk</span>
                </button>
                <button 
                  className="btn-register"
                  onClick={() => openAuthModal('register')}
                >
                  <span>Daftar</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;