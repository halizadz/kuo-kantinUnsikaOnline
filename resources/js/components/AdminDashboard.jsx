import React, { useState, useEffect } from 'react';
import { GraduationCap, Store, Users, BarChart3, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = ({ user, API_BASE }) => {
  const [adminData, setAdminData] = useState({
    users: [],
    pendingPenjual: [],
    stats: null
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const statsResponse = await fetch(`${API_BASE}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const statsData = await statsResponse.json();
      
      const usersResponse = await fetch(`${API_BASE}/admin/users?role=penjual`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const usersData = await usersResponse.json();
      
      if (statsData.success && usersData.success) {
        setAdminData({
          stats: statsData.data,
          pendingPenjual: usersData.data.data.filter(user => !user.is_approved),
          users: usersData.data.data
        });
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const approvePenjual = async (penjualId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/penjual/${penjualId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Penjual berhasil disetujui!');
        loadAdminData();
      }
    } catch (error) {
      console.error('Error approving penjual:', error);
    }
  };

  const rejectPenjual = async (penjualId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/penjual/${penjualId}/reject`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Penjual berhasil ditolak!');
        loadAdminData();
      }
    } catch (error) {
      console.error('Error rejecting penjual:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h2>Dashboard Admin</h2>
        
        {adminData.stats && (
          <div className="admin-stats">
            <div className="stat-card">
              <GraduationCap size={24} />
              <h3>Total Mahasiswa</h3>
              <span className="stat-number">{adminData.stats.total_mahasiswa}</span>
            </div>
            <div className="stat-card">
              <Store size={24} />
              <h3>Total Penjual</h3>
              <span className="stat-number">{adminData.stats.total_penjual}</span>
            </div>
            <div className="stat-card">
              <Users size={24} />
              <h3>Penjual Disetujui</h3>
              <span className="stat-number">{adminData.stats.penjual_approved}</span>
            </div>
            <div className="stat-card">
              <BarChart3 size={24} />
              <h3>Menunggu Approval</h3>
              <span className="stat-number">{adminData.stats.penjual_pending}</span>
            </div>
          </div>
        )}

        <div className="admin-sections">
          <div className="pending-approval-section">
            <h3>Penjual Menunggu Approval</h3>
            <div className="pending-list">
              {adminData.pendingPenjual.map(penjual => (
                <div key={penjual.id} className="pending-item">
                  <div className="pending-info">
                    <h4>{penjual.kantin_name}</h4>
                    <p>Pemilik: {penjual.name}</p>
                    <p>Email: {penjual.email}</p>
                    <p>Lokasi: {penjual.location}</p>
                  </div>
                  <div className="pending-actions">
                    <button 
                      className="btn-approve"
                      onClick={() => approvePenjual(penjual.id)}
                    >
                      <CheckCircle size={16} />
                      Setujui
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => rejectPenjual(penjual.id)}
                    >
                      <XCircle size={16} />
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
              
              {adminData.pendingPenjual.length === 0 && (
                <div className="empty-state">
                  <CheckCircle size={48} />
                  <p>Tidak ada penjual yang menunggu approval</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;