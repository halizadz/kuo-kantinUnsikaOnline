import React, { useState, useEffect } from 'react';
import { X, UploadCloud } from 'lucide-react';

const MenuManagement = ({ editingMenu, onClose, loadPenjualMenus, API_BASE }) => {
  const [menuForm, setMenuForm] = useState({
    name: editingMenu?.name || '',
    description: editingMenu?.description || '',
    price: editingMenu?.price || '',
    prep_time: editingMenu?.prep_time || 15,
    is_available: editingMenu?.is_available ?? true,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(editingMenu?.image_url || null);

  const handleMenuInputChange = (e) => {
    setMenuForm({
      ...menuForm,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMenuForm(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const dataToSend = new FormData();
    dataToSend.append('name', menuForm.name);
    dataToSend.append('description', menuForm.description);
    dataToSend.append('price', menuForm.price);
    dataToSend.append('prep_time', menuForm.prep_time);
    dataToSend.append('is_available', menuForm.is_available ? 1 : 0);
    
    if (menuForm.image) {
      dataToSend.append('image', menuForm.image);
    }

    try {
      const url = editingMenu 
        ? `${API_BASE}/penjual/menus/${editingMenu.id}`
        : `${API_BASE}/penjual/menus`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: dataToSend,
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        loadPenjualMenus();
        onClose();
      } else {
        const errorMessages = result.errors 
          ? Object.values(result.errors).flat().join('\n') 
          : result.message || 'Terjadi kesalahan.';
        alert(errorMessages);
      }

    } catch (error) {
      console.error('Error saving menu:', error);
      alert('Gagal terhubung ke server.');
    }
  };

  // Fungsi untuk close modal dengan cleanup
  const handleClose = () => {
    if (imagePreview && !editingMenu) {
      URL.revokeObjectURL(imagePreview);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          <X/>
        </button>
        <h3>{editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>
        
        <form onSubmit={handleMenuSubmit}> 
          <div className="form-group">
            <label className="form-label">Nama Menu</label>
            <input 
              type="text" 
              name="name" 
              className="form-input" 
              value={menuForm.name} 
              onChange={handleMenuInputChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea 
              name="description" 
              className="form-input" 
              value={menuForm.description} 
              onChange={handleMenuInputChange} 
              required 
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Harga</label>
            <input 
              type="number" 
              name="price" 
              className="form-input" 
              value={menuForm.price} 
              onChange={handleMenuInputChange} 
              required 
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Foto Menu</label>
            <div className="image-upload-box">
              <input 
                type="file" 
                id="image-upload" 
                name="image" 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              <label htmlFor="image-upload" className="image-upload-label">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <UploadCloud size={40} />
                    <span>Klik untuk memilih gambar</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Waktu Persiapan (menit)</label>
            <input 
              type="number" 
              name="prep_time" 
              className="form-input" 
              value={menuForm.prep_time} 
              onChange={handleMenuInputChange} 
              required 
              min="1"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                name="is_available" 
                checked={menuForm.is_available} 
                onChange={handleMenuInputChange} 
              />
              <span>Menu Tersedia</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Batal
            </button>
            <button type="submit" className="btn-primary">
              {editingMenu ? 'Update Menu' : 'Tambah Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuManagement;