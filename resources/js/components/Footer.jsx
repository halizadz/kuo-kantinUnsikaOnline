import React from 'react';
import { 
  Heart,
  ArrowUp,
  Truck,
  Clock,
  Shield,
  Star,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    { icon: Truck, text: 'Gratis Ongkir', desc: 'Area kampus' },
    { icon: Clock, text: 'Cepat', desc: '15 menit sampai' },
    { icon: Shield, text: 'Terjamin', desc: 'Kualitas terbaik' },
    { icon: Star, text: '4.9/5', desc: 'Rating tertinggi' }
  ];

  const quickLinks = [
    { name: 'Tentang Kami', href: '#' },
    { name: 'Kantin', href: '#' },
    { name: 'Menu', href: '#' },
    { name: 'Bantuan', href: '#' },
    { name: 'Kontak', href: '#' }
  ];

  return (
    <footer className="footer">
      {/* Feature Highlights - More Compact */}
      <div className="footer-features">
        <div className="container">
          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-item" style={{ gap: '0.75rem', textAlign: 'center' }}>
                  <div className="feature-icon" style={{ width: '40px', height: '40px' }}>
                    <Icon size={20} />
                  </div>
                  <div className="feature-text">
                    <span className="feature-main" style={{ fontSize: '0.9rem' }}>{feature.text}</span>
                    <span className="feature-desc" style={{ fontSize: '0.8rem' }}>{feature.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer - Simplified */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-content" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '3rem', alignItems: 'start' }}>
            
            {/* Brand Section */}
            <div className="footer-brand">
              <div className="brand-logo" style={{ marginBottom: '1rem' }}>
                <div className="logo-icon" style={{ width: '45px', height: '45px' }}>🍽️</div>
                <div className="logo-text">
                  <h3 style={{ fontSize: '1.4rem', margin: 0 }}>KUO</h3>
                  <p style={{ fontSize: '0.8rem', margin: 0 }}>Makanan Kampus Terbaik</p>
                </div>
              </div>
              
              <p className="brand-description" style={{ fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Platform pemesanan makanan kantin kampus yang menghubungkan mahasiswa dengan kantin favorit. Cepat, praktis, dan terpercaya.
              </p>

              <div className="contact-info" style={{ gap: '0.75rem' }}>
                <div className="contact-item" style={{ gap: '0.5rem' }}>
                  <MapPin size={16} />
                  <span style={{ fontSize: '0.85rem' }}>Universitas Singaperbangsa Karawang</span>
                </div>
                <div className="contact-item" style={{ gap: '0.5rem' }}>
                  <Phone size={16} />
                  <span style={{ fontSize: '0.85rem' }}>+62 812 3456 7890</span>
                </div>
                <div className="contact-item" style={{ gap: '0.5rem' }}>
                  <Mail size={16} />
                  <span style={{ fontSize: '0.85rem' }}>hello@kuo.id</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="links-section">
              <h4 className="section-title" style={{ fontSize: '1.1rem' }}>Tautan Cepat</h4>
              <ul className="links-list">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link" style={{ fontSize: '0.9rem' }}>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Newsletter - Simplified */}
              <div style={{ marginTop: '2rem' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                  Dapatkan promo spesial
                </p>
                <div className="input-group" style={{ background: 'var(--surface)' }}>
                  <input 
                    type="email" 
                    placeholder="Email Anda"
                    className="newsletter-input"
                    style={{ fontSize: '0.85rem', padding: '0.75rem' }}
                    required
                  />
                  <button type="submit" className="newsletter-btn" style={{ padding: '0.75rem' }}>
                    <Mail size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom - Simplified */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="copyright" style={{ fontSize: '0.8rem' }}>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                &copy; {currentYear} KantinKampus 
                <Heart size={12} style={{ color: 'var(--primary)' }} /> 
                Untuk Mahasiswa Indonesia
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button 
        className="scroll-to-top"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        style={{ bottom: '1rem', right: '1rem', width: '45px', height: '45px' }}
      >
        <ArrowUp size={18} />
      </button>
    </footer>
  );
};

export default Footer;