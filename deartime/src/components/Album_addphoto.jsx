import React, { useEffect, useMemo, useState } from "react";
import finder from "../assets/finder.png";
import "./Album_addphoto.css";

export default function Album_addphoto({ onClose, onSelect }) {
  const [keyword, setKeyword] = useState("");
  // 여러 장 선택을 위한 ID 배열 관리
  const [selectedIds, setSelectedIds] = useState([]);

  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. [API 연동] 갤러리(RECORD)의 전체 사진 목록 로드
  useEffect(() => {
    const loadGalleryPhotos = async () => {
      try {
        setIsLoading(true);
        setErrorMsg("");

        const token = localStorage.getItem("accessToken");
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

        const res = await fetch(`${apiBaseUrl}/api/photos`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || "사진 목록 조회 실패");
        }

        // API 응답 구조에 맞춰 데이터 추출
        const list = json?.data?.data || json?.data || [];
        setPhotos(list);
      } catch (e) {
        setPhotos([]);
        setErrorMsg(e?.message || "사진을 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    };

    loadGalleryPhotos();
  }, []);

  // 2. 검색 필터링 로직 (캡션 기준)
  const filteredPhotos = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return photos;
    return photos.filter((p) =>
      (p.caption || "").toLowerCase().includes(k),
    );
  }, [photos, keyword]);

  // 3. 사진 선택/해제 토글 핸들러
  const toggleSelect = (photoId) => {
    setSelectedIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const canConfirm = selectedIds.length > 0;
  const countText = `${filteredPhotos.length}장의 사진`;

  // 4. 선택 완료 핸들러
  const handleConfirm = () => {
    if (selectedIds.length === 0) return;

    // 선택된 ID들에 해당하는 전체 사진 객체 리스트 추출
    const selectedObjects = photos.filter((p) => selectedIds.includes(p.photoId));

    // 부모 컴포넌트(AlbumDetail)로 전달 후 모달 닫기
    onSelect(selectedObjects);
    onClose();
  };

  return (
    <div className="ap-overlay" onClick={onClose}>
      <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 섹션 */}
        <div className="ap-header">
          <div className="ap-title">사진 추가</div>
          <button type="button" className="ap-close" onClick={onClose}>×</button>
        </div>

        {/* 상단 컨트롤 바: 검색 및 추가 버튼 */}
        <div className="ap-topRow">
          <div className="ap-search-row">
            <div className="ap-search">
              <input
                className="ap-search-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="사진 설명을 검색하세요"
              />
              <button type="button" className="ap-search-btn">
                <img className="ap-search-icon" src={finder} alt="search" />
              </button>
            </div>
            <div className="ap-count">{countText}</div>
          </div>

          <button
            type="button"
            className={`ap-confirm-btn ${canConfirm ? "active" : ""}`}
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {selectedIds.length > 0 ? `${selectedIds.length}장 추가` : "사진 선택"}
          </button>
        </div>

        {/* 로딩 및 에러 메시지 표시 */}
        {isLoading && <div className="ap-state">사진 불러오는 중…</div>}
        {!!errorMsg && !isLoading && <div className="ap-state error">{errorMsg}</div>}

        {/* 사진 그리드 섹션 */}
        <div className="ap-grid">
          {!isLoading && !errorMsg && filteredPhotos.length === 0 && (
            <div className="ap-state">사진이 없습니다.</div>
          )}

          {filteredPhotos.map((p) => {
            const isSelected = selectedIds.includes(p.photoId);

            return (
              <div
                key={p.photoId}
                className={`ap-cardSlot ${isSelected ? "selected" : ""}`}
                onClick={() => toggleSelect(p.photoId)}
              >
                <div className="ap-cardInner">
                  <div className="ap-photo-card">
                    <img src={p.imageUrl} alt={p.caption} className="ap-img" />
                    {isSelected && <div className="ap-check-badge">✓</div>}
                    <div className="ap-caption">{p.caption || "설명 없음"}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}