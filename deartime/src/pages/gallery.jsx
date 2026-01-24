import { useNavigate, useLocation } from "react-router-dom";
import "../styles/gallery.css";
import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { Pen, Trash2, ChevronLeft, ChevronRight } from "lucide-react"; 
import bg from "../assets/background_nostar.png";
import AlbumCreateModal from "../components/AlbumCreateModal";
import axios from "axios";

const Gallery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const scrollObserverRef = useRef(null);
  const isFetchingRef = useRef(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const BASE_PATH = `${apiBaseUrl}/api`;

  const getAuthHeader = useCallback(
    () => ({
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    }),
    [],
  );

  const tabs = ["RECORD", "ALBUM"];
  const [activeIndex, setActiveIndex] = useState(
    location.state?.activeTab ?? 0,
  );

  const [photos, setPhotos] = useState([]);
  const [photoPage, setPhotoPage] = useState(0);
  const [hasMorePhotos, setHasMorePhotos] = useState(true);

  const [albums, setAlbums] = useState([]);
  const [albumPage, setAlbumPage] = useState(1);
  const ALBUMS_PER_PAGE = 6;

  const [favAlbumId, setFavAlbumId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    targetId: null,
  });

  const ensureHttps = (url) => {
    if (!url) return "https://via.placeholder.com/300";
    return url.replace(/[<>]/g, "");
  };

  /* [1] 사진 목록 조회 (Infinite Scroll) */
  const fetchPhotos = useCallback(
    async (page, isInitial = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      if (!isInitial) setLoading(true);

      try {
        const res = await axios.get(`${BASE_PATH}/photos`, {
          headers: getAuthHeader(),
          params: { sort: "takenAt,desc", page: page, size: 20 },
        });

        const responseWrapper = res.data.data;
        const newPhotos = Array.isArray(responseWrapper.data)
          ? responseWrapper.data
          : [];

        const isLast = responseWrapper.isLast ?? newPhotos.length < 20;
        setHasMorePhotos(!isLast);

        setPhotos((prev) => (page === 0 ? newPhotos : [...prev, ...newPhotos]));
      } catch (err) {
        console.error("사진 로드 실패:", err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [BASE_PATH, getAuthHeader],
  );

  /**
   * [2] 앨범 목록 조회 및 정렬 로직 (즐겨찾기 1번 고정)
   */
  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_PATH}/albums`, {
        headers: getAuthHeader(),
      });
      const albumList = res.data.data;
      const validAlbums = Array.isArray(albumList) ? albumList : [];

      // ⭐ 정렬 로직: '즐겨찾기' 제목을 가진 앨범을 무조건 배열의 0번 인덱스로 보냄
      const sortedAlbums = [...validAlbums].sort((a, b) => {
        if (a.title === "즐겨찾기") return -1;
        if (b.title === "즐겨찾기") return 1;
        return 0; // 나머지는 서버에서 온 순서 유지
      });

      setAlbums(sortedAlbums);

      // 즐겨찾기 앨범 ID 찾기 (토글 기능용)
      const favAlbum = sortedAlbums.find((a) => a.title === "즐겨찾기");
      if (favAlbum) setFavAlbumId(favAlbum.albumId);
    } catch (err) {
      console.error("앨범 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  }, [BASE_PATH, getAuthHeader]);

  /* [핵심 추가] 즐겨찾기 즉시 토글 함수 */
  const handleToggleFavorite = async (e, photoId, currentStatus) => {
    e.stopPropagation();
    if (!favAlbumId) {
      alert("즐겨찾기 앨범 정보를 불러오는 중입니다.");
      return;
    }

    try {
      if (currentStatus) {
        await axios.delete(`${BASE_PATH}/albums/${favAlbumId}/photos/${photoId}`, {
          headers: getAuthHeader()
        });
      } else {
        await axios.post(`${BASE_PATH}/albums/${favAlbumId}/photos`, 
          { photoIds: [Number(photoId)] }, 
          { headers: getAuthHeader() }
        );
      }
      
      setPhotos(prev => prev.map(p => 
        p.photoId === photoId ? { ...p, isFavorite: !currentStatus } : p
      ));
    } catch (err) {
      console.error("즐겨찾기 토글 실패:", err);
    }
  };

  /* [3] 앨범 생성 로직 */
  const handleCreateAlbum = async (albumData) => {
    setLoading(true);
    try {
      let coverPhotoId = null;
      if (albumData.imageFile) {
        const formData = new FormData();
        formData.append("files", albumData.imageFile);
        const requestBlob = new Blob(
          [JSON.stringify({ caption: `${albumData.title} 표지` })],
          { type: "application/json" },
        );
        formData.append("request", requestBlob);

        const photoRes = await axios.post(`${BASE_PATH}/photos`, formData, {
          headers: getAuthHeader(),
        });
        coverPhotoId = photoRes.data.data[0]?.photoId;
      }

      const res = await axios.post(
        `${BASE_PATH}/albums`,
        {
          title: albumData.title,
          coverPhotoId: coverPhotoId,
        },
        { headers: getAuthHeader() },
      );

      if (res.data.success) {
        alert("앨범이 생성되었습니다.");
        fetchAlbums();
        setIsModalOpen(false);
      }
    } catch (err) {
      alert("앨범 생성 실패: " + (err.response?.data?.data || "서버 에러"));
    } finally {
      setLoading(false);
    }
  };

  /* 단일 사진 업로드 */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("files", file);
    const requestBlob = new Blob(
      [JSON.stringify({ caption: file.name, albumId: null })],
      { type: "application/json" },
    );
    formData.append("request", requestBlob);

    try {
      const res = await axios.post(`${BASE_PATH}/photos`, formData, {
        headers: getAuthHeader(),
      });
      if (res.status === 201 || res.data.success) {
        alert("사진이 업로드되었습니다.");
        setPhotos([]);
        setPhotoPage(0);
        setHasMorePhotos(true);
        fetchPhotos(0, true);
      }
    } catch (err) {
      alert("업로드 실패");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  /* 삭제 로직 */
  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`${BASE_PATH}/photos/${photoId}`, {
        headers: getAuthHeader(),
      });
      setPhotos((prev) => prev.filter((p) => p.photoId !== photoId));
    } catch (err) {
      alert(err.response?.data?.data || "삭제 권한이 없습니다.");
    }
    setContextMenu({ ...contextMenu, show: false });
  };

  const handleDeleteAlbum = async (albumId) => {
    const target = albums.find(a => a.albumId === albumId);
    if (target?.title === "즐겨찾기") {
      alert("즐겨찾기 앨범은 삭제할 수 없습니다.");
      setContextMenu({ ...contextMenu, show: false });
      return;
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await axios.delete(`${BASE_PATH}/albums/${albumId}`, {
        headers: getAuthHeader(),
      });
      if (res.data.success) {
        setAlbums((prev) => prev.filter((a) => a.albumId !== albumId));
      }
    } catch (err) {
      alert(err.response?.data?.data || "삭제 실패");
    }
    setContextMenu({ ...contextMenu, show: false });
  };

  /* 수정 완료 로직 */
  const handleEditComplete = async (e, id) => {
    const newText = e.target.value;
    if (e.key === "Enter") {
      try {
        if (activeIndex === 0) {
          await axios.post(
            `${BASE_PATH}/photos/${id}/caption`,
            { caption: newText },
            { headers: getAuthHeader() },
          );
          setPhotos((prev) =>
            prev.map((p) =>
              p.photoId === id ? { ...p, caption: newText } : p,
            ),
          );
        } else {
          const target = albums.find(a => a.albumId === id);
          if (target?.title === "즐겨찾기") {
            alert("즐겨찾기 앨범의 이름은 수정할 수 없습니다.");
            setEditingId(null);
            return;
          }
          await axios.patch(
            `${BASE_PATH}/albums/${id}/title`,
            { title: newText },
            { headers: getAuthHeader() },
          );
          setAlbums((prev) =>
            prev.map((a) => (a.albumId === id ? { ...a, title: newText } : a)),
          );
        }
      } catch (err) {
        alert(err.response?.data?.data || "수정 실패");
      }
      setEditingId(null);
    } else if (e.key === "Escape") setEditingId(null);
  };

  /* 데이터 동기화 Effect */
  useEffect(() => {
    const syncData = async () => {
      if (activeIndex === 0) {
        setPhotos([]);
        setPhotoPage(0);
        setHasMorePhotos(true);
        await fetchPhotos(0, true);
        await fetchAlbums();
      } else {
        await fetchAlbums();
        if (location.state?.updatedAlbum) {
          const updated = location.state.updatedAlbum;
          setAlbums((prev) =>
            prev.map((a) =>
              a.albumId === updated.albumId
                ? { ...a, coverImageUrl: updated.coverImageUrl, title: updated.title }
                : a,
            ),
          );
        }
      }
    };
    syncData();
  }, [activeIndex, fetchPhotos, fetchAlbums, location.state]);

  /* 무한 스크롤 Observer */
  useEffect(() => {
    if (activeIndex !== 0 || !hasMorePhotos) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current) {
          setPhotoPage((prev) => {
            const nextPage = prev + 1;
            fetchPhotos(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 },
    );

    const target = scrollObserverRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
  }, [activeIndex, hasMorePhotos, fetchPhotos]);

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
    <div
      className={`gallery-container ${activeIndex === 0 ? "record-mode" : ""}`}
      style={{ backgroundImage: `url(${bg})` }}
      onClick={() => setContextMenu({ ...contextMenu, show: false })}
    >
      <AlbumCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateAlbum}
      />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileUpload}
      />

      {contextMenu.show && (
        <div
          className="custom-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="menu-item"
            onClick={() => {
              setEditingId(contextMenu.targetId);
              setContextMenu({ ...contextMenu, show: false });
            }}
          >
            <Pen size={16} /> <span>수정</span>
          </div>
          <div className="menu-divider" />
          <div
            className="menu-item delete"
            onClick={() =>
              activeIndex === 0
                ? handleDeletePhoto(contextMenu.targetId)
                : handleDeleteAlbum(contextMenu.targetId)
            }
          >
            <Trash2 size={16} /> <span>삭제</span>
          </div>
        </div>
      )}

      <div className="tc-topbar">
        <div className="gallery-topnav">
          {tabs.map((tab, index) => (
            <span
              key={tab}
              onClick={() => setActiveIndex(index)}
              className={`gallery-tab ${index === activeIndex ? "active" : ""}`}
            >
              {tab}
              <span className="gallery-tab-underline" />
            </span>
          ))}
        </div>
        <div className="tc-topbar-right">
          <button
            className="tc-create-btn"
            onClick={() =>
              activeIndex === 0
                ? fileInputRef.current.click()
                : setIsModalOpen(true)
            }
          >
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
                    <div
                      key={photo.photoId}
                      className="photo-item"
                      onContextMenu={(e) => onContextMenu(e, photo.photoId)}
                    >
                      <div className="img-box">
                        <img src={ensureHttps(photo.imageUrl)} alt="" />
                        <span 
                          className={`bookmark-icon ${photo.isFavorite ? "active" : ""}`} 
                          onClick={(e) => handleToggleFavorite(e, photo.photoId, photo.isFavorite)}
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            zIndex: 10,
                          }}
                        ></span>
                      </div>
                      
                      {editingId === photo.photoId ? (
                        <input
                          className="edit-title-input"
                          defaultValue={photo.caption}
                          autoFocus
                          onKeyDown={(e) =>
                            handleEditComplete(e, photo.photoId)
                          }
                          onBlur={() => setEditingId(null)}
                        />
                      ) : (
                        <p
                          className="photo-title"
                          onClick={() => setEditingId(photo.photoId)}
                        >
                          {photo.caption || "설명 추가"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
            {!loading && hasMorePhotos && (
              <div ref={scrollObserverRef} style={{ height: "50px" }} />
            )}
            {loading && (
              <div style={{ textAlign: "center", padding: "20px", color: "white" }}>
                로딩 중...
              </div>
            )}
          </>
        ) : (
          <div className="album-section">
            <div className="album-grid">
              {currentAlbums.map((album) => (
                <div
                  key={album.albumId}
                  className="album-item"
                  onContextMenu={(e) => onContextMenu(e, album.albumId)}
                >
                  <div
                    className="album-img-box"
                    onClick={() =>
                      navigate(`/album/${album.albumId}`, { state: { album } })
                    }
                  >
                    <img src={ensureHttps(album.coverImageUrl)} alt="" />
                  </div>
                  <div className="album-info">
                    {editingId === album.albumId ? (
                      <input
                        className="edit-title-input"
                        defaultValue={album.title}
                        autoFocus
                        onKeyDown={(e) => handleEditComplete(e, album.albumId)}
                        onBlur={() => setEditingId(null)}
                      />
                    ) : (
                      <h3 onClick={() => setEditingId(album.albumId)}>
                        {album.title}
                      </h3>
                    )}
                    <p>항목 {album.photoCount || 0}개</p>
                  </div>
                </div>
              ))}
            </div>
            {totalAlbumPages > 1 && (
              <div className="album-pagination">
                <button
                  onClick={() => setAlbumPage((p) => Math.max(1, p - 1))}
                  disabled={albumPage === 1}
                >
                  <ChevronLeft size={20} />
                </button>
                {[...Array(totalAlbumPages)].map((_, i) => (
                  <span
                    key={i}
                    className={`page-num ${albumPage === i + 1 ? "active" : ""}`}
                    onClick={() => setAlbumPage(i + 1)}
                  >
                    {i + 1}p
                  </span>
                ))}
                <button
                  onClick={() =>
                    setAlbumPage((p) => Math.min(totalAlbumPages, p + 1))
                  }
                  disabled={albumPage === totalAlbumPages}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;