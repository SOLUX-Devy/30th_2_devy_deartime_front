import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Plus, X, Camera, Videotape } from "lucide-react"; 
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
  
  const initialCover = albumData?.coverImageUrl || albumData?.coverUrl || "";
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

  const handlePhotoSelect = async (selectedPhotos) => {
    if (selectedPhotos.length === 0) return;
    
    try {
      setLoading(true);

      if (isChangingCover) {
        // 커버 변경 모드일 때는 선택된 첫 번째 사진만 사용 (단일 선택)
        const targetPhoto = selectedPhotos[0];
        const requestBody = {
          title: albumData.title,
          photoId: Number(targetPhoto.photoId)
        };

        const res = await axios.post(
          `${apiBaseUrl}/api/albums/${albumId}/title`, 
          requestBody, 
          { headers: getAuthHeader() }
        );

        if (res.data.success) {
          alert("앨범 커버가 성공적으로 수정되었습니다.");
          setImgSrc(res.data.data.coverImageUrl);
        }
      } else {
        // 일반 사진 추가 모드
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

        {/* 앨범 커버 클릭 시 수정 가능 (즐겨찾기 포함 모든 앨범 동일 적용) */}
        <div className="album-banner" onClick={() => {
          setIsChangingCover(true);
          setIsAddModalOpen(true);
        }}>
          {imgSrc && imgSrc !== "" && !imgSrc.includes("via.placeholder.com") ? (
            <img 
              src={imgSrc} 
              alt="Cover" 
              className="banner-img" 
              onError={() => {
                setImgSrc("");
              }}
            />
          ) : (
            <div className="empty-cover-placeholder">
               <Videotape size={60} color="#ffffff" strokeWidth={1.2} opacity={0.6} />
               <p style={{ marginTop: '10px', color: 'white', opacity: 0.6 }}>앨범 커버를 설정해보세요</p>
            </div>
          )}
          
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
    // 커버를 바꿀 때만 true가 되도록 설정
          singleSelect={isChangingCover} 
        />
      )}
    </div>
  );
};

export default AlbumDetail;