import React, { useEffect, useState } from "react";
import profileImageFallback from "../assets/profile.jpg";

/**
 * FriendInvite (전문)
 * - Step 1: 이메일 입력
 * - Step 2-1: 검색 결과 확인 + [친구 신청] (friendStatus: none/received)
 * - Step 2-2: 안내 모달 (pending/accepted/검색결과없음/에러/성공메시지)
 *
 * ✅ API
 * 1) GET  /api/friends/search?keyword={email}
 * 2) POST /api/friends   body: { friendId: number }
 *
 * ⚠️ 프록시(vite proxy) 없으면 API_BASE에 EC2 주소를 넣어야 실제 서버로 요청됩니다.
 */

// ✅ 프록시 사용하면 "" 그대로 두기 (fetch("/api/...") 형태 유지)
// ✅ 프록시 없으면 아래 EC2 주소 넣기
export default function FriendInvite({ onClose }) {
  const [step, setStep] = useState(1); // 1: 입력, 2: 확인(2-1), 3: 안내(2-2)
  const [inputEmail, setInputEmail] = useState("");
  const [foundFriend, setFoundFriend] = useState(null);

  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const openStatusModal = (message) => {
    setStatusMessage(message);
    setStep(3);
  };

  const getAccessToken = () => {
    return localStorage.getItem("accessToken");
  };

  // =========================
  // 1) 이메일 검색 (GET)
  // =========================
  const handleNext = async () => {
    const keyword = inputEmail.trim().toLowerCase();
    if (!keyword) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      openStatusModal("로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);

    try {
      const url = `/api/friends/search?keyword=${encodeURIComponent(keyword)}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // 400(검색어 비었음 등), 401/403 등
      if (!res.ok) {
        let msg = "요청에 실패했습니다.";
        try {
          const err = await res.json();
          msg = err?.message || msg;
        } catch (_) {}
        openStatusModal(msg);
        return;
      }

      const json = await res.json();

      const count = json?.data?.count ?? 0;
      const results = json?.data?.results ?? [];

      // ✅ 검색 결과 없음도 200이지만 count=0
      if (count === 0 || results.length === 0) {
        openStatusModal("사용자를 찾지 못했습니다.");
        return;
      }

      const user = results[0];
      const friendStatus = user?.friendStatus;

      // ✅ friendStatus 분기
      if (friendStatus === "pending") {
        openStatusModal("이미 친구 신청을 보냈습니다.");
        return;
      }
      if (friendStatus === "accepted") {
        openStatusModal("이미 친구 관계입니다.");
        return;
      }

      // ✅ none / received → 2-1 확인 모달
      if (friendStatus === "none" || friendStatus === "received") {
        setFoundFriend({
          // POST 바디에 넣을 값 (스펙: friendId는 '상대방 사용자 ID')
          friendId: user.userId,
          friendNickname: user.nickname,
          profileImageUrl: user.profileImageUrl,
          friendBio: user.bio,
          friendStatus: user.friendStatus,
          email: keyword,
        });
        setStep(2);
        return;
      }

      // 혹시 모르는 값이면 안전 처리
      openStatusModal("처리할 수 없는 상태입니다.");
    } catch (e) {
      openStatusModal("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // 2) 친구 신청 (POST)
  // =========================
  const handleFriendRequest = async () => {
    if (!foundFriend?.friendId) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      openStatusModal("로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);

    try {
      const url = `/api/friends`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ friendId: foundFriend.friendId }),
      });

      const data = await res.json().catch(() => null);

      // ✅ 성공(201 Created)
      if (res.ok && data?.success) {
        if (data?.data?.status === "accepted") {
          openStatusModal("친구 요청이 자동으로 수락되었습니다!");
        } else {
          openStatusModal("친구 요청을 보냈습니다.");
        }
        return;
      }

      // ❌ 에러: 백엔드 message 우선
      const msg =
        data?.message ||
        (res.status === 400
          ? "요청을 처리할 수 없습니다."
          : res.status === 404
            ? "친구를 찾을 수 없습니다."
            : "요청에 실패했습니다.");

      openStatusModal(msg);
    } catch (e) {
      openStatusModal("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 오버레이 */}
      <div className="friend-invite-overlay" onClick={onClose}>
        {/* 모달 */}
        <div
          className={`friend-invite-modal ${
            step === 1
              ? "modal-step-1"
              : step === 2
                ? "modal-step-2"
                : "modal-step-1"
          }`}
          onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
        >
          <button className="friend-invite-close" onClick={onClose}>
            ×
          </button>

          <h3 className="friend-invite-title">친구 신청</h3>

          {/* ================= 1단계 ================= */}
          {step === 1 && (
            <div className="friend-invite-body column">
              <input
                className="friend-invite-input"
                placeholder="이메일을 입력해주세요."
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
              />

              <div className="friend-invite-footer">
                <button
                  className="friend-invite-next"
                  disabled={!inputEmail.trim() || isLoading}
                  onClick={handleNext}
                >
                  {isLoading ? "조회중" : "다음"}
                </button>
              </div>
            </div>
          )}

          {/* ================= 2-1단계 (기존 확인 화면) ================= */}
          {step === 2 && foundFriend && (
            <div className="friend-invite-body column">
              <div className="friend-preview">
                {foundFriend.profileImageUrl ? (
                  <img
                    src={foundFriend.profileImageUrl}
                    alt="profile"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = profileImageFallback;
                    }}
                  />
                ) : (
                  <div className="profile-placeholder" />
                )}

                <div>
                  <div className="friend-info-container">
                    <label className="friend-label">이메일</label>
                    <div className="friend-id">
                      {foundFriend.email || inputEmail}
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
                  disabled={isLoading}
                >
                  {isLoading ? "처리중" : "친구 신청"}
                </button>
              </div>
            </div>
          )}

          {/* ================= 2-2단계 (상태 안내 모달) ================= */}
          {step === 3 && (
            <div className="friend-invite-body column">
              <div className="friend-status-box">{statusMessage}</div>

              <div className="friend-invite-actions">
                <button
                  className="friend-invite-submit"
                  onClick={() => {
                    setStep(1);
                    setStatusMessage("");
                    setFoundFriend(null);
                    // inputEmail은 유지할지/지울지 선택
                    // setInputEmail("");
                  }}
                >
                  확인
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

        .friend-invite-input {
          width: 380px;
          height: 45px;
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
          object-fit: cover;
        }

        .friend-info-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 380px;    
          height : 40px;
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
          padding: 12px 20px;
          font-size: 14px;
          box-sizing: border-box; 
          text-align: left;
        }

        .friend-warning {
          font-size: 12px;
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

        .friend-invite-submit:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* 2-2 안내 모달 메시지 박스 */
        .friend-status-box {
          width: 100%;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(42, 66, 128, 0.8);
          padding: 18px 14px;
          text-align: center;
          font-family: "Josefin Slab";
          font-size: 14px;
          color: rgba(255,255,255,0.9);
        }

        .profile-placeholder {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: #000;               /* 완전 검정 */
          margin-bottom: 30px;
          border: 1px solid #2A4280;       /* 기존 톤에 맞춘 테두리 */
        }
      `}</style>
    </>
  );
}
