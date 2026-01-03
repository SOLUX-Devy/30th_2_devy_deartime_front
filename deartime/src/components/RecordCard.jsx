
export default function RecordCard({ imageUrl }) {
  return (
    <div className="record">
      <div className="card-title">RECORD</div>
      <img src={imageUrl} alt="record" />
      <div className="record-text">즐겨찾기</div>
    </div>
  );
}