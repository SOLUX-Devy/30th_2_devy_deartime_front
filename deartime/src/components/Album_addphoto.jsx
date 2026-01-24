import React, { useEffect, useMemo, useState } from "react";
import finder from "../assets/finder.png";
import "./Album_addphoto.css";

// singleSelect props를 추가하여 단일 선택 모드 여부를 결정합니다.
export default function Album_addphoto({ onClose, onSelect, singleSelect = false }) {
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. 사진 목록 로드
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
        if (!res.ok) throw new Error(json?.message || "사진 목록 조회 실패");

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

  // 2. 검색 필터링
  const filteredPhotos = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return photos;
    return photos.filter((p) => (p.caption || "").toLowerCase().includes(k));
  }, [photos, keyword]);

  // 3. 사진 선택/해제 핸들러 (단일 선택 로직 추가)
  const toggleSelect = (photoId) => {
    if (singleSelect) {
      // 단일 선택 모드: 클릭 시 이전 선택을 지우고 현재 사진만 선택
      setSelectedIds((prev) => (prev.includes(photoId) ? [] : [photoId]));
    } else {
      // 다중 선택 모드 (기존 로직)
      setSelectedIds((prev) =>
        prev.includes(photoId)
          ? prev.filter((id) => id !== photoId)
          : [...prev, photoId]
      );
    }
  };

  const canConfirm = selectedIds.length > 0;

  // 4. 선택 완료 핸들러
  const handleConfirm = () => {
    if (selectedIds.length === 0) return;
    const selectedObjects = photos.filter((p) => selectedIds.includes(p.photoId));
    onSelect(selectedObjects);
    onClose();
  };

  return (
    <div className="ap-overlay" onClick={onClose}>
      <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ap-header">
          <div className="ap-title">{singleSelect ? "커버 사진 변경" : "사진 추가"}</div>
          <button type="button" className="ap-close" onClick={onClose}>×</button>
        </div>

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
            <div className="ap-count">{filteredPhotos.length}장의 사진</div>
          </div>

          <button
            type="button"
            className={`ap-confirm-btn ${canConfirm ? "active" : ""}`}
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {singleSelect ? "변경하기" : `${selectedIds.length}장 추가`}
          </button>
        </div>

        {isLoading && <div className="ap-state">사진 불러오는 중…</div>}
        {!!errorMsg && !isLoading && <div className="ap-state error">{errorMsg}</div>}

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