// ==========================
// FriendDelete.jsx (완성본: DELETE 연동 + 스타일 포함)
// ✅ 팀 규칙: apiBaseUrl = import.meta.env.VITE_API_BASE_URL 사용
// ==========================
import React, { useEffect, useState } from "react";

export default function FriendDelete({ friendId, onSuccess, onCancel }) {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 팀 규칙: env base url 사용
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // ESC로 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const handleDelete = async () => {
    const id = Number(friendId);
    if (!Number.isFinite(id)) return;

    try {
      setIsLoading(true);

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
      }

      const res = await fetch(`${apiBaseUrl}/api/friends/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json().catch(() => null);
      console.log("DELETE /api/friends/:id =>", res.status, data);

      if (!res.ok) {
        alert(data?.message ?? "친구 삭제에 실패했습니다.");
        return;
      }

      onSuccess?.(id);
    } catch (e) {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="confirm-overlay" onClick={onCancel}>
        <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
          <h3 className="confirm-title">정말 삭제하시겠습니까?</h3>

          <p className="confirm-desc">친구를 삭제하면 되돌릴 수 없습니다.</p>

          <div className="confirm-actions">
            <button
              className="confirm-cancel"
              onClick={onCancel}
              disabled={isLoading}
            >
              취소
            </button>
            <button
              className="confirm-delete"
              onClick={handleDelete}
              disabled={isLoading}
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
