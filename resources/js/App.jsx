import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import PenjualDashboard from './components/PenjualDashboard';
import MahasiswaDashboard from './components/MahasiswaDashboard';
import CartSidebar from './components/CartSidebar';
import Footer from './components/Footer';
import OrderHistory from './components/OrderHistory';

const App = () => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [authModal, setAuthModal] = useState(null);
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('home'); // ✅ Tambahkan state ini

  const API_BASE = 'http://localhost:8000/api';

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const logoutUser = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setActivePage('home'); // Reset ke home saat logout
    }
  };

  return (
    <div className="App">
      {/* Header */}
      <Header 
        user={user}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        openAuthModal={setAuthModal}
        logoutUser={logoutUser}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        activePage={activePage} // ✅ Kirim ke Header
        setActivePage={setActivePage} // ✅ Kirim ke Header
      />

      {/* Render Dashboard Berdasarkan Role */}
      {user && user.role === 'admin' && (
        <AdminDashboard user={user} API_BASE={API_BASE} />
      )}
      
      {user && user.role === 'penjual' && (
        <PenjualDashboard user={user} API_BASE={API_BASE} />
      )}
      
      {(!user || user.role === 'mahasiswa') && (
        <>
          {activePage === 'home' && (
            <MahasiswaDashboard 
              user={user}
              cart={cart}
              setCart={setCart}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              API_BASE={API_BASE} 
            />
          )}
          {activePage === 'order-history' && (
            <OrderHistory user={user} API_BASE={API_BASE} />
          )}
        </>
      )}

      {/* Footer */}
      <Footer />

      {/* Modals */}
      {authModal && (
        <AuthModal 
          authModal={authModal}
          setAuthModal={setAuthModal}
          setUser={setUser}
          API_BASE={API_BASE}
        />
      )}

      {isCartOpen && user?.role === 'mahasiswa' && (
        <CartSidebar 
          cart={cart}
          setCart={setCart}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          user={user}
          setUser={setUser}
          API_BASE={API_BASE}
        />
      )}
    </div>
  );
};

export default App;