import React from 'react';
import '../styles/DeleteCheck.css';

const DeleteCheck = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null; // 열려있지 않으면 아무것도 렌더링하지 않음

    return (
        <div className="check-overlay" onClick={onClose}>
            <div className="check-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="check-title">편지를 삭제하시겠습니까?</h2>
                <p className="check-subtitle">
                    편지를 삭제하시면, 이후 복구는 어렵습니다.
                </p>
                <div className="check-buttons">
                    <button className="check-btn cancel" onClick={onClose}>취소</button>
                    <button className="check-btn delete" onClick={onConfirm}>삭제</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCheck;