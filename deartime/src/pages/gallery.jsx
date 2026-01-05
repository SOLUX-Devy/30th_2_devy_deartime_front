import '../styles/gallery.css';
import React, { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background_nostar.png";

const Gallery = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const tabs = ["RECORD", "ALBUM"];
  const [activeIndex, setActiveIndex] = useState(0);

  const [photos, setPhotos] = useState([
    { id: 1, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '너무 즐거웠다!' },
    { id: 2, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '그냥 웃음이 끊이지 않았던 날' },
    { id: 3, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '하이디라오 먹고 싶다~' },
    { id: 4, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '아 자고싶다' },
    { id: 5, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '휴학 언제 하지' },
    { id: 6, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '학교 가기 싫다' },
  ]);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newPhoto = {
        id: Date.now(),
        url: URL.createObjectURL(file),
        date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '').slice(0, -1),
        title: file.name.split('.')[0],
      };
      setPhotos([newPhoto, ...photos]);
    }
  };

  const groupedPhotos = useMemo(() => {
    return photos.reduce((acc, photo) => {
      const date = photo.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(photo);
      return acc;
    }, {});
  }, [photos]);

  return (
    <div className="gallery-container" style={{ backgroundImage: `url(${bg})` }}>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileChange}
      />

      {/* 상단바 고정 영역 */}
      <div className="tc-topbar">
        <div className="tab-group">
          {tabs.map((tab, index) => {
            const isActive = index === activeIndex;
            return (
              <span
                key={tab}
                className={`tab-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveIndex(index)}
              >
                {tab}
                {isActive && <div className="tab-indicator" />}
              </span>
            );
          })}
        </div>

        <div className="tc-topbar-right">
          <button type="button" className="tc-create-btn" onClick={handleUploadClick}>
            업로드
          </button>
        </div>
      </div>

      {/* 스크롤 가능한 사진 목록 영역 */}
      <div className="gallery-content-wrapper">
        {activeIndex === 0 ? (
          Object.keys(groupedPhotos).map((date) => (
            <section key={date} className="date-group">
              <h2 className="date-title">{date}</h2>
              <div className="photo-grid">
                {groupedPhotos[date].map((photo) => (
                  <div key={photo.id} className="photo-item">
                    <img src={photo.url} alt={photo.title} />
                    <p className="photo-title">{photo.title}</p>
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="tc-empty">ALBUM 컨텐츠가 비어 있습니다.</div>
        )}
      </div>
    </div>
  );
};

export default Gallery;