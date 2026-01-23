import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TimeCapsuleCard from "../components/TimeCapsuleCard";
import RecordCard from "../components/RecordCard";
import ConstellationCard from "../components/ConstellationCard";
import "../styles/home.css";
import { useUser } from "../context/UserContext";

export default function Home() {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  // 1. 서버에서 가져온 전체 캡슐 리스트 저장
  const [capsules, setCapsules] = useState([]);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    if (!loading && !user) {
      alert("로그인이 필요합니다.");
      navigate("/");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const fetchCapsules = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${BASE_URL}/api/timecapsules`, {
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}` 
          }
        });
        const json = await response.json();
        if (json.success) {
          // data.data 구조에 따라 데이터 저장
          setCapsules(json.data.data || []);
        }
      } catch (e) {
        console.error("[Home] 타임캡슐 로드 실패:", e);
      }
    };
    fetchCapsules();
  }, [user, BASE_URL]);

  // 3. ✨ 핵심 로직: 보여줄 타임캡슐 결정 (useMemo로 성능 최적화)
  const displayCapsule = useMemo(() => {
    if (capsules.length === 0) return null;

    // A. 아직 열리지 않은 것 중 날짜가 가장 가까운(최근 미래) 것 우선
    const unopened = capsules
      .filter(c => !c.opened)
      .sort((a, b) => new Date(a.openAt) - new Date(b.openAt));
    
    if (unopened.length > 0) return unopened[0];

    // B. 다 열렸다면, 열린 것 중 가장 최근에 열린(과거) 것 선택
    const opened = capsules
      .filter(c => c.opened)
      .sort((a, b) => new Date(b.openAt) - new Date(a.openAt));

    if (opened.length > 0) return opened[0];

    return null;
  }, [capsules]);

  // 4. 최종 데이터 확정 (서버 데이터 없으면 하드코딩 기본값 사용)
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

  return (
    <div className="home-container">
      <div className="description">
        별빛처럼 사라지지 않는 기억을 기록하는 곳
      </div>

      <section className="cards">
        <div 
          className="card-wrapper"
          /* 클릭 방지를 위해 pointer-events를 none으로 설정하거나 onClick을 비워둡니다. */
          style={{ cursor: 'default', pointerEvents: 'none' }}
        >
          <div className="card-title">TIME CAPSULE</div>
          {/* 결정된 finalCapsule 데이터를 전달 */}
          <TimeCapsuleCard capsule={finalCapsule} />
        </div>

        <RecordCard imageUrl={user.profileImageUrl} />
        <ConstellationCard birthday={user.birthDate} />
      </section>
    </div>
  );
}