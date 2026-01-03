import React, { useMemo } from 'react';
import capsuleDefaultImg from '../assets/timecapsule.png';

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

  // ✅ 상태별 박스 스타일
  const variantClass =
    !canAccess
      ? 'tc-card--locked'
      : opened
      ? 'tc-card--opened'
      : 'tc-card--accessible';

  // ✅ 이미지 규칙
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

      {/* ✅ TimeCapsuleCard 전용 CSS를 JSX에 “합침” */}
      <style>{`
        .tc-card {
          width: 240px;
          height: 323px;

          display: flex;
          flex-direction: column;

          padding: 16px;
          border-radius: 16px;
          box-sizing: border-box;

          background: transparent;
          border: none;

          cursor: pointer;
          text-align: left;
        }

        /* 1) canAccess=false => 투명 박스 */
        .tc-card--locked {
          background: transparent;
          border: none;
        }

        /* 2) canAccess=true & opened=false => 파란색 박스 */
        .tc-card--accessible {
          background: #0e77bc;
          border: none;
        }

        /* 3) canAccess=true & opened=true => fill #000 20% + border #0E77BC 50% 3px */
        .tc-card--opened {
          background: rgba(0, 0, 0, 0.2);
          border: 3px solid rgba(14, 119, 188, 0.5);
        }

        .tc-card__top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .tc-card__dday {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
        }

        .tc-card__created {
          font-size: 12px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.85);
        }

        .tc-card__imgWrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tc-card__img {
          width: 150px;
          height: auto;
          object-fit: contain;
        }

        .tc-card__meta {
          margin-top: 10px;
        }

        .tc-card__sender {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }

        .tc-card__title {
          margin-top: 6px;
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;

          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </>
  );
}
