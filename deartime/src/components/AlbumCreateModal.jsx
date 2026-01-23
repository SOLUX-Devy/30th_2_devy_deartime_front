import React, { useState, useRef } from 'react';
import '../styles/AlbumCreateModal.css';
import { X } from 'lucide-react';

const AlbumCreateModal = ({ isOpen, onClose, onCreate }) => {
  const [albumTitle, setAlbumTitle] = useState('');
  const [previewImage, setPreviewImage] = useState('https://via.placeholder.com/300');
  const [selectedFile, setSelectedFile] = useState(null); // [추가] 실제 파일 객체 저장

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleLogoClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // 서버 전송용 파일 저장
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleCreate = () => {
    if (!albumTitle.trim()) {
      alert("앨범 제목을 입력해주세요.");
      return;
    }
    
    // [수정] 파일 객체와 제목을 함께 전달
    onCreate({ 
      title: albumTitle, 
      imageFile: selectedFile 
    });

    // 초기화 및 닫기
    setAlbumTitle('');
    setPreviewImage('https://via.placeholder.com/300');
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="modal-root">
      <div className="modal-overlay" onClick={onClose}></div>
      
      <div className="album-modal-container">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={32} color="white" />
        </button>

        <h2 className="modal-title">앨범 생성</h2>

        <div className="modal-content">
          <div className="cover-section">
            <div className="cover-preview">
              <img src={previewImage} alt="Cover Preview" />
            </div>

            <button className="change-cover-btn" onClick={handleLogoClick}>
              표지 사진 변경
            </button>

            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>

          <div className="input-section">
            <label className="input-label">앨범 제목</label>
            <input 
              type="text" 
              className="album-title-input" 
              placeholder="제목을 입력하세요"
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button className="submit-btn" onClick={handleCreate}>
              생성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumCreateModal;