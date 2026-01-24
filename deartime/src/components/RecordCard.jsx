export default function RecordCard({ imageUrl, title = "즐겨찾기" }) {
  return (
    <div className="card card-record">
      <div className="card-title">RECORD</div>

      <div className="card-image">
        <img src={imageUrl} alt="record" />
      </div>

      {/* ✅ 하단 고정 */}
      <div className="card-footer">{title}</div>
    </div>
  );
}
