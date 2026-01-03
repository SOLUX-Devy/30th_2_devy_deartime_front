import React, { useMemo } from 'react';
import capsuleDefaultImg from '../assets/timecapsule.png';
import '../styles/timecapsule.css';

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
  // 1) canAccess=false => 투명
  // 2) canAccess=true && opened=false => 파란색
  // 3) canAccess=true && opened=true => fill #000 20% + border #0E77BC 50% 3px
  const variantClass =
    !canAccess
      ? 'tc-card--locked'
      : opened
      ? 'tc-card--opened'
      : 'tc-card--accessible';

  // ✅ 이미지 규칙
  // - canAccess=false => timecapsule.png
  // - canAccess=true && opened=false => timecapsule.png
  // - canAccess=true && opened=true => imageUrl 사용 (null이면 fallback)
  const imgSrc = canAccess && opened ? (imageUrl || capsuleDefaultImg) : capsuleDefaultImg;

  return (
    <button type="button" className={`tc-card ${variantClass}`} onClick={onClick}>
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
  );
}
