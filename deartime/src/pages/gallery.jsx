import { useNavigate, useLocation } from "react-router-dom"; 

import '../styles/gallery.css';
import React, { useMemo, useState, useRef, useEffect } from "react";
import { Pencil, Trash2, MoreVertical, Star } from "lucide-react";
import bg from "../assets/background_nostar.png";
import AlbumCreateModal from "../components/AlbumCreateModal";

const Gallery = () => {
  // --- [공통 유틸리티 및 레퍼런스 설정] ---
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이트 함수
  const location = useLocation(); // 현재 경로 및 전달된 state 정보 확인
  const fileInputRef = useRef(null); // 실제 파일 업로드 <input> 엘리먼트에 접근하기 위한 Ref
  const longPressTimerRef = useRef(null); // 꾹 누르기(롱프레스) 시간을 계산하기 위한 타이머 변수
  const isLongPressActive = useRef(false); // 롱프레스가 실행 중인지 판별하여 일반 클릭과 구분하는 플래그

  // --- [탭 및 데이터 상태 관리] ---
  const tabs = ["RECORD", "ALBUM"]; // 상단에 표시될 탭 메뉴 이름들
  // 현재 선택된 탭 번호 (네비게이션에서 전달받은 값이 있으면 사용, 없으면 0번인 RECORD 탭)
  const [activeIndex, setActiveIndex] = useState(location.state?.activeTab ?? 0);

  // 사진 데이터 (초기값: 샘플 데이터 리스트)
  const [photos, setPhotos] = useState([
    { id: 1, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '너무 즐거웠다!', isFavorite: false },
    { id: 2, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '그냥 웃음이 끊이지 않았던 날', isFavorite: true },
    { id: 3, url: 'https://via.placeholder.com/150', date: '2025.01.01', title: '하이디라오 먹고 싶다~', isFavorite: false },
  ]);

  // 앨범 데이터 (초기값: 샘플 데이터 리스트)
  const [albums, setAlbums] = useState([
    { id: 101, title: '즐겨찾기', count: 9, coverUrl: 'https://via.placeholder.com/300', isFavorite: true },
    { id: 102, title: '우리 가족', count: 1234, coverUrl: 'https://via.placeholder.com/300', isFavorite: false },
    { id: 103, title: '강쥐', count: 2894, coverUrl: 'https://via.placeholder.com/300', isFavorite: false },
  ]);

  // --- [UI 인터랙션 상태 관리] ---
  // 우클릭/롱프레스 시 나타날 메뉴 정보 (표시 여부, 위치 좌표, 타겟 ID, 데이터 타입)
  const [menu, setMenu] = useState({ show: false, x: 0, y: 0, targetId: null, type: null }); 
  const [editingId, setEditingId] = useState(null); // 현재 제목을 수정 중인 아이템의 ID (null이면 수정 모드 아님)
  const [isModalOpen, setIsModalOpen] = useState(false); // 앨범 생성 모달창의 열림/닫힘 상태

  // --- [전역 이벤트 핸들러] ---
  // 화면 어디든 클릭하면 열려있는 커스텀 컨텍스트 메뉴를 닫음
  useEffect(() => {
    const handleClick = () => setMenu(prev => ({ ...prev, show: false }));
    window.addEventListener('click', handleClick); // 이벤트 등록
    return () => window.removeEventListener('click', handleClick); // 컴포넌트 언마운트 시 해제
  }, []);

  // --- [마우스/터치 통합 롱프레스(꾹 누르기) 로직] ---
  const startPress = (e, id, type) => {
    if (e.type === 'mousedown' && e.button !== 0) return; // 마우스 우클릭은 기본 메뉴 방지에서 따로 처리하므로 무시

    // 터치와 마우스 좌표 통합 추출
    const x = e.pageX || (e.touches && e.touches[0].pageX);
    const y = e.pageY || (e.touches && e.touches[0].pageY);

    isLongPressActive.current = false; // 초기화
    longPressTimerRef.current = setTimeout(() => {
      setMenu({ show: true, x, y, targetId: id, type }); // 0.5초 경과 시 메뉴 표시
      isLongPressActive.current = true; // 롱프레스 상태임을 활성화 (이후 클릭 방지)
      if (navigator.vibrate) navigator.vibrate(50); // 진동 피드백 (모바일)
    }, 500); 
  };

  // 꾹 누르기 도중 손을 떼거나 영역을 벗어나면 타이머 취소
  const cancelPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // --- [아이템 클릭 및 페이지 이동 제어] ---
  const handleItemClick = (e, album = null) => {
    // 롱프레스로 메뉴가 떴을 때는 클릭 이벤트가 무시되도록 처리
    if (isLongPressActive.current) {
      e.stopPropagation();
      isLongPressActive.current = false;
      return;
    }

    // 아이템이 앨범인 경우 해당 앨범 상세 페이지로 이동
    if (album) {
      handleAlbumClick(album);
    }
  };

  const handleAlbumClick = (album) => {
    if (editingId) return; // 제목 수정 중에는 클릭 이동 방지
    navigate(`/album/${album.id}`, { state: { album } }); // 앨범 상세 화면으로 데이터와 함께 이동
  };

  // --- [파일 업로드 및 데이터 처리] ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // 임시 이미지 URL 생성
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '.'); // 오늘 날짜 포맷 (YYYY.MM.DD)
      const newPhoto = { 
        id: Date.now(), 
        url: imageUrl, 
        date: today, 
        title: file.name.split('.')[0], // 파일명을 기본 제목으로 사용
        isFavorite: false 
      };
      setPhotos([newPhoto, ...photos]); // 사진 리스트 최상단에 추가
      e.target.value = ''; // 동일 파일 재업로드를 위해 초기화
    }
  };

  // --- [즐겨찾기 토글 기능] ---
  const togglePhotoFavorite = (e, photoId) => {
    e.stopPropagation(); // 부모 클릭 이벤트(이동 등) 전파 방지
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, isFavorite: !p.isFavorite } : p));
  };

  const toggleAlbumFavorite = (e, albumId) => {
    e.stopPropagation(); 
    setAlbums(prev => prev.map(album => album.id === albumId ? { ...album, isFavorite: !album.isFavorite } : album));
  };

  // --- [커스텀 컨텍스트 메뉴 호출 제어] ---
  const handleContextMenu = (e, id, type) => {
    e.preventDefault(); // 브라우저 자체 우클릭 메뉴가 뜨지 않게 차단
    setMenu({ show: true, x: e.pageX, y: e.pageY, targetId: id, type: type }); // 마우스 좌표에 커스텀 메뉴 띄움
    isLongPressActive.current = true; // 클릭 이벤트 방지 활성화
  };

  // 앨범 우측 하단의 점 세개 버튼 클릭 시 메뉴 노출
  const handleAlbumMenuClick = (e, albumId) => {
    e.stopPropagation(); 
    const rect = e.currentTarget.getBoundingClientRect(); // 버튼 위치 계산
    // 버튼의 왼쪽 아래 지점에 메뉴가 뜨도록 위치 설정
    setMenu({ show: true, x: rect.left - 160, y: rect.bottom + 10, targetId: albumId, type: 'album' });
  };

  // --- [삭제 및 수정 모드 로직] ---
  const handleDelete = () => {
    // 현재 타겟이 사진인지 앨범인지 구분하여 해당 리스트에서 삭제
    if (menu.type === 'photo') setPhotos(prev => prev.filter(p => p.id !== menu.targetId));
    else setAlbums(prev => prev.filter(a => a.id !== menu.targetId));
    setMenu(prev => ({ ...prev, show: false })); // 메뉴 닫기
  };

  const handleEditStart = (e) => {
    e.stopPropagation();
    setEditingId(menu.targetId); // 수정 모드(Input 노출) 활성화
    setMenu(prev => ({ ...prev, show: false })); // 메뉴 닫기
  };

  // 수정 중 엔터나 ESC 입력 시 처리
  const handleEditComplete = (e, id) => {
    if (e.key === 'Enter') {
      const newTitle = e.target.value;
      // 현재 보고 있는 탭에 따라 해당 데이터의 제목 업데이트
      if (activeIndex === 0) setPhotos(prev => prev.map(p => p.id === id ? { ...p, title: newTitle } : p));
      else setAlbums(prev => prev.map(a => a.id === id ? { ...a, title: newTitle } : a));
      setEditingId(null); // 수정 완료
    } else if (e.key === 'Escape') setEditingId(null); // 수정 취소
  };

  // --- [데이터 가공 및 메모이제이션] ---
  // 사진 리스트를 날짜별로 묶어주는 로직 (렌더링 최적화를 위해 useMemo 사용)
  const groupedPhotos = useMemo(() => {
    return photos.reduce((acc, photo) => {
      const date = photo.date;
      if (!acc[date]) acc[date] = []; // 해당 날짜 키가 없으면 배열 생성
      acc[date].push(photo); // 날짜별로 사진 푸시
      return acc;
    }, {});
  }, [photos]);
  
  // 앨범 리스트를 즐겨찾기 우선으로 정렬 (useMemo 사용)
  const sortedAlbums = useMemo(() => {
    return [...albums].sort((a, b) => {
      if (a.isFavorite === b.isFavorite) return 0;
      return a.isFavorite ? -1 : 1; // 즐겨찾기(true)인 앨범을 위로
    });
  }, [albums]);

/*===========================================================*/
  return (
    <div
      className="gallery-container"
      style={{ backgroundImage: `url(${bg})` }}
    >
      
      {/* 앨범을 새로 만들 때 뜨는 팝업창 */}
      <AlbumCreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={(data) => setAlbums([{id: Date.now(), ...data, count: 0, isFavorite: false}, ...albums])} 
      />

      {/* 버튼 클릭으로 호출될 숨겨진 파일 선택 창 */}
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />

      {/* 메뉴가 떴을 때 배경을 어둡게 하고 포커스를 잡기 위한 오버레이 */}
      {(menu.show || editingId !== null) && <div className="context-menu-overlay" />}

      {/* 커스텀 수정/삭제 팝업 메뉴 */}
      {menu.show && (
        <div className="custom-context-menu" style={{ top: menu.y, left: menu.x }} onClick={(e) => e.stopPropagation()}>
          <div className="menu-item" onClick={handleEditStart}>
            <Pencil size={20} color="white" />
            <span>{menu.type === 'photo' ? '텍스트 수정' : '제목 수정'}</span>
          </div>
          <div className="menu-divider" />
          <div className="menu-item delete" onClick={handleDelete}>
            <Trash2 size={20} color="#FF4D4D" />
            <span style={{ color: '#FF4D4D' }}>삭제</span>
          </div>
        </div>
      )}

      {/* 상단 탭 및 우측 버튼 영역 */}
      <div className="tc-topbar1">
        <div className="tab-group">
          {tabs.map((tab, idx) => (
            <span key={tab} className={`tab-item ${activeIndex === idx ? 'active' : ''}`} onClick={() => setActiveIndex(idx)}>
              {tab}{activeIndex === idx && <div className="tab-indicator" />}
            </span>
          ))}
        </div>
        <div className="tc-topbar1-right">
          <button className="tc-create-btn" onClick={() => activeIndex === 0 ? fileInputRef.current.click() : setIsModalOpen(true)}>
            {activeIndex === 0 ? '업로드' : '생성'}
          </button>
        </div>
      </div>

      {/* 실제 리스트가 표시되는 스크롤 영역 */}
      <div className="gallery-content-wrapper">
        {activeIndex === 0 ? (
          /* --- RECORD 탭: 날짜별 그룹 렌더링 --- */
          Object.keys(groupedPhotos).map((date) => (
            <section key={date} className="date-group">
              <h2 className="date-title">{date}</h2>
              <div className="photo-grid">
                {groupedPhotos[date].map((photo) => {
                  // 현재 이 아이템이 메뉴 노출 중이거나 수정 중인지 확인 (스포트라이트 효과용)
                  const isSpotlight = (menu.show && menu.targetId === photo.id) || (editingId === photo.id);
                  return (
                    <div 
                      key={photo.id} 
                      className={`photo-item ${isSpotlight ? 'spotlight' : ''}`} 
                      onContextMenu={(e) => handleContextMenu(e, photo.id, 'photo')}
                      onMouseDown={(e) => startPress(e, photo.id, 'photo')}
                      onMouseUp={cancelPress}
                      onMouseLeave={cancelPress}
                      onTouchStart={(e) => startPress(e, photo.id, 'photo')}
                      onTouchEnd={cancelPress}
                      onClick={(e) => handleItemClick(e)} 
                    >
                      <div className="img-box">
                        <img src={photo.url} alt="" />
                        <button className="fav-star-btn photo-star" onClick={(e) => togglePhotoFavorite(e, photo.id)}>
                          <Star size={18} fill={photo.isFavorite ? "#FFD700" : "none"} stroke={photo.isFavorite ? "#FFD700" : "white"} strokeWidth={2} />
                        </button>
                      </div>
                      {/* 수정 중이면 인풋창을, 아니면 일반 텍스트를 표시 */}
                      {editingId === photo.id ? (
                        <input className="edit-title-input" defaultValue={photo.title} autoFocus onKeyDown={(e) => handleEditComplete(e, photo.id)} onBlur={() => setEditingId(null)} />
                      ) : (
                        <p className="photo-title">{photo.title}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        ) : (
          /* --- ALBUM 탭: 앨범 카드 렌더링 --- */
          <div className="album-section">
            <div className="album-grid">
              {sortedAlbums.map((album) => {
                const isSpotlight = (menu.show && menu.targetId === album.id) || (editingId === album.id);
                return (
                  <div 
                    key={album.id} 
                    className={`album-item ${isSpotlight ? 'spotlight' : ''}`}
                    onClick={(e) => handleItemClick(e, album)}
                    onContextMenu={(e) => handleContextMenu(e, album.id, 'album')}
                    onMouseDown={(e) => startPress(e, album.id, 'album')}
                    onMouseUp={cancelPress}
                    onMouseLeave={cancelPress}
                    onTouchStart={(e) => startPress(e, album.id, 'album')}
                    onTouchEnd={cancelPress}
                    style={{ cursor: editingId === album.id ? 'default' : 'pointer' }}
                  >
                    <div className="album-img-box">
                      <img src={album.coverUrl} alt="" />
                      <button className="fav-star-btn" onClick={(e) => toggleAlbumFavorite(e, album.id)}>
                        <Star size={24} fill={album.isFavorite ? "#FFD700" : "none"} stroke={album.isFavorite ? "#FFD700" : "white"} strokeWidth={2} />
                      </button>
                    </div>
                    <div className="album-info">
                      <div className="album-info-top">
                        {editingId === album.id ? (
                          <input className="edit-title-input" defaultValue={album.title} autoFocus onKeyDown={(e) => handleEditComplete(e, album.id)} onBlur={() => setEditingId(null)} onClick={(e) => e.stopPropagation()} />
                        ) : (
                          <h3>{album.title}</h3>
                        )}
                        <button className="album-menu-trigger" onClick={(e) => handleAlbumMenuClick(e, album.id)}>
                          <MoreVertical size={24} color="white" />
                        </button>
                      </div>
                      <p>항목 {album.count.toLocaleString()} 개</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;