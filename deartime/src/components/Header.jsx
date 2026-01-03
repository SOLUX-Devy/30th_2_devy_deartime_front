import { NavLink } from "react-router-dom";
import DearTimeMini from "../assets/logo.svg";

export default function Header() {
  const itemClass = ({ isActive }) => `item ${isActive ? "active" : ""}`;

  return (
    <>
      {/* ✅ 전역 리셋 + 헤더 스타일 전부 여기 */}
      <style>{`
        /* ===== 전역 리셋 ===== */
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
        }

        /* ===== Header ===== */
        .header {
          position: relative;
          width: 100%;
          height: 80px;

          background: linear-gradient(
            180deg,
            #0b1220 0%,
            #090f1c 100%
          );
        }

        /* ===== 안쪽 정렬용 컨테이너 ===== */
        .inner {
          max-width: 1440px;
          height: 100%;
          margin: 0 auto;
          padding: 0 5rem;

          display: flex;
          align-items: center;

          /* ✅ 로고-네비 간격을 여기서 조절 */
          justify-content: flex-start;
          gap: 220px; /* ✅ 원하는 만큼 바꾸기 */
        }

        .logo img {
          height: 22px;
          display: block;
        }

        /* ===== Nav ===== */
        .nav {
          display: flex;
          align-items: center;

          gap: 130px; /* 메뉴 간 간격 */
          margin: 0;  /* ✅ 기존 margin-left/right 제거 */
        }

        .item {
          position: relative;
          color: white;
          text-decoration: none;
          font-size: 16px;

          /* ✅ 클릭 시 네비 흔들림 방지(굵기 고정) */
          font-weight: 400;

          opacity: 0.75;
          transition: opacity 0.2s ease, color 0.2s ease;
        }

        .item:hover {
          opacity: 1;
        }

        .item.active {
          opacity: 1;
          color: #0E77BC;

          /* ✅ active여도 굵기 고정 (움직임 방지) */
          font-weight: 400;
        }
      `}</style>

      {/* ===== Header Markup ===== */}
      <header className="header">
        <div className="inner">
          <NavLink to="/home" className="logo">
            <img src={DearTimeMini} alt="DearTime" />
          </NavLink>

          <nav className="nav">
            <NavLink to="/gallery" className={itemClass}>
              갤러리
            </NavLink>
            <NavLink to="/letterbox" className={itemClass}>
              우체통
            </NavLink>
            <NavLink to="/timecapsule" className={itemClass}>
              타임캡슐
            </NavLink>
            <NavLink to="/freind" className={itemClass}>
              친구목록
            </NavLink>
          </nav>
        </div>
      </header>
    </>
  );
}
