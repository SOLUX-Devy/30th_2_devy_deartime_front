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

  // 명세서에 포함된 < > 기호를 제거하고 안전한 https 경로를 반환합니다.
  const ensureHttps = (url) => {
    if (!url) return url;
    const cleanedUrl = url.replace(/[<>]/g, ""); 
    return cleanedUrl.replace(/^http:\/\//i, "https://");
  };

  /* [목록 조회] 명세서 구조(res.data.data.data) 반영 */
  const fetchPhotos = useCallback(async (page) => {
    if (isFetchingRef.current || !hasMorePhotos) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const res = await axios.get(`${BASE_PATH}/photos`, {
        headers: getAuthHeader(),
        params: { sort: "takenAt,desc", page: page, size: 20 },
      });

      // 응답 구조: res.data(전체) -> data(상위 wrapper) -> data(실제 배열)
      const responseWrapper = res.data.data;
      const newPhotos = Array.isArray(responseWrapper.data) ? responseWrapper.data : [];

      // 명세서의 isLast 필드를 사용하여 무한 스크롤 중단 여부 결정
      if (responseWrapper.isLast || newPhotos.length < 20) {
        setHasMorePhotos(false);
      }

      setPhotos((prev) => (page === 0 ? newPhotos : [...prev, ...newPhotos]));
    } catch (err) {
      console.error("사진 목록 조회 실패:", err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [hasMorePhotos]);

  /* [앨범 조회] */
  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_PATH}/albums`, {
        headers: getAuthHeader(),
      });
      const responseData = res.data.data;
      // 앨범도 사진과 같은 구조일 경우를 대비해 .data 체크 추가
      setAlbums(Array.isArray(responseData) ? responseData : responseData?.data || []);
    } catch (err) {
      console.error("앨범 목록 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  /* 탭 및 페이지 초기화 */
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

  /* 무한 스크롤 감지 */
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

  /* [업로드] 명세서의 files(Multipart) 및 request(JSON) 필드 반영 */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    
    // 1. 이미지 파일 (명세서 키: files)
    formData.append("files", file);

    // 2. 메타데이터 (명세서 키: request, 타입: JSON Blob)
    const requestPayload = {
      caption: file.name, // 기본값으로 파일 이름 사용
      albumId: null,      // 특정 앨범에 속하게 하려면 ID 입력
    };
    const blob = new Blob([JSON.stringify(requestPayload)], { type: "application/json" });
    formData.append("request", blob);

    try {
      const res = await axios.post(`${BASE_PATH}/photos`, formData, {
        headers: { ...getAuthHeader() }, 
        // Content-Type은 axios가 boundary를 포함해 자동으로 설정하게 둠
      });

      if (res.status === 201 || res.data.success) {
        alert("사진 업로드 성공! ✨");
        setPhotos([]);
        setPhotoPage(0);
        setHasMorePhotos(true);
        fetchPhotos(0);
      }
    } catch (err) {
      console.error("업로드 실패:", err.response?.data);
      alert("업로드 실패: " + (err.response?.data?.message || "서버 응답 오류"));
    } finally {
      setLoading(false);
      e.target.value = ""; // 파일 선택 리셋
    }
  };

  /* 수정 처리 */
  const handleEditComplete = async (e, id) => {
    if (e.key === "Enter") {
      try {
        if (activeIndex === 0)
          await axios.post(`${BASE_PATH}/photos/${id}/caption`, { caption: e.target.value }, { headers: getAuthHeader() });
        else
          await axios.post(`${BASE_PATH}/albums/${id}/title`, { title: e.target.value }, { headers: getAuthHeader() });
        
        activeIndex === 0 ? (setPhotos([]), setPhotoPage(0), fetchPhotos(0)) : fetchAlbums();
      } catch (err) {
        alert("수정 실패");
      }
      setEditingId(null);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  /* [데이터 가공] 명세서 필드 'takenAt' 기준으로 날짜 그룹화 */
  const groupedPhotos = useMemo(() => {
    if (!Array.isArray(photos)) return {};
    return photos.reduce((acc, photo) => {
      // "2025-12-28T17:27:56..." -> "2025-12-28" 추출
      const date = photo.takenAt?.split("T")[0] || "날짜 미상";
      if (!acc[date]) acc[date] = [];
      acc[date].push(photo);
      return acc;
    }, {});
  }, [photos]);

  return (
    <div className="gallery-container" style={{ backgroundImage: `url(${bg})` }}>
      <AlbumCreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={fetchAlbums} />
      <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleFileUpload} />

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

      <div className="gallery-content-wrapper">
        {activeIndex === 0 ? (
          <>
            {Object.keys(groupedPhotos).map((date) => (
              <section key={date} className="date-group">
                <h2 className="date-title">{date}</h2>
                <div className="photo-grid">
                  {groupedPhotos[date].map((photo) => (
                    <div key={photo.photoId} className="photo-item">
                      <div className="img-box">
                        <img src={ensureHttps(photo.imageUrl)} alt={photo.caption} />
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
                        <p className="photo-title" onClick={() => setEditingId(photo.photoId)}>
                          {photo.caption || "설명 없음"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
            {/* 스크롤 하단 감지 타겟 */}
            <div ref={scrollObserverRef} className="scroll-observer" style={{ height: "20px" }} />
            {loading && <p className="loading-txt">데이터를 불러오는 중입니다...</p>}
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