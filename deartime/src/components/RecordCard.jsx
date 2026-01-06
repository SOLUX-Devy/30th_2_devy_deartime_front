export default function RecordCard({ imageUrl }) {
  return (
    <div className="card card-record">
      <div className="card-title">RECORD</div>

      <div className="card-image">
        <img src={imageUrl} alt="record" />
      </div>

      <div className="card-text">즐겨찾기</div>
    </div>
  );
}
