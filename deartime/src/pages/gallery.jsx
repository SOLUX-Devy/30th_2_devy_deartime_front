import React, { useState } from 'react';

// 1. 더미 데이터 (실제 프로젝트에선 서버에서 받아온 데이터로 교체하세요)
const dummyImages = [
  { id: 1, src: "https://picsum.photos/id/1015/600/400", title: "강" },
  { id: 2, src: "https://picsum.photos/id/1016/600/400", title: "협곡" },
  { id: 3, src: "https://picsum.photos/id/1018/600/400", title: "산" },
  { id: 4, src: "https://picsum.photos/id/1019/600/400", title: "바다" },
  { id: 5, src: "https://picsum.photos/id/1021/600/400", title: "숲" },
  { id: 6, src: "https://picsum.photos/id/1022/600/400", title: "밤하늘" },
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  // 이미지 클릭 핸들러
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📸 나의 갤러리</h2>
      
      {/* 2. 갤러리 그리드 영역 */}
      <div style={styles.grid}>
        {dummyImages.map((image) => (
          <div 
            key={image.id} 
            style={styles.card} 
            onClick={() => handleImageClick(image)}
          >
            <img 
              src={image.src} 
              alt={image.title} 
              style={styles.thumbnail} 
            />
            <div style={styles.overlay}>
              <span>{image.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. 모달 (이미지 확대 보기) */}
      {selectedImage && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={handleCloseModal}>&times;</button>
            <img 
              src={selectedImage.src} 
              alt={selectedImage.title} 
              style={styles.fullImage} 
            />
            <p style={styles.modalCaption}>{selectedImage.title}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. 인라인 스타일 (CSS 파일 없이 작동하도록 함)
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', // 반응형 그리드
    gap: '15px',
  },
  card: {
    position: 'relative',
    cursor: 'pointer',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  thumbnail: {
    width: '100%',
    height: '200px',
    objectFit: 'cover', // 이미지 비율 유지하며 꽉 채우기
    display: 'block',
  },
  overlay: { // 마우스 오버 효과를 위한 준비
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    padding: '5px',
    textAlign: 'center',
    fontSize: '14px',
  },
  // 모달 스타일
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    position: 'relative',
    background: '#fff',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '90%',
    maxHeight: '90%',
  },
  fullImage: {
    maxWidth: '100%',
    maxHeight: '80vh',
    display: 'block',
    borderRadius: '4px',
  },
  closeButton: {
    position: 'absolute',
    top: '-15px',
    right: '-15px',
    background: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  modalCaption: {
    textAlign: 'center',
    marginTop: '10px',
    fontWeight: 'bold',
    color: '#333',
  },
};

export default Gallery;