import '../styles/gallery.css';
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background_nostar.png";
import { Pencil, Trash2, MoreVertical, Star } from "lucide-react";

const Gallery = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const tabs = ["RECORD", "ALBUM"];
  const [activeIndex, setActiveIndex] = useState(0);

  // --- [RECORD 데이터] ---
  const [photos, setPhotos] = useState([
    { id: 1, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '너무 즐거웠다!' },
    { id: 2, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '그냥 웃음이 끊이지 않았던 날' },
    { id: 3, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '하이디라오 먹고 싶다~' },
    { id: 4, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '아 자고싶다' },
    { id: 5, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '휴학 언제 하지' },
    { id: 6, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '학교 가기 싫다' },
    { id: 7, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '안대에에' },
    { id: 8, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '은행잎 나비 펄럭쓰' },
    { id: 9, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '꼬깃꼬깃' },
  ]);

  // --- [ALBUM 데이터] ---
  const [albums, setAlbums] = useState([
    { id: 1, title: '즐겨찾기', count: 9, coverUrl: 'https://via.placeholder.com/300', isFavorite: true },
    { id: 2, title: '우리 가족', count: 1234, coverUrl: 'https://via.placeholder.com/300' },
    { id: 3, title: '강쥐', count: 2894, coverUrl: 'https://via.placeholder.com/300' },
    { id: 4, title: '고양이', count: 986, coverUrl: 'https://via.placeholder.com/300' },
    { id: 5, title: '친구들', count: 5678, coverUrl: 'https://via.placeholder.com/300' },
  ]);

  const [menu, setMenu] = useState({ show: false, x: 0, y: 0, photoId: null });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const handleClick = () => setMenu({ ...menu, show: false });
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [menu]);

  const handleUploadClick = () => fileInputRef.current.click();
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

  const handleContextMenu = (e, photoId) => {
    e.preventDefault();
    setMenu({ show: true, x: e.pageX, y: e.pageY, photoId });
  };
  const handleDelete = () => setPhotos(prev => prev.filter(p => p.id !== menu.photoId));
  const handleEditComplete = (e, id) => {
    if (e.key === 'Enter') {
      const newTitle = e.target.value;
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, title: newTitle } : p));
      setEditingId(null);
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
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />

      {/* [수정 포인트: 우클릭 시 전체 화면을 어둡게 만드는 오버레이] */}
      {menu.show && (
        <div className="context-menu-overlay" onClick={() => setMenu({ ...menu, show: false })} />
      )}

      {/* 우클릭 커스텀 메뉴 */}
      {menu.show && (
        <div className="custom-context-menu" style={{ top: menu.y, left: menu.x }}>
          <div className="menu-item" onClick={() => setEditingId(menu.photoId)}>
            <Pencil size={18} color="white" />
            <span>텍스트 수정</span>
          </div>
          <div className="menu-divider" />
          <div className="menu-item delete" onClick={handleDelete}>
            <Trash2 size={18} color="#FF4D4D" />
            <span style={{ color: '#FF4D4D' }}>삭제</span>
          </div>
        </div>
      )}

      <div className="tc-topbar">
        <div className="tab-group">
          {tabs.map((tab, index) => (
            <span key={tab} className={`tab-item ${activeIndex === index ? 'active' : ''}`} onClick={() => setActiveIndex(index)}>
              {tab}
              {activeIndex === index && <div className="tab-indicator" />}
            </span>
          ))}
        </div>
        <div className="tc-topbar-right">
          <button className="tc-create-btn" onClick={activeIndex === 0 ? handleUploadClick : () => alert('앨범 생성')}>
            {activeIndex === 0 ? '업로드' : '생성'}
          </button>
        </div>
      </div>

      <div className="gallery-content-wrapper">
        {activeIndex === 0 ? (
          Object.keys(groupedPhotos).map((date) => (
            <section key={date} className="date-group">
              <h2 className="date-title">{date}</h2>
              <div className="photo-grid">
                {groupedPhotos[date].map((photo) => (
                  /* [수정 포인트: 선택된 사진만 강조(spotlight) 하기 위한 조건부 클래스 추가] */
                  <div 
                    key={photo.id} 
                    className={`photo-item ${menu.show && menu.photoId === photo.id ? 'spotlight' : ''}`} 
                    onContextMenu={(e) => handleContextMenu(e, photo.id)}
                  >
                    <div className="img-box">
                      <img src={photo.url} alt="" />
                    </div>
                    {editingId === photo.id ? (
                      <input className="edit-title-input" defaultValue={photo.title} autoFocus onKeyDown={(e) => handleEditComplete(e, photo.id)} onBlur={() => setEditingId(null)} />
                    ) : (
                      <p className="photo-title">{photo.title}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="album-section">
            <div className="album-grid">
              {albums.map((album) => (
                <div key={album.id} className="album-item">
                  <div className="album-img-box">
                    <img src={album.coverUrl} alt="" />
                    {album.isFavorite && <Star className="fav-star-icon" size={24} fill="#FFD700" color="#FFD700" />}
                  </div>
                  <div className="album-info">
                    <div className="album-info-top">
                      <h3>{album.title}</h3>
                      <MoreVertical size={20} className="album-more-icon" />
                    </div>
                    <p>항목 {album.count.toLocaleString()} 개</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination">
              {[1, 2, 3, 4, 5].map(num => (
                <span key={num} className={`page-num ${num === 1 ? 'active' : ''}`}>{num}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;