import React, { useState, useEffect } from 'react';
import { 
  X, UploadCloud, Camera, Image, Trash2,
  Save, Loader, CheckCircle, AlertCircle
} from 'lucide-react';

const MenuManagement = ({ editingMenu, onClose, loadPenjualMenus, API_BASE }) => {
  const [menuForm, setMenuForm] = useState({
    name: editingMenu?.name || '',
    description: editingMenu?.description || '',
    price: editingMenu?.price || '',
    prep_time: editingMenu?.prep_time || 15,
    is_available: editingMenu?.is_available ?? true,
    is_popular: editingMenu?.is_popular ?? false,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(editingMenu?.image_url || null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingMenu) {
      setImagePreview(editingMenu.image_url || null);
    }
  }, [editingMenu]);

  const handleMenuInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMenuForm({
      ...menuForm,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'File harus berupa gambar' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Ukuran gambar maksimal 5MB' }));
        return;
      }

      setMenuForm(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = () => {
    setMenuForm(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!menuForm.name.trim()) {
      newErrors.name = 'Nama menu harus diisi';
    }

    if (!menuForm.description.trim()) {
      newErrors.description = 'Deskripsi menu harus diisi';
    }

    if (!menuForm.price || Number(menuForm.price) <= 0) {
      newErrors.price = 'Harga harus lebih dari 0';
    }

    if (!menuForm.prep_time || Number(menuForm.prep_time) <= 0) {
      newErrors.prep_time = 'Waktu persiapan harus lebih dari 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    const dataToSend = new FormData();
    dataToSend.append('name', menuForm.name);
    dataToSend.append('description', menuForm.description);
    dataToSend.append('price', menuForm.price);
    dataToSend.append('prep_time', menuForm.prep_time);
    dataToSend.append('is_available', menuForm.is_available ? 1 : 0);
    dataToSend.append('is_popular', menuForm.is_popular ? 1 : 0);
    
    if (menuForm.image) {
      dataToSend.append('image', menuForm.image);
    }

    try {
      const url = editingMenu 
        ? `${API_BASE}/penjual/menus/${editingMenu.id}`
        : `${API_BASE}/penjual/menus`;
      
      const method = editingMenu ? 'POST' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: dataToSend,
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        const event = new CustomEvent('showToast', {
          detail: { 
            message: editingMenu ? 'Menu berhasil diupdate!' : 'Menu berhasil ditambahkan!', 
            type: 'success' 
          }
        });
        window.dispatchEvent(event);
        
        loadPenjualMenus();
        onClose();
      } else {
        const errorMessages = result.errors 
          ? Object.values(result.errors).flat().join('\n') 
          : result.message || 'Terjadi kesalahan.';
        
        setErrors({ submit: errorMessages });
      }

    } catch (error) {
      console.error('Error saving menu:', error);
      setErrors({ submit: 'Gagal terhubung ke server.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (imagePreview && !editingMenu) {
      URL.revokeObjectURL(imagePreview);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content menu-management-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <h3>{editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>
            <p>
              {editingMenu 
                ? 'Perbarui informasi menu Anda' 
                : 'Tambahkan menu baru ke kantin Anda'
              }
            </p>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleMenuSubmit} className="menu-form">
          {/* Image Upload */}
          <div className="form-section">
            <label className="form-label">Foto Menu</label>
            <div className="image-upload-container">
              <input 
                type="file" 
                id="image-upload" 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden-input"
              />
              
              <label htmlFor="image-upload" className="image-upload-box">
                {imagePreview ? (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <div className="image-overlay">
                      <Camera size={24} />
                      <span>Ganti Foto</span>
                    </div>
                    <button 
                      type="button"
                      className="remove-image-btn"
                      onClick={removeImage}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <Image size={40} />
                    <div className="upload-text">
                      <span className="upload-title">Klik untuk upload foto</span>
                      <span className="upload-subtitle">PNG, JPG max 5MB</span>
                    </div>
                  </div>
                )}
              </label>
              
              {errors.image && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  {errors.image}
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="form-section">
            <h4 className="section-title">Informasi Dasar</h4>
            
            <div className="form-group">
              <label className="form-label required">Nama Menu</label>
              <input 
                type="text" 
                name="name" 
                className={`form-input ${errors.name ? 'error' : ''}`} 
                value={menuForm.name} 
                onChange={handleMenuInputChange} 
                placeholder="Contoh: Nasi Goreng Special"
              />
              {errors.name && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  {errors.name}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">Deskripsi</label>
              <textarea 
                name="description" 
                className={`form-input ${errors.description ? 'error' : ''}`} 
                value={menuForm.description} 
                onChange={handleMenuInputChange} 
                placeholder="Deskripsikan menu Anda..."
                rows="3"
              />
              {errors.description && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  {errors.description}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Harga (Rp)</label>
                <input 
                  type="number" 
                  name="price" 
                  className={`form-input ${errors.price ? 'error' : ''}`} 
                  value={menuForm.price} 
                  onChange={handleMenuInputChange} 
                  placeholder="15000"
                  min="0"
                />
                {errors.price && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    {errors.price}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label required">Waktu Persiapan (menit)</label>
                <input 
                  type="number" 
                  name="prep_time" 
                  className={`form-input ${errors.prep_time ? 'error' : ''}`} 
                  value={menuForm.prep_time} 
                  onChange={handleMenuInputChange} 
                  placeholder="15"
                  min="1"
                />
                {errors.prep_time && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    {errors.prep_time}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="form-section">
            <h4 className="section-title">Pengaturan</h4>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="is_available" 
                  checked={menuForm.is_available} 
                  onChange={handleMenuInputChange} 
                />
                <span className="checkmark"></span>
                <div className="checkbox-text">
                  <span className="checkbox-title">Menu Tersedia</span>
                  <span className="checkbox-description">
                    Tampilkan menu ini kepada pelanggan
                  </span>
                </div>
              </label>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="is_popular" 
                  checked={menuForm.is_popular} 
                  onChange={handleMenuInputChange} 
                />
                <span className="checkmark"></span>
                <div className="checkbox-text">
                  <span className="checkbox-title">Tandai sebagai Populer</span>
                  <span className="checkbox-description">
                    Tampilkan badge populer pada menu ini
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="submit-error">
              <AlertCircle size={16} />
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="spinner" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {editingMenu ? 'Update Menu' : 'Tambah Menu'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuManagement;