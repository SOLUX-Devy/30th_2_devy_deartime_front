import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FriendInvite() {
  const navigate = useNavigate();

  const closeModal = () => {
    navigate(-1); // 뒤로 가기 = 모달 닫기
  };

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* 오버레이 */}
      <div className="friend-invite-overlay" onClick={closeModal}>
        {/* 모달 */}
        <div
          className="friend-invite-modal"
          onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
        >
          <button className="friend-invite-close" onClick={closeModal}>
            ×
          </button>

          <h2 className="friend-invite-title">친구 초대</h2>

          <div className="friend-invite-body">
            {/* 여기 나중에 초대 코드 / 입력창 넣으면 됨 */}
            <div className="friend-invite-placeholder">
              여기에 친구 초대 UI 들어갈 예정
            </div>
          </div>
        </div>
      </div>

      {/* ===== CSS (한 파일에 포함) ===== */}
      <style>{`
        .friend-invite-overlay {
          position: fixed;
          top: 80px; /* Header 높이 고려 */
          left: 0;
          width: 100%;
          height: calc(100vh - 80px);
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .friend-invite-modal {
          width: 420px;
          height: 260px;
          background: rgba(20, 25, 40, 0.95);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 24px;
          position: relative;
          color: white;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
        }

        .friend-invite-close {
          position: absolute;
          top: 14px;
          right: 16px;
          background: none;
          border: none;
          color: white;
          font-size: 22px;
          cursor: pointer;
          opacity: 0.7;
        }

        .friend-invite-close:hover {
          opacity: 1;
        }

        .friend-invite-title {
          margin: 0;
          margin-bottom: 20px;
          font-size: 22px;
          font-weight: 600;
        }

        .friend-invite-body {
          width: 100%;
          height: calc(100% - 60px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .friend-invite-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
          font-size: 15px;
        }
      `}</style>
    </>
  );
}
