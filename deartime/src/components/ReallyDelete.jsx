// ==========================
// ReallyDelete.jsx (모달 UI만 분리)
// - FriendDelete.jsx에서 "정말 삭제하시겠습니까?" 모달 UI만 떼어낸 컴포넌트
// - onCancel / onConfirm / isLoading props로 제어
// - 스타일은 컴포넌트 내부 <style>로 포함 (기존 그대로)
// ==========================
import React, { useEffect } from "react";

export default function ReallyDelete({ onCancel, onConfirm, isLoading = false }) {
  // ESC로 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <>
      <div className="confirm-overlay" onClick={onCancel}>
        <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
          <h3 className="confirm-title">정말 삭제하시겠습니까?</h3>

          <p className="confirm-desc">한 번 삭제하면 되돌릴 수 없습니다.</p>

          <div className="confirm-actions">
            <button
              className="confirm-cancel"
              onClick={onCancel}
              disabled={isLoading}
              type="button"
            >
              취소
            </button>

            <button
              className="confirm-delete"
              onClick={onConfirm}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? "삭제중" : "삭제"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .confirm-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .confirm-modal {
          border-radius: 20px;
          border: 1px solid #2A4280;
          background: #000D32;
          padding: 24px 22px;
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .confirm-title {
          font-size: 16px;
          font-weight: 500;
          text-align: center;
          margin: 0;
          color: white;
        }

        .confirm-desc {
          font-size: 12px;
          text-align: center;
          color: white;
          font-weight: 300;
          margin: 0 0 8px 0;
        }

        .confirm-actions {
          display: flex;
          gap: 15px;
          margin-top: 10px;
        }

        .confirm-cancel {
          flex: 1;
          height: 40px;
          border: none;
          border-radius: 10px;
          border: 1.5px solid #2A4280;
          background: rgba(255, 255, 255, 0.00);
          font-size: 14px;
          cursor: pointer;
          color: #fff;
        }

        .confirm-delete {
          flex: 1;
          height: 40px;
          border-radius: 10px;
          border: 1.5px solid #2A4280;
          background: rgba(255, 255, 255, 0.00);
          color: #fff;
          font-size: 14px;
          cursor: pointer;
        }
          
        .confirm-cancel:hover,
        .confirm-delete:hover {
          background-color: rgba(42, 66, 128, 1);
        }

        .confirm-cancel:disabled,
        .confirm-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
