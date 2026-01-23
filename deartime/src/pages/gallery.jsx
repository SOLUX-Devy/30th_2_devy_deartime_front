import { useNavigate, useLocation } from "react-router-dom";
import "../styles/gallery.css";
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
  const isFetchingRef = useRef(false);

  const BASE_PATH = "/api";
  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  const tabs = ["RECORD", "ALBUM"];
  const [activeIndex, setActiveIndex] = useState(location.state?.activeTab ?? 0);

  const [photos, setPhotos] = useState([]);
  const [photoPage, setPhotoPage] = useState(0);
  const [hasMorePhotos, setHasMorePhotos] = useState(true);

  const [albums, setAlbums] = useState([]);
  const [albumPage, setAlbumPage] = useState(1);
  const ALBUMS_PER_PAGE = 6;

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, targetId: null });

  const ensureHttps = (url) => {
    if (!url) return url;
    const cleanedUrl = url.replace(/[<>]/g, ""); 
    return cleanedUrl.replace(/^http:\/\//i, "https://");
  };

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_PATH}/albums`, {
        headers: getAuthHeader(),
      });

      // 콘솔로 데이터 구조를 먼저 확인해보는 것이 좋습니다.
      console.log("앨범 서버 응답:", res.data);

      // 백엔드 명세에 따라 res.data.data.data 일 수도 있고 res.data.data 일 수도 있습니다.
      // 안전하게 둘 다 체크하는 로직입니다.
      const responseData = res.data.data;
      const albumList = Array.isArray(responseData) 
        ? responseData 
        : (responseData?.data || []);

      setAlbums(albumList);
    } catch (err) {
      console.error("앨범 로드 실패:", err.response?.data || err.message);
      // 401 에러 등이 날 경우 처리
      if (err.response?.status === 401) {
        alert("인증이 만료되었습니다. 다시 로그인해주세요.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /* [기능] 사진 목록 조회 */
  const fetchPhotos = useCallback(async (page) => {
  // 함수 안에서 최신 상태를 체크하기 위해 Ref를 활용하거나 
  // 호출하는 쪽(useEffect)에서 조건을 체크하는 것이 가장 깔끔합니다.
  if (isFetchingRef.current) return;

  isFetchingRef.current = true;
  setLoading(true);

  try {
    const res = await axios.get(`${BASE_PATH}/photos`, {
      headers: getAuthHeader(),
      params: { sort: "takenAt,desc", page: page, size: 20 },
    });

    const responseWrapper = res.data.data;
    const newPhotos = Array.isArray(responseWrapper.data) ? responseWrapper.data : [];

    // 여기서 더 불러올 데이터가 있는지 판단
    if (responseWrapper.isLast || newPhotos.length < 20) {
      setHasMorePhotos(false);
    }

    setPhotos((prev) => (page === 0 ? newPhotos : [...prev, ...newPhotos]));
  } catch (err) {
    console.error("사진 로드 실패:", err);
  } finally {
    setLoading(false);
    isFetchingRef.current = false;
  }
}, []); // 의존성을 비워서 함수가 절대로 새로 생성되지 않게 함

/* 2. 초기화 로직: 오직 activeIndex가 바뀔 때만 실행 */
useEffect(() => {
  if (activeIndex === 0) {
    setPhotos([]);
    setPhotoPage(0);
    setHasMorePhotos(true);
    fetchPhotos(0); // 고정된 함수이므로 안전하게 호출
  } else {
    fetchAlbums();
  }
  // 의존성 배열에서 fetchPhotos를 제거하거나, 
  // useCallback([]) 처리를 했으므로 그대로 두어도 루프가 발생하지 않습니다.
}, [activeIndex]); 

/* 3. 무한 스크롤 Observer: threshold 조절 */
useEffect(() => {
  if (activeIndex !== 0 || !hasMorePhotos) return;

  const observer = new IntersectionObserver((entries) => {
    // 1.0은 요소가 100% 다 보여야 작동하므로 0.5 정도로 낮추는 게 좋습니다.
    if (entries[0].isIntersecting && !isFetchingRef.current && hasMorePhotos) {
      setPhotoPage((prev) => {
        const nextPage = prev + 1;
        fetchPhotos(nextPage);
        return nextPage;
      });
    }
  }, { threshold: 0.5 });

  if (scrollObserverRef.current) observer.observe(scrollObserverRef.current);
  return () => observer.disconnect();
}, [activeIndex, hasMorePhotos, fetchPhotos]);

  /* [기능] 사진 업로드 */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("files", file);

    const requestBlob = new Blob([JSON.stringify({ caption: file.name, albumId: null })], { type: "application/json" });
    formData.append("request", requestBlob);

    try {
      const res = await axios.post(`${BASE_PATH}/photos`, formData, { headers: getAuthHeader() });
      if (res.status === 201 || res.data.success) {
        alert("사진이 업로드되었습니다.");
        setPhotos([]); setPhotoPage(0); setHasMorePhotos(true); fetchPhotos(0);
      }
    } catch (err) {
      alert("업로드 실패: " + (err.response?.data?.data || "서버 에러"));
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  /* [기능] 사진 삭제 */
  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("정말 이 사진을 삭제하시겠습니까?")) return;
    try {
      const res = await axios.delete(`${BASE_PATH}/photos/${photoId}`, { headers: getAuthHeader() });
      if (res.status === 204 || res.data.success) {
        setPhotos(prev => prev.filter(p => p.photoId !== photoId));
        setContextMenu({ ...contextMenu, show: false });
      }
    } catch (err) {
      alert(err.response?.data?.message || "삭제 권한이 없습니다.");
    }
  };

  /* [기능 추가] 앨범 삭제 명세 반영: DELETE /api/albums/{albumId} */
  const handleDeleteAlbum = async (albumId) => {
    if (!window.confirm("정말 이 앨범을 삭제하시겠습니까? 앨범 안의 사진들은 삭제되지 않습니다.")) return;
    try {
      const res = await axios.delete(`${BASE_PATH}/albums/${albumId}`, {
        headers: getAuthHeader()
      });

      // 명세서 상 성공 응답: 204 또는 success: true
      if (res.status === 204 || res.data.success) {
        setAlbums(prev => prev.filter(a => a.albumId !== albumId));
        setContextMenu({ ...contextMenu, show: false });
      }
    } catch (err) {
      console.error("앨범 삭제 실패:", err.response?.data);
      const msg = err.response?.data?.data || "앨범 삭제 권한이 없습니다.";
      alert(msg);
    }
  };

  const handleEditComplete = async (e, id) => {
    const newText = e.target.value;
    if (e.key === "Enter") {
      try {
        if (activeIndex === 0) {
          const res = await axios.post(`${BASE_PATH}/photos/${id}/caption`, { caption: newText }, { headers: getAuthHeader() });
          if (res.data.success) {
            setPhotos(prev => prev.map(p => p.photoId === id ? { ...p, caption: newText } : p));
          }
        } else {
          const res = await axios.post(`${BASE_PATH}/albums/${id}/title`, { title: newText }, { headers: getAuthHeader() });
          if (res.data.success) {
            setAlbums(prev => prev.map(a => a.albumId === id ? { ...a, title: newText } : a));
          }
        }
      } catch (err) {
        alert("수정에 실패했습니다.");
      }
      setEditingId(null);
    } else if (e.key === "Escape") setEditingId(null);
  };

  const onContextMenu = (e, id) => {
    e.preventDefault();
    setContextMenu({ show: true, x: e.clientX, y: e.clientY, targetId: id });
  };

  const groupedPhotos = useMemo(() => {
    if (!Array.isArray(photos)) return {};
    return photos.reduce((acc, photo) => {
      const date = photo.takenAt?.split("T")[0] || "Unknown";
      if (!acc[date]) acc[date] = [];
      acc[date].push(photo);
      return acc;
    }, {});
  }, [photos]);

  const currentAlbums = useMemo(() => {
    const startIndex = (albumPage - 1) * ALBUMS_PER_PAGE;
    return albums.slice(startIndex, startIndex + ALBUMS_PER_PAGE);
  }, [albums, albumPage]);

  const totalAlbumPages = Math.ceil(albums.length / ALBUMS_PER_PAGE);

  return (
    <div className="gallery-container" style={{ backgroundImage: `url(${bg})` }} onClick={() => setContextMenu({ ...contextMenu, show: false })}>
      <AlbumCreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreateAlbum} />
      <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleFileUpload} />

      {/* 우클릭 메뉴 */}
      {contextMenu.show && (
        <div className="custom-context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()}>
          <div className="menu-item" onClick={() => { setEditingId(contextMenu.targetId); setContextMenu({ ...contextMenu, show: false }); }}>
            <Pen size={16} /> <span>{activeIndex === 0 ? "캡션 수정" : "이름 수정"}</span>
          </div>
          <div className="menu-divider" />
          <div className="menu-item delete" onClick={() => {
            if (activeIndex === 0) handleDeletePhoto(contextMenu.targetId);
            else handleDeleteAlbum(contextMenu.targetId);
          }}>
            <Trash2 size={16} /> <span>삭제</span>
          </div>
        </div>
      )}

      <div className="tc-topbar">
        <div className="gallery-topnav">
          {tabs.map((tab, index) => (
            <span key={tab} onClick={() => setActiveIndex(index)} className={`gallery-tab ${index === activeIndex ? "active" : ""}`}>
              {tab}<span className="gallery-tab-underline" />
            </span>
          ))}
        </div>
        <div className="tc-topbar-right">
          <button className="tc-create-btn" onClick={() => (activeIndex === 0 ? fileInputRef.current.click() : setIsModalOpen(true))}>
            {activeIndex === 0 ? "업로드" : "생성"}
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
                    <div key={photo.photoId} className="photo-item" onContextMenu={(e) => onContextMenu(e, photo.photoId)}>
                      <div className="img-box"><img src={ensureHttps(photo.imageUrl)} alt="" /></div>
                      {editingId === photo.photoId ? (
                        <input className="edit-title-input" defaultValue={photo.caption} autoFocus onKeyDown={(e) => handleEditComplete(e, photo.photoId)} onBlur={() => setEditingId(null)} />
                      ) : (
                        <p className="photo-title" onClick={() => setEditingId(photo.photoId)}>{photo.caption || "설명 추가"}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
            <div ref={scrollObserverRef} className="scroll-observer" style={{ height: "20px" }} />
          </>
        ) : (
          <div className="album-section">
            <div className="album-grid">
              {currentAlbums.map((album) => (
                <div key={album.albumId} className="album-item" onContextMenu={(e) => onContextMenu(e, album.albumId)}>
                  <div className="album-img-box" onClick={() => navigate(`/album/${album.albumId}`, { state: { album } })}>
                    <img src={ensureHttps(album.coverImageUrl)} alt="" />
                  </div>
                  <div className="album-info">
                    {editingId === album.albumId ? (
                      <input className="edit-title-input" defaultValue={album.title} autoFocus onKeyDown={(e) => handleEditComplete(e, album.albumId)} onBlur={() => setEditingId(null)} />
                    ) : (
                      <h3 onClick={() => setEditingId(album.albumId)}>{album.title}</h3>
                    )}
                    <p>항목 {album.photoCount || 0}개</p>
                  </div>
                </div>
              ))}
            </div>
            {totalAlbumPages > 1 && (
              <div className="album-pagination">
                <button onClick={() => setAlbumPage((p) => Math.max(1, p - 1))} disabled={albumPage === 1}><ChevronLeft size={20} /></button>
                {[...Array(totalAlbumPages)].map((_, i) => (
                  <span key={i} className={`page-num ${albumPage === i + 1 ? "active" : ""}`} onClick={() => setAlbumPage(i + 1)}>{i + 1}p</span>
                ))}
                <button onClick={() => setAlbumPage((p) => Math.min(totalAlbumPages, p + 1))} disabled={albumPage === totalAlbumPages}><ChevronRight size={20} /></button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;