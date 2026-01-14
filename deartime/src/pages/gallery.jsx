import { useNavigate, useLocation } from "react-router-dom"; 
import '../styles/gallery.css';
import React, { useMemo, useState, useRef, useEffect } from "react";
import { Pencil, Trash2, MoreVertical } from "lucide-react"; // Star는 CSS 가상요소로 대체했으므로 제외 가능
import bg from "../assets/background_nostar.png";
import AlbumCreateModal from "../components/AlbumCreateModal";

const Gallery = () => {
  // --- [공통 유틸리티 및 레퍼런스 설정] ---
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const isLongPressActive = useRef(false);

  // --- [탭 및 데이터 상태 관리] ---
  const tabs = ["RECORD", "ALBUM"];
  const [activeIndex, setActiveIndex] = useState(location.state?.activeTab ?? 0);

  const [photos, setPhotos] = useState([
    { id: 1, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '너무 즐거웠다!', isFavorite: false },
    { id: 2, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '그냥 웃음이 끊이지 않았던 날', isFavorite: true },
    { id: 3, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '하이디라오 먹고 싶다~', isFavorite: false },
  ]);

  const [albums, setAlbums] = useState([
    { id: 101, title: '즐겨찾기', count: 9, coverUrl: 'https://via.placeholder.com/300', isFavorite: true },
    { id: 102, title: '우리 가족', count: 1234, coverUrl: 'https://via.placeholder.com/300', isFavorite: false },
    { id: 103, title: '강쥐', count: 2894, coverUrl: 'https://via.placeholder.com/300', isFavorite: false },
  ]);

  // --- [UI 인터랙션 상태 관리] ---
  const [menu, setMenu] = useState({ show: false, x: 0, y: 0, targetId: null, type: null }); 
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleClick = () => setMenu(prev => ({ ...prev, show: false }));
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const startPress = (e, id, type) => {
    if (e.type === 'mousedown' && e.button !== 0) return;
    const x = e.pageX || (e.touches && e.touches[0].pageX);
    const y = e.pageY || (e.touches && e.touches[0].pageY);

    isLongPressActive.current = false;
    longPressTimerRef.current = setTimeout(() => {
      setMenu({ show: true, x, y, targetId: id, type });
      isLongPressActive.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500); 
  };

  const cancelPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleItemClick = (e, album = null) => {
    if (isLongPressActive.current) {
      e.stopPropagation();
      isLongPressActive.current = false;
      return;
    }
    if (album) handleAlbumClick(album);
  };

  const handleAlbumClick = (album) => {
    if (editingId) return;
    navigate(`/album/${album.id}`, { state: { album } });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '.');
      const newPhoto = { 
        id: Date.now(), 
        url: imageUrl, 
        date: today, 
        title: file.name.split('.')[0], 
        isFavorite: false 
      };
      setPhotos([newPhoto, ...photos]);
      e.target.value = '';
    }
  };

  const togglePhotoFavorite = (e, photoId) => {
    e.stopPropagation(); 
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, isFavorite: !p.isFavorite } : p));
  };

  const toggleAlbumFavorite = (e, albumId) => {
    e.stopPropagation(); 
    setAlbums(prev => prev.map(album => album.id === albumId ? { ...album, isFavorite: !album.isFavorite } : album));
  };

  const handleContextMenu = (e, id, type) => {
    e.preventDefault();
    setMenu({ show: true, x: e.pageX, y: e.pageY, targetId: id, type: type });
    isLongPressActive.current = true;
  };

  const handleAlbumMenuClick = (e, albumId) => {
    e.stopPropagation(); 
    const rect = e.currentTarget.getBoundingClientRect();
    setMenu({ show: true, x: rect.left - 160, y: rect.bottom + 10, targetId: albumId, type: 'album' });
  };

  const handleDelete = () => {
    if (menu.type === 'photo') setPhotos(prev => prev.filter(p => p.id !== menu.targetId));
    else setAlbums(prev => prev.filter(a => a.id !== menu.targetId));
    setMenu(prev => ({ ...prev, show: false }));
  };

  const handleEditStart = (e) => {
    e.stopPropagation();
    setEditingId(menu.targetId);
    setMenu(prev => ({ ...prev, show: false }));
  };

  const handleEditComplete = (e, id) => {
    if (e.key === 'Enter') {
      const newTitle = e.target.value;
      if (activeIndex === 0) setPhotos(prev => prev.map(p => p.id === id ? { ...p, title: newTitle } : p));
      else setAlbums(prev => prev.map(a => a.id === id ? { ...a, title: newTitle } : a));
      setEditingId(null);
    } else if (e.key === 'Escape') setEditingId(null);
  };

  const groupedPhotos = useMemo(() => {
    return photos.reduce((acc, photo) => {
      const date = photo.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(photo);
      return acc;
    }, {});
  }, [photos]);
  
  const sortedAlbums = useMemo(() => {
    return [...albums].sort((a, b) => {
      if (a.isFavorite === b.isFavorite) return 0;
      return a.isFavorite ? -1 : 1;
    });
  }, [albums]);

  return (
    <div className="gallery-container" style={{ backgroundImage: `url(${bg})` }}>
      
      <AlbumCreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={(data) => setAlbums([{id: Date.now(), ...data, count: 0, isFavorite: false}, ...albums])} 
      />

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />

      {(menu.show || editingId !== null) && <div className="context-menu-overlay" />}

      {menu.show && (
        <div className="custom-context-menu" style={{ top: menu.y, left: menu.x }} onClick={(e) => e.stopPropagation()}>
          <div className="menu-item" onClick={handleEditStart}>
            <Pencil size={20} color="white" />
            <span>{menu.type === 'photo' ? '텍스트 수정' : '제목 수정'}</span>
          </div>
          <div className="menu-divider" />
          <div className="menu-item delete" onClick={handleDelete}>
            <Trash2 size={20} color="#FF4D4D" />
            <span style={{ color: '#FF4D4D' }}>삭제</span>
          </div>
        </div>
      )}

      {/* 상단 영역 (왼쪽: 탭 / 오른쪽: 캡슐 생성 버튼) */}
      <div className="tc-topbar">
        {/* 상단 세부 네비 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "50px",  
            marginBottom: "0px",
            marginLeft: "60px",
            marginTop: "14px",
          }}
        >
          {tabs.map((tab, index) => {
            const isActive = index === activeIndex;

            return (
              <span
                key={tab}
                onClick={() => {
                  setActiveIndex(index);
                  setPage(1);
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.opacity = 1;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.opacity = 0.7;
                }}
                style={{
                  position: "relative",
                  fontSize: "23px",
                  fontFamily: "Josefin Slab",
                  fontWeight: isActive ? 600 : 350,
                  paddingBottom: "6px",
                  cursor: "pointer",
                  color: "white",
                  opacity: isActive ? 1 : 0.7,
                  transition: "opacity 0.2s ease",
                }}
              >
                {tab}

                {/* 클릭 시 밑줄 */}
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    width: "100%",
                    height: "2px",
                    backgroundColor: "#0E77BC",
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "center",
                    transition: "transform 0.3s ease",
                  }}
                />
              </span>
            );
          })}
        </div>

        {/* 오른쪽: 캡슐 생성 */}
        <div className="tc-topbar-right">
          <button
            type="button"
            className="tc-create-btn"
            onClick={() => activeIndex === 0 ? fileInputRef.current.click() : setIsModalOpen(true)}
          >
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
                {groupedPhotos[date].map((photo) => {
                  const isSpotlight = (menu.show && menu.targetId === photo.id) || (editingId === photo.id);
                  return (
                    <div 
                      key={photo.id} 
                      className={`photo-item ${isSpotlight ? 'spotlight' : ''}`} 
                      onContextMenu={(e) => handleContextMenu(e, photo.id, 'photo')}
                      onMouseDown={(e) => startPress(e, photo.id, 'photo')}
                      onMouseUp={cancelPress}
                      onMouseLeave={cancelPress}
                      onTouchStart={(e) => startPress(e, photo.id, 'photo')}
                      onTouchEnd={cancelPress}
                      onClick={(e) => handleItemClick(e)} 
                    >
                      <div className="img-box">
                        <img src={photo.url} alt="" />
                        {/* [수정 포인트: 클래스에 isFavorite 조건 추가] */}
                        <button 
                          className={`fav-star-btn photo-star ${photo.isFavorite ? 'active' : ''}`} 
                          onClick={(e) => togglePhotoFavorite(e, photo.id)}
                        >
                        </button>
                      </div>
                      {editingId === photo.id ? (
                        <input className="edit-title-input" defaultValue={photo.title} autoFocus onKeyDown={(e) => handleEditComplete(e, photo.id)} onBlur={() => setEditingId(null)} />
                      ) : (
                        <p className="photo-title">{photo.title}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        ) : (
          <div className="album-section">
            <div className="album-grid">
              {sortedAlbums.map((album) => {
                const isSpotlight = (menu.show && menu.targetId === album.id) || (editingId === album.id);
                return (
                  <div 
                    key={album.id} 
                    className={`album-item ${isSpotlight ? 'spotlight' : ''}`}
                    onClick={(e) => handleItemClick(e, album)}
                    onContextMenu={(e) => handleContextMenu(e, album.id, 'album')}
                    onMouseDown={(e) => startPress(e, album.id, 'album')}
                    onMouseUp={cancelPress}
                    onMouseLeave={cancelPress}
                    onTouchStart={(e) => startPress(e, album.id, 'album')}
                    onTouchEnd={cancelPress}
                    style={{ cursor: editingId === album.id ? 'default' : 'pointer' }}
                  >
                    <div className="album-img-box">
                      <img src={album.coverUrl} alt="" />
                      {/* [수정 포인트: 클래스에 isFavorite 조건 추가] */}
                      <button 
                        className={`fav-star-btn ${album.isFavorite ? 'active' : ''}`} 
                        onClick={(e) => toggleAlbumFavorite(e, album.id)}
                      >
                      </button>
                    </div>
                    <div className="album-info">
                      <div className="album-info-top">
                        {editingId === album.id ? (
                          <input className="edit-title-input" defaultValue={album.title} autoFocus onKeyDown={(e) => handleEditComplete(e, album.id)} onBlur={() => setEditingId(null)} onClick={(e) => e.stopPropagation()} />
                        ) : (
                          <h3>{album.title}</h3>
                        )}
                        <button className="album-menu-trigger" onClick={(e) => handleAlbumMenuClick(e, album.id)}>
                          <MoreVertical size={24} color="white" />
                        </button>
                      </div>
                      <p>항목 {album.count.toLocaleString()} 개</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;