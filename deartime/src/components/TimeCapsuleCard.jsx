import capsuleImg from "../assets/timecapsule.png"; 
export default function TimeCapsuleCard({ capsule }) {
  return (
    <div className="capsule">
      <div className="card-title">TIME CAPSULE</div>
      <div className="card-sub">D - {capsule.dday}</div>
      <img src={capsuleImg} alt="capsule" />
      <div className="from">from.{capsule.from}</div>
      <div className="capsule-title">{capsule.title}</div>
    </div>
  );
}