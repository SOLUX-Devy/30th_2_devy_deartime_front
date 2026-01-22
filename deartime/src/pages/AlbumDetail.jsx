import { useNavigate, useParams, useLocation } from "react-router-dom";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Pen, Trash2, ArrowLeft, MoreVertical } from "lucide-react";
import '../styles/AlbumDetail.css';
import bg from "../assets/background_nostar.png";
/* API 인스턴스 임포트 (경로 확인 필요) */
import api from "../api/proxy"; 

const AlbumDetail = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  /* 상태 관리: 더미 데이터 삭제 */
  const [photos, setPhotos] = useState([]);
  const [albumTitle, setAlbumTitle] = useState(location.state?.album?.title || "");
  const [loading, setLoading] = useState(true);
  
  const [menu, setMenu] = useState({ show: false, x: 0, y: 0, targetId: null, isCentered: false });
  const [editingId, setEditingId] = useState(null);
  const [isEditingAlbumTitle, setIsEditingAlbumTitle] = useState(false);

  useEffect(() => {
    fetchAlbumPhotos();
  }, [albumId]);

  /* 1. 앨범 내 사진 목록 조회: GET /api/albums/{albumId}/photos */
  const fetchAlbumPhotos = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/albums/${albumId}/photos`, {
        params: { sort: "takenAt,desc", page: 0, size: 20 }
      });
      // 페이징 객체일 경우 response.data.content 사용
      setPhotos(response.data.content || response.data);
    } catch (error) {
      console.error("앨범 사진 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  /* 2. 앨범 이름 수정: POST /api/albums/{albumId}/title */
  const handleAlbumTitleEdit = async (e) => {
    if (e.key === 'Enter') {
      const newTitle = e.target.value;
      try {
        await api.post(`/api/albums/${albumId}/title`, { title: newTitle });
        setAlbumTitle(newTitle);
        setIsEditingAlbumTitle(false);
      } catch (error) {
        alert("앨범 제목 수정 실패");
      }
    } else if (e.key === 'Escape') setIsEditingAlbumTitle(false);
  };

  /* 3. 앨범에서 사진 제거: DELETE /api/albums/{albumId}/photos/{photoId} */
  const handleDeletePhoto = async () => {
    try {
      await api.delete(`/api/albums/${albumId}/photos/${menu.targetId}`);
      setPhotos(prev => prev.filter(p => p.id !== menu.targetId));
    } catch (error) {
      alert("사진 제거 실패");
    }
    setMenu({ ...menu, show: false });
  };

  /* 4. 사진 캡션 수정: POST /api/photos/{photoId}/caption */
  const handleCaptionEditComplete = async (e, photoId) => {
    if (e.key === 'Enter') {
      const newCaption = e.target.value;
      try {
        await api.post(`/api/photos/${photoId}/caption`, { caption: newCaption });
        setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, caption: newCaption } : p));
      } catch (error) {
        alert("캡션 수정 실패");
      }
      setEditingId(null);
    } else if (e.key === 'Escape') setEditingId(null);
  };

  /* 날짜별 그룹화 로직 */
  const groupedPhotos = useMemo(() => {
    return photos.reduce((acc, photo) => {
      const date = photo.takenAt?.split('T')[0] || photo.date || "Unknown";
      if (!acc[date]) acc[date] = [];
      acc[date].push(photo);
      return acc;
    }, {});
  }, [photos]);

  if (loading) return <div className="loading">앨범을 불러오는 중...</div>;

  return (
    <div className="album-detail-container" style={{ backgroundImage: `url(${bg})` }}>
      <div className="ad-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={24} color="white" />
        </button>
        
        {isEditingAlbumTitle ? (
          <input 
            className="edit-album-title-input"
            defaultValue={albumTitle}
            autoFocus
            onKeyDown={handleAlbumTitleEdit}
            onBlur={() => setIsEditingAlbumTitle(false)}
          />
        ) : (
          <h1 onClick={() => setIsEditingAlbumTitle(true)}>{albumTitle}</h1>
        )}
        <div className="header-right-empty" />
      </div>

      <div className="gallery-content-wrapper">
        {Object.keys(groupedPhotos).length > 0 ? (
          Object.keys(groupedPhotos).map((date) => (
            <section key={date} className="date-group">
              <h2 className="date-title">{date}</h2>
              <div className="photo-grid">
                {groupedPhotos[date].map((photo) => (
                  <div 
                    key={photo.id} 
                    className="photo-item"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setMenu({ show: true, x: e.clientX, y: e.clientY, targetId: photo.id });
                    }}
                  >
                    <div className="img-box">
                      <img src={photo.imagePath || photo.url} alt={photo.caption} />
                    </div>
                    {editingId === photo.id ? (
                      <input 
                        className="edit-title-input" 
                        defaultValue={photo.caption || photo.title} 
                        autoFocus 
                        onKeyDown={(e) => handleCaptionEditComplete(e, photo.id)}
                        onBlur={() => setEditingId(null)}
                      />
                    ) : (
                      <p className="photo-title">{photo.caption || photo.title}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="empty-message">앨범에 사진이 없습니다.</div>
        )}
      </div>

      {/* 우클릭/롱프레스 컨텍스트 메뉴 */}
      {menu.show && (
        <>
          <div className="context-menu-overlay" onClick={() => setMenu({ ...menu, show: false })} />
          <div className="custom-context-menu" style={{ top: menu.y, left: menu.x }}>
            <div className="menu-item" onClick={() => { setEditingId(menu.targetId); setMenu({ ...menu, show: false }); }}>
              <Pen size={15} color="white" />
              <span>캡션 수정</span>
            </div>
            <div className="menu-divider" />
            <div className="menu-item delete" onClick={handleDeletePhoto}>
              <Trash2 size={15} color="#FF4D4D" />
              <span>앨범에서 제거</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AlbumDetail;