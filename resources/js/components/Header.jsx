import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Store, 
  GraduationCap, 
  Settings,
  LogOut,
  Home,
  History,
  Menu,
  ChevronDown,
  Bell
} from 'lucide-react';

const Header = ({ 
  user, 
  searchTerm, 
  setSearchTerm, 
  openAuthModal, 
  logoutUser, 
  cart, 
  setIsCartOpen,
  activePage,
  setActivePage 
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleBadge = (role, isApproved) => {
    const roleConfig = {
      mahasiswa: { label: 'Mahasiswa', color: 'mahasiswa' },
      penjual: { label: isApproved ? 'Penjual' : 'Penjual (Pending)', color: 'penjual' },
      admin: { label: 'Admin', color: 'admin' }
    };
    
    const config = roleConfig[role] || { label: role, color: 'default' };
    return (
      <span className={`user-role ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); setActivePage('home'); }}>
            <div className="logo-icon">🍽️</div>
            <div className="logo-text">
              <h1>KUO</h1>
              <p>Kantin Unsika Online</p>
            </div>
          </a>

          {/* Navigation - Show for mahasiswa and guests */}
          {(!user || user.role === 'mahasiswa') && (
            <div className="nav-center">
              <div className="nav-buttons">
                <button 
                  className={`nav-button ${activePage === 'home' ? 'active' : ''}`}
                  onClick={() => setActivePage('home')}
                >
                  <Home size={20} />
                  <span>Beranda</span>
                </button>
                <button 
                  className={`nav-button ${activePage === 'order-history' ? 'active' : ''}`}
                  onClick={() => setActivePage('order-history')}
                >
                  <History size={20} />
                  <span>Riwayat</span>
                </button>
              </div>
              
              {/* <div className="search-bar">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Cari makanan atau minuman..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div> */}
            </div>
          )}

          {/* Search bar for guests */}
          {!user && (
            <div className="search-bar">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Cari makanan atau minuman..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu size={24} />
          </button>

          {/* Header Actions */}
          <div className="header-actions">
            {user ? (
              <div className="user-section">
                {/* Notifications */}
                <button className="btn-ghost">
                  <Bell size={20} />
                </button>

                {/* Cart - Only for mahasiswa */}
                {user.role === 'mahasiswa' && (
                  <button 
                    className="cart-btn"
                    onClick={() => setIsCartOpen(true)}
                  >
                    <ShoppingCart size={20} />
                    {cart.length > 0 && (
                      <span className="cart-badge">
                        {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                      </span>
                    )}
                  </button>
                )}

                {/* User Info */}
                <div 
                  className="user-info"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    {getInitials(user.name)}
                    <div className="user-status"></div>
                  </div>
                  
                  <div className="user-details">
                    <div className="user-name">{user.name}</div>
                    {getRoleBadge(user.role, user.is_approved)}
                  </div>
                  
                  <ChevronDown 
                    size={16} 
                    className={`dropdown-arrow ${showUserMenu ? 'rotate' : ''}`} 
                  />
                </div>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="user-menu">
                    <div className="user-menu-item">
                      <User size={18} />
                      <span>Profil Saya</span>
                    </div>
                    <div className="user-menu-item">
                      <Settings size={18} />
                      <span>Pengaturan</span>
                    </div>
                    <div className="user-menu-divider"></div>
                    <button 
                      className="user-menu-logout"
                      onClick={logoutUser}
                    >
                      <LogOut size={18} />
                      <span>Keluar</span>
                    </button>
                  </div>
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

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (!user || user.role === 'mahasiswa') && (
          <div className="mobile-nav">
            <button 
              className={`mobile-nav-item ${activePage === 'home' ? 'active' : ''}`}
              onClick={() => {
                setActivePage('home');
                setShowMobileMenu(false);
              }}
            >
              <Home size={20} />
              <span>Beranda</span>
            </button>
            <button 
              className={`mobile-nav-item ${activePage === 'order-history' ? 'active' : ''}`}
              onClick={() => {
                setActivePage('order-history');
                setShowMobileMenu(false);
              }}
            >
              <History size={20} />
              <span>Riwayat Pesanan</span>
            </button>
          </div>
        )}
      </div>

      {/* Overlay for user menu */}
      {showUserMenu && (
        <div 
          className="menu-overlay" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;