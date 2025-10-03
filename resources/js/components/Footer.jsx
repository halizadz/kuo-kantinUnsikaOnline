import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo">
              <div className="logo-icon">🍽️</div>
              <div>
                <h3>KantinKampus</h3>
                <p>Food Delivery</p>
              </div>
            </div>
            <p className="footer-description">
              Platform pemesanan makanan kantin kampus yang memudahkan mahasiswa menikmati makanan favorit tanpa antri.
            </p>
            <div className="social-links">
              <a href="#"><Facebook size={20} /></a>
              <a href="#"><Twitter size={20} /></a>
              <a href="#"><Instagram size={20} /></a>
              <a href="#"><Youtube size={20} /></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 KantinKampus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;