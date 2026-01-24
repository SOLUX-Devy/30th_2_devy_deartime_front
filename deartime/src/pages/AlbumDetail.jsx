import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Plus, X, Camera } from "lucide-react"; 
import axios from "axios";
import "../styles/AlbumDetail.css";
import bg from "../assets/background_nostar.png";
import Album_addphoto from "../components/Album_addphoto.jsx"; 

const AlbumDetail = () => {
  const params = useParams();
  const albumId = params.albumId || params.id;

  const location = useLocation();
  const navigate = useNavigate();

  const albumData = location.state?.album;
  
  const initialCover = albumData?.coverImageUrl || albumData?.coverUrl || "https://via.placeholder.com/1200x400";
  const [imgSrc, setImgSrc] = useState(initialCover);
  
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChangingCover, setIsChangingCover] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    return { Authorization: `Bearer ${token}` };
  }, []);

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
      setAlbumPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [albumId, apiBaseUrl, getAuthHeader]);

  useEffect(() => {
    if (albumId && albumId !== "undefined") {
      fetchAlbumPhotos();
    }
  }, [albumId, fetchAlbumPhotos]);

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

  /**
   * 사진 선택 완료 핸들러
   * 알려주신 새로운 엔드포인트 /api/albums/{albumId}/title 에 POST를 사용합니다.
   */
  const handlePhotoSelect = async (selectedPhotos) => {
    if (selectedPhotos.length === 0) return;
    
    try {
      setLoading(true);

      if (isChangingCover) {
        // [최종 수정] 새로운 엔드포인트와 POST 메서드 반영
        const targetPhoto = selectedPhotos[0];
        const requestBody = {
          title: albumData.title, // 기존 제목 유지
          photoId: Number(targetPhoto.photoId) // 선택한 사진 ID
        };

        const res = await axios.post(
          `${apiBaseUrl}/api/albums/${albumId}/title`, 
          requestBody, 
          { headers: getAuthHeader() }
        );

        if (res.data.success) {
          alert("앨범 커버가 성공적으로 수정되었습니다.");
          // 서버에서 응답받은 새로운 커버 이미지 URL로 상태 업데이트
          setImgSrc(res.data.data.coverImageUrl);
        }
      } else {
        // 기존: 앨범에 사진 추가 로직
        const requestBody = {
          photoIds: selectedPhotos.map(p => Number(p.photoId))
        };
        const res = await axios.post(
          `${apiBaseUrl}/api/albums/${albumId}/photos`, 
          requestBody, 
          { headers: getAuthHeader() }
        );

        if (res.data.success) {
          alert("앨범에 사진이 추가되었습니다.");
          fetchAlbumPhotos();
        }
      }
    } catch (err) {
      console.error("작업 실패:", err.response?.data || err);
      alert(err.response?.data?.message || "서버 에러가 발생했습니다.");
    } finally {
      setLoading(false);
      setIsAddModalOpen(false);
      setIsChangingCover(false);
    }
  };

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

  const handleBack = () => {
    navigate("/gallery", { 
      state: { 
        activeTab: 1, 
        updatedAlbum: { 
          ...albumData, 
          albumId: albumId,
          coverImageUrl: imgSrc 
        } 
      } 
    });
  };

  return (
    <div className="gallery-container" style={{ backgroundImage: `url(${bg})` }}>
      <div className="album-detail-container">
        <div className="detail-top-nav">
          <button className="back-btn" onClick={handleBack}>
            &lt; ALBUM
          </button>
          <span className="album-nav-title">{albumData.title}</span>
        </div>

        {/* 커버 클릭 시 모달 오픈 */}
        <div className="album-banner" onClick={() => {
          setIsChangingCover(true);
          setIsAddModalOpen(true);
        }}>
          <img 
            src={imgSrc} 
            alt="Cover" 
            className="banner-img" 
            onError={() => {
              if (imgSrc !== "https://via.placeholder.com/1200x400") {
                setImgSrc("https://via.placeholder.com/1200x400");
              }
            }}
          />
          <div className="banner-overlay">
            <Camera size={32} color="white" />
            <span>커버 사진 변경</span>
          </div>
        </div>

        <div className="album-content-area">
          <div className="photo-grid1">
            <div className="grid-item add-btn-item" onClick={() => {
              setIsChangingCover(false);
              setIsAddModalOpen(true);
            }}>
              <Plus size={40} color="#ffffff" strokeWidth={1} />
            </div>

            {albumPhotos.map((photo) => (
              <div key={photo.photoId} className="grid-item photo-item1">
                <img src={photo.imageUrl} alt="" />
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
          onClose={() => {
            setIsAddModalOpen(false);
            setIsChangingCover(false);
          }} 
          onSelect={handlePhotoSelect} 
        />
      )}
    </div>
  );
};

export default AlbumDetail;