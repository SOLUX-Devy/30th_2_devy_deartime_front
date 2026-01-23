import React, { useMemo } from "react";
import capsuleDefaultImg from "../assets/timecapsule_small.png";

function formatDateYYYYMMDD(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

// openAt 기준 D-day 계산 (날짜 기준)
function calcDDay(openAt) {
  if (!openAt) return "";
  const now = new Date();
  const target = new Date(openAt);

  const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffDays = Math.round((t - n) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "D-day";
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

  // ✅ 규칙 1) canAccess=false면 opened는 무조건 false로 "취급"
  const effectiveOpened = canAccess ? !!opened : false;

  // ✅ 상태 정리 (요구사항 그대로)
  const isLocked = canAccess === false; // 클릭/깜빡 전부 X
  const isSparkle = canAccess === true && effectiveOpened === false; // 깜빡 + 클릭 가능(클릭 시 모달 + opened true)
  const isOpened = canAccess === true && effectiveOpened === true; // 클릭 가능 + 사진 노출 + 안깜빡

  // ✅ 스타일 클래스
  const variantClass = isLocked
    ? "tc-card--locked"
    : isOpened
    ? "tc-card--opened"
    : "tc-card--accessible"; // sparkle

  // ✅ 이미지: 완전 열린 상태만 서버 이미지 노출
  const imgSrc = isOpened ? imageUrl || capsuleDefaultImg : capsuleDefaultImg;

  // ✅ 클릭 핸들러
  const handleClick = () => {
    // 요구사항: canAccess=false면 아예 클릭도 안되고 깜빡도 X
    if (isLocked) return;

    // sparkle 상태에서 클릭하면:
    // - 모달 켜짐
    // - 동시에 opened=true로 바뀌어야 함(부모에서 처리)
    if (isSparkle) {
      onClick?.(capsule, { markOpened: true });
      return;
    }

    // opened=true 상태에서 클릭하면 그냥 사진 띄우기(부모에서 처리)
    onClick?.(capsule, { markOpened: false });
  };

  return (
    <>
      <button
        type="button"
        className={`tc-card ${variantClass} ${isLocked ? "tc-card--disabled" : ""}`}
        onClick={handleClick}
        disabled={isLocked}              // ✅ 키보드 접근도 막기
        aria-disabled={isLocked}
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

        /* ✅ 잠긴 캡슐: 클릭/포커스/깜빡 전부 없음 */
        .tc-card--disabled {
          cursor: default;
          pointer-events: none; /* 🔥 마우스 클릭 자체 차단 */
          opacity: 0.9;
        }
        .tc-card:disabled {
          outline: none;
        }
        .tc-card:disabled:focus,
        .tc-card:disabled:focus-visible {
          outline: none;
          box-shadow: none;
        }

        /* 접근 불가(locked): 배경/애니메이션 X */
        .tc-card--locked {
          background: transparent;
          animation: none !important;
          box-shadow: none !important;
        }

        /* 🔥 canAccess=true && opened=false: 깜빡 + 클릭 가능 */
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

        /* ✅ canAccess=true && opened=true: 클릭 가능 + 사진 노출 + 안깜빡 */
        .tc-card--opened {
          background: rgba(0, 0, 0, 0.2);
          box-shadow: inset 0 0 0 2.5px rgba(14, 119, 188, 0.5);
          animation: none !important;
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

        .tc-card__imgWrap {
          width: 200px;
          height: 200px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 20px;
          overflow: hidden;
        }

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
