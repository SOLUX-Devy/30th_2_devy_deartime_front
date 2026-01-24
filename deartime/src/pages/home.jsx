import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Videotape } from "lucide-react"; // ⭐ 아이콘 추가
import TimeCapsuleCard from "../components/TimeCapsuleCard";
import ConstellationCard from "../components/ConstellationCard";
import "../styles/home.css";
import { useUser } from "../context/UserContext";

export default function Home() {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  const [capsules, setCapsules] = useState([]);
  const [favAlbum, setFavAlbum] = useState(null); // ⭐ 즐겨찾기 앨범 상태 추가
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    if (!loading && !user) {
      alert("로그인이 필요합니다.");
      navigate("/");
    }
  }, [loading, user, navigate]);

  // 1. 데이터 페칭 (타임캡슐 + 즐겨찾기 앨범)
  useEffect(() => {
    const fetchHomeData = async () => {
      if (!user) return;
      const headers = { 
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}` 
      };

      try {
        // 타임캡슐 로드
        const capResponse = await fetch(`${BASE_URL}/api/timecapsules`, { headers });
        const capJson = await capResponse.json();
        if (capJson.success) {
          setCapsules(capJson.data.data || []);
        }

        // ⭐ 앨범 목록 로드 및 '즐겨찾기' 찾기
        const albResponse = await fetch(`${BASE_URL}/api/albums`, { headers });
        const albJson = await albResponse.json();
        if (albJson.success) {
          const favorite = albJson.data.find(a => a.title === "즐겨찾기");
          setFavAlbum(favorite);
        }
      } catch (e) {
        console.error("[Home] 데이터 로드 실패:", e);
      }
    };
    fetchHomeData();
  }, [user, BASE_URL]);

  const displayCapsule = useMemo(() => {
    if (capsules.length === 0) return null;

    const unopened = capsules
      .filter(c => !c.opened)
      .sort((a, b) => new Date(a.openAt) - new Date(b.openAt));
    
    if (unopened.length > 0) return unopened[0];

    const opened = capsules
      .filter(c => c.opened)
      .sort((a, b) => new Date(b.openAt) - new Date(a.openAt));

    if (opened.length > 0) return opened[0];

    return null;
  }, [capsules]);

  const finalCapsule = displayCapsule || {
    canAccess: true,
    opened: false,
    openAt: null,
    createdAt: null,
    imageUrl: null,
    senderNickname: user?.nickname || "Deartime",
    title: "환영합니다",
  };

  if (loading) {
    return <div className="loading-screen">정보를 불러오는 중...</div>;
  }

  if (!user) return null;

  const handleCapsuleClick = () => {
    navigate("/timecapsule"); 
  };

  return (
    <div className="home-container">
      <div className="description">
        별빛처럼 사라지지 않는 기억을 기록하는 곳
      </div>

      <section className="cards">
        <div 
          className="card-wrapper"
          onClick={handleCapsuleClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-title">TIME CAPSULE</div>
          <TimeCapsuleCard capsule={finalCapsule} />
        </div>

        {/* ⭐ 중앙 RECORD 섹션: 클릭 시 갤러리로 이동 */}
        <div 
          className="card-wrapper"
          onClick={() => navigate("/gallery")}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-title">RECORD</div>
          <div className="card card-record">
            <div className="card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {favAlbum?.coverImageUrl ? (
                <img 
                  src={favAlbum.coverImageUrl} 
                  alt="Album Cover" 
                  style={{ width: '220px', height: '220px', border: '3px solid #0E77BC', borderRadius: '20px', objectFit: 'cover'  }}
                />
              ) : (
                /* 앨범 커버가 없을 때 Videotape 아이콘 (2px 굵기) */
                <Videotape size={160} strokeWidth={1} color="#0E77BC" style={{ opacity: 0.8 }} />
              )}
            </div>
            <div className="card-text">{favAlbum?.title || "즐겨찾기"}</div>
          </div>
        </div>

        {/* CONSTELLATION: 기존 코드 유지 */}
        <ConstellationCard birthday={user.birthDate} />
      </section>
    </div>
  );
}