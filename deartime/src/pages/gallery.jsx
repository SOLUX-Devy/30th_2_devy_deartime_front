import '../styles/gallery.css';
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background_nostar.png";
import { Pencil, Trash2, MoreVertical, Star } from "lucide-react";
import AlbumCreateModal from "../components/AlbumCreateModal"; 

const Gallery = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const tabs = ["RECORD", "ALBUM"];
  const [activeIndex, setActiveIndex] = useState(0);

  // --- [데이터 상태] ---
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

  // --- [UI 상태 제어] ---
  const [menu, setMenu] = useState({ show: false, x: 0, y: 0, targetId: null, type: null });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleClick = () => setMenu({ ...menu, show: false });
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [menu]);

  // --- [핸들러 함수] ---

  // 사진 업로드 핸들러
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

  // 사진 즐겨찾기 토글 (단순 토글, 정렬X)
  const togglePhotoFavorite = (e, photoId) => {
    e.stopPropagation();
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  // 앨범 즐겨찾기 토글 (정렬 적용됨)
  const toggleAlbumFavorite = (e, albumId) => {
    e.stopPropagation();
    setAlbums(prev => prev.map(album => 
      album.id === albumId ? { ...album, isFavorite: !album.isFavorite } : album
    ));
  };

  const handlePhotoContextMenu = (e, photoId) => {
    e.preventDefault();
    setMenu({ show: true, x: e.pageX, y: e.pageY, targetId: photoId, type: 'photo' });
  };

  const handleAlbumMenuClick = (e, albumId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenu({ show: true, x: rect.left - 160, y: rect.bottom + 10, targetId: albumId, type: 'album' });
  };

  const handleDelete = () => {
    if (menu.type === 'photo') {
      setPhotos(prev => prev.filter(p => p.id !== menu.targetId));
    } else {
      setAlbums(prev => prev.filter(a => a.id !== menu.targetId));
    }
  };

  const handleEditStart = () => setEditingId(menu.targetId);

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

  // --- [데이터 정렬 및 그룹화] ---
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

      {menu.show && <div className="context-menu-overlay" />}

      {menu.show && (
        <div className="custom-context-menu" style={{ top: menu.y, left: menu.x }}>
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
                  <div key={photo.id} 
                       className={`photo-item ${menu.show && menu.targetId === photo.id && menu.type === 'photo' ? 'spotlight' : ''}`} 
                       onContextMenu={(e) => handlePhotoContextMenu(e, photo.id)}>
                    <div className="img-box">
                      <img src={photo.url} alt="" />
                      {/* 별 버튼을 이미지 위에 상시 배치 */}
                      <button className="fav-star-btn photo-star" onClick={(e) => togglePhotoFavorite(e, photo.id)}>
                        <Star 
                          size={18} 
                          fill={photo.isFavorite ? "#FFD700" : "none"} 
                          stroke={photo.isFavorite ? "#FFD700" : "white"} 
                          strokeWidth={2} 
                        />
                      </button>
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
          /* --- ALBUM 탭 --- */
          <div className="album-section">
            <div className="album-grid">
              {sortedAlbums.map((album) => (
                <div key={album.id} className={`album-item ${menu.show && menu.targetId === album.id && menu.type === 'album' ? 'spotlight' : ''}`}>
                  <div className="album-img-box">
                    <img src={album.coverUrl} alt="" />
                    {/* 별 버튼을 앨범 커버 위에 상시 배치 */}
                    <button className="fav-star-btn" onClick={(e) => toggleAlbumFavorite(e, album.id)}>
                      <Star 
                        size={24} 
                        fill={album.isFavorite ? "#FFD700" : "none"} 
                        stroke={album.isFavorite ? "#FFD700" : "white"} 
                        strokeWidth={2} 
                      />
                    </button>
                  </div>
                  <div className="album-info">
                    <div className="album-info-top">
                      {editingId === album.id ? (
                        <input className="edit-title-input" defaultValue={album.title} autoFocus onKeyDown={(e) => handleEditComplete(e, album.id)} onBlur={() => setEditingId(null)} />
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;