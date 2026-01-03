// src/components/LockedCapsuleModal.jsx
import React from "react";

export default function LockedCapsuleModal({ open, message, onClose }) {
  if (!open) return null;

  return (
    <>
      <div className="tc-lock-overlay" onClick={onClose}>
        <div className="tc-lock-modal" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="tc-lock-close"
            onClick={onClose}
            aria-label="close"
          >
            ×
          </button>

          <div className="tc-lock-text">
            {message || "아직 열 수 없는 타임캡슐이에요"}
          </div>
        </div>
      </div>

      <style>{`
        .tc-lock-overlay {
          position: fixed;
          inset: 0; /* top:0 left:0 right:0 bottom:0 */
          background: rgba(0, 0, 0, 0.4); /* 요청: 40% */
          z-index: 9999;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tc-lock-modal {
          position: relative;
          padding: 40px 50px;

          background: linear-gradient(180deg, #081126 0%, #060f22 100%);
          border-radius: 20px;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
        }

        .tc-lock-text {
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          font-weight: 300;
          text-align: center;
          white-space: nowrap;
        }

        .tc-lock-close {
          position: absolute;
          top: 12px;
          right: 12px;

          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.75);
          font-size: 22px;
          cursor: pointer;
          line-height: 1;
        }

        .tc-lock-close:hover {
          color: rgba(255, 255, 255, 0.95);
        }
      `}</style>
    </>
  );
}
