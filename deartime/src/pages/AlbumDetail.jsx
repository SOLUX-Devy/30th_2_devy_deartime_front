import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Plus, X, Camera } from "lucide-react"; 
import axios from "axios";
import "../styles/AlbumDetail.css";
import bg from "../assets/background_nostar.png";
import Album_addphoto from "../components/Album_addphoto.jsx"; 

const AlbumDetail = () => {
  const params = useParams();
  const albumId = params.albumId || params.id; // 라우터 설정에 구애받지 않도록 보정

  const location = useLocation();
  const navigate = useNavigate();
  const coverInputRef = useRef(null); 

  // 갤러리 목록에서 전달받은 앨범 데이터
  const albumData = location.state?.album;
  
  /** * [이미지 에러 처리 - 상태 관리 방식]
   * 초기값은 전달받은 데이터로 설정하고, 
   * imgSrc라는 독립된 상태로 관리하여 무한 루프를 방지합니다.
   */
  const initialCover = albumData?.coverImageUrl || albumData?.coverUrl || "https://via.placeholder.com/1200x400";
  const [imgSrc, setImgSrc] = useState(initialCover);
  
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // 인증 헤더 (useCallback으로 메모이제이션하여 함수 재생성 방지)
  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    return { Authorization: `Bearer ${token}` };
  }, []);

  /**
   * 1. 사진 목록 조회 (GET)
   */
  const fetchAlbumPhotos = useCallback(async () => {
    if (!albumId || albumId === "undefined") return;

    setLoading(true);
    try {
      const res = await axios.get(`${apiBaseUrl}/api/albums/${albumId}/photos`, {
        headers: getAuthHeader(),
        params: { sort: "id,desc", page: 0, size: 50 } 
      });

      if (res.data.success) {
        const photoList = res.data.data?.data || res.data.data || [];
        setAlbumPhotos(Array.isArray(photoList) ? photoList : []);
      }
    } catch (err) {
      console.error("앨범 사진 로드 실패:", err.response?.data || err);
      setAlbumPhotos([]); // 에러 시 빈 배열로 밀어 무한 로딩 방지
    } finally {
      setLoading(false);
    }
  }, [albumId, apiBaseUrl, getAuthHeader]);

  /**
   * [핵심 수정] 무한 루프 차단
   * fetchAlbumPhotos를 의존성에서 제거하고 오직 albumId가 바뀔 때만 실행합니다.
   */
  useEffect(() => {
    if (albumId && albumId !== "undefined") {
      fetchAlbumPhotos();
    }
  }, [albumId]); // fetchAlbumPhotos를 의존성 배열에서 제외하여 루프를 끊습니다.

  // 컴포넌트 마운트 시 초기 이미지 동기화
  useEffect(() => {
    setImgSrc(initialCover);
  }, [initialCover]);

  if (!albumData) {
    return (
      <div className="gallery-container" style={{ backgroundImage: `url(${bg})`, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
        <p>앨범 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 2. 커버 사진 로컬 수정 (미리보기)
  const handleCoverEdit = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newCoverUrl = URL.createObjectURL(file);
      setImgSrc(newCoverUrl);
    }
  };

  /**
   * 3. 사진 추가 (POST) - 명세서 준수
   */
  const handlePhotoSelect = async (selectedPhotos) => {
    if (selectedPhotos.length === 0) return;
    
    const requestBody = {
      photoIds: selectedPhotos.map(p => Number(p.photoId)) // ID는 반드시 숫자형으로
    };

    try {
      setLoading(true);
      const res = await axios.post(
        `${apiBaseUrl}/api/albums/${albumId}/photos`, 
        requestBody, 
        { headers: getAuthHeader() }
      );

      if (res.data.success) {
        alert("앨범에 사진이 추가되었습니다.");
        fetchAlbumPhotos(); // 성공 후 목록 새로고침
      }
    } catch (err) {
      console.error("사진 추가 실패:", err.response?.data || err);
      alert(err.response?.data?.message || "사진 추가 중 서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setIsAddModalOpen(false);
    }
  };

  /**
   * 4. 사진 제거 (DELETE)
   */
  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("이 사진을 앨범에서 삭제하시겠습니까?")) return;

    try {
      const res = await axios.delete(
        `${apiBaseUrl}/api/albums/${albumId}/photos/${photoId}`,
        { headers: getAuthHeader() }
      );

      if (res.data.success) {
        setAlbumPhotos(prev => prev.filter(photo => photo.photoId !== photoId));
      }
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 5. 뒤로 가기
  const handleBack = () => {
    navigate("/gallery", { 
      state: { 
        activeTab: 1, 
        updatedAlbum: { 
          ...albumData, 
          albumId: albumId,
          coverImageUrl: imgSrc // 현재 상태 관리 중인 이미지를 전달
        } 
      } 
    });
  };

  return (
    <div className="gallery-container" style={{ backgroundImage: `url(${bg})` }}>
      <div className="album-detail-container">
        {/* 상단 네비바 */}
        <div className="detail-top-nav">
          <button className="back-btn" onClick={handleBack}>
            &lt; ALBUM
          </button>
          <span className="album-nav-title">{albumData.title}</span>
        </div>

        {/* 앨범 커버 영역 */}
        <div className="album-banner" onClick={() => coverInputRef.current.click()}>
          <img 
            src={imgSrc} 
            alt="Cover" 
            className="banner-img" 
            onError={() => {
              // 에러 발생 시 딱 한 번만 대체 이미지로 교체하여 무한 루프 방지
              if (imgSrc !== "https://via.placeholder.com/1200x400") {
                setImgSrc("https://via.placeholder.com/1200x400");
              }
            }}
          />
          <div className="banner-overlay">
            <Camera size={32} color="white" />
            <span>커버 사진 변경</span>
          </div>
          <input 
            type="file" 
            ref={coverInputRef} 
            style={{ display: "none" }} 
            accept="image/*" 
            onChange={handleCoverEdit} 
          />
        </div>

        {/* 사진 목록 영역 */}
        <div className="album-content-area">
          <div className="photo-grid1">
            <div className="grid-item add-btn-item" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={40} color="#ffffff" strokeWidth={1} />
            </div>

            {albumPhotos.map((photo) => (
              <div key={photo.photoId} className="grid-item photo-item1">
                <img 
                  src={photo.imageUrl} 
                  alt="" 
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = "https://via.placeholder.com/300"; 
                  }}
                />
                <button className="delete-photo-btn" onClick={(e) => {
                  e.stopPropagation(); 
                  handleDeletePhoto(photo.photoId);
                }}>
                  <X size={16} color="white" />
                </button>
              </div>
            ))}
          </div>
          {loading && <p style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>데이터 처리 중...</p>}
        </div>
      </div>

      {isAddModalOpen && (
        <Album_addphoto 
          onClose={() => setIsAddModalOpen(false)} 
          onSelect={handlePhotoSelect} 
        />
      )}
    </div>
  );
};

export default AlbumDetail;