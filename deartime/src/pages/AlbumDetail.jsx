import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, X, Camera } from "lucide-react"; 
import "../styles/AlbumDetail.css";
import bg from "../assets/background_nostar.png";
import Album_addphoto from "../components/Album_addphoto.jsx"; 

const AlbumDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const coverInputRef = useRef(null); 

  // [연결] 갤러리(목록)에서 넘어온 앨범 데이터
  const albumData = location.state?.album;
  
  // [연결] 갤러리의 'coverImageUrl'을 상세 페이지 커버의 초기값으로 사용
  const [currentCover, setCurrentCover] = useState(albumData?.coverImageUrl || albumData?.coverUrl); 
  const [albumPhotos, setAlbumPhotos] = useState([]);
  
  // [추가] Album_addphoto 모달 열림 상태 관리
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (!albumData) {
    return <div className="error-msg">앨범 정보를 찾을 수 없습니다.</div>;
  }

  // 1. 커버 사진 수정 (갤러리와 연결된 부분)
  const handleCoverEdit = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newCoverUrl = URL.createObjectURL(file);
      setCurrentCover(newCoverUrl);
    }
  };

  // 2. [변경] Album_addphoto 모달에서 선택한 사진들을 앨범에 추가
  const handlePhotoSelect = (selectedPhotos) => {
    // 모달(ap-grid)에서 선택된 사진 객체들을 현재 UI 리스트 형식(id, url)으로 변환
    const newPhotos = selectedPhotos.map(p => ({
      id: p.photoId,
      url: p.imageUrl
    }));

    // 기존 리스트에 추가 (앞으로 추가)
    setAlbumPhotos(prev => [...newPhotos, ...prev]);
  };

  const handleDeletePhoto = (photoId) => {
    if (window.confirm("이 사진을 앨범에서 삭제하시겠습니까?")) {
      setAlbumPhotos(prev => prev.filter(photo => photo.id !== photoId));
    }
  };

  // 3. 뒤로 가기 (변경된 커버 정보를 갤러리에 전달하여 동기화)
  const handleBack = () => {
    navigate("/gallery", { 
      state: { 
        activeTab: 1, 
        updatedAlbum: { ...albumData, coverImageUrl: currentCover } 
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
          <img src={currentCover} alt="Album Cover" className="banner-img" />
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

        {/* 앨범 내부 사진 영역 */}
        <div className="album-content-area">
          <div className="photo-grid1">
            {/* [변경] + 버튼 클릭 시 Album_addphoto 모달을 엽니다. */}
            <div className="grid-item add-btn-item" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={40} color="#ffffff" strokeWidth={1} />
            </div>

            {/* 사진 리스트 출력 */}
            {albumPhotos.map((photo) => (
              <div key={photo.id} className="grid-item photo-item1">
                <img src={photo.url} alt="album-content" />
                <button className="delete-photo-btn" onClick={(e) => {
                  e.stopPropagation(); 
                  handleDeletePhoto(photo.id);
                }}>
                  <X size={16} color="white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* [연결] 사진 추가 모달 컴포넌트 */}
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