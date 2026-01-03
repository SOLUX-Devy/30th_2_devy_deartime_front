import React, { useMemo } from 'react';
import capsuleDefaultImg from '../assets/timecapsule_small.png';

function formatDateYYYYMMDD(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

// openAt 기준 D-day 계산 (날짜 기준)
function calcDDay(openAt) {
  if (!openAt) return '';
  const now = new Date();
  const target = new Date(openAt);

  const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffDays = Math.round((t - n) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'D-day';
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}

export default function TimeCapsuleCard({ capsule, onClick }) {
  const {
    canAccess,
    opened,
    openAt,
    createdAt,
    imageUrl,
    senderNickname,
    title,
  } = capsule;

  const dday = useMemo(() => calcDDay(openAt), [openAt]);
  const created = useMemo(() => formatDateYYYYMMDD(createdAt), [createdAt]);

  const variantClass = !canAccess
    ? 'tc-card--locked'
    : opened
    ? 'tc-card--opened'
    : 'tc-card--accessible';

  const imgSrc =
    canAccess && opened ? imageUrl || capsuleDefaultImg : capsuleDefaultImg;

  return (
    <>
      <button
        type="button"
        className={`tc-card ${variantClass}`}
        onClick={onClick}
      >
        <div className="tc-card__top">
          <span className="tc-card__dday">{dday}</span>
          <span className="tc-card__created">{created}</span>
        </div>

        <div className="tc-card__imgWrap">
          <img className="tc-card__img" src={imgSrc} alt="timecapsule" />
        </div>

        <div className="tc-card__meta">
          <div className="tc-card__sender">{senderNickname}</div>
          <div className="tc-card__title">{title}</div>
        </div>
      </button>

      <style>{`
        .tc-card {
          width: 100%;
          max-width: 240px;
          height: 323px;
          justify-self: center;

          display: flex;
          flex-direction: column;
          align-items: center;

          padding: 16px;
          border-radius: 16px;
          box-sizing: border-box;

          background: transparent;
          border: none;

          cursor: pointer;
          text-align: center;
        }

        /* 접근 불가 */
        .tc-card--locked {
          background: transparent;
        }

        /* 🔥 OPEN ME – 채도 다운 & 은은 */
        .tc-card--accessible {
          animation: openMeGlow 3.2s ease-in-out infinite;
          will-change: background-color, box-shadow;
        }

        @keyframes openMeGlow {
          0% {
            background-color: rgba(14, 119, 188, 0.05);
            box-shadow: 0 0 0 rgba(14, 119, 188, 0);
          }
          50% {
            background-color: rgba(14, 119, 188, 0.3);
            box-shadow:
              0 0 12px rgba(14, 119, 188, 0.28),
              0 0 24px rgba(14, 119, 188, 0.15);
          }
          100% {
            background-color: rgba(14, 119, 188, 0.05);
            box-shadow: 0 0 0 rgba(14, 119, 188, 0);
          }
        }

        /* 열린 캡슐 */
        .tc-card--opened {
          background: rgba(0, 0, 0, 0.2);
          box-shadow: inset 0 0 0 2.5px rgba(14, 119, 188, 0.5);
        }

        .tc-card__top {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 5px;
        }

        .tc-card__dday {
          font-size: 20px;
          font-weight: 100;
          color: #ffffff;
        }

        .tc-card__created {
          margin-top: 5px;
          font-size: 10px;
          font-weight: 100;
          color: rgba(255, 255, 255, 0.85);
        }

        /* ✅ 이미지 래퍼 – 무조건 20px 라운드 */
        .tc-card__imgWrap {
          width: 200px;
          height: 200px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 20px;
          overflow: hidden; /* 중요 */
        }

        /* ✅ 이미지 자체도 20px 라운드 */
        .tc-card__img {
          width: 200px;
          height: 200px;
          object-fit: contain;
          border-radius: 20px;
        }

        .tc-card__meta {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .tc-card__sender {
          margin-top: 5px;
          font-size: 14px;
          font-weight: 100;
          color: rgba(255, 255, 255, 0.95);
        }

        .tc-card__title {
          margin-top: 10px;
          font-size: 10px;
          font-weight: 100;
          color: rgba(255, 255, 255, 0.95);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }
      `}</style>
    </>
  );
}
