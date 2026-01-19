import TimeCapsuleCard from "../components/TimeCapsuleCard";
import RecordCard from "../components/RecordCard";
import ConstellationCard from "../components/ConstellationCard";
import "../styles/home.css";
import backgroundImg from "../assets/background.svg";
import { useUser } from "../context/UserContext";

export default function Home() {
  const { user } = useUser();

  if (!user) return null; 

  return (
    <div className="home-container">
      <img src={backgroundImg} alt="background" className="background-img" />

      <div className="description">
        {user.nickname}님의 기억을 별빛처럼 기록해요 ✨
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
              senderNickname: user.nickname,
              title: "어렸을 때의 추억",
            }}
          />
        </div>

        <RecordCard imageUrl={user.profileImageUrl} />
        <ConstellationCard birthday={user.birthday} />
      </section>
    </div>
  );
}
