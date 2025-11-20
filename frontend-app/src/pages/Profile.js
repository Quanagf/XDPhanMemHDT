import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login';
import ImageCropper from '../components/ImageCropper';


const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [activeSection, setActiveSection] = useState('account');
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [activeTripsTab, setActiveTripsTab] = useState('current');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    address: '',
    birthDate: '',
    gender: '',
    facebook: ''
  });
  const [errors, setErrors] = useState({});

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false); // Thêm state thông báo thành công
    
  const [licenseFile,setLicenseFile] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  // State cho upload CCCD
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);

  // State cho verification status
  const [verificationStatus, setVerificationStatus] = useState({
    license: null, // { status: 'PENDING'/'APPROVED'/'REJECTED', message: '...' }
    identity: null
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State cho modal xác nhận xóa tài khoản
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // State cho avatar upload
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);

  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    const authToken = localStorage.getItem('authToken');
    
    if (userProfile && authToken) {
      try {
        const parsedUser = JSON.parse(userProfile);
        
        // Chuyển hướng Admin và Staff đến trang của họ
        if (parsedUser.role === 'ADMIN') {
          navigate('/admin');
          return;
        } else if (parsedUser.role === 'STAFF') {
          navigate('/staff');
          return;
        }
        
        setUser(parsedUser);
        // Khởi tạo form với dữ liệu hiện tại (chỉ các trường được phép sửa)
        setEditForm({
          address: parsedUser.address || '',
          birthDate: parsedUser.birthDate || '',
          gender: parsedUser.gender || '',
          facebook: parsedUser.facebook || ''
        });
        
        // Lấy trạng thái verification
        fetchVerificationStatus(authToken);
      } catch (error) {
        console.error('Error parsing user profile:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userRole');
      }
    }
  }, [navigate]);

  // Xử lý URL query parameters để tự động chuyển đến section tương ứng
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get('section');
    const tab = searchParams.get('tab');
    
    if (section && ['account', 'favorites', 'trips', 'password'].includes(section)) {
      setActiveSection(section);
    }
    
    // Nếu section là trips và có tab parameter, set activeTripsTab
    if (section === 'trips' && tab && ['current', 'history', 'overview'].includes(tab)) {
      setActiveTripsTab(tab);
    }
  }, [location.search]);

  // === BẮT ĐẦU: THÊM USEEFFECT ĐỂ TẠO PREVIEW HÌNH ===
  // useEffect để tạo preview cho GPLX
  useEffect(() => {
    if (!licenseFile) {
      setLicensePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(licenseFile);
    setLicensePreview(objectUrl);
    // Dọn dẹp
    return () => URL.revokeObjectURL(objectUrl);
  }, [licenseFile]);

  // useEffect để tạo preview cho CCCD
  useEffect(() => {
    if (!idFile) {
      setIdPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(idFile);
    setIdPreview(objectUrl);
    // Dọn dẹp
    return () => URL.revokeObjectURL(objectUrl);
  }, [idFile]);
  // === KẾT THÚC: THÊM USEEFFECT ĐỂ TẠO PREVIEW HÌNH ===

  // === BẮT ĐẦU: HÀM RELOAD THÔNG TIN USER TỪ SERVER ===
  const fetchUserData = async (token) => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // Cập nhật localStorage
        localStorage.setItem('userProfile', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  // === KẾT THÚC: HÀM RELOAD THÔNG TIN USER TỪ SERVER ===

  // === BẮT ĐẦU: HÀM LẤY TRẠNG THÁI VERIFICATION ===
  const fetchVerificationStatus = async (token) => {
    try {
      const response = await fetch('/api/users/my-verifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const verifications = await response.json();
        const newStatus = { license: null, identity: null };
        let needsUserRefresh = false;
        
        verifications.forEach(verification => {
          const docType = verification.documentType.toLowerCase();
          
          if (verification.status === 'PENDING') {
            newStatus[docType] = {
              status: 'PENDING',
              message: 'Đang chờ admin xác thực (trong vòng 2 ngày)'
            };
          } else if (verification.status === 'APPROVED') {
            newStatus[docType] = {
              status: 'APPROVED',
              message: 'Đã được xác thực thành công',
              documentNumber: verification.documentNumber
            };
            needsUserRefresh = true; // Đã được approve, cần refresh user data
          } else if (verification.status === 'REJECTED') {
            newStatus[docType] = {
              status: 'REJECTED',
              message: `Bị từ chối: ${verification.rejectionReason || 'Không rõ lý do'}`,
              rejectionReason: verification.rejectionReason
            };
          }
        });
        
        setVerificationStatus(newStatus);
        
        // Nếu có verification được approve, reload user data để cập nhật số GPLX/CCCD
        if (needsUserRefresh) {
          await fetchUserData(token);
        }
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };
  // === KẾT THÚC: HÀM LẤY TRẠNG THÁI VERIFICATION ===

    

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
        ...prev,
        [name]: value
    }));
    
    // Tự động xóa lỗi khi người dùng bắt đầu nhập
    if (passwordErrors[name]) {
        setPasswordErrors(prevErrors => ({
            ...prevErrors,
            [name]: null
        }));
    }
    setPasswordSuccess(false); // Xóa thông báo thành công khi bắt đầu nhập lại
  }

  const validatePasswordForm = () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;
    const newErrors = {};

    // 1. Mật khẩu hiện tại
    if (currentPassword.length < 6) {
        newErrors.currentPassword = 'Mật khẩu hiện tại phải có ít nhất 6 ký tự';
    }

    // 2. Mật khẩu mới
    if (newPassword.length < 6) {
        newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    // 3. Xác nhận mật khẩu mới
    if (newPassword !== confirmNewPassword) {
        newErrors.confirmNewPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    // 4. Mật khẩu mới không được giống mật khẩu cũ
    if (newPassword && newPassword === currentPassword) {
        newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleChangePassword = async () => {
    // 1. Validate form
    const isValid = validatePasswordForm();
    if (!isValid) {
        console.log('Validation failed, showing errors on form.');
        return;
    }

    const { currentPassword, newPassword } = passwordForm;
    const token = localStorage.getItem('authToken');

    const payload = { currentPassword, newPassword };

    try {
        const response = await fetch('/api/users/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        let errorMessage = text;

        // Thử parse JSON nếu backend trả về JSON
        try {
            const data = JSON.parse(text);
            errorMessage = data.message || `Lỗi không xác định: ${response.status}`;
        } catch {}

        if (response.ok) {
            // Thành công
            setPasswordSuccess(true);
            setPasswordErrors({});
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });
            alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.');
            handleLogout();
        } else {
            // Lỗi cụ thể từ server
            if (response.status === 400 && errorMessage.includes('Mật khẩu hiện tại không đúng')) {
                setPasswordErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' });
            } else {
                alert(`Lỗi khi đổi mật khẩu: ${errorMessage}`);
            }
            setPasswordSuccess(false);
        }
    } catch (error) {
        console.error('Error changing password:', error);
        alert(`Có lỗi kết nối xảy ra: ${error.message}`);
        setPasswordSuccess(false);
    }
  };



  // THÊM VÀO: Tự động xóa lỗi khi người dùng nhập
  if (errors[name]) {
    setErrors(prevErrors => ({
     ...prevErrors,
      [name]: null
    }));
  }

  const validateForm = () => {
    const newErrors = {};
    const { address, birthDate, gender } = editForm;

    // Các ràng buộc này nên khớp với backend của bạn
    
    // 1. Ngày sinh
    if (!birthDate) {
      newErrors.birthDate = 'Vui lòng chọn ngày sinh';
    } else if (new Date(birthDate) >= new Date()) {
      newErrors.birthDate = 'Ngày sinh phải là một ngày trong quá khứ';
    }

    // 2. Giới tính
    if (!gender) {
      newErrors.gender = 'Vui lòng chọn giới tính';
    }

    setErrors(newErrors);
    // Trả về true nếu không có lỗi (object newErrors rỗng)
    return Object.keys(newErrors).length === 0;
  };

    
  const handleSaveProfile = async () => {
    
    const isValid = validateForm();
    if (!isValid) {
      console.log('Validation failed:', errors);
      alert('Vui lòng kiểm tra lại thông tin, có trường bị lỗi.');
      return; // Dừng lại, không gọi API
    }

    try {
      const token = localStorage.getItem('authToken');
      
      // Chỉ gửi các trường có giá trị (loại bỏ empty string)
      const updateData = {};
      if (editForm.address && editForm.address.trim()) {
        updateData.address = editForm.address.trim();
      }
      if (editForm.birthDate) {
        updateData.birthDate = editForm.birthDate;
      }
      if (editForm.gender && editForm.gender.trim()) {
        updateData.gender = editForm.gender.trim();
      }
      if (editForm.facebook && editForm.facebook.trim()) {
        updateData.facebook = editForm.facebook.trim();
      }
      
      console.log('Sending update request with data:', updateData);
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('Updated user:', updatedUser);
        setUser(updatedUser);
        localStorage.setItem('userProfile', JSON.stringify(updatedUser));
        setIsEditing(false);
        alert('Cập nhật thông tin thành công!');
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert(`Có lỗi xảy ra: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Có lỗi xảy ra khi cập nhật thông tin: ${error.message}`);
    }
  };

  // === XỬ LÝ AVATAR MODAL VÀ UPLOAD ===
  const handleAvatarClick = () => {
    if (user.avatarUrl) {
      setShowImageViewer(true);
    }
  };

  const handleCameraIconClick = (e) => {
    e.stopPropagation(); // Ngăn trigger avatar click
    document.getElementById('avatar-upload-input').click();
  };

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra định dạng file
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }
      
      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      setAvatarFile(file);
      
      // Tạo URL để hiển thị trong cropper
      const reader = new FileReader();
      reader.onload = (e) => {
        setCropperImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropAndUpload = async (croppedBlob) => {
    if (!croppedBlob) {
      alert('Vui lòng chọn vùng ảnh');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Bạn cần đăng nhập lại');
        return;
      }
      
      // Tạo FormData với blob đã crop
      const formData = new FormData();
      formData.append('file', croppedBlob, `avatar-${Date.now()}.jpg`);
      
      const response = await fetch('/api/users/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Cập nhật user state với avatar URL mới
        const updatedUser = { ...user, avatarUrl: result.avatarUrl };
        setUser(updatedUser);
        localStorage.setItem('userProfile', JSON.stringify(updatedUser));
        
        // Trigger custom event để Header cập nhật
        window.dispatchEvent(new Event('userProfileUpdated'));
        
        // Reset form
        setAvatarFile(null);
        setCropperImage(null);
        
        alert('Cập nhật avatar thành công!');
      } else {
        const errorText = await response.text();
        
        if (response.status === 401) {
          alert('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        } else if (response.status === 403) {
          alert('Không có quyền thực hiện hành động này');
        } else {
          alert(`Có lỗi xảy ra: ${errorText || 'Không thể upload avatar'}`);
        }
      }
    } catch (error) {
      alert(`Có lỗi xảy ra khi upload avatar: ${error.message}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const cancelAvatarCrop = () => {
    setAvatarFile(null);
    setCropperImage(null);
  };

  // === BẮT ĐẦU: THÊM HÀM TỔNG QUÁT NÀY VÀO ===
  // Hàm xử lý file tổng quát (thay thế cho 2 hàm cũ)
  const handleFileChange = (e, doc) => {
    const file = e.target.files[0];
    
    if (file) {
      if (doc === 'license') {
        setLicenseFile(file);
      } else if (doc === 'identity') {
        setIdFile(file);
      }
    } else {
      // Nếu người dùng hủy chọn file
      if (doc === 'license') {
        setLicenseFile(null);
        setLicensePreview(null);
      } else if (doc === 'identity') {
        setIdFile(null);
        setIdPreview(null);
      }
    }
  };
  // === KẾT THÚC: THÊM HÀM TỔNG QUÁT NÀY VÀO ===

  // === BẮT ĐẦU: THÊM LẠI HÀM NÀY VÀO ===
  // Hàm TỔNG QUÁT để upload file (GPLX hoặc CCCD) - CẬP NHẬT MỚI
  const handleFileUpload = async (file, uploadType) => {
    if (!file) {
      alert(`Vui lòng chọn file ${uploadType} để tải lên.`);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const endpoint = `/api/users/upload/${uploadType}`;
    const token = localStorage.getItem('authToken');

    console.log(`Đang tải lên ${uploadType} đến ${endpoint}`);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log(`Response status: ${response.status}`);

      if (response.ok) {
        const result = await response.json();
        
        alert(result.message || 'Tải lên thành công! Vui lòng chờ trong 2 ngày để admin xác thực.');
        
        // Xóa file và preview sau khi thành công
        if (uploadType === 'license') {
          setLicenseFile(null);
          setLicensePreview(null);
        } else if (uploadType === 'identity') {
          setIdFile(null);
          setIdPreview(null);
        }
        
        // Cập nhật verification status
        fetchVerificationStatus(token);
        
      } else {
        const errorText = await response.text();
        console.error('Lỗi khi tải lên:', errorText);
        alert(`Lỗi khi tải lên (${response.status}): ${errorText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error uploading ${uploadType}:`, error);
      alert(`Có lỗi xảy ra khi tải file: ${error.message}`);
    }
  };
  // === KẾT THÚC: THÊM LẠI HÀM NÀY VÀO ===

  const formatDate = (dateString) => {
    if (!dateString) return '--/--/---';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatCreatedDate = (dateString) => {
    if (!dateString) return '01/01/2026';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleOpenLogin = (callback) => {
    setShowLogin(true);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userRole');
    setUser(null);
    window.location.href = '/';
  };

  // Hàm xử lý xác nhận xóa tài khoản
  const handleDeleteAccount = async () => {
    // Kiểm tra xem người dùng có nhập đúng "Đồng ý" không
    if (deleteConfirmText !== 'Đồng ý') {
      alert('Vui lòng nhập chính xác "Đồng ý" để xác nhận xóa tài khoản');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/users/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Tài khoản đã được xóa thành công');
        // Đăng xuất và chuyển về trang chủ
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userRole');
        window.location.href = '/';
      } else {
        const errorText = await response.text();
        alert(`Lỗi khi xóa tài khoản: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Có lỗi xảy ra khi xóa tài khoản. Vui lòng thử lại sau.');
    }
  };

  // Hàm đóng modal xác nhận
  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmModal(false);
    setDeleteConfirmText('');
  };

  if (!user) {
    return (
      <div className="profile-container">
        <Header onOpenLogin={handleOpenLogin} />
        <main className="profile-login-prompt">
          <h2>Vui lòng đăng nhập để xem thông tin cá nhân</h2>
          <button 
            onClick={() => handleOpenLogin()}
            className="profile-login-button"
          >
            Đăng nhập
          </button>
        </main>
        <Footer />
        {showLogin && <Login onClose={handleCloseLogin} />}
      </div>
    );
  }

  // Định nghĩa style cho lỗi (để tái sử dụng)
  const errorStyle = {
    color: '#dc3545', // Màu đỏ
    fontSize: '0.85rem',
    marginTop: '4px',
    display: 'block'
  };

  // === RENDER FUNCTIONS ===
  const renderAccountInfo = () => (
    <div className="profile-content-container">
      {/* Account Info Box */}
      <div className="profile-box">
        <div className="profile-box-header">
          <h3 className="profile-box-title">Thông tin tài khoản</h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               className="profile-edit-icon"
               onClick={isEditing ? handleSaveProfile : handleEditToggle}
               style={{ cursor: 'pointer' }}>
            {isEditing ? (
              <path d="M5 13l4 4L19 7" />
            ) : (
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            )}
          </svg>
        </div>

        <div className="profile-account-grid">
          {/* Avatar Section */}
          <div className="profile-avatar-section">
            <div className="profile-avatar-container" onClick={handleAvatarClick}>
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt="Avatar" 
                  className="profile-avatar-image"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Camera Icon để upload */}
              <div 
                className="profile-camera-icon-overlay"
                onClick={handleCameraIconClick}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M9 2C7.9 2 7 2.9 7 4v1H4C2.9 5 2 5.9 2 7v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3V4c0-1.1-.9-2-2-2H9zm3 15c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/>
                </svg>
              </div>
            </div>
            
            <h4 className="profile-user-name">{user.fullName || user.username || 'User'}</h4>
            <p className="profile-join-date">Tham gia: {formatCreatedDate(user.createdAt)}</p>
            
            {/* Hidden file input */}
            <input
              type="file"
              id="avatar-upload-input"
              accept="image/*"
              onChange={handleAvatarFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* Info Section */}
          <div className="profile-info-section">
            <div className="profile-info-grid">
              {['birthDate', 'gender', 'address', 'facebook'].map((field) => (
                <div key={field} className="profile-info-item">
                  <span className="profile-info-label">
                    {field === 'birthDate' ? 'Ngày sinh' :
                     field === 'gender' ? 'Giới tính' :
                     field === 'address' ? 'Địa chỉ' :
                     'Facebook'}
                  </span>
                  {isEditing ? (
                    // CẬP NHẬT: Thêm Fragment <> để bọc input và span lỗi
                    <>
                      {field === 'gender' ? (
                        <select name={field} value={editForm[field]} onChange={handleInputChange} className="profile-info-input">
                          <option value="">Chọn giới tính</option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      ) : (
                        <input
                          type={field === 'birthDate' ? 'date' : 'text'}
                          name={field}
                          value={editForm[field]}
                          onChange={handleInputChange}
                          className="profile-info-input"
                          placeholder={field === 'facebook' ? 'Link Facebook của bạn' : ''}
                        />
                      )}
                      
                      {/* Thêm span báo lỗi */}
                      {errors[field] && (
                        <span style={errorStyle}>
                          {errors[field]}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className={`profile-info-value ${field === 'facebook' ? 'facebook-link' : ''}`} style={field === 'facebook' ? {textAlign: 'right', direction: 'rtl', unicodeBidi: 'plaintext'} : {}}>
                      {field === 'birthDate' ? formatDate(user.birthDate) : user[field] || '---'}
                    </span>
                  )}
                </div>
              ))}
              {/* Non-editable fields (Giữ nguyên) */}
              <div className="profile-info-item">
                <span className="profile-info-label">Số điện thoại</span>
                <span className="profile-info-value">{user.phoneNumber || '---'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">{user.email || '---'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Documents Section */}
      {['license', 'identity'].map((doc) => {
        // Xác định tên trường lỗi tương ứng
        const fieldName = doc === 'license' ? 'licenseNumber' : 'identityNumber';

        return (
          <div key={doc} className="profile-box">
            <div className="profile-box-header">
              <h3 className="profile-box-title">{doc === 'license' ? 'Giấy phép lái xe' : 'Căn cước công dân'}</h3>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>(Cập nhật riêng)</span>
            </div>

            <div className="profile-document-grid">
            
              {/* === PHẦN UPLOAD FILE ĐÃ ĐƯỢC GIỮ NGUYÊN === */}
              <div className="profile-upload-section">
                <label className="profile-upload-label">Hình ảnh</label>
                <input
                  type="file"
                  accept="image/*"
                  id={`${doc}-upload`}
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e, doc)}
                />
                <label htmlFor={`${doc}-upload`} className="profile-upload-area-label" style={{ cursor: 'pointer' }}>
                  <div className="profile-upload-area">
                    {(doc === 'license' && (licensePreview || user.licenseImage)) ||
                     (doc === 'identity' && (idPreview || user.identityImage)) ? (
                      <img
                        src={doc === 'license' ? (licensePreview || user.licenseImage) : (idPreview || user.identityImage)}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                      />
                    ) : (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2">
                          <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="profile-upload-text">Nhấn để tải lên ảnh {doc === 'license' ? 'GPLX' : 'CCCD'}</p>
                      </>
                    )}
                  </div>
                </label>
                {(doc === 'license' ? licenseFile : idFile) && (
                  <button
                    onClick={() => handleFileUpload(doc === 'license' ? licenseFile : idFile, doc)}
                    className="profile-upload-save-btn"
                  >
                    Lưu ảnh {doc === 'license' ? 'GPLX' : 'CCCD'}
                  </button>
                )}

                {/* Verification Status */}
                {verificationStatus[doc] && (
                  <div className="verification-status" style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: verificationStatus[doc].status === 'PENDING' ? '#fff3cd' : 
                                   verificationStatus[doc].status === 'APPROVED' ? '#d4edda' : '#f8d7da',
                    color: verificationStatus[doc].status === 'PENDING' ? '#856404' : 
                           verificationStatus[doc].status === 'APPROVED' ? '#155724' : '#721c24',
                    fontSize: '0.9rem'
                  }}>
                    {verificationStatus[doc].status === 'PENDING' && (
                      <span>
                        <iconify-icon icon="material-symbols:schedule" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon>
                        Đang chờ admin xác thực (trong vòng 2 ngày)
                      </span>
                    )}
                    {verificationStatus[doc].status === 'APPROVED' && (
                      <span>
                        <iconify-icon icon="material-symbols:check-circle" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon>
                        Đã được xác thực
                      </span>
                    )}
                    {verificationStatus[doc].status === 'REJECTED' && (
                      <span>
                        <iconify-icon icon="material-symbols:cancel" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon>
                        Bị từ chối: {verificationStatus[doc].rejectionReason || 'Không rõ lý do'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="profile-document-info">
                <label className="profile-document-label">Thông tin chung</label>
                <div className="profile-document-grid-info">
                  <div className="profile-info-item">
                    <span className="profile-info-label">{doc === 'license' ? 'Số GPLX' : 'Số CCCD'}</span>
                    <span className="profile-info-value">
                      {doc === 'license' 
                        ? user.licenseNumber || 'Chưa cung cấp' 
                        : user.identityNumber || 'Chưa cung cấp'}
                    </span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Họ và tên</span>
                    <span className="profile-info-value">{user.fullName || '---'}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Ngày sinh</span>
                    <span className="profile-info-value">{formatDate(user.birthDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return renderAccountInfo();
      case 'favorites':
        return (
          <div className="profile-content-container">
            <div className="profile-box favorites-box">
              <div className="profile-box-header">
                <h3 className="profile-box-title">Xe yêu thích của tôi</h3>
              </div>
              
              {/* Empty state for favorites */}
              <div className="favorites-empty-state">
                <div className="favorites-empty-icon">
                  <img 
                    src="/assets/images/no data/Gemini_Generated_Image_tufjhwtufjhwtufj-removebg-preview.png" 
                    alt="Không có xe yêu thích" 
                    className="no-favorites-image"
                  />
                </div>
                <p className="favorites-empty-text">Bạn chưa có xe yêu thích nào</p>
              </div>
            </div>
          </div>
        );
      case 'trips':
        const renderTripsContent = () => {
          // All tabs show the same empty state for now
          return (
            <div className="trips-empty-state">
              <div className="trips-empty-icon">
                <img 
                  src="/assets/images/no data/Gemini_Generated_Image_8hczgs8hczgs8hcz-removebg-preview.png" 
                  alt="No trips available" 
                  className="no-trips-image"
                />
              </div>
              <p className="trips-empty-text">Bạn chưa có chuyến</p>
            </div>
          );
        };

        return (
          <div className="profile-content-container">
            <div className="profile-box trips-box">
              <div className="profile-box-header">
                <h2 className="profile-box-title centered-title">Chuyến của tôi</h2>
              </div>
              
              {/* Trip Tabs */}
              <div className="trip-tabs">
                <button 
                  className={`trip-tab ${activeTripsTab === 'current' ? 'active' : ''}`}
                  onClick={() => setActiveTripsTab('current')}
                >
                  Chuyến hiện tại
                </button>
                <button 
                  className={`trip-tab ${activeTripsTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTripsTab('history')}
                >
                  Lịch sử chuyến
                </button>
                <button 
                  className={`trip-tab ${activeTripsTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTripsTab('overview')}
                >
                  Tổng quan chuyến
                </button>
              </div>

              {/* Trip Content */}
              <div className="trip-content">
                {renderTripsContent()}
              </div>
            </div>
          </div>
        );
      case 'password':
        const passwordFields = [
          { name: 'currentPassword', label: 'Nhập mật khẩu hiện tại', placeholder: 'Nhập mật khẩu hiện tại', show: showCurrentPassword, setter: setShowCurrentPassword },
          { name: 'newPassword', label: 'Nhập mật khẩu mới', placeholder: 'Nhập mật khẩu mới', show: showNewPassword, setter: setShowNewPassword },
          { name: 'confirmNewPassword', label: 'Xác nhận mật khẩu mới', placeholder: 'Xác nhận mật khẩu mới', show: showConfirmPassword, setter: setShowConfirmPassword },
        ];

        return (
          <div className="profile-content-container">
            <div className="profile-box password-box">
              <div className="password-header">
                <h3 className="password-title">Đổi mật khẩu</h3>
                <p className="password-subtitle">
                  Vui lòng nhập mật khẩu hiện tại để cài đặt lại mật khẩu mới!
                </p>
              </div>

              {/* Thông báo thành công */}
              {passwordSuccess && (
                <div
                  style={{
                    padding: '10px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    textAlign: 'center',
                  }}
                >
                  Đổi mật khẩu thành công!
                </div>
              )}

              <div className="password-form">
                <div className="password-section">
                  {/* Render động các input */}
                  {passwordFields.map((field) => (
                    <div key={field.name} className="password-field">
                      <label className="password-label">{field.label}</label>
                      <div className="password-input-container">
                        <input
                          type={field.show ? 'text' : 'password'}
                          className={`password-input ${
                            passwordErrors[field.name] ? 'input-error' : ''
                          }`}
                          placeholder={field.placeholder}
                          name={field.name}
                          value={passwordForm[field.name]}
                          onChange={handlePasswordInputChange}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => field.setter((prev) => !prev)}
                        >
                          <svg
                            className="password-toggle-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            {field.show ? (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </>
                            ) : (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M1 1l22 22"></path>
                              </>
                            )}
                          </svg>
                        </button>
                      </div>

                      {/* Hiển thị lỗi */}
                      {passwordErrors[field.name] && (
                        <span style={errorStyle}>{passwordErrors[field.name]}</span>
                      )}
                    </div>
                  ))}

                  {/* Nút xác nhận */}
                  <div className="password-actions">
                    <button 
                      className="password-confirm-btn"
                      onClick={handleChangePassword}
                    >
                      Xác nhận
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return renderAccountInfo();
    }
  };

  // Render delete account page
  const renderDeleteAccountPage = () => {
    return (
      <div className="profile-container">
        <Header onOpenLogin={handleOpenLogin} />
        
        <main className="profile-main full-width">
          <div className="delete-account-container">
            <div className="delete-account-content">
              <h1 className="delete-account-title">Yêu cầu xóa tài khoản</h1>
              <p className="delete-account-subtitle">Vui lòng đọc kĩ những điều sau</p>
              
              <div className="delete-account-illustration">
                <img 
                  src="/assets/images/no data/Gemini_Generated_Image_z6clpdz6clpdz6cl-removebg-preview.png" 
                  alt="Delete Account Illustration" 
                  className="delete-account-image"
                />
              </div>

              <div className="delete-account-text">
                <p className="info-text">Khi xóa tài khoản, các thông tin sau (nếu có) sẽ bị xóa trên hệ thống:</p>
                <ul className="info-list-simple">
                  <li>Thông tin cá nhân</li>
                  <li>Thông tin lịch sử chuyến và danh sách xe</li>
                </ul>
                <p className="info-text">Yêu cầu xóa tài khoản sẽ được xử lý trong vòng 15 ngày làm việc. FEV sẽ liên hệ trực tiếp với bạn thông qua Email hoặc Số điện thoại đã cung cấp.</p>
                <p className="info-text">Mọi thắc mắc xin liên hệ Fanpage của FEV hoặc Hotline 1900 1234 (7AM - 10PM) để được hỗ trợ.</p>
              </div>

              <div className="delete-account-actions">
                <button 
                  className="delete-account-btn"
                  onClick={() => setShowDeleteConfirmModal(true)}
                >
                  Xóa tài khoản
                </button>
                <button className="cancel-btn" onClick={() => setShowDeleteAccount(false)}>Hủy</button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        {showLogin && <Login onClose={handleCloseLogin} />}
        
        {/* Modal xác nhận xóa tài khoản */}
        {showDeleteConfirmModal && (
          <div className="delete-modal-overlay" onClick={handleCloseDeleteModal}>
            <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="delete-modal-header">
                <h3>Xác nhận xóa tài khoản</h3>
                <button 
                  className="delete-modal-close"
                  onClick={handleCloseDeleteModal}
                >
                  ×
                </button>
              </div>
              
              <div className="delete-modal-body">
                <div className="delete-warning">
                  <svg className="delete-warning-icon" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <h4>CẢNH BÁO: Hành động này không thể hoàn tác!</h4>
                </div>
                
                <p className="delete-description">
                  Khi xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn khỏi hệ thống bao gồm:
                </p>
                
                <ul className="delete-list">
                  <li>Thông tin cá nhân và tài khoản</li>
                  <li>Lịch sử thuê xe và giao dịch</li>
                  <li>Các file đã tải lên (GPLX, CCCD)</li>
                  <li>Danh sách xe yêu thích</li>
                </ul>
                
                <div className="delete-confirm-input">
                  <label htmlFor="deleteConfirm">
                    Để xác nhận, vui lòng nhập chính xác: <strong>"Đồng ý"</strong>
                  </label>
                  <input
                    type="text"
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Nhập: Đồng ý"
                    className="delete-confirm-text"
                  />
                </div>
              </div>
              
              <div className="delete-modal-footer">
                <button 
                  className="delete-confirm-btn"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'Đồng ý'}
                >
                  Xóa tài khoản vĩnh viễn
                </button>
                <button 
                  className="delete-cancel-btn"
                  onClick={handleCloseDeleteModal}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // If showing delete account page, render it
  if (showDeleteAccount) {
    return renderDeleteAccountPage();
  }

  return (
    <div className="profile-container">
      <Header onOpenLogin={handleOpenLogin} />
      
      <main className="profile-main">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-sidebar-header">
            <h1 className="profile-sidebar-title">FEV - SAY HI!</h1>
          </div>

          <nav className="profile-nav">
            <div className={`profile-nav-item ${activeSection === 'account' ? 'with-border' : 'without-border'}`}>
              <button
                onClick={() => setActiveSection('account')}
                className={`profile-nav-button ${activeSection === 'account' ? 'active' : ''}`}
              >
                <svg className="profile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Tài khoản của tôi
              </button>
            </div>

            <div className={`profile-nav-item ${activeSection === 'favorites' ? 'with-border' : 'without-border'}`}>
              <button
                onClick={() => setActiveSection('favorites')}
                className={`profile-nav-button ${activeSection === 'favorites' ? 'active' : ''}`}
              >
                <svg className="profile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Xe yêu thích
              </button>
            </div>

            <div className={`profile-nav-item ${activeSection === 'trips' ? 'with-border' : 'without-border'}`}>
              <button
                onClick={() => setActiveSection('trips')}
                className={`profile-nav-button ${activeSection === 'trips' ? 'active' : ''}`}
              >
                <svg className="profile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Chuyến của tôi
              </button>
            </div>

            <div className="profile-nav-separator">
              <div className={`profile-nav-item ${activeSection === 'password' ? 'with-border' : 'without-border'}`}>
                <button
                  onClick={() => setActiveSection('password')}
                  className={`profile-nav-button ${activeSection === 'password' ? 'active' : ''}`}
                >
                  <svg className="profile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="16" r="1"></circle>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Đổi mật khẩu
                </button>
              </div>

              <div className={`profile-nav-item ${activeSection === 'delete' ? 'with-border' : 'without-border'}`}>
                <button
                  onClick={() => setShowDeleteAccount(true)}
                  className={`profile-nav-button ${activeSection === 'delete' ? 'active' : ''}`}
                >
                  <svg className="profile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                  </svg>
                  Yêu cầu xóa tài khoản
                </button>
              </div>

              <div className="profile-nav-logout-section">
                <button
                  onClick={handleLogout}
                  className="profile-nav-button logout"
                >
                  <svg className="profile-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16,17 21,12 16,7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {/* Thông báo Verification ở đầu trang */}
          {user && (!user.licenseNumber || !user.identityNumber) && (
            <div className="verification-alert-banner">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <h4>Yêu cầu xác thực tài liệu</h4>
                <p>
                  {!user.licenseNumber && !user.identityNumber && 
                    'Bạn cần xác thực GPLX và CCCD để có thể đặt xe.'}
                  {!user.licenseNumber && user.identityNumber && 
                    'Bạn cần xác thực GPLX để có thể đặt xe.'}
                  {user.licenseNumber && !user.identityNumber && 
                    'Bạn cần xác thực CCCD để có thể đặt xe.'}
                </p>
                {!user.licenseNumber && (
                  <div className="alert-item">
                    {verificationStatus.license?.status === 'PENDING' ? (
                      <span className="status-pending">
                        <iconify-icon icon="material-symbols:schedule" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon>
                        GPLX: Đang chờ xác thực
                      </span>
                    ) : verificationStatus.license?.status === 'REJECTED' ? (
                      <span className="status-rejected">
                        <iconify-icon icon="material-symbols:cancel" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon>
                        GPLX: Bị từ chối - Vui lòng upload lại
                      </span>
                    ) : (
                      <span className="status-none">
                        <iconify-icon icon="material-symbols:description" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon>
                        GPLX: Chưa upload
                      </span>
                    )}
                  </div>
                )}
                {!user.identityNumber && (
                  <div className="alert-item">
                    {verificationStatus.identity?.status === 'PENDING' ? (
                      <span className="status-pending">
                        <iconify-icon icon="material-symbols:schedule" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon>
                        CCCD: Đang chờ xác thực
                      </span>
                    ) : verificationStatus.identity?.status === 'REJECTED' ? (
                      <span className="status-rejected">
                        <iconify-icon icon="material-symbols:cancel" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon>
                        CCCD: Bị từ chối - Vui lòng upload lại
                      </span>
                    ) : (
                      <span className="status-none">
                        <iconify-icon icon="material-symbols:description" aria-hidden="true" style={{marginRight: '6px', verticalAlign: 'baseline'}}></iconify-icon>
                        CCCD: Chưa upload
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {renderContent()}
        </div>
      </main>

      <Footer />
      {showLogin && <Login onClose={handleCloseLogin} />}
      


      {/* Image Viewer Modal */}
      {showImageViewer && user.avatarUrl && (
        <div className="image-viewer-overlay" onClick={() => setShowImageViewer(false)}>
          <div className="image-viewer-content" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowImageViewer(false)}
              className="image-viewer-close"
            >
              ×
            </button>
            <img src={user.avatarUrl} alt="Avatar" className="image-viewer-img" />
          </div>
        </div>
      )}

      {/* Image Cropper */}
      {cropperImage && (
        <ImageCropper
          src={cropperImage}
          onCrop={handleCropAndUpload}
          onCancel={cancelAvatarCrop}
        />
      )}
      
      {/* Modal xác nhận xóa tài khoản */}
      {showDeleteConfirmModal && (
        <div className="delete-modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3>Xác nhận xóa tài khoản</h3>
              <button 
                className="delete-modal-close"
                onClick={handleCloseDeleteModal}
              >
                ×
              </button>
            </div>
            
            <div className="delete-modal-body">
              <div className="delete-warning">
                <svg className="delete-warning-icon" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <h4>CẢNH BÁO: Hành động này không thể hoàn tác!</h4>
              </div>
              
              <p className="delete-description">
                Khi xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn khỏi hệ thống bao gồm:
              </p>
              
              <ul className="delete-list">
                <li>Thông tin cá nhân và tài khoản</li>
                <li>Lịch sử thuê xe và giao dịch</li>
                <li>Các file đã tải lên (GPLX, CCCD)</li>
                <li>Danh sách xe yêu thích</li>
              </ul>
              
              <div className="delete-confirm-input">
                <label htmlFor="deleteConfirm">
                  Để xác nhận, vui lòng nhập chính xác: <strong>"Đồng ý"</strong>
                </label>
                <input
                  type="text"
                  id="deleteConfirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Nhập: Đồng ý"
                  className="delete-confirm-text"
                />
              </div>
            </div>
            
            <div className="delete-modal-footer">
              <button 
                className="delete-confirm-btn"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'Đồng ý'}
              >
                Xóa tài khoản vĩnh viễn
              </button>
              <button 
                className="delete-cancel-btn"
                onClick={handleCloseDeleteModal}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
