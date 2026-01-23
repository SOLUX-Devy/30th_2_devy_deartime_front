import React, { useState, useRef, useEffect } from 'react';
import '../styles/AlbumCreateModal.css';
import { X } from 'lucide-react';

const AlbumCreateModal = ({ isOpen, onClose, onCreate }) => {
  const [albumTitle, setAlbumTitle] = useState('');
  const [previewImage, setPreviewImage] = useState('https://via.placeholder.com/300');
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  // 모달이 닫힐 때나 컴포넌트가 언마운트될 때 메모리 해제
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  if (!isOpen) return null;

  // 표지 사진 영역 클릭 시 파일 입력창 호출
  const handleLogoClick = () => {
    fileInputRef.current.click();
  };

  // 이미지 파일 선택 시 처리
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // 서버 전송용 파일 저장
      
      // 기존 미리보기 URL 메모리 해제 (선택 사항이나 권장함)
      if (previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }

      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  // 생성 버튼 클릭 시 부모(Gallery)에게 데이터 전달
  const handleCreate = () => {
    if (!albumTitle.trim()) {
      alert("앨범 제목을 입력해주세요.");
      return;
    }
    
    // Gallery.jsx의 handleCreateAlbum으로 데이터 전달
    onCreate({ 
      title: albumTitle, 
      imageFile: selectedFile 
    });

    // 상태 초기화
    setAlbumTitle('');
    setPreviewImage('https://via.placeholder.com/300');
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="modal-root">
      {/* 바깥 배경 클릭 시 닫기 */}
      <div className="modal-overlay" onClick={onClose}></div>
      
      <div className="album-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={32} color="white" />
        </button>

        <h2 className="modal-title">앨범 생성</h2>

        <div className="modal-content">
          {/* 1. 커버 설정 섹션 */}
          <div className="cover-section">
            <div className="cover-preview" onClick={handleLogoClick}>
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

          {/* 2. 제목 입력 섹션 */}
          <div className="input-section">
            <label className="input-label">앨범 제목</label>
            <input 
              type="text" 
              className="album-title-input" 
              placeholder="제목을 입력하세요"
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          {/* 3. 하단 버튼 섹션 */}
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