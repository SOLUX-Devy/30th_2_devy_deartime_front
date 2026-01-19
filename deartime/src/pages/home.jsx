import TimeCapsuleCard from "../components/TimeCapsuleCard";
import RecordCard from "../components/RecordCard";
import ConstellationCard from "../components/ConstellationCard";
import "../styles/home.css";
import backgroundImg from "../assets/background.svg";
import { useUser } from "../context/UserContext";

export default function Home() {
  const { user } = useUser();

  if (!user) {
    return null; // 또는 로딩 컴포넌트
  }

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
              senderNickname: user?.nickname ?? "익명",
              title: "어렸을 때의 추억",
            }}
          />
        </div>

        <RecordCard imageUrl={user?.profileImageUrl ?? null} />
        <ConstellationCard birthday={user?.birthday ?? null} />
      </section>
    </div>
  );
}
