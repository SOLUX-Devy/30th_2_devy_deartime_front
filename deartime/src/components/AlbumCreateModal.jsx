import React, { useState, useRef } from 'react';
import '../styles/AlbumCreateModal.css';
import { X } from 'lucide-react';

const AlbumCreateModal = ({ isOpen, onClose, onCreate }) => {
  const [albumTitle, setAlbumTitle] = useState('');
  const [previewImage, setPreviewImage] = useState('https://via.placeholder.com/300'); // 기본 이미지
  
  // [추가] 파일 입력창을 가리키기 위한 Ref
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // [추가] 사진 변경 버튼 클릭 시 숨겨진 input을 클릭하는 함수
  const handleLogoClick = () => {
    fileInputRef.current.click();
  };

  // [추가] 파일이 선택되었을 때 실행되는 함수
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 선택한 파일을 미리보기 URL로 변환
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleCreate = () => {
    if (!albumTitle.trim()) {
      alert("앨범 제목을 입력해주세요.");
      return;
    }
    onCreate({ title: albumTitle, coverUrl: previewImage });
    onClose();
    // 초기화 (필요시)
    setAlbumTitle('');
    setPreviewImage('https://via.placeholder.com/300');
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

            {/* [수정] 버튼 클릭 시 handleLogoClick 호출 */}
            <button className="change-cover-btn" onClick={handleLogoClick}>
              표지 사진 변경
            </button>

            {/* [추가] 숨겨진 파일 입력창 */}
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