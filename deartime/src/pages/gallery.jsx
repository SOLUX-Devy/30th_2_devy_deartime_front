import { useNavigate, useLocation } from "react-router-dom"; 
import '../styles/gallery.css';
import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { Pen, Trash2, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"; 
import bg from "../assets/background_nostar.png";
import AlbumCreateModal from "../components/AlbumCreateModal";
import axios from "axios";

const Gallery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const scrollObserverRef = useRef(null);

  /* [API 경로 설정] 
    Mixed Content 및 Network Error 방지를 위해 상대 경로 '/api' 사용. 
    Vercel의 vercel.json 설정에 의해 자동으로 백엔드 서버와 통신합니다.
  */
  const BASE_PATH = "/api"; 
  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
  });

  const tabs = ["RECORD", "ALBUM"];
  const [activeIndex, setActiveIndex] = useState(location.state?.activeTab ?? 0);

  /* 데이터 및 페이지네이션 상태 관리 */
  const [photos, setPhotos] = useState([]);
  const [photoPage, setPhotoPage] = useState(0);
  const [hasMorePhotos, setHasMorePhotos] = useState(true);
  const [albums, setAlbums] = useState([]);
  const [albumPage, setAlbumPage] = useState(1);
  const ALBUMS_PER_PAGE = 6;

  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState({ show: false, x: 0, y: 0, targetId: null, type: null, isCentered: false }); 
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* 이미지 URL을 안전한 https로 변환하는 함수 (Mixed Content 방지) */
  const ensureHttps = (url) => {
    if (!url) return url;
    return url.replace(/^http:\/\//i, 'https://');
  };

  /* 사진 데이터를 백엔드에서 불러오는 함수 (무한 스크롤용) */
  const fetchPhotos = useCallback(async (page) => {
    if (loading || !hasMorePhotos) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_PATH}/photos`, {
        headers: getAuthHeader(),
        params: { sort: "takenAt,desc", page: page, size: 20 }
      });
      
      const newPhotos = res.data.data || [];
      if (newPhotos.length < 20) setHasMorePhotos(false);
      
      setPhotos(prev => (page === 0 ? newPhotos : [...prev, ...newPhotos]));
    } catch (err) {
      console.error("사진 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMorePhotos]);

  /* 앨범 데이터를 백엔드에서 불러오는 함수 */
  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_PATH}/albums`, {
        headers: getAuthHeader()
      });
      setAlbums(res.data.data || []);
    } catch (err) {
      console.error("앨범 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  /* 탭 변경 시 데이터 로드 로직 */
  useEffect(() => {
    if (activeIndex === 0) {
      setPhotos([]);
      setPhotoPage(0);
      setHasMorePhotos(true);
      fetchPhotos(0);
    } else {
      fetchAlbums();
    }
  }, [activeIndex, fetchPhotos]);

  /* 사진 탭 무한 스크롤 감지 설정 */
  useEffect(() => {
    if (activeIndex !== 0 || !hasMorePhotos) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPhotoPage(prev => {
            const nextPage = prev + 1;
            fetchPhotos(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 1.0 }
    );

    if (scrollObserverRef.current) observer.observe(scrollObserverRef.current);
    return () => observer.disconnect();
  }, [activeIndex, hasMorePhotos, loading, fetchPhotos]);

  const currentAlbums = useMemo(() => {
    const startIndex = (albumPage - 1) * ALBUMS_PER_PAGE;
    return albums.slice(startIndex, startIndex + ALBUMS_PER_PAGE);
  }, [albums, albumPage]);

  const totalAlbumPages = Math.ceil(albums.length / ALBUMS_PER_PAGE);

  /* 사진 업로드 핸들러 */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        await axios.post(`${BASE_PATH}/photos`, formData, {
          headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" }
        });
        setPhotos([]); setPhotoPage(0); setHasMorePhotos(true); fetchPhotos(0);
      } catch (err) { alert("업로드 실패"); }
    }
  };

  /* 사진 삭제 핸들러 */
  const handleDelete = async () => {
    try {
      const endpoint = menu.type === 'photo' ? `/photos/${menu.targetId}` : `/albums/${menu.targetId}`;
      await axios.delete(`${BASE_PATH}${endpoint}`, { headers: getAuthHeader() });
      activeIndex === 0 ? (setPhotos([]), setPhotoPage(0), fetchPhotos(0)) : fetchAlbums();
    } catch (err) { alert("삭제 실패"); }
    setMenu(prev => ({ ...prev, show: false }));
  };

  /* 수정 완료 핸들러 */
  const handleEditComplete = async (e, id) => {
    if (e.key === 'Enter') {
      try {
        if (activeIndex === 0) await axios.post(`${BASE_PATH}/photos/${id}/caption`, { caption: e.target.value }, { headers: getAuthHeader() });
        else await axios.post(`${BASE_PATH}/albums/${id}/title`, { title: e.target.value }, { headers: getAuthHeader() });
        activeIndex === 0 ? (setPhotos([]), setPhotoPage(0), fetchPhotos(0)) : fetchAlbums();
      } catch (err) { alert("수정 실패"); }
      setEditingId(null);
    } else if (e.key === 'Escape') setEditingId(null);
  };

  /* 사진 날짜별 가공 로직 */
  const groupedPhotos = useMemo(() => {
    return photos.reduce((acc, photo) => {
      const date = photo.uploadedAt?.split('T')[0] || "Unknown";
      if (!acc[date]) acc[date] = [];
      acc[date].push(photo);
      return acc;
    }, {});
  }, [photos]);

  return (
    <div className="gallery-container" style={{ backgroundImage: `url(${bg})` }}>
      <AlbumCreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={fetchAlbums} />
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />

      <div className="tc-topbar">
        <div className="gallery-topnav">
          {tabs.map((tab, index) => (
            <span key={tab} onClick={() => setActiveIndex(index)} className={`gallery-tab ${index === activeIndex ? 'active' : ''}`}>
              {tab}<span className="gallery-tab-underline" />
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
          <>
            {Object.keys(groupedPhotos).map((date) => (
              <section key={date} className="date-group">
                <h2 className="date-title">{date}</h2>
                <div className="photo-grid">
                  {groupedPhotos[date].map((photo) => (
                    <div key={photo.photoId} className="photo-item">
                      {/* [보안 수정] ensureHttps 함수 적용 */}
                      <div className="img-box"><img src={ensureHttps(photo.imageUrl)} alt="" /></div>
                      {editingId === photo.photoId ? (
                        <input className="edit-title-input" defaultValue={photo.caption} autoFocus onKeyDown={(e) => handleEditComplete(e, photo.photoId)} onBlur={() => setEditingId(null)} />
                      ) : (
                        <p className="photo-title">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
            <div ref={scrollObserverRef} className="scroll-observer" style={{ height: '20px' }} />
          </>
        ) : (
          <div className="album-section">
            <div className="album-grid">
              {currentAlbums.map((album) => (
                <div key={album.albumId} className="album-item" onClick={() => navigate(`/album/${album.albumId}`, { state: { album } })}>
                  {/* [보안 수정] ensureHttps 함수 적용 */}
                  <div className="album-img-box"><img src={ensureHttps(album.coverImageUrl)} alt="" /></div>
                  <div className="album-info">
                    <h3>{album.title}</h3>
                    <p>항목 {album.photoCount || 0}개</p>
                  </div>
                </div>
              ))}
            </div>
            
            {totalAlbumPages > 1 && (
              <div className="album-pagination">
                <button onClick={() => setAlbumPage(p => Math.max(1, p - 1))} disabled={albumPage === 1}><ChevronLeft size={20}/></button>
                {[...Array(totalAlbumPages)].map((_, i) => (
                  <span key={i} className={`page-num ${albumPage === i + 1 ? 'active' : ''}`} onClick={() => setAlbumPage(i + 1)}>
                    {i + 1}p
                  </span>
                ))}
                <button onClick={() => setAlbumPage(p => Math.min(totalAlbumPages, p + 1))} disabled={albumPage === totalAlbumPages}><ChevronRight size={20}/></button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;