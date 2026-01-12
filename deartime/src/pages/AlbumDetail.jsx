import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, X, Camera } from "lucide-react"; 
import "../styles/AlbumDetail.css";
import bg from "../assets/background_nostar.png";

const AlbumDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const photoInputRef = useRef(null); 
  const coverInputRef = useRef(null); 

  const albumData = location.state?.album;
  
  const [currentCover, setCurrentCover] = useState(albumData?.coverUrl); 
  const [albumPhotos, setAlbumPhotos] = useState([]);

  if (!albumData) {
    return <div className="error-msg">앨범 정보를 찾을 수 없습니다.</div>;
  }

  const handleCoverEdit = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newCoverUrl = URL.createObjectURL(file);
      setCurrentCover(newCoverUrl);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file)
    }));
    setAlbumPhotos(prev => [...newPhotos, ...prev]);
    e.target.value = "";
  };

  const handleDeletePhoto = (photoId) => {
    if (window.confirm("이 사진을 앨범에서 삭제하시겠습니까?")) {
      setAlbumPhotos(prev => prev.filter(photo => photo.id !== photoId));
    }
  };

  const handleBack = () => {
    navigate("/gallery", { 
      state: { 
        activeTab: 1, 
        updatedAlbum: { ...albumData, coverUrl: currentCover } 
      } 
    });
  };

  return (
    <div className="gallery-container" style={{ backgroundImage: `url(${bg})` }}>
      <div className="album-detail-container">
        {/* 상단 네비바 */}
        <div className="detail-top-nav">
          <button className="back-btn" onClick={handleBack}>
            &lt; ALBUM
          </button>
          <span className="album-nav-title">{albumData.title}</span>
        </div>

        {/* 상단 커버 영역 */}
        <div className="album-banner" onClick={() => coverInputRef.current.click()}>
          <img src={currentCover} alt="Album Cover" className="banner-img" />
          <div className="banner-overlay">
            {/* 대문자로 수정 */}
            <Camera size={32} color="white" />
            <span>커버 사진 변경</span>
          </div>
          <input 
            type="file" 
            ref={coverInputRef} 
            style={{ display: "none" }} 
            accept="image/*" 
            onChange={handleCoverEdit} 
          />
        </div>

        <div className="album-content-area">
          <div className="photo-grid1">
            {/* 사진 추가 버튼 */}
            <div className="grid-item add-btn-item" onClick={() => photoInputRef.current.click()}>
              {/* 대문자로 수정 */}
              <Plus size={40} color="#ffffff" strokeWidth={1} />
              <input 
                type="file" 
                ref={photoInputRef} 
                style={{ display: "none" }} 
                multiple 
                accept="image/*" 
                onChange={handlePhotoUpload} 
              />
            </div>

            {/* 사진 리스트 */}
            {albumPhotos.map((photo) => (
              <div key={photo.id} className="grid-item photo-item1">
                <img src={photo.url} alt="album-content" />
                <button className="delete-photo-btn" onClick={(e) => {
                  e.stopPropagation(); // 그리드 클릭 이벤트 전파 방지
                  handleDeletePhoto(photo.id);
                }}>
                  {/* 대문자로 수정 */}
                  <X size={16} color="white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div> 
    </div>
  );
};

export default AlbumDetail;