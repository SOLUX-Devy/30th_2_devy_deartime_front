import TimeCapsuleCard from "../components/TimeCapsuleCard";
import RecordCard from "../components/RecordCard";
import ConstellationCard from "../components/ConstellationCard";
import "../styles/home.css";
import backgroundImg from "../assets/background.svg";
import profileImg from "../assets/profile.jpg";

export default function Home() {
  // 나중에 API로 대체될 데이터
  const capsuleData = {
    dday: 1,
    from: "solux",
    title: "어렸을 때의 추억",
  };

  const favoriteRecordImage = profileImg
  const userBirthday = "2004-03-16";

  return (
    <div className="home-container">
      <img src={backgroundImg} alt="background" className="background-img" />
      <div className="description">
        별빛처럼 사라지지 않는 기억을 기록하는 곳
      </div>

      <section className="cards">
        <TimeCapsuleCard capsule={capsuleData} />
        <RecordCard imageUrl={favoriteRecordImage} />
        <ConstellationCard birthday={userBirthday} />
      </section>
    </div>
  );
}