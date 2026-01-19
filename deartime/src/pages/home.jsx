import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TimeCapsuleCard from "../components/TimeCapsuleCard";
import RecordCard from "../components/RecordCard";
import ConstellationCard from "../components/ConstellationCard";
import "../styles/home.css";
import backgroundImg from "../assets/background.svg";
import { useUser } from "../context/UserContext";

export default function Home() {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      alert("로그인이 필요합니다.");
      navigate("/");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      console.log("[Home] 유저 데이터:", user);
      console.log("생일:", user.birthDate); 
      console.log("이미지:", user.profileImageUrl);
    }
  }, [user]);

  if (loading) {
    return <div className="loading-screen">정보를 불러오는 중...</div>;
  }

  if (!user) return null;

  return (
    <div className="home-container">
      <img src={backgroundImg} alt="background" className="background-img" />

      <div className="description">
        별빛처럼 사라지지 않는 기억을 기록하는 곳
      </div>

      <section className="cards">
        <div className="card-wrapper">
          <div className="card-title">TIME CAPSULE</div>
          <TimeCapsuleCard
            capsule={{
              canAccess: true,
              opened: false,
              openAt: "2026-01-05",
              createdAt: "2026-01-01",
              imageUrl: null,
              senderNickname: user.nickname || "알 수 없음", // 유저 닉네임 연동
              title: "어렸을 때의 추억",
            }}
          />
        </div>

        <RecordCard imageUrl={user.profileImageUrl} />

        <ConstellationCard birthday={user.birthDate} />
      </section>
    </div>
  );
}