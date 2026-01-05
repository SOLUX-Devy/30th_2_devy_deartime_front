import React, { useState } from 'react';
import '../styles/AlbumCreateModal.css';
import { X } from 'lucide-react';

const AlbumCreateModal = ({ isOpen, onClose, onCreate }) => {
  const [albumTitle, setAlbumTitle] = useState('');
  const [previewImage, setPreviewImage] = useState('https://via.placeholder.com/300'); // 기본 이미지

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!albumTitle.trim()) {
      alert("앨범 제목을 입력해주세요.");
      return;
    }
    onCreate({ title: albumTitle, coverUrl: previewImage });
    onClose();
  };

  return (
    <div className="modal-root">
      {/* 배경을 어둡게 만드는 오버레이 */}
      <div className="modal-overlay" onClick={onClose}></div>
      
      {/* 앨범 생성 창 본체 */}
      <div className="album-modal-container">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={32} color="white" />
        </button>

        <h2 className="modal-title">앨범 생성</h2>

        <div className="modal-content">
          {/* 표지 사진 영역 */}
          <div className="cover-section">
            <div className="cover-preview">
              <img src={previewImage} alt="Cover Preview" />
            </div>
            <button className="change-cover-btn">
              표지 사진 변경
            </button>
          </div>

          {/* 앨범 제목 입력 영역 */}
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

          {/* 생성 버튼 */}
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