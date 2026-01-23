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

  // 무한 루프 방지를 위해 API 호출 중복 방지용 Ref 사용
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

  const ensureHttps = (url) => {
    if (!url) return url;
    return url.replace(/^http:\/\//i, "https://");
  };

  /* [기능 1] 사진 데이터 로드 (무한 스크롤 연동) */
  const fetchPhotos = useCallback(
    async (page) => {
      if (isFetchingRef.current || !hasMorePhotos) return;

      isFetchingRef.current = true;
      setLoading(true);

      try {
        const res = await axios.get(`${BASE_PATH}/photos`, {
          headers: getAuthHeader(),
          params: { sort: "takenAt,desc", page: page, size: 20 },
        });

        // 응답 데이터 구조 방어 로직: 서버 응답 형태에 따라 배열 추출
        const responseData = res.data.data;
        let newPhotos = [];
        if (Array.isArray(responseData)) {
          newPhotos = responseData;
        } else if (responseData && Array.isArray(responseData.content)) {
          newPhotos = responseData.content;
        }

        if (newPhotos.length < 20) setHasMorePhotos(false);

        setPhotos((prev) => (page === 0 ? newPhotos : [...prev, ...newPhotos]));
      } catch (err) {
        console.error("사진 로드 실패:", err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [hasMorePhotos]
  );

  /* [기능 2] 앨범 목록 로드 */
  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_PATH}/albums`, {
        headers: getAuthHeader(),
      });
      const responseData = res.data.data;
      setAlbums(Array.isArray(responseData) ? responseData : responseData?.content || []);
    } catch (err) {
      console.error("앨범 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  /* [기능 3] 탭 변경 및 초기화 */
  useEffect(() => {
    if (activeIndex === 0) {
      setPhotos([]);
      setPhotoPage(0);
      setHasMorePhotos(true);
      fetchPhotos(0);
    } else {
      fetchAlbums();
    }
  }, [activeIndex]);

  /* [기능 4] 무한 스크롤 옵저버 설정 */
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
      { threshold: 1.0 }
    );

    if (scrollObserverRef.current) observer.observe(scrollObserverRef.current);
    return () => observer.disconnect();
  }, [activeIndex, hasMorePhotos, fetchPhotos]);

  const currentAlbums = useMemo(() => {
    const startIndex = (albumPage - 1) * ALBUMS_PER_PAGE;
    return albums.slice(startIndex, startIndex + ALBUMS_PER_PAGE);
  }, [albums, albumPage]);

  const totalAlbumPages = Math.ceil(albums.length / ALBUMS_PER_PAGE);

  /* [기능 5] 사진 업로드 처리 (백엔드 키값 'files' 반영) */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      // 백엔드 명세에 맞춰 'file'에서 'files'로 수정
      formData.append("files", file);

      try {
        await axios.post(`${BASE_PATH}/photos`, formData, {
          headers: {
            ...getAuthHeader(),
            "Content-Type": "multipart/form-data",
          },
        });
        
        // 업로드 성공 후 리스트 초기화 및 첫 페이지 재로드
        setPhotos([]);
        setPhotoPage(0);
        setHasMorePhotos(true);
        fetchPhotos(0);
      } catch (err) {
        console.error("업로드 실패 원인:", err.response?.data);
        alert("업로드 실패: " + (err.response?.data?.message || "서버 에러가 발생했습니다."));
      }
    }
  };

  /* [기능 6] 캡션 및 제목 수정 */
  const handleEditComplete = async (e, id) => {
    if (e.key === "Enter") {
      try {
        if (activeIndex === 0) {
          await axios.post(`${BASE_PATH}/photos/${id}/caption`, { caption: e.target.value }, { headers: getAuthHeader() });
        } else {
          await axios.post(`${BASE_PATH}/albums/${id}/title`, { title: e.target.value }, { headers: getAuthHeader() });
        }
        activeIndex === 0 ? (setPhotos([]), setPhotoPage(0), fetchPhotos(0)) : fetchAlbums();
      } catch (err) {
        alert("수정 실패");
      }
      setEditingId(null);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  /* [기능 7] 사진 날짜별 그룹화 로직 */
  const groupedPhotos = useMemo(() => {
    if (!Array.isArray(photos)) return {};
    return photos.reduce((acc, photo) => {
      // 날짜 필드명(uploadedAt 또는 createdAt) 확인 필요
      const dateStr = photo.uploadedAt || photo.createdAt || "Unknown";
      const date = dateStr.split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(photo);
      return acc;
    }, {});
  }, [photos]);

  return (
    <div className="gallery-container" style={{ backgroundImage: `url(${bg})` }}>
      <AlbumCreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={fetchAlbums} />
      <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleFileUpload} />

      {/* 상단 바 영역 */}
      <div className="tc-topbar">
        <div className="gallery-topnav">
          {tabs.map((tab, index) => (
            <span key={tab} onClick={() => setActiveIndex(index)} className={`gallery-tab ${index === activeIndex ? "active" : ""}`}>
              {tab}
              <span className="gallery-tab-underline" />
            </span>
          ))}
        </div>
        <div className="tc-topbar-right">
          <button className="tc-create-btn" onClick={() => (activeIndex === 0 ? fileInputRef.current.click() : setIsModalOpen(true))}>
            {activeIndex === 0 ? "업로드" : "생성"}
          </button>
        </div>
      </div>

      {/* 본문 영역 */}
      <div className="gallery-content-wrapper">
        {activeIndex === 0 ? (
          <>
            {Object.keys(groupedPhotos).length > 0 ? (
              Object.keys(groupedPhotos).map((date) => (
                <section key={date} className="date-group">
                  <h2 className="date-title">{date}</h2>
                  <div className="photo-grid">
                    {groupedPhotos[date].map((photo) => (
                      <div key={photo.photoId} className="photo-item">
                        <div className="img-box">
                          <img src={ensureHttps(photo.imageUrl)} alt={photo.caption || ""} />
                        </div>
                        {editingId === photo.photoId ? (
                          <input
                            className="edit-title-input"
                            defaultValue={photo.caption}
                            autoFocus
                            onKeyDown={(e) => handleEditComplete(e, photo.photoId)}
                            onBlur={() => setEditingId(null)}
                          />
                        ) : (
                          <p className="photo-title">{photo.caption || "설명 없음"}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              !loading && <p className="empty-msg">업로드된 사진이 없습니다.</p>
            )}
            <div ref={scrollObserverRef} className="scroll-observer" />
          </>
        ) : (
          <div className="album-section">
            <div className="album-grid">
              {currentAlbums.map((album) => (
                <div key={album.albumId} className="album-item" onClick={() => navigate(`/album/${album.albumId}`, { state: { album } })}>
                  <div className="album-img-box">
                    <img src={ensureHttps(album.coverImageUrl)} alt={album.title} />
                  </div>
                  <div className="album-info">
                    <h3>{album.title}</h3>
                    <p>항목 {album.photoCount || 0}개</p>
                  </div>
                </div>
              ))}
            </div>
            {totalAlbumPages > 1 && (
              <div className="album-pagination">
                <button onClick={() => setAlbumPage((p) => Math.max(1, p - 1))} disabled={albumPage === 1}>
                  <ChevronLeft size={20} />
                </button>
                {[...Array(totalAlbumPages)].map((_, i) => (
                  <span key={i} className={`page-num ${albumPage === i + 1 ? "active" : ""}`} onClick={() => setAlbumPage(i + 1)}>
                    {i + 1}p
                  </span>
                ))}
                <button onClick={() => setAlbumPage((p) => Math.min(totalAlbumPages, p + 1))} disabled={albumPage === totalAlbumPages}>
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