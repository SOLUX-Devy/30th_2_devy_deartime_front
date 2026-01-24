import c1 from "../assets/constellation/1.svg";
import c2 from "../assets/constellation/2.svg";
import c3 from "../assets/constellation/3.svg";
import c4 from "../assets/constellation/4.svg";
import c5 from "../assets/constellation/5.svg";
import c6 from "../assets/constellation/6.svg";
import c7 from "../assets/constellation/7.svg";
import c8 from "../assets/constellation/8.svg";
import c9 from "../assets/constellation/9.svg";
import c10 from "../assets/constellation/10.svg";
import c11 from "../assets/constellation/11.svg";
import c12 from "../assets/constellation/12.svg";

const constellationImages = {
  1: c1,
  2: c2,
  3: c3,
  4: c4,
  5: c5,
  6: c6,
  7: c7,
  8: c8,
  9: c9,
  10: c10,
  11: c11,
  12: c12,
};

export default function ConstellationCard({ birthday }) {
  const date = birthday ? new Date(birthday) : null;
  const month = date && !isNaN(date) ? date.getMonth() + 1 : 1;
  const imageSrc = constellationImages[month];

  return (
    <div className="card-wrapper" style={{ cursor: "pointer" }}>
      <div className="card-title">CONSTELLATION</div>

      <div className="card constellation">
        <div className="card-image">
          <img src={imageSrc} alt={`${month}월 별자리`} />
        </div>

        <div className="card-footer">{birthday}</div>
      </div>
    </div>
  );
}

