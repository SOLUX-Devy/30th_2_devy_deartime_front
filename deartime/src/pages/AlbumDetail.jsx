import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import "../styles/AlbumDetail.css";

const AlbumDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const albumData = location.state?.album;

  const [albumPhotos, setAlbumPhotos] = useState([]);

  if (!albumData) {
    return <div className="error-msg">앨범 정보를 찾을 수 없습니다.</div>;
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file)
    }));
    
    setAlbumPhotos(prev => [...newPhotos, ...prev]);
    e.target.value = "";
  };

  return (
    <div className="album-detail-container">
      <div className="detail-top-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          &lt; RECORD
        </button>
        <span className="album-nav-title">ALBUM</span>
        <button className="create-header-btn">생성</button>
      </div>

      <div className="album-banner">
        <img src={albumData.coverUrl} alt="Album Cover" className="banner-img" />
      </div>

      <div className="album-content-area">
        <div className="photo-grid">
          {/* 1번째 칸: 사진 추가 버튼 */}
          <div className="grid-item add-btn-item" onClick={() => fileInputRef.current.click()}>
            <Plus size={40} color="#ffffff" strokeWidth={1} />
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              multiple 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />
          </div>

          {/* 추가된 사진들 리스트 */}
          {albumPhotos.map((photo) => (
            <div key={photo.id} className="grid-item photo-item">
              <img src={photo.url} alt="album-content" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlbumDetail;