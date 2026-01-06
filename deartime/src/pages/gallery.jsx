import '../styles/gallery.css';
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background_nostar.png";
import { Pencil, Trash2, MoreVertical, Star } from "lucide-react";
import AlbumCreateModal from "./AlbumCreateModal"; 

const Gallery = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const tabs = ["RECORD", "ALBUM"];
  const [activeIndex, setActiveIndex] = useState(0);

  // --- [데이터 상태] ---
  const [photos, setPhotos] = useState([
    { id: 1, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '너무 즐거웠다!' },
    { id: 2, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '그냥 웃음이 끊이지 않았던 날' },
    { id: 3, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '하이디라오 먹고 싶다~' },
  ]);

  const [albums, setAlbums] = useState([
    { id: 101, title: '즐겨찾기', count: 9, coverUrl: 'https://via.placeholder.com/300', isFavorite: true },
    { id: 102, title: '우리 가족', count: 1234, coverUrl: 'https://via.placeholder.com/300' },
    { id: 103, title: '강쥐', count: 2894, coverUrl: 'https://via.placeholder.com/300' },
  ]);

  // --- [UI 상태 제어] ---
  // 메뉴 상태를 하나로 통합하여 사진(photo)과 앨범(album) 모두 대응합니다.
  const [menu, setMenu] = useState({ show: false, x: 0, y: 0, targetId: null, type: null });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 메뉴 닫기 로직
  useEffect(() => {
    const handleClick = () => setMenu({ ...menu, show: false });
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [menu]);

  // --- [핸들러 함수] ---

  // 사진 우클릭 메뉴 열기
  const handlePhotoContextMenu = (e, photoId) => {
    e.preventDefault();
    setMenu({ show: true, x: e.pageX, y: e.pageY, targetId: photoId, type: 'photo' });
  };

  // 앨범 점 세개 클릭 메뉴 열기 (디자인 시안 반영)
  const handleAlbumMenuClick = (e, albumId) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    const rect = e.currentTarget.getBoundingClientRect();
    // 아이콘 바로 아래에 메뉴가 나타나도록 위치 계산
    setMenu({ 
      show: true, 
      x: rect.left - 150, 
      y: rect.bottom + 10, 
      targetId: albumId, 
      type: 'album' 
    });
  };

  const handleDelete = () => {
    if (menu.type === 'photo') {
      setPhotos(prev => prev.filter(p => p.id !== menu.targetId));
    } else {
      setAlbums(prev => prev.filter(a => a.id !== menu.targetId));
    }
  };

  const handleEditStart = () => {
    setEditingId(menu.targetId);
  };

  const handleEditComplete = (e, id) => {
    if (e.key === 'Enter') {
      const newTitle = e.target.value;
      if (activeIndex === 0) {
        setPhotos(prev => prev.map(p => p.id === id ? { ...p, title: newTitle } : p));
      } else {
        setAlbums(prev => prev.map(a => a.id === id ? { ...a, title: newTitle } : a));
      }
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
      <AlbumCreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={(data) => setAlbums([{id: Date.now(), ...data, count: 0}, ...albums])} 
      />

      {/* [효과] 메뉴 활성 시 배경 어둡게 처리 */}
      {menu.show && <div className="context-menu-overlay" />}

      {/* [UI] 사진/앨범 공용 커스텀 메뉴 (image_1b03ae.png 디자인 반영) */}
      {menu.show && (
        <div className="custom-context-menu" style={{ top: menu.y, left: menu.x }}>
          <div className="menu-item" onClick={handleEditStart}>
            <Pencil size={20} color="white" />
            <span>{menu.type === 'photo' ? '텍스트 수정' : '이름 수정'}</span>
          </div>
          <div className="menu-divider" />
          <div className="menu-item delete" onClick={handleDelete}>
            <Trash2 size={20} color="#FF4D4D" />
            <span style={{ color: '#FF4D4D' }}>삭제</span>
          </div>
        </div>
      )}

      <div className="tc-topbar">
        <div className="tab-group">
          {tabs.map((tab, idx) => (
            <span key={tab} className={`tab-item ${activeIndex === idx ? 'active' : ''}`} onClick={() => setActiveIndex(idx)}>
              {tab}{activeIndex === idx && <div className="tab-indicator" />}
            </span>
          ))}
        </div>
        <div className="tc-topbar-right">
          <button className="tc-create-btn" onClick={() => activeIndex === 0 ? fileInputRef.current.click() : setIsModalOpen(true)}>
            {activeIndex === 0 ? '업로드' : '생성'}
          </button>
        </div>
      </div>

      <div className="gallery-content-wrapper">
        {activeIndex === 0 ? (
          /* --- RECORD 탭 --- */
          Object.keys(groupedPhotos).map((date) => (
            <section key={date} className="date-group">
              <h2 className="date-title">{date}</h2>
              <div className="photo-grid">
                {groupedPhotos[date].map((photo) => (
                  <div key={photo.id} className={`photo-item ${menu.show && menu.targetId === photo.id && menu.type === 'photo' ? 'spotlight' : ''}`} onContextMenu={(e) => handlePhotoContextMenu(e, photo.id)}>
                    <div className="img-box"><img src={photo.url} alt="" /></div>
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
          /* --- ALBUM 탭 (4열 그리드 및 스포트라이트 적용) --- */
          <div className="album-section">
            <div className="album-grid">
              {albums.map((album) => (
                <div 
                  key={album.id} 
                  className={`album-item ${menu.show && menu.targetId === album.id && menu.type === 'album' ? 'spotlight' : ''}`}
                >
                  <div className="album-img-box">
                    <img src={album.coverUrl} alt="" />
                    {album.isFavorite && <Star className="fav-star-icon" size={24} fill="#FFD700" color="#FFD700" />}
                  </div>
                  <div className="album-info">
                    <div className="album-info-top">
                      {editingId === album.id ? (
                        <input className="edit-title-input" defaultValue={album.title} autoFocus onKeyDown={(e) => handleEditComplete(e, album.id)} onBlur={() => setEditingId(null)} />
                      ) : (
                        <h3>{album.title}</h3>
                      )}
                      {/* 점 세개 클릭 시 메뉴 트리거 */}
                      <button className="album-menu-trigger" onClick={(e) => handleAlbumMenuClick(e, album.id)}>
                        <MoreVertical size={24} color="white" />
                      </button>
                    </div>
                    <p>항목 {album.count.toLocaleString()} 개</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;