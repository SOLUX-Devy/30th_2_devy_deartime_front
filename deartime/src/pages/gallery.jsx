import React from 'react';
import '../styles/gallery.css';

const Gallery = () => {
  // 1. 샘플 데이터 (나중에 서버에서 받아올 데이터입니다)
  const photos = [
    { id: 1, url: 'https://via.placeholder.com/150', date: '2025-12-24', title: '크리스마스 이브' },
    { id: 2, url: 'https://via.placeholder.com/150', date: '2025-12-24', title: '파티' },
    { id: 3, url: 'https://via.placeholder.com/150', date: '2025-12-31', title: '새해 전야' },
    { id: 4, url: 'https://via.placeholder.com/150', date: '2026-01-01', title: '떡국' },
  ];

  //날짜별로 그룹화
  const groupedPhotos = photos.reduce((acc, photo) => {
    const date = photo.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(photo);
    return acc;
  }, {});

  return (
    <div className="gallery-container">
      {Object.keys(groupedPhotos).map((date) => (
        <section key={date} className="date-group">
          <h2 className="date-title">{date}</h2>
          <div className="photo-grid">
            {groupedPhotos[date].map((photo) => (
              <div key=
              {photo.id} className="photo-item">
                <img src={photo.url} alt={photo.title} />
                <p>{photo.title}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Gallery;
