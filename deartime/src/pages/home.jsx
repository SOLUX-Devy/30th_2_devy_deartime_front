import TimeCapsuleCard from "../components/TimeCapsuleCard";
import RecordCard from "../components/RecordCard";
import ConstellationCard from "../components/ConstellationCard";
import "../styles/home.css";
import backgroundImg from "../assets/background.svg";
import profileImg from "../assets/profile.jpg";

export default function Home() {

  const favoriteRecordImage = profileImg
  const userBirthday = "2004-03-16";

  return (
    <div className="home-container">
      <img src={backgroundImg} alt="background" className="background-img" />
      <div className="description">
        별빛처럼 사라지지 않는 기억을 기록하는 곳
      </div>

      <section className="cards">
        <div className="card-wrapper">
          <div className="card-title">TIME CAPSULE</div>
          {/* <TimeCapsuleCard capsule={capsuleData} /> */}
          <TimeCapsuleCard
          capsule={{
            canAccess: true,
            opened: false,
            openAt: "2026-01-05",
            createdAt: "2026-01-01",
            imageUrl: null,
            senderNickname: "from.solux",
            title: "어렸을 때의 추억",
          }}
        />
        </div>
        <RecordCard imageUrl={favoriteRecordImage} />
        <ConstellationCard birthday={userBirthday} />
      </section>
    </div>
  );
}