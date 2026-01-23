import React, { useEffect, useState } from "react";
import profileImageFallback from "../assets/default_profile2.png";

/**
 * FriendInvite (전문)
 * - Step 1: 이메일 입력
 * - Step 2-1: 검색 결과 확인 + [친구 신청] (friendStatus: none/received)
 * - Step 2-2: 안내 모달 (pending/accepted/검색결과없음/에러/성공메시지)
 *
 * ✅ API
 * 1) GET  /api/friends/search?keyword={email}
 * 2) POST /api/friends   body: { friendId: number }
 */

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

  const getAccessToken = () => localStorage.getItem("accessToken");

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

      if (count === 0 || results.length === 0) {
        openStatusModal("사용자를 찾지 못했습니다.");
        return;
      }

      const user = results[0];
      const friendStatus = user?.friendStatus;

      if (friendStatus === "pending") {
        openStatusModal("이미 친구 신청을 보냈습니다.");
        return;
      }
      if (friendStatus === "accepted") {
        openStatusModal("이미 친구 관계입니다.");
        return;
      }

      if (friendStatus === "none" || friendStatus === "received") {
        setFoundFriend({
          friendId: user.userId,
          friendNickname: user.nickname,
          profileImageUrl: user.profileImageUrl,
          friendBio: user.bio,
          friendStatus: user.friendStatus,
          email: keyword, // ✅ 입력한 이메일 보관
        });
        setStep(2);
        return;
      }

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

      if (res.ok && data?.success) {
        if (data?.data?.status === "accepted") {
          openStatusModal("친구 요청이 자동으로 수락되었습니다!");
        } else {
          openStatusModal("친구 요청을 보냈습니다.");
        }
        return;
      }

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
      <div className="friend-invite-overlay" onClick={onClose}>
        <div
          className={`friend-invite-modal ${
            step === 1
              ? "modal-step-1"
              : step === 2
                ? "modal-step-2"
                : "modal-step-1"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {step !== 3 && (
            <button className="friend-invite-close" onClick={onClose}>
              ×
            </button>
          )}

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

          {/* ================= 2-1단계 ================= */}
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

          {/* ================= 2-2단계 ================= */}
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
                    setInputEmail("");
                    onClose();
                  }}
                >
                  확인
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .friend-invite-overlay {
          position: fixed;
          top: 80px;
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
          border-radius: 20px;
          border: 1px solid #2A4280;
          position: relative;
          color: white;
        }

        .modal-step-1 {
          width: 420px;
          height: auto;
          padding: 24px;
        }

        /* ✅ 2단계는 내용 늘어나면 늘어나게 (겹침 방지) */
        .modal-step-2 {
          width: 420px;
          height: auto;
          padding: 24px;
          padding-bottom: 28px;
        }
        .modal-step-2 .friend-invite-body.column {
            justify-content: flex-start;
            padding-top: 10px;
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
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .friend-invite-body.column {
          display: flex;
          flex-direction: column;
          gap: 15px;
          width: 100%;
          box-sizing: border-box;
          align-items: stretch;
          justify-content: flex-start;
        }

        /* ✅ placeholder 포함 '세로 중앙'은 line-height + padding 정리로 해결 */
        .friend-invite-input {
          width: 350px;
          height: 45px;
          border-radius: 10px;
          border: 1px solid #2A4280;
          background: #000D32;
          color: #FFF;

          padding: 0 15px;         /* ✅ 위아래 padding 제거 */
          line-height: 45px;       /* ✅ 글자(placeholder) 세로 중앙 */
          font-family: "Josefin Slab";
          font-size: 16px;
          box-sizing: border-box;
        }

        .friend-invite-input::placeholder {
          color: #FFF;
          font-size: 13px;
        }

        .friend-invite-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
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

        .friend-preview {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .friend-preview img{
          margin-bottom: 18px;
          width: 100px;
          height: 100px;
          background: white;
          border-radius: 50%;
          overflow: hidden;
          object-fit: cover;
        }

        .profile-placeholder {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: #000;
          margin-bottom: 18px;
          border: 1px solid #2A4280;
        }

        /* ✅ 여기 height:40px 같은 거 절대 넣지마 (내용 다 짤림/겹침) */
        .friend-info-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 350px;
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
          padding: 12px 14px;
          font-size: 14px;
          box-sizing: border-box;
          text-align: left;
        }

        .friend-warning {
          font-size: 12px;
          color: #FFF;
          text-align: center;
          font-family: "Josefin Slab";
          margin: 16px 0 10px 0;
        }

        .friend-invite-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 12px;
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
          margin-bottom: 0; /* ✅ -20 삭제 (겹침 원인) */
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
      `}</style>
    </>
  );
}
