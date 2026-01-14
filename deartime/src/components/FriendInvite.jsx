import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { mockFriendListResponse } from "../mocks/FriendList.js";
import profileImage from "../assets/profile.jpg";

export default function FriendInvite({ onClose }) {
  // const navigate = useNavigate();

  // const closeModal = () => {
  //   navigate(-1); // 뒤로 가기 = 모달 닫기
  // };

  const [step, setStep] = useState(1); // 1: 입력, 2: 확인
  const [inputId, setInputId] = useState("");
  const [foundFriend, setFoundFriend] = useState(null);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleNext = () => {
    const keyword = inputId.trim().toLowerCase();

    const friend = mockFriendListResponse.data.friends.find((f) => {
      // 숫자 ID 매칭
      if (!isNaN(keyword) && String(f.friendId) === keyword) {
        return true;
      }

      // 닉네임 부분 검색
      if (f.friendNickname.toLowerCase().includes(keyword)) {
        return true;
      }

      return false;
    });

    if (!friend) {
      alert("해당 아이디를 가진 사용자를 찾을 수 없습니다.");
      return;
    }

    setFoundFriend(friend);
    setStep(2);
  };

  // 친구 신청 
  const handleFriendRequest = () => {
    console.log("친구 신청 보냄:", foundFriend);

    alert(
      `${foundFriend.friendNickname}님에게 친구 신청을 보냈습니다.`
    );

    onClose();
  };

  return (
    <>
      {/* 오버레이 */}
      <div className="friend-invite-overlay" onClick={onClose}>
        {/* 모달 */}
        <div
          className={`friend-invite-modal ${step === 1 ? "modal-step-1" : "modal-step-2"}`}
          onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
        >
          <button className="friend-invite-close" onClick={onClose}>
            ×
          </button>

          <h3 className="friend-invite-title">친구 신청</h3>

          {step === 1 && (
            <div className="friend-invite-body column">
              <input
                className="friend-invite-input"
                placeholder="아이디를 입력해주세요."
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
              />

              <div className="friend-invite-footer">
              <button
                className="friend-invite-next"
                disabled={!inputId.trim()}
                onClick={handleNext}
              >
                다음
              </button>
            </div>
          </div>
          )}

          {/* ================= 2단계 ================= */}
          {step === 2 && foundFriend && (
            <div className="friend-invite-body column">
              <div className="friend-preview">
                <img
                  src={profileImage}
                  alt="profile"
                />
                <div>
                    <div className="friend-info-container">
                  <label className="friend-label">아이디</label>
                  <div className="friend-id">
                    {foundFriend.friendId}
                  </div>

                  <label className="friend-label">닉네임</label>
                  <div className="friend-nickname">
                    {foundFriend.friendNickname}
                  </div>
                </div>
                </div>
              </div>

              <p className="friend-warning">
                입력하신 정보가 맞는지 확인해주세요.
                <br />
                친구신청을 보낸 후엔 취소할 수 없습니다.
              </p>

              <div className="friend-invite-actions">
                <button
                  className="friend-invite-submit"
                  onClick={handleFriendRequest}
                >
                  친구 신청
                </button>
              </div>
            </div>
          )}
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
          background: #000D32;
          border-radius: 16px;
          border: 1px solid #2A4280;
          position: relative;
          color: white;
          border-radius: 20px;
        }
 
        .modal-step-1 {
          width: 420px;
          height: 260px;
          padding: 24px;
        }

        .modal-step-2 {
          width: 420px;
          height: 550px;
          padding: 24px;
        }

        .friend-invite-close {
          position: absolute;
          top: 8px;
          right: 20px;
          background: none;
          border: none;
          color: white;
          font-size: 40px;
          cursor: pointer;
        }

        .friend-invite-close:hover {
          opacity: 1;
        }

        .friend-invite-title {
          margin: 0;
          margin-bottom: 20px;
          font-size: 22px;
          font-weight: 550;
          text-align: center;
          font-family: "Josefin Slab";
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

        .friend-invite-input {
          width: 360px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.50);
          border: 1px solid #2A4280;
          background: #000D32;
          margin-bottom: 50px;
          color: #FFF;
          padding-left: 15px;
          font-family: "Josefin Slab";
          font-size: 16px;
        }

        .friend-invite-input::placeholder {
          color: #FFF;
          font-size: 13px;
        }

        .friend-invite-footer {
          position: absolute;
          bottom: 30px;
          right: 30px;
        }

        .friend-invite-next {
          width: 80px;
          height: 40px;
          border-radius: 10px;
          border: 1.5px solid #2A4280;
          background: rgba(255, 255, 255, 0.00);
          color: #fff;
          font-family: "Josefin Slab";
          cursor: pointer;
        }

        .friend-invite-next:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .friend-invite-next:hover {
          background: rgba(42, 66, 128, 0.8);
        }

        .friend-invite-next:active {
          background-color: #0E77BC;
        }

        .friend-invite-body.column {
          display: flex;
          flex-direction: column;
          gap: 15px;
          width: 100%;
          box-sizing: border-box;
          align-items: stretch;
        }

        .friend-preview {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center; 
        }


        .friend-preview img{
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
          width: 100px;
          height: 100px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .friend-info-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
          align-items: stretch;
        }
        
        .friend-label {
          font-size: 13px;
          color: white;
          margin-left: 2px;
          margin-top: 8px;
          text-align: left;
          align-self: flex-start;
        }

        .friend-id, 
        .friend-nickname {
          width: 100%;
          border-radius: 10px;
          background: #545454;
          color: rgba(255, 255, 255, 0.8);
          padding: 12px 150px;
          font-size: 14px;
          box-sizing: border-box; 
        }

        .friend-warning {
          font-size: 11px;
          color: #FFF;
          text-align: center;
          font-family: "Josefin Slab";
          margin: 20px 0 10px 0;
        }

        .friend-invite-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }

        .friend-invite-submit {
          background: transparent;
          border-radius: 10px;
          border: 1.5px solid #2A4280;
          background: rgba(255, 255, 255, 0.00);
          color: white;
          padding: 8px 20px;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: -20px;
        }
        
        .friend-invite-submit:hover {
          background: #2A4280;
          opacity: 0.8;
        }

        .friend-invite-submit:active { 
          background-color: #0E77BC;
        }
      `}</style>
    </>
  );
}
