import { NavLink } from "react-router-dom";
import DearTimeMini from "../assets/DearTimemini.png";

export default function Header() {
    const itemClass = ({ isActive }) => `item ${isActive ? "active" : ""}`;

    return (
        <>
        {/* ✅ 전역 리셋 + 헤더 스타일 전부 여기 */}
        <style>{`
            /* ===== 전역 리셋 (이거 때문에 문제였음) ===== */
            html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            }

            /* ===== Header ===== */
            .header {
            position: relative;
            width: 100vw;              /* 🔥 화면 끝까지 */
            height: 80px;
            background: linear-gradient(
                180deg,
                #0b1220 0%,
                #090f1c 100%
            );
            border-bottom: 1px solid rgba(255,255,255,0.06);
            }

            /* ===== 안쪽 정렬용 컨테이너 ===== */
            .inner {
            max-width: 1440px;          /* 시안용 폭 */
            height: 100%;
            margin: 0 auto;
            padding: 0 48px;

            display: flex;
            align-items: center;
            gap: 48px;
            }

            .logo img {
            height: 22px;
            display: block;
            }

            /* ===== Nav ===== */
            .nav {
            display: flex;
            align-items: center;
            gap: 40px;
            }

            .item {
            position: relative;
            color: white;
            text-decoration: none;
            font-size: 16px;
            opacity: 0.75;
            transition: opacity 0.2s ease;
            }

            .item:hover {
            opacity: 1;
            }

            .item.active {
            opacity: 1;
            font-weight: 600;
            }

            /* active 밑줄 (있어 보이게) */
            .item.active::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: -10px;
            height: 2px;
            background: white;
            border-radius: 2px;
            }
        `}</style>

        {/* ===== Header Markup ===== */}
        <header className="header">
            <div className="inner">
            <NavLink to="/home" className="logo">
                <img src={DearTimeMini} alt="DearTime" />
            </NavLink>

            <nav className="nav">
                <NavLink to="/gallery" className={itemClass}>갤러리</NavLink>
                <NavLink to="/letterbox" className={itemClass}>우체통</NavLink>
                <NavLink to="/timecapsule" className={itemClass}>타임캡슐</NavLink>
                <NavLink to="/freind" className={itemClass}>친구목록</NavLink>
            </nav>
            </div>
        </header>
        </>
    );
}